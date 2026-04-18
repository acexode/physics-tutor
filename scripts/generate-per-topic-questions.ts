/**
 * For each JAMB syllabus topic (or one topic via --topic=), call OpenAI to create
 * N practice MCQs with answers and merge into data/questions-stems.json and
 * data/questions-answers.json. Idempotent: skips topics that already have N
 * questions with ids prefixed ai-topic-{topicId}-.
 *
 * Usage:
 *   pnpm generate-topic-questions
 *   pnpm generate-topic-questions -- --topic=measurements-and-units
 *   pnpm generate-topic-questions -- --dry-run
 *   pnpm generate-topic-questions -- --count=10   (default 10)
 *   pnpm generate-topic-questions -- --max-topics=2   (only first 2 topics in list)
 *   pnpm generate-topic-questions -- --verbose       (log Zod errors for dropped items)
 *
 * Env: OPENAI_API_KEY (.env.local), OPENAI_MODEL (default gpt-4o-mini)
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";
import { z } from "zod";
import type { SyllabusTopic } from "../lib/jamb/types";
import { SYLLABUS_TOPICS } from "../lib/jamb/syllabus-data";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STEMS_PATH = path.join(ROOT, "data", "questions-stems.json");
const ANSWERS_PATH = path.join(ROOT, "data", "questions-answers.json");

const ID_PREFIX = "ai-topic";

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

/** Normalize common LLM JSON quirks before Zod (IDs, null E, key casing, etc.). */
function coerceQuestionItem(raw: unknown, topicId: string): unknown {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return raw;
  const o = { ...(raw as Record<string, unknown>) };

  if (typeof o.id === "string") {
    const prefix = `${ID_PREFIX}-${topicId}-`;
    const id = o.id.trim();
    if (id.startsWith(prefix)) {
      const suffix = id.slice(prefix.length).replace(/^0+/, "") || "0";
      const n = Number.parseInt(suffix, 10);
      if (Number.isFinite(n) && n > 0) {
        o.id = `${prefix}${String(n).padStart(2, "0")}`;
      }
    }
  }

  if (typeof o.correctOption === "string") {
    const c = o.correctOption.trim().toUpperCase().slice(0, 1);
    if (["A", "B", "C", "D", "E"].includes(c)) o.correctOption = c;
  }

  if (o.options && typeof o.options === "object" && !Array.isArray(o.options)) {
    const src = o.options as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [key, val] of Object.entries(src)) {
      const L = key.trim().toUpperCase().slice(0, 1);
      if (!["A", "B", "C", "D", "E"].includes(L)) continue;
      if (val === null || val === undefined) continue;
      const s = String(val).trim();
      if (s.length === 0) continue;
      out[L] = s;
    }
    o.options = out;
  }

  if (o.whyOthersWrong && typeof o.whyOthersWrong === "object" && !Array.isArray(o.whyOthersWrong)) {
    const src = o.whyOthersWrong as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [key, val] of Object.entries(src)) {
      const L = key.trim().toUpperCase().slice(0, 1);
      if (!["A", "B", "C", "D", "E"].includes(L)) continue;
      out[L] = String(val ?? "").trim();
    }
    o.whyOthersWrong = out;
  }

  if (Array.isArray(o.topicIds)) {
    o.topicIds = (o.topicIds as unknown[])
      .map((x) => String(x).trim())
      .filter(Boolean);
  }

  return o;
}

function validateItem(
  raw: unknown,
  allowed: Set<string>,
  requiredTopicId: string,
  verbose: boolean,
): RawItem | null {
  const coerced = coerceQuestionItem(raw, requiredTopicId);
  const parsed = rawItemSchema.safeParse(coerced);
  if (!parsed.success) {
    if (verbose) {
      console.warn(
        "[zod]",
        parsed.error.flatten(),
        "raw:",
        JSON.stringify(coerced).slice(0, 400),
      );
    }
    return null;
  }

  const rawIds = [...parsed.data.topicIds].map((x) => String(x).trim());
  const filtered = rawIds.filter((tid) => allowed.has(tid));
  let topicIds = filtered.includes(requiredTopicId)
    ? filtered
    : [requiredTopicId, ...filtered];
  topicIds = [requiredTopicId, ...topicIds.filter((t) => t !== requiredTopicId)].slice(0, 3);

  let v: RawItem = { ...parsed.data, topicIds };

  const letters = (["A", "B", "C", "D", "E"] as const).filter(
    (L) => v.options[L] != null && String(v.options[L]).trim().length > 0,
  );
  if (letters.length < 4) {
    if (verbose) console.warn("[options] need at least A–D:", letters);
    return null;
  }
  if (!letters.includes(v.correctOption)) return null;

  const wow: Record<string, string> = { ...v.whyOthersWrong };
  for (const k of Object.keys(wow)) {
    if (!(letters as readonly string[]).includes(k) || k === v.correctOption) {
      delete wow[k];
    }
  }
  v = { ...v, whyOthersWrong: wow };

  for (const L of letters) {
    if (L === v.correctOption) continue;
    const w = v.whyOthersWrong[L];
    if (!w || w.trim().length < 1) {
      if (verbose) console.warn(`[whyOthersWrong] missing or empty for wrong option ${L}`);
      return null;
    }
  }
  for (const k of Object.keys(v.whyOthersWrong)) {
    if (!(letters as readonly string[]).includes(k) || k === v.correctOption) return null;
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

function expectedIds(topicId: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return `${ID_PREFIX}-${topicId}-${n}`;
  });
}

