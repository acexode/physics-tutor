"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SYLLABUS_TOPICS } from "@/lib/jamb/syllabus-data";
import { topicProgress } from "@/lib/jamb/types";
import { recordStudyVisit } from "@/lib/gamification";
import { PHYSICS_CONSTANTS } from "@/lib/jamb/physics-constants";
import { ConstantsSidebar } from "./ConstantsSidebar";
import { TopicCard } from "./TopicCard";
import { DailyChallenge } from "./DailyChallenge";
import { GamificationStrip } from "./GamificationStrip";
import { ThemeToggle } from "./ThemeToggle";

export function HomeDashboard() {
  const [, bump] = useState(0);
  useEffect(() => {
    recordStudyVisit();
  }, []);
  useEffect(() => {
    const onStorage = () => bump((n) => n + 1);
    const onMastery = () => bump((n) => n + 1);
    window.addEventListener("storage", onStorage);
    window.addEventListener("physics-pulse-mastery", onMastery);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("physics-pulse-mastery", onMastery);
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-pulse-blue">Physics Pulse</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-pulse-text">
              JAMB Physics prep
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-pulse-muted">
              Master the official syllabus by topic, then practice past-style MCQs with explanations.
              Progress for each topic is saved in your browser.
            </p>
            <Link
              href="/practice"
              className="mt-4 inline-flex rounded-xl bg-pulse-green px-4 py-2.5 text-sm font-bold text-pulse-bg no-underline shadow-[0_0_20px_rgba(74,222,128,0.35)] transition hover:brightness-110"
            >
              Full practice bank
            </Link>
          </div>
          <div className="flex flex-col items-end gap-3">
            <ThemeToggle />
            <GamificationStrip />
          </div>
        </header>

        <DailyChallenge />

        <h2 className="mb-4 text-lg font-bold text-pulse-text">Syllabus topics</h2>
        <p className="mb-4 max-w-2xl text-xs text-pulse-muted">
          To add AI-written practice items (default 10 per topic, merged into the question bank), run
          locally:{" "}
          <code className="rounded border border-pulse-border bg-pulse-surface px-1.5 py-0.5 font-mono text-[11px] text-pulse-text">
            pnpm generate-topic-questions
          </code>{" "}
          (requires{" "}
          <code className="font-mono text-[11px] text-pulse-blue">OPENAI_API_KEY</code> in{" "}
          <code className="font-mono text-[11px]">.env.local</code>).
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {SYLLABUS_TOPICS.map((topic) => {
            const { mastered, total } = topicProgress(topic.id, topic.objectives.length);
            return (
              <TopicCard key={topic.id} topic={topic} mastered={mastered} total={total} />
            );
          })}
        </div>
      </div>
      <ConstantsSidebar items={PHYSICS_CONSTANTS} />
    </div>
  );
}
