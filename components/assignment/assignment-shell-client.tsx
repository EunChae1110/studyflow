"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { AssignmentAiPanel } from "@/components/assignment/assignment-ai-panel";
import { AssignmentHeader } from "@/components/assignment/assignment-header";
import { AssignmentTabs } from "@/components/assignment/assignment-tabs";
import { AppShell } from "@/components/layout/app-shell";
import { assignment } from "@/lib/mock-data";

const labelByView: Record<string, string> = {
  brief: "Brief",
  notes: "Notes",
  research: "Research",
  outline: "Outline",
  draft: "Draft",
  references: "References",
  "claim-evidence": "Claim–evidence map",
};

export function AssignmentShellClient({
  assignmentId,
  children,
}: {
  assignmentId: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  const current = parts[parts.length - 1] ?? "brief";
  const view = (current in labelByView ? current : "brief") as
    | "brief"
    | "notes"
    | "research"
    | "outline"
    | "draft"
    | "references"
    | "claim-evidence";

  const tab = view === "claim-evidence" ? "outline" : view;
  const crumbs = useMemo(
    () => [
      { label: "Assignments" },
      { label: assignment.title },
      { label: labelByView[view] ?? "Brief" },
    ],
    [view],
  );

  return (
    <AppShell
      crumbs={crumbs}
      rightPanel={
        <AssignmentAiPanel
          view={tab as "brief" | "notes" | "research" | "outline" | "draft" | "references"}
        />
      }
    >
      <AssignmentHeader />
      <AssignmentTabs assignmentId={assignmentId} activeTab={tab} />
      {children}
    </AppShell>
  );
}
