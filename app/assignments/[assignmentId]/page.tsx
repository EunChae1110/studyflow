import { redirect } from "next/navigation";

export default async function AssignmentIndexPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  redirect(`/assignments/${assignmentId}/brief`);
}
