"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SYLLABUS_TOPICS } from "@/lib/jamb/syllabus-data";
import { topicProgress } from "@/lib/jamb/types";
import { PHYSICS_CONSTANTS } from "@/lib/jamb/physics-constants";
import { ConstantsSidebar } from "./ConstantsSidebar";
import { TopicCard } from "./TopicCard";

export function HomeDashboard() {
  const [, bump] = useState(0);
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
        <header className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Physics Pulse
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            JAMB Physics prep
          </h1>
          <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Master the official syllabus by topic, then practice past-style MCQs with
            explanations. Progress for each topic is saved in your browser.
          </p>
          <Link
            href="/practice"
            className="mt-4 inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white no-underline hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400"
          >
            Full practice bank
          </Link>
        </header>

        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Syllabus topics
        </h2>
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
