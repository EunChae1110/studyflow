import { Suspense } from "react";
import Link from "next/link";
import { getClaimsWithEvidence, getOutline } from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
        <div className="flex gap-2">
          <Link href="../claim-evidence" className={cn(buttonVariants({ variant: "outline" }))}>
            Claim–evidence map
          </Link>
          <Button>Save outline</Button>
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
          <div className="mx-auto mt-4 max-w-lg space-y-3 text-left">
            <LabeledInput label="Claim" placeholder="State your first claim..." />
            <LabeledTextArea
              label="Your explanation (write this yourself)"
              placeholder="Paraphrase the claim and evidence in your own words..."
            />
            <Button size="sm">Add claim</Button>
          </div>
        </section>
      ) : (
        claims.map((claim, index) => {
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
              <LabeledInput label="Claim" defaultValue={claim.statement} />
              <div>
                <Label>Evidence</Label>
                {claim.evidence.length === 0 ? (
                  <Button size="sm" variant="outline" className="mt-1">
                    + Attach evidence from library
                  </Button>
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
              <LabeledTextArea
                label="Your explanation"
                placeholder="Explain how this evidence supports your claim..."
              />
            </OutlineSection>
          );
        })
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

function LabeledInput({
  label,
  defaultValue,
  placeholder,
}: {
  label: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input defaultValue={defaultValue} placeholder={placeholder} className="mt-1 bg-background" />
    </div>
  );
}

function LabeledTextArea({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Textarea placeholder={placeholder} className="mt-1 min-h-20 bg-background" />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">{children}</p>;
}
