export function QuestionDiagramPlaceholder({
  diagramKey,
}: {
  diagramKey?: string;
}) {
  if (!diagramKey) return null;
  return (
    <figure className="my-4 rounded-xl border border-dashed border-pulse-border bg-pulse-surface-strong/50 p-6 text-center backdrop-blur-sm">
      <figcaption className="text-sm text-pulse-muted">
        Diagram placeholder{" "}
        <code className="rounded border border-pulse-border bg-pulse-surface px-1.5 py-0.5 font-mono text-xs text-pulse-text">
          {diagramKey}
        </code>
      </figcaption>
      <p className="mt-2 text-xs text-pulse-muted">
        Add an image at{" "}
        <code className="font-mono">public/diagrams/{diagramKey}.png</code> and swap this
        component for an <code className="font-mono">Image</code> when ready.
      </p>
    </figure>
  );
}
