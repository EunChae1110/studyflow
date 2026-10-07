import { Suspense } from "react";
import Link from "next/link";
import { getClaimsWithEvidence } from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

async function ClaimEvidenceContent({ assignmentId }: { assignmentId: string }) {
  const claims = await getClaimsWithEvidence(assignmentId);
  const primary = claims[0] ?? null;
  const evidence = primary?.evidence ?? [];
  const verified = evidence.filter((e) => e.studentVerified).length;
  const strength = evidence.length === 0 ? 0 : Math.round((verified / evidence.length) * 100);

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
          <Button disabled={!primary}>Move to outline</Button>
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
                  {evidence.length} item{evidence.length === 1 ? "" : "s"}
                </Badge>
              </h3>

              {evidence.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted">
                  No evidence linked to this claim yet.
                </p>
              ) : (
                evidence.map((ev) => (
                  <EvidenceCard
                    key={ev.id}
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
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Check logic
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Find counterargument
                  </Button>
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
                      {verified} / {evidence.length}
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

export default async function ClaimEvidenceMapPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-surface-muted" />}>
      <ClaimEvidenceContent assignmentId={assignmentId} />
    </Suspense>
  );
}

function EvidenceCard({
  source,
  status,
  quote,
  needsReview = false,
}: {
  source: string;
  status: string;
  quote: string;
  needsReview?: boolean;
}) {
  return (
    <article
      className={`rounded-xl border bg-surface p-3 ${
        needsReview ? "border-amber-300" : "border-emerald-300"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold">{source}</p>
        <Badge
          className={
            needsReview
              ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          }
        >
          {status}
        </Badge>
      </div>
      <blockquote className="rounded-lg border border-border bg-surface-muted p-3 text-sm italic leading-6">
        “{quote}”
      </blockquote>
      <div className="mt-2 flex gap-1.5">
        <Button size="sm" variant={needsReview ? "default" : "outline"}>
          {needsReview ? "Verify source" : "Verify"}
        </Button>
        <Button size="sm" variant="ghost">
          {needsReview ? "Remove" : "Add note"}
        </Button>
      </div>
    </article>
  );
}