function existingAiTopicIds(stems: StemRow[], topicId: string, count: number): Set<string> {
  const want = new Set(expectedIds(topicId, count));
  const found = new Set<string>();
  for (const s of stems) {
    if (want.has(s.id)) found.add(s.id);
  }
  return found;
}

function missingAiTopicIds(stems: StemRow[], topicId: string, count: number): string[] {
  const want = expectedIds(topicId, count);
  const have = existingAiTopicIds(stems, topicId, count);
  return want.filter((id) => !have.has(id));
}

function objectivesSnippet(topic: SyllabusTopic, maxChars = 3500): string {
  const lines = topic.objectives.map((o, i) => `${i + 1}. ${o}`);
  let out = lines.join("\n");
  if (out.length > maxChars) out = `${out.slice(0, maxChars)}\n…(truncated)`;
  return out;
}

function buildPrompt(topic: SyllabusTopic, ids: string[], allowedList: string[]) {
  const n = ids.length;
  return `You write original JAMB UTME-style Physics multiple-choice questions (not copied verbatim from any past paper).

Target topic (must be the primary focus of every question):
- JAMB topic number: ${topic.jambNumber}
- Title: ${topic.title}
- Content notes: ${topic.contentNotes}

Syllabus objectives (use as skill coverage; vary subtopics within this topic):
${objectivesSnippet(topic)}

Rules:
- Return STRICT JSON: {"items":[ ... exactly ${n} objects ... ]}
- Each item MUST use this exact "id" field (one of the following, use each exactly once — note two-digit suffixes 01,02,… not 1,2): ${JSON.stringify(ids)}
- topicIds: always include "${topic.id}" as the first entry; you may add at most two more from this allowed list only: ${JSON.stringify(allowedList)}
- stem: clear English; use $...$ for inline math (e.g. $10\\ \\mathrm{m\\,s^{-2}}$).
- options: A–D required strings; include E only for five-option style.
- correctOption: single best answer for JAMB conventions (use $g=10\\ \\mathrm{m\\,s^{-2}}$ when a problem implies it and does not give another value).
- whyCorrect: 2–4 sentences of physics reasoning.
- whyOthersWrong: object with one non-empty string per incorrect option (keys A–E only; omit the correct letter key entirely).
- needsHumanReview: false unless the item is ambiguous.
- examLabel: "Physics Pulse · AI · Topic ${topic.jambNumber}"
- year: omit or use a single recent year like 2026 only if needed; prefer omitting year.

Do not include markdown fences. Output only valid JSON.`;
}

