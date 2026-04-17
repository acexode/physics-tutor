"use client";

import { useState } from "react";
import Link from "next/link";
import type { SyllabusTopic } from "@/lib/jamb/types";
import {
  loadObjectiveMastery,
  toggleObjectiveMastered,
  topicProgress,
} from "@/lib/jamb/types";

export function ObjectivesPanel({ topic }: { topic: SyllabusTopic }) {
  const [tick, setTick] = useState(0);
  const total = topic.objectives.length;
  const { mastered } = topicProgress(topic.id, total);

  function bump() {
    setTick((t) => t + 1);
    window.dispatchEvent(new Event("physics-pulse-mastery"));
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Topic {topic.jambNumber}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {topic.title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {topic.contentNotes}
          </p>
        </div>
        <div className="text-right text-sm text-zinc-500 dark:text-zinc-400">
          <div className="font-medium text-zinc-800 dark:text-zinc-200">
            {mastered}/{total} objectives checked
          </div>
          <Link
            href="/"
            className="mt-2 inline-block text-emerald-700 underline dark:text-emerald-400"
          >
            Back to dashboard
          </Link>
        </div>
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Candidates should be able to
      </h2>
      <ul className="mt-3 space-y-3" key={tick}>
        {topic.objectives.map((obj, idx) => {
          const checked = loadObjectiveMastery()[topic.id]?.[idx] ?? false;
          return (
            <li
              key={idx}
              className="flex gap-3 rounded-lg border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/40"
            >
              <input
                id={`obj-${topic.id}-${idx}`}
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 accent-emerald-600"
                checked={checked}
                onChange={() => {
                  toggleObjectiveMastered(topic.id, idx, total);
                  bump();
                }}
              />
              <label
                htmlFor={`obj-${topic.id}-${idx}`}
                className="cursor-pointer text-sm leading-relaxed text-zinc-800 dark:text-zinc-100"
              >
                {obj}
              </label>
            </li>
          );
        })}
      </ul>

      <div className="mt-8">
        <Link
          href={`/practice?topic=${topic.id}`}
          className="inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white no-underline hover:bg-emerald-700 dark:bg-emerald-500"
        >
          Practice this topic
        </Link>
      </div>
    </div>
  );
}
