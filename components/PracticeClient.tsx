"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { getQuestionsForTopic, QUESTIONS } from "@/lib/jamb/questions-data";
import { getTopicById } from "@/lib/jamb/syllabus-data";
import { PHYSICS_CONSTANTS } from "@/lib/jamb/physics-constants";
import { recordStudyVisit } from "@/lib/gamification";
import { ConstantsSidebar } from "./ConstantsSidebar";
import { QuizModule } from "./QuizModule";
import { ThemeToggle } from "./ThemeToggle";

export function PracticeClient() {
  const searchParams = useSearchParams();
  const topicId = searchParams.get("topic");
  const qParam = searchParams.get("q");
  const topic = topicId ? getTopicById(topicId) : undefined;

  useEffect(() => {
    recordStudyVisit();
  }, []);

  const questions = useMemo(() => {
    if (topicId) return getQuestionsForTopic(topicId);
    return QUESTIONS;
  }, [topicId]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/"
              className="text-sm font-medium text-pulse-blue underline-offset-2 hover:underline"
            >
              Dashboard
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-pulse-text">
              {topic ? `Practice · ${topic.title}` : "Practice · all loaded questions"}
            </h1>
            <p className="mt-2 text-sm text-pulse-muted">
              {topic
                ? "Filtered to questions tagged with this topic. Add more stems in data/questions-stems.json and merge answers."
                : "All questions currently in the bank."}
            </p>
          </div>
          <ThemeToggle />
        </header>
        <QuizModule
          questions={questions}
          syllabusHintTopicId={topicId ?? undefined}
          initialQuestionId={qParam ?? undefined}
        />
      </div>
      <ConstantsSidebar items={PHYSICS_CONSTANTS} />
    </div>
  );
}
