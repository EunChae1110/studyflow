import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import { assignment } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function AssignmentsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Assignments</h1>
        <p className="text-sm text-muted">
          Understand requirements, organise sources, verify evidence, then draft independently.
        </p>
      </div>

      <Card className="border-border bg-surface">
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
                Completed
              </p>
              <p className="text-xs text-muted">Brief, Notes, and Research completed</p>
            </div>
            <div className="rounded-lg border border-border bg-surface-muted p-3">
              <p className="flex items-center gap-1.5 font-medium text-foreground">
                <Clock3 className="size-4 text-warning" />
                Next actions
              </p>
              <p className="text-xs text-muted">Check logic · Add to outline · Review limitations</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/assignments/${assignment.id}/brief`}
              className={cn(buttonVariants(), "inline-flex items-center gap-1.5")}
            >
              Open workspace
              <ArrowRight className="size-4" />
            </Link>
            <Button variant="outline">Review checklist</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
