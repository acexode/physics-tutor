"use client";

import type { PhysicsConstant } from "@/lib/jamb/types";
import { MathText } from "./MathText";

export function ConstantsSidebar({ items }: { items: PhysicsConstant[] }) {
  return (
    <aside className="w-full shrink-0 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:w-64 lg:sticky lg:top-4 lg:self-start">
      <h2 className="text-sm font-semibold tracking-wide text-zinc-900 dark:text-zinc-50">
        Constants
      </h2>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Values often used in JAMB-style calculations.
      </p>
      <ul className="mt-4 space-y-4">
        {items.map((c) => (
          <li key={c.id}>
            <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {c.label}
            </div>
            <div className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
              <MathText text={c.latex} />
            </div>
            {c.notes ? (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{c.notes}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </aside>
  );
}
