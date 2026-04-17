import { notFound } from "next/navigation";
import { getTopicById } from "@/lib/jamb/syllabus-data";
import { ObjectivesPanel } from "@/components/ObjectivesPanel";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const topic = getTopicById(topicId);
  if (!topic) notFound();

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl">
        <ObjectivesPanel topic={topic} />
      </div>
    </div>
  );
}
