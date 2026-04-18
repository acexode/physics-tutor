/**
 * Client-only streak + points (localStorage). Call when an objective is newly mastered.
 */
const POINTS_KEY = "physics-pulse-points-v1";
const STREAK_KEY = "physics-pulse-streak-v1";
const LAST_DAY_KEY = "physics-pulse-last-study-day-v1";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(iso: string, delta: number): string {
  const x = new Date(`${iso}T12:00:00.000Z`);
  x.setUTCDate(x.getUTCDate() + delta);
  return x.toISOString().slice(0, 10);
}

export type GamificationSnapshot = {
  points: number;
  streak: number;
  lastStudyDay: string | null;
};

export function getGamificationSnapshot(): GamificationSnapshot {
  if (typeof window === "undefined") {
    return { points: 0, streak: 0, lastStudyDay: null };
  }
  return {
    points: Math.max(0, Number(window.localStorage.getItem(POINTS_KEY) ?? "0") || 0),
    streak: Math.max(0, Number(window.localStorage.getItem(STREAK_KEY) ?? "0") || 0),
    lastStudyDay: window.localStorage.getItem(LAST_DAY_KEY),
  };
}

function notifyGamification(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("physics-pulse-gamification"));
}

/**
 * First visit of a calendar day to a study surface (dashboard / topic / practice).
 * Updates streak only; does not add points.
 */
export function recordStudyVisit(): void {
  if (typeof window === "undefined") return;

  const today = isoDate(new Date());
  const last = window.localStorage.getItem(LAST_DAY_KEY) ?? "";
  if (last === today) return;

  const streakPrev = Math.max(0, Number(window.localStorage.getItem(STREAK_KEY) ?? "0") || 0);
  let streakNext = 1;
  if (last === addDays(today, -1)) {
    streakNext = streakPrev > 0 ? streakPrev + 1 : 1;
  }

  window.localStorage.setItem(LAST_DAY_KEY, today);
  window.localStorage.setItem(STREAK_KEY, String(streakNext));
  notifyGamification();
}

/** Award +1 point and update streak when user checks an objective (unchecked → checked). */
export function recordObjectiveMastered(): void {
  if (typeof window === "undefined") return;

  const points = Math.max(0, Number(window.localStorage.getItem(POINTS_KEY) ?? "0") || 0) + 1;
  window.localStorage.setItem(POINTS_KEY, String(points));

  const today = isoDate(new Date());
  const last = window.localStorage.getItem(LAST_DAY_KEY) ?? "";

  if (last === today) {
    notifyGamification();
    return;
  }

  const streakPrev = Math.max(0, Number(window.localStorage.getItem(STREAK_KEY) ?? "0") || 0);
  let streakNext = 1;
  if (last === addDays(today, -1)) {
    streakNext = streakPrev > 0 ? streakPrev + 1 : 1;
  }

  window.localStorage.setItem(LAST_DAY_KEY, today);
  window.localStorage.setItem(STREAK_KEY, String(streakNext));
  notifyGamification();
}
