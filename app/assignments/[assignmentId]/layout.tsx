import { Suspense } from "react";
import { AssignmentShellClient } from "@/components/assignment/assignment-shell-client";
import { assignment } from "@/lib/mock-data";

export function generateStaticParams() {
  return [{ assignmentId: assignment.id }];
}

type AssignmentLayoutProps = {
  children: React.ReactNode;
};

export default function AssignmentLayout({ children }: AssignmentLayoutProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AssignmentShellClient assignmentId={assignment.id}>{children}</AssignmentShellClient>
    </Suspense>
  );
}
