import { Suspense } from "react";
import { FileText, Lock } from "lucide-react";
import { DeliverableFilesCard } from "@/components/assignment/deliverable-files";
import { DraftPlannerForm } from "@/components/assignment/draft-planner-form";
import { requireUser } from "@/lib/auth";
import { isWritingFocusedType } from "@/lib/assignment-types";
import { BUILD_DELIVERABLE_SOURCE } from "@/lib/build/types";
import { getAssignmentBySlug, getNotes } from "@/lib/db/queries";
import { listDeliverablesForAssignment } from "@/lib/deliverables/store";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function DraftContent({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const user = await requireUser();
  const assignment = await getAssignmentBySlug(assignmentId, user.id);
  const writing = isWritingFocusedType(assignment?.assignmentType);
  const allNotes = await getNotes(assignmentId);
  const deliverables = assignment
    ? await listDeliverablesForAssignment(assignment.id, user.id)
    : [];
  const draftNotes = allNotes.filter(
    (n) => n.sourceLabel === BUILD_DELIVERABLE_SOURCE,
  );
  const sectionNotes = draftNotes.filter(
    (n) => !n.title.startsWith("Deliverable ·"),
  );
  const displayNotes =
    sectionNotes.length > 0
      ? sectionNotes
      : draftNotes.filter((n) => n.title.startsWith("Deliverable ·"));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">
          {writing ? "Draft workspace" : "Work workspace"}
        </h2>
        <p className="text-sm text-muted">
          {deliverables.length > 0 || displayNotes.length > 0
            ? writing
              ? "Build wrote files and a draft from your guideline. Download, review, and revise before submitting."
              : "Build wrote downloadable submission files from your guideline. Download the ZIP / PDF, then revise anything still missing."
            : writing
              ? "Plan, verify, and check logic — or run Build to generate files from your guideline."
              : "Plan your approach — or run Build to generate downloadable files from your guideline."}
        </p>
      </div>

      <DeliverableFilesCard
        assignmentSlug={assignmentId}
        deliverables={deliverables}
      />

      {displayNotes.length > 0 ? (
        <Card className="border-primary/30 bg-surface">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4 text-primary" />
              Build deliverable preview
            </CardTitle>
            <Badge className="bg-primary-soft text-primary">
              {displayNotes.length} section
              {displayNotes.length === 1 ? "" : "s"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {displayNotes.map((note) => (
              <article
                key={note.id}
                className="rounded-xl border border-border bg-background p-4"
              >
                <h3 className="text-sm font-semibold text-foreground">
                  {note.title}
                </h3>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-[13px] leading-6 text-foreground/90">
                  {note.body}
                </pre>
              </article>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <DraftPlannerForm assignmentSlug={assignmentId} />
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-base">Support guardrails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted">
            <p className="rounded-lg border border-primary/25 bg-primary-soft p-3 text-primary">
              <Lock className="mr-1 inline size-3.5" />
              {deliverables.length > 0
                ? "Download the ZIP and individual files, replace STUDENTID with your real id, then verify tests before submit."
                : writing
                  ? "Run Build to write files from your guideline, or plan sections manually below."
                  : "Run Build to generate java/report/GenAI/tests/ZIP from your guideline."}
            </p>
            <p>
              When course materials are uploaded, Build stays within that learning
              scope plus the guideline.
            </p>
            <div className="space-y-1">
              <Badge variant="secondary">Download files</Badge>{" "}
              <Badge variant="secondary">Revise</Badge>{" "}
              <Badge variant="secondary">Check rubric</Badge>{" "}
              <Badge variant="secondary">Verify sources</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AssignmentDraftPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-surface-muted" />}>
      <DraftContent params={params} />
    </Suspense>
  );
}
