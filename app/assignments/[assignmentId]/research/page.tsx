import { Suspense } from "react";
import Link from "next/link";
import { Filter, Search, ShieldCheck } from "lucide-react";
import {
  getResearchQuestions,
  getResearchSources,
} from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

async function ResearchWorkspace({ assignmentId }: { assignmentId: string }) {
  const [questions, sources] = await Promise.all([
    getResearchQuestions(assignmentId),
    getResearchSources({ assignmentSlug: assignmentId }),
  ]);
  const selected = sources.find((s) => s.selected) ?? sources[0] ?? null;

  return (
    <div className="grid min-h-[680px] overflow-hidden rounded-xl border border-border bg-surface lg:grid-cols-[220px_1fr_340px]">
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
                  <Badge className="mb-1.5 bg-primary text-primary-foreground">Active</Badge>
                ) : null}
                <p className="text-sm font-medium">{question.title}</p>
              </div>
            ))
          )}
        </div>
        <Button variant="outline" size="sm" className="mt-4 w-full">
          + Add question
        </Button>
      </aside>

      <section className="study-scroll border-b border-border bg-background p-4 lg:border-r lg:border-b-0">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted">
            <Search className="size-4" />
            Search papers, DOI, keywords...
          </div>
          <Button variant="outline" size="sm">
            <Filter className="size-3.5" />
            Filters
          </Button>
        </div>
        <div className="mb-3 flex items-center justify-between text-sm">
          <p className="text-muted">
            {sources.length} saved source{sources.length === 1 ? "" : "s"}
          </p>
          <div className="flex gap-1.5">
            <Badge variant="outline">Peer-reviewed</Badge>
            <Badge variant="outline">Open access</Badge>
          </div>
        </div>
        <div className="space-y-2">
          {sources.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted">
              No sources saved for this assignment yet.
            </p>
          ) : (
            sources.map((source) => (
              <article
                key={source.id}
                className={`rounded-xl border p-3 transition-colors ${
                  selected?.id === source.id
                    ? "border-primary bg-primary-soft"
                    : "border-border bg-surface hover:border-primary/50"
                }`}
              >
                <h4 className="text-sm font-semibold leading-5">{source.title}</h4>
                <p className="mt-1 text-xs text-muted">
                  {source.authors ?? "Unknown"} · {source.venue ?? "—"} · {source.year ?? "—"}
                  {source.doi ? ` · DOI: ${source.doi}` : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {source.verified ? (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      ✓ Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      Needs review
                    </Badge>
                  )}
                  {source.openAccess ? (
                    <Badge className="bg-primary-soft text-primary">Open access</Badge>
                  ) : null}
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <aside className="study-scroll bg-surface p-4">
        {!selected ? (
          <p className="text-sm text-muted">Select a source to see details.</p>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Source detail</h3>
              {selected.verified ? (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <ShieldCheck className="size-3" /> Student verified
                </Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  Needs review
                </Badge>
              )}
            </div>
            <h4 className="text-sm font-semibold leading-5">{selected.title}</h4>
            <p className="mt-2 text-xs text-muted">
              {selected.authors ?? "Unknown authors"}
              {selected.year ? ` (${selected.year})` : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Button size="sm">Add to outline</Button>
              <Button size="sm" variant="outline">
                Save evidence
              </Button>
              <Link
                href="../claim-evidence"
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
              >
                Map claim
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

export default async function AssignmentResearchPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  return (
    <Suspense fallback={<div className="h-[680px] animate-pulse rounded-xl bg-surface-muted" />}>
      <ResearchWorkspace assignmentId={assignmentId} />
    </Suspense>
  );
}
