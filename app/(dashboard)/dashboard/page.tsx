import { ContinueWorkingCard, DashboardSplitPanels } from "@/components/dashboard/dashboard-panels";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { studentProfile } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <section>
        <h1 className="text-2xl font-semibold">Good afternoon, {studentProfile.name}</h1>
        <p className="text-sm text-muted">You have 3 assignments to work on this week.</p>
      </section>
      <StatsOverview />
      <ContinueWorkingCard />
      <DashboardSplitPanels />
    </div>
  );
}
