import Link from "next/link";
import type { SyllabusTopic } from "@/lib/jamb/types";
import { TopicProgressRing } from "./TopicProgressRing";

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
    <div className="group flex flex-col rounded-2xl border border-pulse-border bg-pulse-surface p-4 shadow-[0_0_24px_transparent] backdrop-blur-md transition hover:border-pulse-blue/40 hover:shadow-[0_0_28px_var(--pulse-glow)]">
      <div className="flex gap-4">
        <TopicProgressRing pct={pct} label="topic" />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-pulse-blue">
            Topic {topic.jambNumber}
          </div>
          <h3 className="mt-1 text-base font-bold leading-snug text-pulse-text">{topic.title}</h3>
          <p className="mt-2 text-xs text-pulse-muted line-clamp-2">{topic.contentNotes}</p>
          <p className="mt-2 text-[11px] font-medium text-pulse-muted">
            Objectives mastered:{" "}
            <span className="tabular-nums text-pulse-text">
              {mastered}/{total}
            </span>
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/topics/${topic.id}`}
          className="inline-flex flex-1 min-w-[8rem] items-center justify-center rounded-xl bg-pulse-blue px-3 py-2 text-center text-xs font-bold text-pulse-bg no-underline transition hover:brightness-110"
        >
          Objectives
        </Link>
        <Link
          href={`/practice?topic=${topic.id}`}
          className="inline-flex flex-1 min-w-[8rem] items-center justify-center rounded-xl border border-pulse-border bg-pulse-surface-strong px-3 py-2 text-xs font-semibold text-pulse-text no-underline backdrop-blur-sm transition hover:border-pulse-green/50"
        >
          Practice
        </Link>
      </div>
    </div>
  );
}
