import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import {
  getResearchQuestions,
  getResearchSources,
} from "@/lib/db/queries";
import { LiteratureSearch } from "@/components/research/literature-search";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

async function ResearchWorkspace({ assignmentId }: { assignmentId: string }) {
  const user = await requireUser();
  const [questions, sources] = await Promise.all([
    getResearchQuestions(assignmentId),
    getResearchSources({ assignmentSlug: assignmentId, userId: user.id }),
  ]);

  return (
    <div className="grid min-h-[680px] overflow-hidden rounded-xl border border-border bg-surface lg:grid-cols-[220px_1fr]">
      <aside className="study-scroll border-b border-border p-4 lg:border-r lg:border-b-0">
        <h3 className="mb-3 text-sm font-semibold">Research questions</h3>
        <div className="space-y-2">
          {questions.length === 0 ? (
            <p className="text-xs text-muted">No research questions yet.</p>
          ) : (
            questions.map((question) => (
              <div
                key={question.id}
                className={`rounded-lg border p-3 ${
                  question.active
                    ? "border-primary/30 bg-primary-soft"
                    : "border-border bg-surface hover:bg-surface-muted"
                }`}
              >
                {question.active ? (
                  <Badge className="mb-1.5 bg-primary text-primary-foreground">
                    Active
                  </Badge>
                ) : null}
                <p className="text-sm font-medium">{question.title}</p>
              </div>
            ))
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 w-full"
          disabled
          title="Manual research questions coming next — use AI Research mode for now"
        >
          + Add question
        </Button>
        <p className="mt-3 text-[11px] leading-4 text-muted">
          Use catalog search to find papers. Add sources you verify — never invent
          citations.
        </p>
      </aside>

      <LiteratureSearch
        assignmentSlug={assignmentId}
        initialSources={sources}
      />
    </div>
  );
}

export default function AssignmentResearchPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  return (
    <Suspense fallback={<div className="h-[680px] animate-pulse rounded-xl bg-surface-muted" />}>
      <AssignmentResearchPageParams params={params} />
    </Suspense>
  );
}

async function AssignmentResearchPageParams({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  return <ResearchWorkspace assignmentId={assignmentId} />;
}
