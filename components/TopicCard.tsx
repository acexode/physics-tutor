import Link from "next/link";
import type { SyllabusTopic } from "@/lib/jamb/types";

export function TopicCard({
  topic,
  mastered,
  total,
}: {
  topic: SyllabusTopic;
  mastered: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-emerald-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-700">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
            Topic {topic.jambNumber}
          </div>
          <h3 className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {topic.title}
          </h3>
        </div>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {pct}%
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
        {topic.contentNotes}
      </p>
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>Objective mastery</span>
          <span>
            {mastered}/{total}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all dark:bg-emerald-400"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/topics/${topic.id}`}
          className="inline-flex flex-1 min-w-[8rem] items-center justify-center rounded-lg bg-zinc-900 px-3 py-2 text-center text-xs font-medium text-white no-underline dark:bg-zinc-100 dark:text-zinc-900"
        >
          Objectives
        </Link>
        <Link
          href={`/practice?topic=${topic.id}`}
          className="inline-flex flex-1 min-w-[8rem] items-center justify-center rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-800 no-underline dark:border-zinc-700 dark:text-zinc-100"
        >
          Practice
        </Link>
      </div>
    </div>
  );
}
