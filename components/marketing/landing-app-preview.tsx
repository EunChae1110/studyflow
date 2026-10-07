"use client";

import { AssistantPanel } from "@/components/ai/assistant-panel";
import { AssignmentHeader } from "@/components/assignment/assignment-header";
import { AssignmentTabs } from "@/components/assignment/assignment-tabs";
import { BriefPanels } from "@/components/assignment/brief-panels";
import { AppShell } from "@/components/layout/app-shell";
import {
  landingAssignment,
  landingCourseLabels,
  landingProfile,
} from "@/lib/landing-demo";

/** Real assignment chrome embedded in the marketing hero (read-only). */
export function LandingAppPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_0_rgba(0,0,0,0.04),0_12px_40px_-16px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.03] dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.5)] dark:ring-white/[0.04]">
      <div className="flex h-9 items-center gap-2 border-b border-border bg-surface-muted/60 px-3">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </div>
        <div className="ml-2 flex h-5 flex-1 items-center rounded-md border border-border/80 bg-background px-2.5">
          <span className="truncate text-[10px] text-muted">
            studyflow.app / assignments / {landingAssignment.slug} / brief
          </span>
        </div>
      </div>

      <div className="pointer-events-none h-[min(540px,70vh)] select-none overflow-hidden sm:h-[580px]">
        <AppShell
          preview
          previewActivePath="/assignments"
          profile={landingProfile}
          courseLabels={landingCourseLabels}
          crumbs={[
            { label: "Assignments" },
            { label: landingAssignment.title },
            { label: "Brief" },
          ]}
          rightPanel={
            <AssistantPanel
              className="min-h-0"
              activeMode="Research"
              promptPlaceholder="Ask about requirements, rubric, or next steps..."
              promptHint="Learning support only — understand, verify, and plan. No essay generation."
              promptChips={["Break down the brief"]}
              live={false}
            >
              <div className="space-y-3 text-sm leading-relaxed">
                <div className="rounded-lg border border-border bg-surface-muted/60 px-3 py-2 text-muted-foreground">
                  What does &ldquo;evaluate&rdquo; mean for this rubric?
                </div>
                <div className="rounded-lg border border-border bg-background px-3 py-2">
                  Rubric weights Analysis and Evidence at 25% each. Explain how normalisation
                  helps integrity, then support each claim with a verified source — StudyFlow
                  will not write the essay.
                </div>
              </div>
            </AssistantPanel>
          }
        >
          <AssignmentHeader assignment={landingAssignment} />
          <AssignmentTabs
            assignmentId={landingAssignment.slug}
            activeTab="brief"
            preview
          />
          <BriefPanels assignment={landingAssignment} />
        </AppShell>
      </div>
    </div>
  );
}
