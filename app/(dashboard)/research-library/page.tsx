import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { getResearchSources, listAssignments } from "@/lib/db/queries";
import { LiteratureSearch } from "@/components/research/literature-search";
import { SourceKindLegend } from "@/components/research/source-kind-legend";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

async function LibraryBody() {
  const user = await requireUser();
  const [sources, assignments] = await Promise.all([
    getResearchSources({ userId: user.id, limit: 50 }),
    listAssignments(user.id),
  ]);

  const defaultSlug = assignments[0]?.slug ?? null;

  return (
    <div className="space-y-4">
      <LiteratureSearch
        assignmentSlug={defaultSlug}
        initialSources={sources}
        libraryMode
      />

      <SourceKindLegend />

      <div>
        <h2 className="mb-2 text-sm font-semibold">Saved sources</h2>
        {sources.length === 0 ? (
          <Card className="border-border bg-surface">
            <CardContent className="p-6 text-sm text-muted">
              No sources in your library yet. Search OpenAlex above, or add from
              an assignment&apos;s Research tab.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {sources.map((source) => (
              <Card key={source.id} className="border-border bg-surface">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-base leading-6">
                    {source.title}
                  </CardTitle>
                  <p className="text-xs text-muted">
                    {source.authors ?? "Unknown authors"} ·{" "}
                    {source.venue ?? "Unknown venue"}
                    {source.year ? ` · ${source.year}` : ""}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted">
                    DOI: {source.doi ?? "—"}
                  </p>
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
                      <Badge className="bg-primary-soft text-primary">
                        Open access
                      </Badge>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResearchLibraryPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Research Library</h1>
        <p className="text-sm text-muted">
          Search OpenAlex for papers, save sources you verify, and keep
          transparent provenance tags. StudyFlow helps you find evidence — not
          write essays.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="h-48 animate-pulse rounded-xl bg-surface-muted" />
        }
      >
        <LibraryBody />
      </Suspense>
    </div>
  );
}
