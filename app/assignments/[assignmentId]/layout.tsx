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

/** Session-scoped shell — await params + requireUser inside Suspense. */
async function AssignmentShell({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
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

export default function AssignmentLayout({
  children,
  params,
}: AssignmentLayoutProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AssignmentShell params={params}>{children}</AssignmentShell>
    </Suspense>
  );
}
