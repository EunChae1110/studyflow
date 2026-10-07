import { Suspense } from "react";
import { ContinueWorkingCard, DashboardSplitPanels } from "@/components/dashboard/dashboard-panels";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { getDashboardSummary } from "@/lib/db/queries";

function DashboardHeaderFallback() {
  return (
    <section className="space-y-2">
      <div className="h-8 w-64 animate-pulse rounded-md bg-surface-muted" />
      <div className="h-4 w-80 animate-pulse rounded-md bg-surface-muted" />
    </section>
  );
}

async function DashboardHeader() {
  const summary = await getDashboardSummary();

  return (
    <section>
      <h1 className="text-2xl font-semibold">Good afternoon, {summary.studentName}</h1>
      <p className="text-sm text-muted">
        You have {summary.assignmentCount} assignment
        {summary.assignmentCount === 1 ? "" : "s"} to work on this week.
        {summary.source === "database" ? (
          <span className="ml-2 text-[11px] text-muted">· live data</span>
        ) : (
          <span className="ml-2 text-[11px] text-muted">· mock data</span>
        )}
      </p>
    </section>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <Suspense fallback={<DashboardHeaderFallback />}>
        <DashboardHeader />
      </Suspense>
      <StatsOverview />
      <ContinueWorkingCard />
      <DashboardSplitPanels />
    </div>
  );
}
