/**
 * Optional Stage 3: send a single page image (PNG/JPEG) plus optional caption text
 * to a vision-capable model to extract MCQs into the same JSON shape as bulk-from-chunks.
 * Use when local PDF text omits figure-critical information.
 *
 * Usage:
 *   pnpm bulk-vision-page -- --image=public/diagrams/page-3.png --meta=data/raw/vision-meta.json
 *
 * meta JSON example:
 *   { "examLabel": "JAMB Physics 1983", "year": 1983, "note": "page 3 of 1983 paper" }
 *
 * Output: appends validated items to data/questions-stems.json / answers (same merge rules).
 *
 * Env: OPENAI_API_KEY, OPENAI_VISION_MODEL (default gpt-4o-mini — supports image input)
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";
import { z } from "zod";
import { SYLLABUS_TOPICS } from "../lib/jamb/syllabus-data";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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

async function main() {
  const imageArg = process.argv.find((a) => a.startsWith("--image="));
  const metaArg = process.argv.find((a) => a.startsWith("--meta="));
  if (!imageArg) {
    console.error("Missing --image=path/to.png");
    process.exit(1);
  }
  const imagePath = path.resolve(ROOT, imageArg.slice("--image=".length));
  if (!fs.existsSync(imagePath)) {
    console.error(`Image not found: ${imagePath}`);
    process.exit(1);
  }

  const meta = metaArg
    ? (JSON.parse(fs.readFileSync(path.resolve(ROOT, metaArg.slice("--meta=".length)), "utf8")) as {
        examLabel?: string;
        year?: number;
        note?: string;
      })
    : {};

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Missing OPENAI_API_KEY");
    process.exit(1);
  }

  const mime = imagePath.toLowerCase().endsWith(".png")
    ? "image/png"
    : imagePath.toLowerCase().endsWith(".webp")
      ? "image/webp"
      : "image/jpeg";
  const b64 = fs.readFileSync(imagePath).toString("base64");
  const dataUrl = `data:${mime};base64,${b64}`;

  const allowed = new Set(ALLOWED_TOPIC_IDS);
  const topicList = JSON.stringify(ALLOWED_TOPIC_IDS);

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_VISION_MODEL ?? "gpt-4o-mini";

  const userText = `Extract JAMB Physics MCQs visible in this exam page image.
Context JSON: ${JSON.stringify(meta)}
Return JSON {"items":[...]} only.
topicIds must use only these ids: ${topicList}
Use ids prefixed with "pdf-vision-".
needsHumanReview should default true unless every option is fully legible.
Include whyOthersWrong for every incorrect visible option.`;

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "You output only valid JSON." },
      {
        role: "user",
        content: [
          { type: "text", text: userText },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
  });

  const text = completion.choices[0]?.message?.content ?? "{}";
  const body = JSON.parse(text) as { items?: unknown[] };
  if (!Array.isArray(body.items)) {
    console.error("Invalid response", text.slice(0, 400));
    process.exit(1);
  }

  let stems = loadJson<StemRow[]>(STEMS_PATH, []);
  let answers = loadJson<AnswerRow[]>(ANSWERS_PATH, []);
  const stemIds = new Set(stems.map((s) => s.id));
  const answerIds = new Set(answers.map((a) => a.id));
  const stemHashes = new Set(stems.map((s) => normalizeStem(s.stem)));

  let added = 0;
  for (const raw of body.items) {
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

    stems = [
      ...stems,
      {
        id: v.id,
        year: v.year ?? meta.year,
        examLabel: v.examLabel ?? meta.examLabel ?? "JAMB Physics",
        topicIds: v.topicIds,
        stem: v.stem,
        options: opt,
        diagramKey: v.diagramKey,
      },
    ];
    answers = [
      ...answers,
      {
        id: v.id,
        correctOption: v.correctOption,
        whyCorrect: v.whyCorrect,
        whyOthersWrong: v.whyOthersWrong as AnswerRow["whyOthersWrong"],
        needsHumanReview: v.needsHumanReview ?? true,
      },
    ];
    stemIds.add(v.id);
    answerIds.add(v.id);
    stemHashes.add(h);
    added += 1;
  }

  saveJson(STEMS_PATH, stems);
  saveJson(ANSWERS_PATH, answers);
  console.log(`Vision pass merged ${added} questions.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
