"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { getQuestionsForTopic, QUESTIONS } from "@/lib/jamb/questions-data";
import { getTopicById } from "@/lib/jamb/syllabus-data";
import { PHYSICS_CONSTANTS } from "@/lib/jamb/physics-constants";
import { ConstantsSidebar } from "./ConstantsSidebar";
import { QuizModule } from "./QuizModule";

export function PracticeClient() {
  const searchParams = useSearchParams();
  const topicId = searchParams.get("topic");
  const topic = topicId ? getTopicById(topicId) : undefined;

  const questions = useMemo(() => {
    if (topicId) return getQuestionsForTopic(topicId);
    return QUESTIONS;
  }, [topicId]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        <header className="mb-6">
          <Link
            href="/"
            className="text-sm font-medium text-emerald-700 underline dark:text-emerald-400"
          >
            Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {topic ? `Practice · ${topic.title}` : "Practice · all loaded questions"}
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {topic
              ? "Filtered to questions tagged with this topic. Add more stems in data/questions-stems.json and merge answers."
              : "All questions currently in the bank."}
          </p>
        </header>
        <QuizModule questions={questions} syllabusHintTopicId={topicId ?? undefined} />
      </div>
      <ConstantsSidebar items={PHYSICS_CONSTANTS} />
    </div>
  );
}
