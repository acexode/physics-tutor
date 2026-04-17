"use client";

import { useMemo, useState } from "react";
import type { Question } from "@/lib/jamb/types";
import { getTopicById } from "@/lib/jamb/syllabus-data";
import { MathText } from "./MathText";
import { QuestionDiagramPlaceholder } from "./QuestionDiagramPlaceholder";

const LETTERS = ["A", "B", "C", "D", "E"] as const;

function optionLetters(q: Question): (typeof LETTERS)[number][] {
  return LETTERS.filter((L) => q.options[L] != null && q.options[L] !== "");
}

export function QuizModule({
  questions,
  syllabusHintTopicId,
}: {
  questions: Question[];
  syllabusHintTopicId?: string;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const q = questions[index];
  const topic = useMemo(() => {
    const id = syllabusHintTopicId ?? q?.topicIds[0];
    return id ? getTopicById(id) : undefined;
  }, [syllabusHintTopicId, q]);

  if (!q || questions.length === 0) {
    return (
      <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300">
        No questions in this set yet.
      </p>
    );
  }

  const letters = optionLetters(q);
  const correct = q.correctOption;
  const isCorrect = selected === correct;

  function reveal() {
    setRevealed(true);
  }

  function next() {
    setIndex((i) => (i + 1) % questions.length);
    setSelected(null);
    setRevealed(false);
  }

  const hintObjectives = topic?.objectives.slice(0, 3) ?? [];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Question {index + 1} of {questions.length}
          {q.year ? <span className="ml-2 text-zinc-400">· {q.year}</span> : null}
        </div>
        {q.needsHumanReview ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
            Needs human review
          </span>
        ) : null}
      </div>

      <QuestionDiagramPlaceholder diagramKey={q.diagramKey} />

      <p className="mt-4 text-base leading-relaxed text-zinc-900 dark:text-zinc-50">
        <MathText text={q.stem} />
      </p>

      <ul className="mt-4 space-y-2">
        {letters.map((L) => {
          const text = q.options[L]!;
          const chosen = selected === L;
          const showCorrect = revealed && L === correct;
          const showWrong = revealed && chosen && L !== correct;
          return (
            <li key={L}>
              <button
                type="button"
                disabled={revealed}
                onClick={() => setSelected(L)}
                className={[
                  "flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left text-sm transition",
                  chosen && !revealed
                    ? "border-emerald-500 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/40"
                    : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-zinc-600",
                  showCorrect ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30" : "",
                  showWrong ? "border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950/30" : "",
                  revealed ? "cursor-default opacity-90" : "",
                ].join(" ")}
              >
                <span className="mt-0.5 font-mono text-xs font-bold text-zinc-500">{L}.</span>
                <span className="text-zinc-800 dark:text-zinc-100">
                  <MathText text={text} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        {!revealed ? (
          <button
            type="button"
            disabled={!selected}
            onClick={reveal}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-emerald-500"
          >
            Check answer
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Next question
          </button>
        )}
      </div>

      {revealed ? (
        <div className="mt-5 space-y-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <div
            className={[
              "rounded-lg px-3 py-2 text-sm font-medium",
              isCorrect
                ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100"
                : "bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-100",
            ].join(" ")}
          >
            {isCorrect ? "Correct." : `Incorrect. The answer is ${correct}.`}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Explanation</h4>
            <p className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              <MathText text={q.whyCorrect} />
            </p>
          </div>
          {!isCorrect && selected ? (
            <div>
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Why option {selected} is wrong
              </h4>
              <p className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                <MathText
                  text={
                    q.whyOthersWrong[selected as keyof typeof q.whyOthersWrong] ??
                    "No separate note was stored for this distractor."
                  }
                />
              </p>
            </div>
          ) : null}
          {hintObjectives.length > 0 ? (
            <div>
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Syllabus objectives (hint)
              </h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
                {hintObjectives.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
