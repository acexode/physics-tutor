import { Suspense } from "react";
import { PracticeClient } from "@/components/PracticeClient";

export default function PracticePage() {
  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="px-4 py-16 text-center text-sm text-pulse-muted">Loading practice…</div>
        }
      >
        <PracticeClient />
      </Suspense>
    </div>
  );
}
