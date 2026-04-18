"use client";

import { useEffect, useState } from "react";
import { getGamificationSnapshot } from "@/lib/gamification";

export function GamificationStrip() {
  const [snap, setSnap] = useState(getGamificationSnapshot);

  useEffect(() => {
    const refresh = () => setSnap(getGamificationSnapshot());
    window.addEventListener("physics-pulse-gamification", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("physics-pulse-gamification", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="rounded-xl border border-pulse-border bg-pulse-surface px-3 py-1.5 text-xs backdrop-blur-md">
        <span className="text-pulse-muted">Streak </span>
        <span className="font-bold tabular-nums text-pulse-orange">{snap.streak}</span>
        <span className="text-pulse-muted"> d</span>
      </div>
      <div className="rounded-xl border border-pulse-border bg-pulse-surface px-3 py-1.5 text-xs backdrop-blur-md">
        <span className="text-pulse-muted">Physics pts </span>
        <span className="font-bold tabular-nums text-pulse-green">{snap.points}</span>
      </div>
    </div>
  );
}
