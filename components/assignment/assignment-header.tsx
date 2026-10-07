import Link from "next/link";
import { Shield } from "lucide-react";
import { BuildRunner } from "@/components/assignment/build-runner";
import { DeleteButton } from "@/components/workspace/delete-button";
import type { AssignmentDetail } from "@/lib/types";
import { typeLabel } from "@/lib/assignment-types";
import { Badge } from "@/components/ui/badge";

export function AssignmentHeader({ assignment }: { assignment: AssignmentDetail }) {
  return (
    <section className="mb-5 space-y-3">
      <Link href="/dashboard" className="inline-flex text-xs font-medium text-muted hover:text-foreground">
        ← Back to overview
      </Link>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{assignment.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{assignment.course}</Badge>
            <Badge variant="outline">{typeLabel(assignment.assignmentType)}</Badge>
            {assignment.wordLimit ? <Badge variant="outline">{assignment.wordLimit}</Badge> : null}
            {assignment.citationStyle ? (
              <Badge variant="outline">{assignment.citationStyle}</Badge>
            ) : null}
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              {assignment.due}
            </Badge>
            {assignment.supportMode ? (
              <Badge className="bg-primary-soft text-primary">
                <Shield className="size-3" />
                {assignment.supportMode}
              </Badge>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BuildRunner assignmentSlug={assignment.slug} variant="header" />
          <DeleteButton
            kind="assignment"
            id={assignment.slug}
            label={assignment.title}
            size="sm"
            variant="ghost"
            redirectTo="/assignments"
          />
        </div>
      </div>
    </section>
  );
}
