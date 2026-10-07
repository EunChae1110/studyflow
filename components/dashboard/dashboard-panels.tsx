import Link from "next/link";
import { ArrowRight, BookOpen, LibraryBig } from "lucide-react";
import type { AssignmentListItem, DeadlineItem, ResearchSourceItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function ContinueWorkingCard({
  assignment,
}: {
  assignment: AssignmentListItem | null;
}) {
  if (!assignment) {
    return (
      <Card className="mb-5 border-border bg-surface shadow-sm">
        <CardContent className="space-y-3 p-5">
          <Badge className="bg-primary-soft text-primary">Get started</Badge>
          <h2 className="text-xl font-semibold">No active assignment yet</h2>
          <p className="text-sm text-muted">
            Create a course and assignment to continue your evidence-based workflow.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/courses" className={cn(buttonVariants(), "inline-flex")}>
              Create course
            </Link>
            <Link href="/assignments" className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}>
              View assignments
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-5 border-border bg-surface shadow-sm">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <Badge className="bg-primary-soft text-primary">Continue working</Badge>
          <span className="text-sm text-muted">{assignment.due}</span>
        </div>
        <h2 className="text-xl font-semibold">{assignment.title}</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{assignment.course}</Badge>
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            {assignment.progress}% complete
          </Badge>
        </div>
        <Progress value={assignment.progress} className="h-1.5 w-full max-w-sm bg-surface-muted" />
        {assignment.nextAction ? (
          <p className="text-sm text-muted">
            Current task:{" "}
            <span className="font-medium text-foreground">{assignment.nextAction}</span>
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          <Link
            href={`/assignments/${assignment.slug}/brief`}
            className={cn(buttonVariants(), "inline-flex items-center gap-1.5")}
          >
            Continue assignment
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href={`/assignments/${assignment.slug}/brief`}
            className={buttonVariants({ variant: "outline" })}
          >
            Open details
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardSplitPanels({
  deadlines,
  sources,
}: {
  deadlines: DeadlineItem[];
  sources: ResearchSourceItem[];
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[2fr_1.2fr]">
      <Card className="border-border bg-surface shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Upcoming deadlines</CardTitle>
          <Link href="/calendar" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            View calendar
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {deadlines.length === 0 ? (
            <p className="text-sm text-muted">No upcoming deadlines.</p>
          ) : (
            deadlines.map((deadline) => (
              <div
                key={deadline.slug}
                className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3"
              >
                <span
                  className={`mt-1.5 size-2 rounded-full ${
                    deadline.urgency === "danger"
                      ? "bg-[var(--danger)]"
                      : deadline.urgency === "warning"
                        ? "bg-[var(--warning)]"
                        : "bg-[var(--success)]"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{deadline.title}</p>
                  <p className="text-xs text-muted">
                    {deadline.course} · {deadline.due}
                  </p>
                </div>
                <Badge
                  className={
                    deadline.urgency === "danger"
                      ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                      : deadline.urgency === "warning"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  }
                >
                  {deadline.daysLeft}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-surface shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent sources</CardTitle>
          <Link href="/research-library" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Library
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {sources.length === 0 ? (
            <p className="text-sm text-muted">No sources collected yet.</p>
          ) : (
            sources.map((source) => (
              <div key={source.id} className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium leading-5">{source.title}</p>
                <p className="mt-1 text-xs text-muted">
                  {source.venue ?? "Unknown venue"}
                  {source.year ? ` · ${source.year}` : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {source.verified ? (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <BookOpen className="size-3" /> Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      Needs review
                    </Badge>
                  )}
                  {source.openAccess ? (
                    <Badge className="bg-primary-soft text-primary">
                      <LibraryBig className="size-3" /> Open access
                    </Badge>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
