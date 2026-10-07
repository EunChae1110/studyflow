import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AssignmentShellClient } from "@/components/assignment/assignment-shell-client";
import { requireUser, toStudentProfile } from "@/lib/auth";
import {
  getAssignmentBySlug,
  getCoursesForUser,
} from "@/lib/db/queries";

type AssignmentLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ assignmentId: string }>;
};

/** Session-scoped shell — always resolve requireUser before DB reads. */
async function AssignmentShell({
  children,
  assignmentId,
}: {
  children: React.ReactNode;
  assignmentId: string;
}) {
  const user = await requireUser();
  const [assignment, courses] = await Promise.all([
    getAssignmentBySlug(assignmentId, user.id),
    getCoursesForUser(user.id),
  ]);

  if (!assignment) notFound();

  return (
    <AssignmentShellClient
      assignmentId={assignment.slug}
      assignment={assignment}
      profile={toStudentProfile(user)}
      courses={courses.map((c) => ({ id: c.id, name: c.name }))}
    >
      {children}
    </AssignmentShellClient>
  );
}

export default async function AssignmentLayout({
  children,
  params,
}: AssignmentLayoutProps) {
  const { assignmentId } = await params;

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AssignmentShell assignmentId={assignmentId}>{children}</AssignmentShell>
    </Suspense>
  );
}
