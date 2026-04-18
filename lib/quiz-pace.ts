export type QuizPace = "easy" | "medium" | "hard";

export const PACE_SECONDS_PER_QUESTION: Record<QuizPace, number> = {
  easy: 60,
  medium: 45,
  hard: 30,
};

export const PACE_LABEL: Record<QuizPace, string> = {
  easy: "Easy · 60s / question",
  medium: "Medium · 45s / question",
  hard: "Hard · 30s / question",
};

export function paceTotalSeconds(deckLength: number, pace: QuizPace): number {
  return deckLength * PACE_SECONDS_PER_QUESTION[pace];
}

export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
