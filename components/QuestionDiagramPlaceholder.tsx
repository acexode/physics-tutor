export function QuestionDiagramPlaceholder({
  diagramKey,
}: {
  diagramKey?: string;
}) {
  if (!diagramKey) return null;
  return (
    <figure className="my-4 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
      <figcaption className="text-sm text-zinc-600 dark:text-zinc-400">
        Diagram placeholder{" "}
        <code className="rounded bg-zinc-200 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800">
          {diagramKey}
        </code>
      </figcaption>
      <p className="mt-2 text-xs text-zinc-500">
        Add an image at{" "}
        <code className="font-mono">public/diagrams/{diagramKey}.png</code> and swap this
        component for an <code className="font-mono">Image</code> when ready.
      </p>
    </figure>
  );
}
