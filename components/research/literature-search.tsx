"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Filter,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { LiteratureSearchHit } from "@/lib/research/types";
import type { ResearchSourceItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  assignmentSlug?: string | null;
  initialSources: ResearchSourceItem[];
  /** When true, hide assignment-specific chrome (for Research Library page). */
  libraryMode?: boolean;
};

type ViewTab = "catalog" | "saved";

export function LiteratureSearch({
  assignmentSlug,
  initialSources,
  libraryMode = false,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<ViewTab>("catalog");
  const [results, setResults] = useState<LiteratureSearchHit[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [openAccessOnly, setOpenAccessOnly] = useState(false);
  const [peerReviewed, setPeerReviewed] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSources.find((s) => s.selected)?.id ?? initialSources[0]?.id ?? null,
  );
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const selectedSource = useMemo(
    () => initialSources.find((s) => s.id === selectedId) ?? null,
    [initialSources, selectedId],
  );

  const savedDois = useMemo(() => {
    const set = new Set<string>();
    for (const s of initialSources) {
      if (s.doi) set.add(s.doi.toLowerCase());
    }
    return set;
  }, [initialSources]);

  const runSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) {
      setError("Enter a keyword, title, or DOI.");
      return;
    }
    setLoading(true);
    setError(null);
    setSavedMessage(null);
    setTab("catalog");
    try {
      const params = new URLSearchParams({
        q,
        perPage: "10",
      });
      if (openAccessOnly) params.set("openAccess", "1");
      if (peerReviewed) params.set("peerReviewed", "1");

      const res = await fetch(`/api/research/search?${params.toString()}`);
      const data = (await res.json()) as {
        results?: LiteratureSearchHit[];
        count?: number;
        error?: string;
      };
      if (!res.ok) {
        setResults([]);
        setCount(0);
        setError(data.error || "Search failed.");
        setSearched(true);
        return;
      }
      setResults(data.results ?? []);
      setCount(data.count ?? 0);
      setSearched(true);
    } catch {
      setError("Network error while searching. Try again.");
      setResults([]);
      setCount(0);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }, [query, openAccessOnly, peerReviewed]);

  async function saveHit(hit: LiteratureSearchHit, selectAfter: boolean) {
    setSavingId(hit.id);
    setError(null);
    setSavedMessage(null);
    try {
      const res = await fetch("/api/research/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentSlug: assignmentSlug || null,
          title: hit.title,
          authors: hit.authors,
          venue: hit.venue,
          year: hit.year,
          doi: hit.doi,
          url: hit.url,
          openAccess: hit.openAccess,
          selected: selectAfter,
        }),
      });
      const data = (await res.json()) as {
        source?: ResearchSourceItem;
        error?: string;
      };
      if (!res.ok || !data.source) {
        setError(data.error || "Could not save source.");
        return;
      }
      setSavedMessage(
        selectAfter
          ? "Saved and selected for this assignment."
          : "Added to your research library.",
      );
      if (selectAfter) setSelectedId(data.source.id);
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("Network error while saving.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div
      className={
        libraryMode
          ? "space-y-4"
          : "grid min-h-[680px] overflow-hidden rounded-xl border border-border bg-surface lg:grid-cols-[1fr_340px]"
      }
    >
      <section
        className={
          libraryMode
            ? "space-y-3"
            : "study-scroll border-b border-border bg-background p-4 lg:border-r lg:border-b-0"
        }
      >
        <form
          className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center"
          onSubmit={(e) => {
            e.preventDefault();
            void runSearch();
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-muted" />
            <Input
              className="bg-surface pl-8"
              placeholder="Search OpenAlex: papers, keywords, DOI…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search literature"
            />
          </div>
          <div className="flex gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowFilters((v) => !v)}
            >
              <Filter className="size-3.5" />
              Filters
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Searching
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </form>

        {showFilters ? (
          <div className="mb-3 flex flex-wrap gap-2 rounded-lg border border-border bg-surface p-2 text-xs">
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 hover:bg-surface-muted">
              <input
                type="checkbox"
                className="accent-primary"
                checked={openAccessOnly}
                onChange={(e) => setOpenAccessOnly(e.target.checked)}
              />
              Open access
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 hover:bg-surface-muted">
              <input
                type="checkbox"
                className="accent-primary"
                checked={peerReviewed}
                onChange={(e) => setPeerReviewed(e.target.checked)}
              />
              Journal articles
            </label>
            <p className="w-full px-2 text-[11px] text-muted">
              Catalog: OpenAlex. DOI lookups may use Crossref for metadata.
            </p>
          </div>
        ) : null}

        {!libraryMode ? (
          <div className="mb-3 flex items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              variant={tab === "catalog" ? "default" : "outline"}
              onClick={() => setTab("catalog")}
            >
              Catalog results
            </Button>
            <Button
              type="button"
              size="sm"
              variant={tab === "saved" ? "default" : "outline"}
              onClick={() => setTab("saved")}
            >
              Saved ({initialSources.length})
            </Button>
          </div>
        ) : null}

        {error ? (
          <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            {error}
          </p>
        ) : null}
        {savedMessage ? (
          <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            {savedMessage}
          </p>
        ) : null}

        {tab === "catalog" || libraryMode ? (
          <div className="space-y-2">
            {loading ? (
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-6 text-sm text-muted">
                <Loader2 className="size-4 animate-spin" />
                Searching OpenAlex…
              </div>
            ) : null}

            {!loading && searched && results.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted">
                No catalog hits for “{query.trim()}”. Try different keywords or a
                DOI.
              </p>
            ) : null}

            {!loading && !searched ? (
              <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted">
                Search external catalogs to find papers, then add them to this
                assignment. StudyFlow helps you find and verify sources — it will
                not write your essay.
              </p>
            ) : null}

            {!loading && results.length > 0 ? (
              <>
                <p className="text-xs text-muted">
                  Showing {results.length} of {count.toLocaleString()} OpenAlex
                  hits
                </p>
                {results.map((hit) => {
                  const already =
                    Boolean(hit.doi) && savedDois.has(hit.doi!.toLowerCase());
                  return (
                    <article
                      key={hit.id}
                      className="rounded-xl border border-border bg-surface p-3"
                    >
                      <h4 className="text-sm font-semibold leading-5">
                        {hit.title}
                      </h4>
                      <p className="mt-1 text-xs text-muted">
                        {hit.authors ?? "Unknown authors"}
                        {hit.venue ? ` · ${hit.venue}` : ""}
                        {hit.year ? ` · ${hit.year}` : ""}
                        {hit.doi ? ` · DOI: ${hit.doi}` : ""}
                      </p>
                      {hit.abstractSnippet ? (
                        <p className="mt-2 line-clamp-3 text-xs text-muted">
                          {hit.abstractSnippet}
                        </p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {hit.openAccess ? (
                          <Badge className="bg-primary-soft text-primary">
                            Open access
                          </Badge>
                        ) : null}
                        {hit.type ? (
                          <Badge variant="outline">{hit.type}</Badge>
                        ) : null}
                        {typeof hit.citedByCount === "number" ? (
                          <Badge variant="outline">
                            Cited {hit.citedByCount.toLocaleString()}
                          </Badge>
                        ) : null}
                        {already ? (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            In library
                          </Badge>
                        ) : null}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <Button
                          size="sm"
                          disabled={savingId === hit.id}
                          onClick={() => void saveHit(hit, false)}
                        >
                          {savingId === hit.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Plus className="size-3.5" />
                          )}
                          Add to library
                        </Button>
                        {!libraryMode ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={savingId === hit.id}
                            onClick={() => void saveHit(hit, true)}
                          >
                            Select for assignment
                          </Button>
                        ) : null}
                        {hit.url ? (
                          <a
                            href={hit.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-7 items-center gap-1 rounded-lg border border-border px-2.5 text-[0.8rem] hover:bg-muted"
                          >
                            <ExternalLink className="size-3.5" />
                            Open
                          </a>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted">
              {initialSources.length} saved source
              {initialSources.length === 1 ? "" : "s"}
            </p>
            {initialSources.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted">
                No sources saved for this assignment yet. Search the catalog
                above.
              </p>
            ) : (
              initialSources.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => setSelectedId(source.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    selectedId === source.id
                      ? "border-primary bg-primary-soft"
                      : "border-border bg-surface hover:border-primary/50"
                  }`}
                >
                  <h4 className="text-sm font-semibold leading-5">
                    {source.title}
                  </h4>
                  <p className="mt-1 text-xs text-muted">
                    {source.authors ?? "Unknown"} · {source.venue ?? "—"} ·{" "}
                    {source.year ?? "—"}
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
                      <Badge className="bg-primary-soft text-primary">
                        Open access
                      </Badge>
                    ) : null}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </section>

      {!libraryMode ? (
        <aside className="study-scroll bg-surface p-4">
          {!selectedSource ? (
            <p className="text-sm text-muted">
              Select a saved source to see details, or add one from catalog
              search.
            </p>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Source detail</h3>
                {selectedSource.verified ? (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <ShieldCheck className="size-3" /> Student verified
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    Needs review
                  </Badge>
                )}
              </div>
              <h4 className="text-sm font-semibold leading-5">
                {selectedSource.title}
              </h4>
              <p className="mt-2 text-xs text-muted">
                {selectedSource.authors ?? "Unknown authors"}
                {selectedSource.year ? ` (${selectedSource.year})` : ""}
              </p>
              {selectedSource.venue ? (
                <p className="mt-1 text-xs text-muted">{selectedSource.venue}</p>
              ) : null}
              {selectedSource.doi ? (
                <p className="mt-1 text-xs text-muted">DOI: {selectedSource.doi}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedSource.url ? (
                  <a
                    href={selectedSource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-7 items-center gap-1 rounded-lg border border-border px-2.5 text-[0.8rem] hover:bg-muted"
                  >
                    <ExternalLink className="size-3.5" />
                    Open source
                  </a>
                ) : null}
              </div>
              <p className="mt-4 text-xs text-muted">
                Verify quotes against the original before mapping to claims.
                StudyFlow will not invent citations.
              </p>
            </>
          )}
        </aside>
      ) : null}
    </div>
  );
}
