"use client";

import type { PhysicsConstant } from "@/lib/jamb/types";
import { MathText } from "./MathText";

export function ConstantsSidebar({ items }: { items: PhysicsConstant[] }) {
  return (
    <aside className="w-full shrink-0 rounded-2xl border border-pulse-border bg-pulse-surface p-4 shadow-[0_0_20px_rgba(56,189,248,0.12)] backdrop-blur-md lg:w-64 lg:sticky lg:top-4 lg:self-start">
      <h2 className="text-sm font-bold tracking-wide text-pulse-text">Constants</h2>
      <p className="mt-1 text-xs text-pulse-muted">Values often used in JAMB-style calculations.</p>
      <ul className="mt-4 space-y-4">
        {items.map((c) => (
          <li key={c.id} className="rounded-lg border border-pulse-border/50 bg-pulse-surface-strong/40 p-2">
            <div className="text-xs font-semibold text-pulse-blue">{c.label}</div>
            <div className="mt-1 text-sm text-pulse-text">
              <MathText text={c.latex} />
            </div>
            {c.notes ? <p className="mt-1 text-xs text-pulse-muted">{c.notes}</p> : null}
          </li>
        ))}
      </ul>
    </aside>
  );
}
