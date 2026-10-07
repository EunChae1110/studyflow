import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function ClaimEvidenceMapPage() {
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
          <Button>Move to outline</Button>
        </div>
      </div>

      <div className="rounded-xl border border-primary/25 bg-primary-soft p-4">
        <p className="text-[11px] font-semibold tracking-wide text-primary uppercase">Your claim</p>
        <p className="mt-1 text-[15px] font-semibold leading-6">
          Update anomalies occur when redundant data must be changed in multiple places; 3NF reduces these by removing transitive dependencies.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          <h3 className="text-base font-semibold">
            Linked evidence{" "}
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              3 items
            </Badge>
          </h3>

          <EvidenceCard
            source="Chen & Okonkwo (2023), p.214"
            status="Supports"
            quote="Schemas in third normal form eliminated 41% of observed update anomalies relative to equivalent second-normal-form designs."
          />
          <EvidenceCard
            source="Lecture 04 — Normal Forms.pdf, p.15"
            status="Supports"
            quote="A transitive dependency means a non-key attribute depends on another non-key attribute, creating redundant storage."
          />
          <EvidenceCard
            source="Rivera (2022), p.88"
            status="Needs review"
            quote="Enterprise schemas may retain controlled redundancy for read performance after documenting anomaly risk."
            needsReview
          />
        </div>

        <div className="space-y-4">
          <Card className="border-border bg-surface">
            <CardHeader>
              <CardTitle className="text-base">Logic feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="rounded-lg border border-primary/20 bg-primary-soft p-3 text-sm text-primary">
                Two verified sources support anomaly reduction. Add one counterargument source on
                denormalisation trade-offs for a stronger evaluation.
              </div>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Check logic
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Find counterargument
              </Button>
              <Button variant="secondary" size="sm" className="w-full justify-start">
                Add to outline
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
                <span className="font-semibold">2 / 3</span>
              </div>
              <Progress value={66} className="h-1.5 bg-surface-muted" />
              <div className="flex items-center justify-between">
                <span className="text-muted">Supports claim</span>
                <span className="font-semibold">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Needs review</span>
                <span className="font-semibold text-amber-700 dark:text-amber-300">1</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
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
      {needsReview ? (
        <div className="mt-2 rounded-lg border border-amber-300 bg-amber-100/55 p-2 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950/25 dark:text-amber-200">
          Source needs review before it can be used as evidence.
        </div>
      ) : null}
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