async function main() {
  const dry = process.argv.includes("--dry-run");
  const topicArg = process.argv.find((a) => a.startsWith("--topic="));
  const countArg = process.argv.find((a) => a.startsWith("--count="));
  const maxTopicsArg = process.argv.find((a) => a.startsWith("--max-topics="));
  const count = Math.min(25, Math.max(1, Number(countArg?.slice("--count=".length) ?? "10") || 10));
  console.log("count", count);
  const maxTopics = maxTopicsArg
    ? Math.max(1, Number(maxTopicsArg.slice("--max-topics=".length)) || 999)
    : undefined;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!dry && !apiKey) {
    console.error("Missing OPENAI_API_KEY (set in .env.local).");
    process.exit(1);
  }

  let topics = topicArg
    ? SYLLABUS_TOPICS.filter((t) => t.id === topicArg.slice("--topic=".length))
    : SYLLABUS_TOPICS;
  if (maxTopics != null) topics = topics.slice(0, maxTopics);
  if (topics.length === 0) {
    console.error("No topics match --topic= filter.");
    process.exit(1);
  }

  let stems = loadJson<StemRow[]>(STEMS_PATH, []);
  let answers = loadJson<AnswerRow[]>(ANSWERS_PATH, []);
  let stemIds = new Set(stems.map((s) => s.id));
  let answerIds = new Set(answers.map((a) => a.id));
  let stemHashes = new Set(stems.map((s) => normalizeStem(s.stem)));
  const allowed = new Set(SYLLABUS_TOPICS.map((t) => t.id));
  const allowedList = SYLLABUS_TOPICS.map((t) => t.id);

  const client = apiKey ? new OpenAI({ apiKey }) : null;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  for (const topic of topics) {
    const missing = missingAiTopicIds(stems, topic.id, count);
    if (missing.length === 0) {
      console.log(`Skip ${topic.id}: already has all ${count} (${ID_PREFIX}-*) questions.`);
      continue;
    }

    const prompt = buildPrompt(topic, missing, allowedList);
    if (dry) {
      console.log(
        `[dry-run] Would generate ${missing.length} questions for ${topic.id} (${topic.title}): ${missing.join(", ")}`,
      );
      continue;
    }

    const verbose = process.argv.includes("--verbose");
    let wrote = false;

    for (let attempt = 0; attempt < 2; attempt++) {
      const temperature = attempt === 0 ? 0.35 : 0.55;
      if (attempt > 0) {
        console.warn(`Topic ${topic.id}: retrying OpenAI (pass 2, temp=${temperature})…`);
      }

      const completion = await client!.chat.completions.create({
        model,
        temperature,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You output only valid JSON." },
          { role: "user", content: prompt },
        ],
      });

      const text = completion.choices[0]?.message?.content ?? "{}";
      let body: unknown;
      try {
        body = parseModelJson(text);
      } catch (e) {
        console.error(`JSON parse failed for ${topic.id}`, text.slice(0, 500));
        throw e;
      }

      const itemsUnknown = (body as { items?: unknown }).items;
      if (!Array.isArray(itemsUnknown)) {
        console.error(`No items[] for ${topic.id}`);
        process.exit(1);
      }

      const expected = new Set(missing);
      const stemsCandidate = [...stems];
      const answersCandidate = [...answers];
      const stemIdsCandidate = new Set(stemIds);
      const answerIdsCandidate = new Set(answerIds);
      const stemHashesCandidate = new Set(stemHashes);

      let merged = 0;
      for (const raw of itemsUnknown) {
        const v = validateItem(raw, allowed, topic.id, verbose);
        if (!v) {
          console.warn(`Dropped one invalid item for ${topic.id}`);
          continue;
        }
        if (!expected.has(v.id)) {
          console.warn(
            `Dropped item with wrong id "${v.id}" (expected one of ${[...expected].join(",")})`,
          );
          continue;
        }
        if (stemIdsCandidate.has(v.id) || answerIdsCandidate.has(v.id)) continue;
        const h = normalizeStem(v.stem);
        if (stemHashesCandidate.has(h)) {
          console.warn(`Dropped duplicate stem hash for ${v.id}`);
          continue;
        }

        const opt: Record<string, string> = {
          A: v.options.A,
          B: v.options.B,
          C: v.options.C,
          D: v.options.D,
        };
        if (v.options.E && v.options.E.trim()) opt.E = v.options.E;

        stemsCandidate.push({
          id: v.id,
          year: v.year,
          examLabel: v.examLabel ?? `Physics Pulse · AI · Topic ${topic.jambNumber}`,
          topicIds:
            v.topicIds[0] === topic.id ? v.topicIds : [topic.id, ...v.topicIds.filter((x) => x !== topic.id)],
          stem: v.stem,
          options: opt,
          diagramKey: v.diagramKey,
        });
        answersCandidate.push({
          id: v.id,
          correctOption: v.correctOption,
          whyCorrect: v.whyCorrect,
          whyOthersWrong: v.whyOthersWrong as AnswerRow["whyOthersWrong"],
          needsHumanReview: v.needsHumanReview,
        });
        stemIdsCandidate.add(v.id);
        answerIdsCandidate.add(v.id);
        stemHashesCandidate.add(h);
        merged += 1;
      }

      if (attempt === 0 && merged < missing.length) {
        console.warn(`Topic ${topic.id}: pass 1 accepted ${merged}/${missing.length} items.`);
      }

      if (merged === missing.length) {
        stems = stemsCandidate;
        answers = answersCandidate;
        stemIds = new Set(stems.map((s) => s.id));
        answerIds = new Set(answers.map((a) => a.id));
        stemHashes = new Set(stems.map((s) => normalizeStem(s.stem)));
        saveJson(STEMS_PATH, stems);
        saveJson(ANSWERS_PATH, answers);
        console.log(`Topic ${topic.id}: wrote ${merged} questions (${missing.length} slots).`);
        wrote = true;
        break;
      }
    }

    if (!wrote) {
      console.error(
        `Topic ${topic.id}: expected ${missing.length} valid items after 2 attempts. Re-run with --verbose or --topic=${topic.id} to inspect.`,
      );
      process.exit(1);
    }

    await new Promise((r) => setTimeout(r, 400));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
