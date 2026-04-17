/**
 * Stage 1 (local, no API cost): extract text from physics.pdf, split into page-ish
 * segments, then pack into chunk JSON files under data/raw/chunks/.
 *
 * Usage: pnpm pdf-to-chunks
 * Optional: pnpm pdf-to-chunks -- --pdf=path/to/other.pdf
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFParse } from "pdf-parse";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_PDF = path.join(ROOT, "physics.pdf");
const RAW_DIR = path.join(ROOT, "data", "raw");
const PAGES_DIR = path.join(RAW_DIR, "pages");
const CHUNKS_DIR = path.join(RAW_DIR, "chunks");

const PAGE_MARKER = /\n--\s*\d+\s+of\s+\d+\s*--\s*\n/gi;
const PHYSICS_YEAR = /Physics\s+(\d{4})/gi;
const DIAGRAM_HINT =
  /\b(fig\.|figure\s*\d|in the diagram|diagram above|shown in the diagram)\b/i;

const NOISE_LINES = /Provided by www\.myschoolgist\.com/gi;

const MAX_CHUNK_CHARS = 10_000;

function mkdirp(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanPageText(text: string): string {
  return text.replace(NOISE_LINES, "").replace(/\r\n/g, "\n").trim();
}

function splitPages(fullText: string): string[] {
  const normalized = fullText.replace(/\r\n/g, "\n");
  const parts = normalized
    .split(PAGE_MARKER)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length > 1) return parts.map(cleanPageText);
  return normalized
    .split(/\f+/g)
    .map((p) => cleanPageText(p))
    .filter(Boolean);
}

function detectYearFromText(text: string): number | undefined {
  PHYSICS_YEAR.lastIndex = 0;
  let last: number | undefined;
  let m: RegExpExecArray | null;
  while ((m = PHYSICS_YEAR.exec(text)) !== null) {
    last = Number(m[1]);
  }
  return last;
}

function examLabelForYear(year?: number): string {
  if (!year) return "JAMB Physics (year unknown)";
  return `JAMB Physics ${year}`;
}

function joinPages(pages: string[], startIdx: number, endIdxInclusive: number) {
  return pages
    .slice(startIdx, endIdxInclusive + 1)
    .join("\n\n")
    .trim();
}

function buildChunks(pages: string[]) {
  const chunks: {
    id: string;
    startPage: number;
    endPage: number;
    approxYear?: number;
    examLabel: string;
    requiresVision: boolean;
    rawText: string;
  }[] = [];

  let chunkSeq = 0;
  let windowStart = 0;
  let windowEnd = 0;
  let windowLen = 0;

  const flushWindow = () => {
    if (windowStart > windowEnd) return;
    const rawText = joinPages(pages, windowStart, windowEnd);
    if (!rawText) return;
    chunkSeq += 1;
    const id = `chunk-${String(chunkSeq).padStart(5, "0")}`;
    const approxYear = detectYearFromText(rawText);
    chunks.push({
      id,
      startPage: windowStart + 1,
      endPage: windowEnd + 1,
      approxYear,
      examLabel: examLabelForYear(approxYear),
      requiresVision: DIAGRAM_HINT.test(rawText),
      rawText,
    });
  };

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]!;
    const len = page.length + 2;

    if (windowLen + len > MAX_CHUNK_CHARS && windowLen > 0) {
      flushWindow();
      windowStart = i;
      windowEnd = i;
      windowLen = page.length;
      continue;
    }

    if (windowLen === 0) windowStart = i;
    windowEnd = i;
    windowLen += len;
  }
  flushWindow();

  return chunks;
}

async function main() {
  const pdfArg = process.argv.find((a) => a.startsWith("--pdf="));
  const pdfPath = pdfArg ? pdfArg.slice("--pdf=".length) : DEFAULT_PDF;
  if (!fs.existsSync(pdfPath)) {
    console.error(`PDF not found: ${pdfPath}`);
    process.exit(1);
  }

  mkdirp(PAGES_DIR);
  mkdirp(CHUNKS_DIR);

  const buffer = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: buffer });
  const textResult = await parser.getText();
  await parser.destroy();
  const pagesFromPdf = textResult.pages.map((p) => cleanPageText(p.text)).filter(Boolean);
  const pages = pagesFromPdf.length > 0 ? pagesFromPdf : splitPages(textResult.text);

  pages.forEach((text, idx) => {
    const name = path.join(PAGES_DIR, `page-${String(idx + 1).padStart(4, "0")}.txt`);
    fs.writeFileSync(name, text, "utf8");
  });

  const chunks = buildChunks(pages);
  for (const c of chunks) {
    const fp = path.join(CHUNKS_DIR, `${c.id}.json`);
    fs.writeFileSync(fp, JSON.stringify(c, null, 2), "utf8");
  }

  console.log(
    `Wrote ${pages.length} page files to ${path.relative(ROOT, PAGES_DIR)} and ${chunks.length} chunks to ${path.relative(ROOT, CHUNKS_DIR)}.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
