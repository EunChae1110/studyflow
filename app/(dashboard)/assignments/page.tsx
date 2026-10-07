import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { listAssignments } from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
  const items = await listAssignments(user.id);

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
              <Button variant="outline">Review checklist</Button>
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

export default function AssignmentsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Assignments</h1>
        <p className="text-sm text-muted">
          Understand requirements, organise sources, verify evidence, then draft independently.
        </p>
      </div>

      <Suspense fallback={<AssignmentsListFallback />}>
        <AssignmentsList />
      </Suspense>
    </div>
  );
}
