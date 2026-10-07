import { Suspense } from "react";
import Link from "next/link";
import { getClaimsWithEvidence } from "@/lib/db/queries";
import { ClaimAiActions } from "@/components/assignment/claim-ai-actions";
import { EvidenceCard } from "@/components/assignment/evidence-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

async function ClaimEvidenceContent({ assignmentId }: { assignmentId: string }) {
  const claims = await getClaimsWithEvidence(assignmentId);
  const primary = claims[0] ?? null;
  const evidenceRows = primary?.evidence ?? [];
  const verified = evidenceRows.filter((e) => e.studentVerified).length;
  const strength =
    evidenceRows.length === 0
      ? 0
      : Math.round((verified / evidenceRows.length) * 100);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Claim–evidence map</h2>
          <p className="text-sm text-muted">Link each claim to verified sources before drafting.</p>
        </div>
        <div className="flex gap-2">
          <Link href="../outline" className={cn(buttonVariants({ variant: "outline" }))}>
            Back to outline
          </Link>
          {primary ? (
            <Link href="../outline" className={cn(buttonVariants())}>
              Open in outline
            </Link>
          ) : null}
        </div>
      </div>

      {!primary ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-sm font-medium">No claims yet</p>
          <p className="mt-1 text-xs text-muted">
            Create a claim in Outline, then map verified evidence here.
          </p>
          <Link
            href="../outline"
            className={cn(buttonVariants({ size: "sm" }), "mt-4 inline-flex")}
          >
            Open outline
          </Link>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-primary/25 bg-primary-soft p-4">
            <p className="text-[11px] font-semibold tracking-wide text-primary uppercase">Your claim</p>
            <p className="mt-1 text-[15px] font-semibold leading-6">{primary.statement}</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <div className="space-y-3">
              <h3 className="text-base font-semibold">
                Linked evidence{" "}
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {evidenceRows.length} item{evidenceRows.length === 1 ? "" : "s"}
                </Badge>
              </h3>

              {evidenceRows.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted">
                  No evidence linked to this claim yet. Find sources in Research, then attach them
                  from Outline.
                </p>
              ) : (
                evidenceRows.map((ev) => (
                  <EvidenceCard
                    key={ev.id}
                    evidenceId={ev.id}
                    source={ev.page ? `Source · ${ev.page}` : "Source"}
                    status={ev.studentVerified ? "Supports" : "Needs review"}
                    quote={ev.quote ?? ev.paraphrase ?? "—"}
                    needsReview={!ev.studentVerified}
                  />
                ))
              )}
            </div>

            <div className="space-y-4">
              <Card className="border-border bg-surface">
                <CardHeader>
                  <CardTitle className="text-base">Logic feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="rounded-lg border border-primary/20 bg-primary-soft p-3 text-sm text-primary">
                    Use the AI panel to check logic and find missing counterarguments — StudyFlow will
                    not write your essay.
                  </div>
                  <ClaimAiActions claim={primary.statement} />
                </CardContent>
              </Card>

              <Card className="border-border bg-surface">
                <CardHeader>
                  <CardTitle className="text-base">Evidence strength</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Verified</span>
                    <span className="font-semibold">
                      {verified} / {evidenceRows.length}
                    </span>
                  </div>
                  <Progress value={strength} className="h-1.5 bg-surface-muted" />
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ClaimEvidenceMapPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-surface-muted" />}>
      <ClaimEvidenceMapPageParams params={params} />
    </Suspense>
  );
}

async function ClaimEvidenceMapPageParams({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  return <ClaimEvidenceContent assignmentId={assignmentId} />;
}
