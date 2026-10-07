import { ContinueWorkingCard, DashboardSplitPanels } from "@/components/dashboard/dashboard-panels";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { getDashboardSummary } from "@/lib/db/queries";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <div className="space-y-4">
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
      <StatsOverview />
      <ContinueWorkingCard />
      <DashboardSplitPanels />
    </div>
  );
}
