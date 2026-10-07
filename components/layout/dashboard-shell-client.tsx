"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import type { SidebarCourse, StudentProfile } from "@/lib/types";

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
  courses,
}: {
  children: React.ReactNode;
  profile?: StudentProfile;
  courses?: SidebarCourse[];
}) {
  const pathname = usePathname();
  const crumbs =
    crumbsByPath[pathname] ??
    (pathname.startsWith("/courses/")
      ? [{ label: "Courses" }, { label: "Course" }]
      : [{ label: "Workspace" }]);

  return (
    <AppShell crumbs={crumbs} profile={profile} courses={courses}>
      {children}
    </AppShell>
  );
}
