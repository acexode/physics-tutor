import { Suspense } from "react";
import { PracticeClient } from "@/components/PracticeClient";

export default function PracticePage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Suspense
        fallback={
          <div className="px-4 py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Loading practice…
          </div>
        }
      >
        <PracticeClient />
      </Suspense>
    </div>
  );
}
