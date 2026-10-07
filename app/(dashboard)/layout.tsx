"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";

const crumbsByPath: Record<string, { label: string }[]> = {
  "/dashboard": [{ label: "Overview" }],
  "/assignments": [{ label: "Assignments" }],
  "/courses": [{ label: "Courses" }],
  "/calendar": [{ label: "Calendar" }],
  "/research-library": [{ label: "Research Library" }],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const crumbs = crumbsByPath[pathname] ?? [{ label: "Workspace" }];

  return <AppShell crumbs={crumbs}>{children}</AppShell>;
}
