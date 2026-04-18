"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "physics-pulse-theme-v1";

type Theme = "dark" | "light";

function applyTheme(t: Theme) {
  document.documentElement.setAttribute("data-theme", t);
  try {
    window.localStorage.setItem(STORAGE_KEY, t);
  } catch {
    /* ignore */
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    let initial: Theme = "dark";
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved === "light" || saved === "dark") initial = saved;
    } catch {
      /* ignore */
    }
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-lg border border-pulse-border bg-pulse-surface px-3 py-1.5 text-xs font-medium text-pulse-text backdrop-blur-md transition hover:border-pulse-blue/50 hover:shadow-[0_0_20px_var(--pulse-glow)]"
      aria-pressed={theme === "light"}
    >
      {theme === "dark" ? "Daylight mode" : "Night mode"}
    </button>
  );
}
