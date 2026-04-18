export type RoundSummaryStats = {
  correct: number;
  wrong: number;
  total: number;
  topicLabel?: string;
  /** Whole-deck timer hit zero; unanswered counted as wrong. */
  endedByTimeOut?: boolean;
  unansweredCount?: number;
  paceLabel?: string;
};

export function roundSummaryHeadline(stats: RoundSummaryStats): {
  title: string;
  subtitle: string;
  badge: string;
} {
  const { correct, wrong, total, endedByTimeOut, unansweredCount } = stats;
  if (total === 0) {
    return {
      title: "Round complete",
      subtitle: "No questions in this set — add more stems to the bank.",
      badge: "∅",
    };
  }
  if (endedByTimeOut) {
    const u = unansweredCount ?? 0;
    return {
      title: "Time's up",
      subtitle: `The clock won this round. ${u} unanswered ${u === 1 ? "item" : "items"} count as misses — try a calmer pace or shuffle and sprint again.`,
      badge: "⏱️",
    };
  }

  const pct = (correct / total) * 100;
  if (pct === 100) {
    return {
      title: "Perfect arc",
      subtitle: "You bent every question into the right answer. Thermodynamics would be proud.",
      badge: "⚡",
    };
  }
  if (pct >= 85) {
    return {
      title: "High‑voltage round",
      subtitle: "Mostly bullseyes. A little noise in the signal, but the trend is clear: you are dangerous.",
      badge: "🔋",
    };
  }
  if (pct >= 65) {
    return {
      title: "Solid phase",
      subtitle: "Good hit rate. A few distractors still sneak past — skim the explanations and strike again.",
      badge: "📈",
    };
  }
  if (pct >= 45) {
    return {
      title: "Warming up",
      subtitle: "Half the battle is showing up; the other half is vectors. Keep drilling — entropy favours repetition.",
      badge: "🌡️",
    };
  }
  return {
    title: "Plot twist",
    subtitle: "Rough round, brave round. Wrong answers are just free tutoring — read the notes, then shuffle and rematch.",
    badge: "🧲",
  };
}
