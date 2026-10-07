import { Suspense } from "react";
import { DashboardShellClient } from "@/components/layout/dashboard-shell-client";
import { requireUser, toStudentProfile } from "@/lib/auth";
import { getCoursesForUser } from "@/lib/db/queries";

/** Session-scoped shell — always resolve requireUser before DB reads. */
async function DashboardShell({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const courses = await getCoursesForUser(user.id);

  return (
    <DashboardShellClient
      profile={toStudentProfile(user)}
      courses={courses.map((c) => ({ id: c.id, name: c.name }))}
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
