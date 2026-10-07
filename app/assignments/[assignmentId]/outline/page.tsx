import { Suspense } from "react";
import Link from "next/link";
import { getClaimsWithEvidence, getOutline } from "@/lib/db/queries";
import { AddClaimForm } from "@/components/workspace/add-claim-form";
import { SaveOutlineButton } from "@/components/workspace/save-outline-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

async function OutlineContent({ assignmentId }: { assignmentId: string }) {
  const [claims, outline] = await Promise.all([
    getClaimsWithEvidence(assignmentId),
    getOutline(assignmentId),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Outline builder</h2>
          <p className="text-sm text-muted">
            Build claims, attach evidence, then write explanations yourself.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="../claim-evidence" className={cn(buttonVariants({ variant: "outline" }))}>
            Claim–evidence map
          </Link>
          <SaveOutlineButton assignmentSlug={assignmentId} />
        </div>
      </div>

      {claims.length === 0 ? (
        <section className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-sm font-medium">No outline claims yet</p>
          <p className="mt-1 text-xs text-muted">
            {outline
              ? "An outline record exists but has no claims linked."
              : "Add your first claim to start planning sections."}
          </p>
          <AddClaimForm assignmentSlug={assignmentId} />
        </section>
      ) : (
        <>
          {claims.map((claim, index) => {
            const verified = claim.evidence.filter((e) => e.studentVerified).length;
            const state =
              verified > 0 ? (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {verified} verified
                </Badge>
              ) : claim.evidence.length > 0 ? (
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  Needs evidence check
                </Badge>
              ) : (
                <Badge variant="secondary">Draft</Badge>
              );

            return (
              <OutlineSection
                key={claim.id}
                title={`${index + 1}. ${claim.statement.slice(0, 60)}${claim.statement.length > 60 ? "…" : ""}`}
                state={state}
              >
                <div>
                  <Label>Claim</Label>
                  <Input
                    readOnly
                    defaultValue={claim.statement}
                    className="mt-1 bg-background"
                  />
                </div>
                <div>
                  <Label>Evidence</Label>
                  {claim.evidence.length === 0 ? (
                    <Link
                      href="../research"
                      className={cn(
                        buttonVariants({ size: "sm", variant: "outline" }),
                        "mt-1 inline-flex",
                      )}
                    >
                      + Find sources in Research
                    </Link>
                  ) : (
                    <div className="mt-1 space-y-2">
                      {claim.evidence.map((ev) => (
                        <div key={ev.id} className="rounded-lg border border-border bg-surface p-3">
                          <p className="text-xs text-muted">{ev.page ?? "No page"}</p>
                          <p className="text-sm">{ev.quote ?? ev.paraphrase ?? "—"}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Your explanation</Label>
                  <Textarea
                    readOnly
                    placeholder="Add explanations when creating a claim, or ask the Outline AI coach for structure tips."
                    className="mt-1 min-h-20 bg-background"
                  />
                </div>
              </OutlineSection>
            );
          })}
          <section className="rounded-xl border border-border bg-surface p-4">
            <p className="mb-2 text-sm font-medium">Add another claim</p>
            <AddClaimForm assignmentSlug={assignmentId} />
          </section>
        </>
      )}
    </div>
  );
}

export default async function AssignmentOutlinePage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-surface-muted" />}>
      <OutlineContent assignmentId={assignmentId} />
    </Suspense>
  );
}

function OutlineSection({
  title,
  state,
  children,
}: {
  title: string;
  state: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface">
      <header className="flex items-center justify-between border-b border-border bg-surface-muted px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {state}
      </header>
      <div className="space-y-3 p-4">{children}</div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">{children}</p>;
}
