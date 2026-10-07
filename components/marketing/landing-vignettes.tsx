"use client";

import { AssistantPanel } from "@/components/ai/assistant-panel";
import { EvidenceCard } from "@/components/assignment/evidence-card";
import { DashboardSplitPanels } from "@/components/dashboard/dashboard-panels";
import { Badge } from "@/components/ui/badge";
import {
  landingClaim,
  landingDeadlines,
  landingMaterials,
  landingSources,
} from "@/lib/landing-demo";

export function NotesVignette() {
  return (
    <div className="pointer-events-none select-none overflow-hidden rounded-lg border border-border bg-surface shadow-sm ring-1 ring-black/[0.02] dark:ring-white/[0.03]">
      <div className="grid min-h-[280px] sm:grid-cols-[200px_1fr]">
        <aside className="border-b border-border p-3 sm:border-r sm:border-b-0">
          <h3 className="mb-2 text-sm font-semibold">Course materials</h3>
          <div className="space-y-1">
            {landingMaterials.map((doc, index) => (
              <div
                key={doc.id}
                className={`rounded-lg px-3 py-2 ${
                  index === 0 ? "bg-primary-soft text-primary" : "text-foreground"
                }`}
              >
                <p className="text-sm font-medium">{doc.title}</p>
                <p className="text-xs text-muted">
                  {doc.pages != null ? `${doc.pages} pages · ` : ""}
                  {doc.status}
                </p>
              </div>
            ))}
          </div>
        </aside>
        <div className="flex min-h-0 flex-col bg-background">
          <div className="flex items-center gap-2 border-b border-border bg-surface px-3 py-2">
            <Badge className="bg-primary-soft text-primary">Notes-only</Badge>
            <p className="text-xs text-muted">External sources disabled</p>
          </div>
          <div className="min-h-0 flex-1">
            <AssistantPanel
              className="min-h-[240px]"
              activeMode="Notes-only"
              promptPlaceholder="Ask about your lecture materials..."
              promptHint="External sources disabled. Answers are grounded only in your course materials."
              live={false}
            >
              <div className="space-y-3 text-sm leading-relaxed">
                <div className="rounded-lg border border-border bg-surface-muted/60 px-3 py-2 text-muted-foreground">
                  How does 3NF reduce update anomalies in Lecture 04?
                </div>
                <div className="rounded-lg border border-border bg-background px-3 py-2">
                  From Lecture 04 p.12: transitive dependencies force the same fact into many
                  rows — splitting isolates it so one update site remains.
                </div>
              </div>
            </AssistantPanel>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ResearchVignette() {
  return (
    <div className="pointer-events-none select-none overflow-hidden rounded-lg border border-border bg-surface p-3 shadow-sm ring-1 ring-black/[0.02] dark:ring-white/[0.03] [&_.mb-5]:mb-0">
      <DashboardSplitPanels deadlines={landingDeadlines.slice(0, 1)} sources={landingSources} />
    </div>
  );
}

export function ClaimVignette() {
  return (
    <div className="pointer-events-none select-none space-y-3 overflow-hidden rounded-lg border border-border bg-surface p-3 shadow-sm ring-1 ring-black/[0.02] dark:ring-white/[0.03]">
      <div className="rounded-xl border border-primary/25 bg-primary-soft p-3">
        <p className="text-[11px] font-semibold tracking-wide text-primary uppercase">Your claim</p>
        <p className="mt-1 text-sm font-semibold leading-6">{landingClaim.statement}</p>
      </div>
      {landingClaim.evidence.map((ev) => (
        <EvidenceCard
          key={ev.id}
          source={ev.page}
          status={ev.studentVerified ? "Supports" : "Needs review"}
          quote={ev.quote}
          needsReview={!ev.studentVerified}
        />
      ))}
    </div>
  );
}
