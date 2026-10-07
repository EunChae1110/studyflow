import { Suspense } from "react";
import { DashboardShellClient } from "@/components/layout/dashboard-shell-client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <DashboardShellClient>{children}</DashboardShellClient>
    </Suspense>
  );
}
