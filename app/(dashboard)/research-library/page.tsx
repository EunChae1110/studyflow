import { Suspense } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { getResearchSources } from "@/lib/db/queries";
import { SourceKindLegend } from "@/components/research/source-kind-legend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

async function SourceGrid() {
  const sources = await getResearchSources({ limit: 50 });

  if (sources.length === 0) {
    return (
      <Card className="border-border bg-surface">
        <CardContent className="p-6 text-sm text-muted">
          No sources in your library yet. Add research from an assignment&apos;s Research tab.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 xl:grid-cols-2">
      {sources.map((source) => (
        <Card key={source.id} className="border-border bg-surface">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base leading-6">{source.title}</CardTitle>
            <p className="text-xs text-muted">
              {source.authors ?? "Unknown authors"} · {source.venue ?? "Unknown venue"}
              {source.year ? ` · ${source.year}` : ""}
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted">DOI: {source.doi ?? "—"}</p>
            <div className="flex flex-wrap gap-1.5">
              {source.verified ? (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <ShieldCheck className="size-3" />
                  Student verified
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ResearchLibraryPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Research Library</h1>
        <p className="text-sm text-muted">
          Save external research, lecture notes, and verified evidence with transparent provenance tags.
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-muted" />
          <Input className="bg-background pl-8" placeholder="Search title, author, DOI..." />
        </div>
        <Button variant="outline">Filter: Peer-reviewed</Button>
        <Button>Add source</Button>
      </div>

      <SourceKindLegend />

      <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-surface-muted" />}>
        <SourceGrid />
      </Suspense>
    </div>
  );
}
