import Link from "next/link";
import { ArrowRight, BookOpen, LibraryBig } from "lucide-react";
import { assignment, deadlines, researchSources } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function ContinueWorkingCard() {
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
          <Badge variant="outline">{assignment.wordLimit}</Badge>
          <Badge variant="outline">{assignment.citationStyle}</Badge>
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            {assignment.progress}% complete
          </Badge>
        </div>
        <Progress value={assignment.progress} className="h-1.5 w-full max-w-sm bg-surface-muted" />
        <div className="flex flex-wrap gap-1.5 text-xs">
          <MiniStep done>Brief</MiniStep>
          <MiniStep done>Notes</MiniStep>
          <MiniStep done>Research</MiniStep>
          <MiniStep current>Outline</MiniStep>
          <MiniStep>Draft</MiniStep>
        </div>
        <p className="text-sm text-muted">
          Current task: <span className="font-medium text-foreground">Verify 2 research sources</span> · Next: Verify evidence
        </p>
        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          <Button asChild>
            <Link href={`/assignments/${assignment.id}/brief`}>
              Continue assignment
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/assignments/${assignment.id}/brief`}>Open details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardSplitPanels() {
  return (
    <div className="grid gap-4 xl:grid-cols-[2fr_1.2fr]">
      <Card className="border-border bg-surface shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Upcoming deadlines</CardTitle>
          <Button variant="ghost" size="sm">
            View calendar
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {deadlines.map((deadline) => (
            <div key={deadline.title} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3">
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
          ))}
        </CardContent>
      </Card>

      <Card className="border-border bg-surface shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent sources</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/research-library">Library</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {researchSources.map((source) => (
            <div key={source.doi} className="rounded-lg border border-border p-3">
              <p className="text-sm font-medium leading-5">{source.title}</p>
              <p className="mt-1 text-xs text-muted">
                {source.venue} · {source.year}
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
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStep({
  children,
  done = false,
  current = false,
}: {
  children: React.ReactNode;
  done?: boolean;
  current?: boolean;
}) {
  return (
    <span
      className={`rounded-md px-2 py-1 ${
        current
          ? "bg-primary-soft text-primary"
          : done
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            : "bg-surface-muted text-muted"
      }`}
    >
      {done ? "✓ " : ""}
      {children}
    </span>
  );
}
