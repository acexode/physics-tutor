"use client";

import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";

function renderPiece(part: string, key: number) {
  const trimmed = part.trim();
  if (!trimmed) return null;
  try {
    return <InlineMath key={key} math={trimmed} />;
  } catch {
    return (
      <span key={key} className="text-red-600">
        {part}
      </span>
    );
  }
}

/** Renders plain text with inline TeX segments delimited by single `$...$`. */
export function MathText({ text }: { text: string }) {
  const segments = text.split(/(\$[^$]+\$)/g);
  return (
    <span className="inline leading-relaxed">
      {segments.map((seg, i) => {
        if (seg.startsWith("$") && seg.endsWith("$")) {
          return renderPiece(seg.slice(1, -1), i);
        }
        return (
          <span key={i} className="whitespace-pre-wrap">
            {seg}
          </span>
        );
      })}
    </span>
  );
}
