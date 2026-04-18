"use client";

import Link from "next/link";
import { useMemo } from "react";
import { QUESTIONS } from "@/lib/jamb/questions-data";

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function daySeedIndex(dateIso: string, len: number): number {
  let h = 2166136261;
  for (let i = 0; i < dateIso.length; i++) {
    h ^= dateIso.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return len > 0 ? Math.abs(h) % len : 0;
}

export function DailyChallenge() {
  const q = useMemo(() => {
    if (QUESTIONS.length === 0) return null;
    const idx = daySeedIndex(isoToday(), QUESTIONS.length);
    return QUESTIONS[idx] ?? null;
  }, []);

  if (!q) {
    return (
      <div className="mb-8 rounded-2xl border border-pulse-border bg-pulse-surface p-5 backdrop-blur-md">
        <h2 className="text-sm font-bold uppercase tracking-wider text-pulse-blue">Daily challenge</h2>
        <p className="mt-2 text-sm text-pulse-muted">No questions loaded yet.</p>
      </div>
    );
  }

  const hook =
    q.whyCorrect.length > 140 ? `${q.whyCorrect.slice(0, 137).trim()}…` : q.whyCorrect;

  return (
    <div className="mb-8 rounded-2xl border border-pulse-border bg-pulse-surface p-5 shadow-[0_0_28px_var(--pulse-glow)] backdrop-blur-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-pulse-blue">
            Daily challenge
          </h2>
          <p className="mt-2 text-xs font-medium text-pulse-muted">Physics pulse · today&apos;s pick</p>
        </div>
        <span className="rounded-full border border-pulse-border bg-pulse-surface-strong px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide text-pulse-muted">
          {isoToday()}
        </span>
      </div>
      <p className="mt-3 text-sm font-medium leading-snug text-pulse-text line-clamp-3">{q.stem}</p>
      <p className="mt-2 text-xs leading-relaxed text-pulse-muted line-clamp-2">{hook}</p>
      <div className="mt-4">
        <Link
          href={`/practice?q=${encodeURIComponent(q.id)}`}
          className="inline-flex rounded-lg bg-pulse-green px-4 py-2 text-sm font-semibold text-pulse-bg no-underline transition hover:brightness-110"
        >
          Answer in practice
        </Link>
      </div>
    </div>
  );
}
