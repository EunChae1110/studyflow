"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import type { StudentProfile } from "@/lib/types";

const crumbsByPath: Record<string, { label: string }[]> = {
  "/dashboard": [{ label: "Overview" }],
  "/assignments": [{ label: "Assignments" }],
  "/courses": [{ label: "Courses" }],
  "/calendar": [{ label: "Calendar" }],
  "/research-library": [{ label: "Research Library" }],
};

export function DashboardShellClient({
  children,
  profile,
  courseLabels,
}: {
  children: React.ReactNode;
  profile?: StudentProfile;
  courseLabels?: string[];
}) {
  const pathname = usePathname();
  const crumbs = crumbsByPath[pathname] ?? [{ label: "Workspace" }];

  return (
    <AppShell crumbs={crumbs} profile={profile} courseLabels={courseLabels}>
      {children}
    </AppShell>
  );
}
