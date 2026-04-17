/**
 * Dev-only: batch-call OpenAI to fill `data/questions-answers.json`.
 * Usage: copy `.env.example` to `.env.local`, set OPENAI_API_KEY, then:
 *   pnpm generate-answers
 *
 * Skips question ids already present in the answers file (resume-safe).
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STEMS_PATH = path.join(ROOT, "data", "questions-stems.json");

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
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvLocal();
const ANSWERS_PATH = path.join(ROOT, "data", "questions-answers.json");

type Stem = {
  id: string;
  year?: number;
  examLabel?: string;
  topicIds: string[];
  stem: string;
  options: Record<string, string>;
  diagramKey?: string;
};

type AnswerOut = {
  id: string;
  correctOption: "A" | "B" | "C" | "D" | "E";
  whyCorrect: string;
  whyOthersWrong: Partial<Record<"A" | "B" | "C" | "D" | "E", string>>;
  needsHumanReview?: boolean;
};

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Missing OPENAI_API_KEY (use .env.local in project root).");
    process.exit(1);
  }

  const stems: Stem[] = JSON.parse(fs.readFileSync(STEMS_PATH, "utf8"));
  const existing: AnswerOut[] = fs.existsSync(ANSWERS_PATH)
    ? JSON.parse(fs.readFileSync(ANSWERS_PATH, "utf8"))
    : [];
  const done = new Set(existing.map((r) => r.id));
  const pending = stems.filter((s) => !done.has(s.id));
  if (pending.length === 0) {
    console.log("All stems already have answers. Nothing to do.");
    return;
  }

  const client = new OpenAI({ apiKey });
  const BATCH = 5;
  const out: AnswerOut[] = [...existing];

  for (let i = 0; i < pending.length; i += BATCH) {
    const batch = pending.slice(i, i + BATCH);
    const userPayload = batch.map((q) => ({
      id: q.id,
      year: q.year,
      examLabel: q.examLabel,
      topicIds: q.topicIds,
      stem: q.stem,
      options: q.options,
      diagramKey: q.diagramKey ?? null,
    }));

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a JAMB (UTME) Physics examiner assistant. For each multiple-choice question, output STRICT JSON with shape:
{"items":[{"id":"...","correctOption":"A|B|C|D|E","whyCorrect":"string","whyOthersWrong":{"A":"...","B":"..."},"needsHumanReview":boolean}]}
Rules:
- whyOthersWrong must include a short string for EVERY wrong option letter present in the question (omit the correct letter key only).
- Use JAMB conventions (e.g. g=10 m/s^2 when a problem states it).
- If the stem references a missing diagram and you cannot be sure, set needsHumanReview true and still pick the most defensible letter.
- Return ONLY valid JSON, no markdown.`,
        },
        {
          role: "user",
          content: JSON.stringify({ questions: userPayload }),
        },
      ],
    });

    const text = completion.choices[0]?.message?.content ?? "{}";
    let parsed: { items?: AnswerOut[] };
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error("Failed to parse model JSON:", text.slice(0, 500));
      process.exit(1);
    }
    const items = parsed.items;
    if (!Array.isArray(items)) {
      console.error("Model response missing items[]", text.slice(0, 500));
      process.exit(1);
    }
    for (const row of items) {
      if (!row?.id || !row.correctOption) continue;
      done.add(row.id);
      const idx = out.findIndex((o) => o.id === row.id);
      if (idx >= 0) out[idx] = row;
      else out.push(row);
    }
    fs.writeFileSync(ANSWERS_PATH, JSON.stringify(out, null, 2));
    console.log(`Wrote batch; total answers: ${out.length}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
