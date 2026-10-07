import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AssignmentShellClient } from "@/components/assignment/assignment-shell-client";
import {
  getAssignmentBySlug,
  getCoursesForUser,
  getStudentProfile,
} from "@/lib/db/queries";

type AssignmentLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ assignmentId: string }>;
};

async function AssignmentShell({
  children,
  assignmentId,
}: {
  children: React.ReactNode;
  assignmentId: string;
}) {
  const [assignment, profile, courses] = await Promise.all([
    getAssignmentBySlug(assignmentId),
    getStudentProfile(),
    getCoursesForUser(),
  ]);

  if (!assignment) notFound();

  return (
    <AssignmentShellClient
      assignmentId={assignment.slug}
      assignment={assignment}
      profile={profile}
      courseLabels={courses.map((c) => c.name)}
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
