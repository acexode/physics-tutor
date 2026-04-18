/** SVG ring: 0–100% objective mastery. */
export function TopicProgressRing({
  pct,
  label,
}: {
  pct: number;
  label: string;
}) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const dash = c * (1 - Math.min(100, Math.max(0, pct)) / 100);
  return (
    <div className="relative flex h-[84px] w-[84px] shrink-0 items-center justify-center">
      <svg className="-rotate-90" width="84" height="84" viewBox="0 0 84 84" aria-hidden>
        <circle
          cx="42"
          cy="42"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-pulse-border/50"
        />
        <circle
          cx="42"
          cy="42"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dash}
          className="text-pulse-green transition-[stroke-dashoffset] duration-500 ease-out"
          style={{ filter: "drop-shadow(0 0 6px var(--pulse-green))" }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-lg font-bold tabular-nums text-pulse-text">{pct}</span>
        <span className="text-[9px] font-medium uppercase tracking-wide text-pulse-muted">
          {label}
        </span>
      </div>
    </div>
  );
}
