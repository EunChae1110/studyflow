import { Suspense } from "react";
import { ContinueWorkingCard, DashboardSplitPanels } from "@/components/dashboard/dashboard-panels";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { requireUser } from "@/lib/auth";
import {
  getDashboardStats,
  getDashboardSummary,
  getDeadlines,
  getResearchSources,
} from "@/lib/db/queries";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-surface-muted ${className ?? ""}`} />;
}

async function DashboardHeader() {
  const user = await requireUser();
  const summary = await getDashboardSummary(user.id);

  return (
    <section>
      <h1 className="text-2xl font-semibold">Good afternoon, {summary.studentName}</h1>
      <p className="text-sm text-muted">
        You have {summary.assignmentCount} assignment
        {summary.assignmentCount === 1 ? "" : "s"} to work on this week.
      </p>
    </section>
  );
}

async function DashboardStatsSection() {
  const user = await requireUser();
  const { stats, weeklyProgress } = await getDashboardStats(user.id);
  return <StatsOverview stats={stats} weeklyProgress={weeklyProgress} />;
}

async function DashboardMainPanels() {
  const user = await requireUser();
  const [summary, deadlines, sources] = await Promise.all([
    getDashboardSummary(user.id),
    getDeadlines(user.id, 5),
    getResearchSources({ userId: user.id, limit: 5 }),
  ]);

  return (
    <>
      <ContinueWorkingCard assignment={summary.assignments[0] ?? null} />
      <DashboardSplitPanels deadlines={deadlines} sources={sources} />
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <Suspense
        fallback={
          <section className="space-y-2">
            <SkeletonBlock className="h-8 w-64" />
            <SkeletonBlock className="h-4 w-80" />
          </section>
        }
      >
        <DashboardHeader />
      </Suspense>
      <Suspense fallback={<SkeletonBlock className="h-64 w-full" />}>
        <DashboardStatsSection />
      </Suspense>
      <Suspense fallback={<SkeletonBlock className="h-80 w-full" />}>
        <DashboardMainPanels />
      </Suspense>
    </div>
  );
}
