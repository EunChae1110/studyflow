import { Suspense } from "react";
import { CalendarDays, Clock4 } from "lucide-react";
import { getDeadlines } from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function DeadlineList() {
  const deadlines = await getDeadlines(30);

  return (
    <Card className="border-border bg-surface">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="size-4 text-primary" />
          Upcoming deadlines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {deadlines.length === 0 ? (
          <p className="text-sm text-muted">No deadlines yet. Assignments with due dates appear here.</p>
        ) : (
          deadlines.map((item) => (
            <div key={item.slug} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <Clock4 className="size-4 text-muted" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted">
                  {item.course} · {item.due}
                </p>
              </div>
              <Badge
                className={
                  item.urgency === "danger"
                    ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                    : item.urgency === "warning"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                }
              >
                {item.daysLeft}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default function CalendarPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <p className="text-sm text-muted">
          Track due dates and plan verification checkpoints before drafting.
        </p>
      </div>
      <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-surface-muted" />}>
        <DeadlineList />
      </Suspense>
    </div>
  );
}
