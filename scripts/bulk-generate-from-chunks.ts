/**
 * Stage 2: read local chunk JSON from data/raw/chunks/, call OpenAI (default
 * gpt-4o-mini) to emit structured questions + answers in one pass, validate
 * with Zod, dedupe by stem hash, merge into data/questions-stems.json and
 * data/questions-answers.json. Resume-safe via data/raw/processed-chunks.json.
 *
 * Cost controls: text-only chunks, batched single response per chunk, skip
 * already-processed chunk ids, skip question ids already present.
 *
 * ---------------------------------------------------------------------------
 * OpenAI Batch API (optional, ~50% discount, ~24h turnaround): build one
 * JSONL file where each line is a batch request with custom_id = chunk id and
 * body matching /v1/chat/completions. Upload file, create batch, poll output
 * file, then run a small "ingest-batch-output.ts" that maps completions back
 * into the same merge path as this script. Same prompts; no code change to
 * merge logic beyond reading batch results instead of live completions.
 * ---------------------------------------------------------------------------
 *
 * Usage:
 *   pnpm bulk-from-chunks              # process all unprocessed chunks
 *   pnpm bulk-from-chunks -- --dry-run
 *   pnpm bulk-from-chunks -- --limit=2
 *   pnpm bulk-from-chunks -- --skip-diagram-chunks   # skip requiresVision chunks
 *
 * Env: OPENAI_API_KEY (or .env.local), OPENAI_MODEL (default gpt-4o-mini)
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";
import { z } from "zod";
import { SYLLABUS_TOPICS } from "../lib/jamb/syllabus-data";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHUNKS_DIR = path.join(ROOT, "data", "raw", "chunks");
const PROCESSED_PATH = path.join(ROOT, "data", "raw", "processed-chunks.json");
const STEMS_PATH = path.join(ROOT, "data", "questions-stems.json");
const ANSWERS_PATH = path.join(ROOT, "data", "questions-answers.json");

const ALLOWED_TOPIC_IDS = SYLLABUS_TOPICS.map((t) => t.id);

function loadEnvLocal() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    )
      val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvLocal();

const optionsSchema = z.object({
  A: z.string().min(1),
  B: z.string().min(1),
  C: z.string().min(1),
  D: z.string().min(1),
  E: z.string().optional(),
});

const rawItemSchema = z.object({
  id: z.string().min(1),
  year: z.number().optional(),
  examLabel: z.string().optional(),
  topicIds: z.array(z.string()).min(1),
  stem: z.string().min(1),
  options: optionsSchema,
  correctOption: z.enum(["A", "B", "C", "D", "E"]),
  whyCorrect: z.string().min(1),
  whyOthersWrong: z.record(z.string(), z.string()),
  needsHumanReview: z.boolean().optional(),
  diagramKey: z.string().optional(),
});

type RawItem = z.infer<typeof rawItemSchema>;

function normalizeStem(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 400);
}

function parseModelJson(content: string): unknown {
  let t = content.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  return JSON.parse(t) as unknown;
}

function validateItem(raw: unknown, allowed: Set<string>): RawItem | null {
  const parsed = rawItemSchema.safeParse(raw);
  if (!parsed.success) return null;
  const v = parsed.data;
  for (const tid of v.topicIds) {
    if (!allowed.has(tid)) return null;
  }
  const letters = (["A", "B", "C", "D", "E"] as const).filter(
    (L) => v.options[L] != null && String(v.options[L]).trim().length > 0,
  );
  if (!letters.includes(v.correctOption)) return null;
  for (const L of letters) {
    if (L === v.correctOption) continue;
    const w = v.whyOthersWrong[L];
    if (!w || w.trim().length < 3) return null;
  }
  for (const k of Object.keys(v.whyOthersWrong)) {
    if (!(letters as readonly string[]).includes(k)) return null;
    if (k === v.correctOption) return null;
  }
  return v;
}

type StemRow = {
  id: string;
  year?: number;
  examLabel?: string;
  topicIds: string[];
  stem: string;
  options: Record<string, string>;
  diagramKey?: string;
};

type AnswerRow = {
  id: string;
  correctOption: "A" | "B" | "C" | "D" | "E";
  whyCorrect: string;
  whyOthersWrong: Partial<Record<"A" | "B" | "C" | "D" | "E", string>>;
  needsHumanReview?: boolean;
};

function loadJson<T>(p: string, fallback: T): T {
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, "utf8")) as T;
}

function saveJson(p: string, data: unknown) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf8");
}

function loadProcessed(): Set<string> {
  const data = loadJson<{ chunks?: string[] }>(PROCESSED_PATH, {});
  return new Set(data.chunks ?? []);
}

function saveProcessed(set: Set<string>) {
  saveJson(PROCESSED_PATH, { chunks: [...set].sort() });
}

function buildPrompt(chunk: {
  id: string;
  startPage: number;
  endPage: number;
  approxYear?: number;
  examLabel: string;
  requiresVision: boolean;
  rawText: string;
}) {
  const topicList = JSON.stringify(ALLOWED_TOPIC_IDS);
  return `Extract every complete JAMB-style Physics multiple-choice question from the following raw PDF text chunk.

Chunk meta: id=${chunk.id}, pages=${chunk.startPage}-${chunk.endPage}, label=${chunk.examLabel}, approxYear=${chunk.approxYear ?? "unknown"}, requiresVisionHint=${chunk.requiresVision}.

Rules:
- Return STRICT JSON object: {"items":[ ... ]} with no markdown.
- Each item must include: id (string, unique, start with "pdf-"), year (number, optional — infer from header if possible), examLabel (string), topicIds (1 to 3 ids ONLY from this allowed list): ${topicList}
- stem: plain text; use single-dollar TeX for math fragments e.g. $3.0\\times 10^8$.
- options: A,B,C,D required strings; include E only if the paper has five options.
- correctOption: A|B|C|D|E matching the key you believe is correct for JAMB-style assumptions (use g=10 m/s^2 when a problem states it).
- whyCorrect: concise physics explanation.
- whyOthersWrong: object with one entry per INCORRECT option letter present (omit the correct letter).
- needsHumanReview: true if text is incomplete, diagram-dependent, or ambiguous.
- diagramKey: optional short slug if question references a figure (e.g. pdf-p${chunk.startPage}-fig1).

Skip questions with missing options or garbled stems.`;
}

async function main() {
  const dry = process.argv.includes("--dry-run");
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.slice("--limit=".length)) : undefined;
  const skipDiagram = process.argv.includes("--skip-diagram-chunks");

  if (!fs.existsSync(CHUNKS_DIR)) {
    console.error(`No chunks directory at ${CHUNKS_DIR}. Run pnpm pdf-to-chunks first.`);
    process.exit(1);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!dry && !apiKey) {
    console.error("Missing OPENAI_API_KEY (set in environment or .env.local).");
    process.exit(1);
  }

  const chunkFiles = fs
    .readdirSync(CHUNKS_DIR)
    .filter((f) => f.startsWith("chunk-") && f.endsWith(".json"))
    .sort();

  const processed = loadProcessed();
  const allowed = new Set(ALLOWED_TOPIC_IDS);

  let stems = loadJson<StemRow[]>(STEMS_PATH, []);
  let answers = loadJson<AnswerRow[]>(ANSWERS_PATH, []);
  const stemIds = new Set(stems.map((s) => s.id));
  const answerIds = new Set(answers.map((a) => a.id));
  const stemHashes = new Set(stems.map((s) => normalizeStem(s.stem)));

  const client = apiKey ? new OpenAI({ apiKey }) : null;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  let used = 0;
  for (const file of chunkFiles) {
    if (limit != null && used >= limit) break;
    const chunkId = file.replace(/\.json$/i, "");
    if (processed.has(chunkId)) continue;

    const chunkPath = path.join(CHUNKS_DIR, file);
    const chunk = JSON.parse(fs.readFileSync(chunkPath, "utf8")) as {
      id: string;
      startPage: number;
      endPage: number;
      approxYear?: number;
      examLabel: string;
      requiresVision: boolean;
      rawText: string;
    };

    if (skipDiagram && chunk.requiresVision) {
      console.warn(`Skipping diagram chunk ${chunkId} (--skip-diagram-chunks).`);
      continue;
    }

    const userContent = `${buildPrompt(chunk)}\n\n--- RAW TEXT ---\n\n${chunk.rawText}`;

    if (dry) {
      console.log(`[dry-run] Would process ${chunkId} (${chunk.rawText.length} chars)`);
      used += 1;
      continue;
    }

    used += 1;

    const completion = await client!.chat.completions.create({
      model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You output only valid JSON." },
        { role: "user", content: userContent },
      ],
    });

    const text = completion.choices[0]?.message?.content ?? "{}";
    let body: unknown;
    try {
      body = parseModelJson(text);
    } catch (e) {
      console.error(`Failed JSON parse for ${chunkId}`, text.slice(0, 400));
      throw e;
    }

    const itemsUnknown = (body as { items?: unknown }).items;
    if (!Array.isArray(itemsUnknown)) {
      console.error(`No items[] for ${chunkId}`);
      process.exit(1);
    }

    let added = 0;
    for (const raw of itemsUnknown) {
      const v = validateItem(raw, allowed);
      if (!v) continue;
      if (stemIds.has(v.id) || answerIds.has(v.id)) continue;
      const h = normalizeStem(v.stem);
      if (stemHashes.has(h)) continue;

      const opt: Record<string, string> = {
        A: v.options.A,
        B: v.options.B,
        C: v.options.C,
        D: v.options.D,
      };
      if (v.options.E && v.options.E.trim()) opt.E = v.options.E;

      const stemRow: StemRow = {
        id: v.id,
        year: v.year ?? chunk.approxYear,
        examLabel: v.examLabel ?? chunk.examLabel,
        topicIds: v.topicIds,
        stem: v.stem,
        options: opt,
        diagramKey: v.diagramKey,
      };
      const answerRow: AnswerRow = {
        id: v.id,
        correctOption: v.correctOption,
        whyCorrect: v.whyCorrect,
        whyOthersWrong: v.whyOthersWrong as AnswerRow["whyOthersWrong"],
        needsHumanReview: v.needsHumanReview ?? chunk.requiresVision,
      };

      stems = [...stems, stemRow];
      answers = [...answers, answerRow];
      stemIds.add(v.id);
      answerIds.add(v.id);
      stemHashes.add(h);
      added += 1;
    }

    saveJson(STEMS_PATH, stems);
    saveJson(ANSWERS_PATH, answers);
    processed.add(chunkId);
    saveProcessed(processed);
    console.log(`Chunk ${chunkId}: merged ${added} questions (totals stems=${stems.length}).`);
  }

}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
