"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SyllabusTopic } from "@/lib/jamb/types";
import {
  loadObjectiveMastery,
  toggleObjectiveMastered,
  topicProgress,
} from "@/lib/jamb/types";
import { recordObjectiveMastered, recordStudyVisit } from "@/lib/gamification";
import { ThemeToggle } from "./ThemeToggle";

export function ObjectivesPanel({ topic }: { topic: SyllabusTopic }) {
  const [tick, setTick] = useState(0);
  const total = topic.objectives.length;
  const { mastered } = topicProgress(topic.id, total);

  useEffect(() => {
    recordStudyVisit();
  }, []);

  function bump() {
    setTick((t) => t + 1);
    window.dispatchEvent(new Event("physics-pulse-mastery"));
  }

  return (
    <div className="rounded-2xl border border-pulse-border bg-pulse-surface p-6 shadow-[0_0_28px_var(--pulse-glow)] backdrop-blur-md">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-pulse-blue">Topic {topic.jambNumber}</p>
          <h1 className="mt-1 text-2xl font-bold text-pulse-text">{topic.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-pulse-muted">{topic.contentNotes}</p>
        </div>
        <div className="flex flex-col items-end gap-3 text-right">
          <ThemeToggle />
          <div className="text-sm text-pulse-muted">
            <span className="font-semibold tabular-nums text-pulse-text">
              {mastered}/{total}
            </span>{" "}
            objectives checked
          </div>
          <Link href="/" className="text-sm font-medium text-pulse-blue underline-offset-2 hover:underline">
            Back to dashboard
          </Link>
        </div>
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-pulse-muted">
        Candidates should be able to
      </h2>
      <ul className="mt-3 space-y-3" key={tick}>
        {topic.objectives.map((obj, idx) => {
          const checked = loadObjectiveMastery()[topic.id]?.[idx] ?? false;
          return (
            <li
              key={idx}
              className="flex gap-3 rounded-xl border border-pulse-border bg-pulse-surface-strong/60 p-3 backdrop-blur-sm"
            >
              <input
                id={`obj-${topic.id}-${idx}`}
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 accent-pulse-green"
                checked={checked}
                onChange={() => {
                  const wasChecked = loadObjectiveMastery()[topic.id]?.[idx] ?? false;
                  toggleObjectiveMastered(topic.id, idx, total);
                  if (!wasChecked) {
                    recordObjectiveMastered();
                  }
                  bump();
                }}
              />
              <label
                htmlFor={`obj-${topic.id}-${idx}`}
                className="cursor-pointer text-sm leading-relaxed text-pulse-text"
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
          className="inline-flex rounded-xl bg-pulse-green px-4 py-2 text-sm font-bold text-pulse-bg no-underline transition hover:brightness-110"
        >
          Practice this topic
        </Link>
      </div>
    </div>
  );
}
