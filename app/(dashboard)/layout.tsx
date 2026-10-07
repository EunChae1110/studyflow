import { Suspense } from "react";
import { DashboardShellClient } from "@/components/layout/dashboard-shell-client";
import { getCoursesForUser, getStudentProfile } from "@/lib/db/queries";

async function DashboardShell({ children }: { children: React.ReactNode }) {
  const [profile, courses] = await Promise.all([
    getStudentProfile(),
    getCoursesForUser(),
  ]);

  return (
    <DashboardShellClient
      profile={profile}
      courseLabels={courses.map((c) => c.name)}
    >
      {children}
    </DashboardShellClient>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
