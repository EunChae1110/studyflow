import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BriefPanels } from "@/components/assignment/brief-panels";
import { getAssignmentBySlug } from "@/lib/db/queries";

async function BriefContent({ assignmentId }: { assignmentId: string }) {
  const assignment = await getAssignmentBySlug(assignmentId);
  if (!assignment) notFound();
  return <BriefPanels assignment={assignment} />;
}

export default async function AssignmentBriefPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-surface-muted" />}>
      <BriefContent assignmentId={assignmentId} />
    </Suspense>
  );
}
