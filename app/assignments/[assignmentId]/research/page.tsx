import Link from "next/link";
import { Filter, Search, ShieldCheck } from "lucide-react";
import { researchQuestions, researchSources } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AssignmentResearchPage() {
  const selected = researchSources[0];

  return (
    <div className="grid min-h-[680px] overflow-hidden rounded-xl border border-border bg-surface lg:grid-cols-[220px_1fr_340px]">
      <aside className="study-scroll border-b border-border p-4 lg:border-r lg:border-b-0">
        <h3 className="mb-3 text-sm font-semibold">Research questions</h3>
        <div className="space-y-2">
          {researchQuestions.map((question) => (
            <div
              key={question.title}
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
          ))}
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
          <p className="text-muted">12 results · sorted by relevance</p>
          <div className="flex gap-1.5">
            <Badge variant="outline">Peer-reviewed</Badge>
            <Badge variant="outline">Open access</Badge>
          </div>
        </div>
        <div className="space-y-2">
          {researchSources.map((source) => (
            <article
              key={source.doi}
              className={`rounded-xl border p-3 transition-colors ${
                source.selected
                  ? "border-primary bg-primary-soft"
                  : "border-border bg-surface hover:border-primary/50"
              }`}
            >
              <h4 className="text-sm font-semibold leading-5">{source.title}</h4>
              <p className="mt-1 text-xs text-muted">
                {source.authors} · {source.venue} · {source.year} · DOI: {source.doi}
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
                {source.openAccess ? <Badge className="bg-primary-soft text-primary">Open access</Badge> : null}
                <Badge variant="secondary">Peer-reviewed</Badge>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="study-scroll bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Source detail</h3>
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <ShieldCheck className="size-3" /> Student verified
          </Badge>
        </div>
        <h4 className="text-sm font-semibold leading-5">{selected.title}</h4>
        <div className="mt-3 rounded-lg border border-primary/20 bg-primary-soft p-3 text-xs text-primary">
          <p>
            <strong>Why relevant:</strong> Directly addresses how 3NF eliminates transitive dependencies
            that cause update anomalies.
          </p>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          <Label>Abstract</Label>
          <p className="text-muted">
            This paper examines how enforcing third normal form reduces update anomalies in relational schemas, using controlled experiments across synthetic and industrial datasets.
          </p>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          <Label>Key findings</Label>
          <ul className="list-disc space-y-1 pl-4 text-muted">
            <li>3NF reduced anomaly incidents by 41% vs 2NF schemas.</li>
            <li>Join cost increased modestly (around 8%) after decomposition.</li>
            <li>Benefits were strongest on write-heavy workloads.</li>
          </ul>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          <Label>Evidence quote</Label>
          <blockquote className="rounded-lg border border-border bg-surface-muted p-3 text-sm italic">
            “Schemas in third normal form eliminated 41% of observed update anomalies relative to equivalent second-normal-form designs.”
          </blockquote>
          <p className="text-xs text-muted">Chen &amp; Okonkwo, 2023, p.214</p>
        </div>
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

        <div className="mt-4">
          <Label>Source timeline</Label>
          <ol className="mt-2 space-y-2">
            {[
              ["Discovered", "Keyword search · 2 days ago"],
              ["Abstract reviewed", "AI summarised · yesterday"],
              ["Quote extracted", "You selected p.214"],
              ["Student verified", "Checked against PDF · today"],
            ].map(([title, subtitle]) => (
              <li key={title} className="flex gap-2">
                <span className="mt-1 size-3 rounded-full border-2 border-primary bg-primary" />
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted">{subtitle}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">{children}</p>;
}
