import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getCoursesForUser, listAssignments } from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CreateAssignmentForm } from "@/components/workspace/create-assignment-form";
import { DeleteButton } from "@/components/workspace/delete-button";
import { cn } from "@/lib/utils";

function AssignmentsListFallback() {
  return (
    <div className="space-y-4">
      {[0, 1].map((i) => (
        <div key={i} className="h-40 animate-pulse rounded-xl border border-border bg-surface-muted" />
      ))}
    </div>
  );
}

async function AssignmentsList() {
  const user = await requireUser();
  const [items, courses] = await Promise.all([
    listAssignments(user.id),
    getCoursesForUser(user.id),
  ]);

  if (items.length === 0) {
    return (
      <Card className="border-border bg-surface">
        <CardContent className="space-y-3 p-6 text-sm text-muted">
          <p>No assignments yet. Create one to start the evidence-based workflow.</p>
          <CreateAssignmentForm courses={courses} triggerVariant="outline" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {items.map((assignment) => (
        <Card key={assignment.slug} className="border-border bg-surface">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{assignment.title}</CardTitle>
              <p className="mt-1 text-xs text-muted">{assignment.course}</p>
            </div>
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              {assignment.due}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={assignment.progress} className="h-1.5 bg-surface-muted" />
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface-muted p-3">
                <p className="flex items-center gap-1.5 font-medium text-foreground">
                  <CheckCircle2 className="size-4 text-[var(--success)]" />
                  Progress
                </p>
                <p className="text-xs text-muted">{assignment.progress}% complete</p>
              </div>
              <div className="rounded-lg border border-border bg-surface-muted p-3">
                <p className="flex items-center gap-1.5 font-medium text-foreground">
                  <Clock3 className="size-4 text-warning" />
                  Next actions
                </p>
                <p className="text-xs text-muted">
                  {assignment.nextAction ?? "Review brief and gather evidence"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/assignments/${assignment.slug}/brief`}
                className={cn(buttonVariants(), "inline-flex items-center gap-1.5")}
              >
                Open workspace
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={`/assignments/${assignment.slug}/brief`}
                className={buttonVariants({ variant: "outline" })}
              >
                Review checklist
              </Link>
              <DeleteButton
                kind="assignment"
                id={assignment.slug}
                label={assignment.title}
                variant="ghost"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

async function AssignmentsHeader() {
  const user = await requireUser();
  const courses = await getCoursesForUser(user.id);
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Assignments</h1>
        <p className="text-sm text-muted">
          Understand requirements, organise sources, verify evidence, then draft independently.
        </p>
      </div>
      <CreateAssignmentForm courses={courses} />
    </div>
  );
}

export default function AssignmentsPage() {
  return (
    <div className="space-y-4">
      <Suspense fallback={<div className="h-16 animate-pulse rounded-xl bg-surface-muted" />}>
        <AssignmentsHeader />
      </Suspense>

      <Suspense fallback={<AssignmentsListFallback />}>
        <AssignmentsList />
      </Suspense>
    </div>
  );
}
