"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { AssignmentAiPanel } from "@/components/assignment/assignment-ai-panel";
import { AssignmentHeader } from "@/components/assignment/assignment-header";
import { AssignmentTabs } from "@/components/assignment/assignment-tabs";
import { BuildProvider } from "@/components/assignment/build-context";
import { AppShell } from "@/components/layout/app-shell";
import { tabsForAssignmentType } from "@/lib/assignment-types";
import type { AssignmentDetail, SidebarCourse, StudentProfile } from "@/lib/types";

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
  assignment,
  profile,
  courses,
  children,
}: {
  assignmentId: string;
  assignment: AssignmentDetail;
  profile?: StudentProfile;
  courses?: SidebarCourse[];
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
    [assignment.title, view],
  );

  const hasGuidelineFile = (assignment.guidelines ?? []).length > 0;

  const produceTabLabel =
    tabsForAssignmentType(assignment.assignmentType).find(
      (t) => t.href === "draft",
    )?.label ?? "Draft";

  return (
    <BuildProvider
      assignmentSlug={assignment.slug}
      hasGuideline={hasGuidelineFile}
      produceTabLabel={produceTabLabel}
    >
      <AppShell
        crumbs={crumbs}
        profile={profile}
        courses={courses}
        rightPanel={
          <AssignmentAiPanel
            view={
              tab as
                | "brief"
                | "notes"
                | "research"
                | "outline"
                | "draft"
                | "references"
            }
            assignmentSlug={assignment.slug}
            assignmentType={assignment.assignmentType}
          />
        }
      >
        <AssignmentHeader assignment={assignment} />
        <AssignmentTabs
          assignmentId={assignmentId}
          activeTab={tab}
          assignmentType={assignment.assignmentType}
        />
        {children}
      </AppShell>
    </BuildProvider>
  );
}
