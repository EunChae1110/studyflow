import { Suspense } from "react";
import { redirect } from "next/navigation";

async function RedirectToBrief({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  redirect(`/assignments/${assignmentId}/brief`);
}

export default function AssignmentIndexPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <RedirectToBrief params={params} />
    </Suspense>
  );
}
