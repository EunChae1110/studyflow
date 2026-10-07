import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BriefPanels } from "@/components/assignment/brief-panels";
import { getAssignmentBySlug } from "@/lib/db/queries";
import { recomputeAssignmentProgress } from "@/lib/workspace/progress";

async function BriefContent({ assignmentId }: { assignmentId: string }) {
  let assignment = await getAssignmentBySlug(assignmentId);
  if (!assignment) notFound();

  // Catch up progress for assignments that already had guidelines/brief
  // before auto-recompute existed (never decreases).
  const next = await recomputeAssignmentProgress(assignment.id);
  if (typeof next === "number" && next !== assignment.progress) {
    assignment = (await getAssignmentBySlug(assignmentId)) ?? assignment;
  }

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
