import type { LiteratureSearchHit } from "@/lib/research/types";

const OPENALEX_BASE = "https://api.openalex.org";

type OpenAlexAuthor = {
  author?: { display_name?: string | null } | null;
  raw_author_name?: string | null;
};

type OpenAlexWork = {
  id?: string;
  display_name?: string | null;
  title?: string | null;
  authorships?: OpenAlexAuthor[] | null;
  publication_year?: number | null;
  primary_location?: {
    landing_page_url?: string | null;
    pdf_url?: string | null;
    source?: { display_name?: string | null } | null;
  } | null;
  open_access?: {
    is_oa?: boolean | null;
    oa_url?: string | null;
  } | null;
  doi?: string | null;
  abstract_inverted_index?: Record<string, number[]> | null;
  cited_by_count?: number | null;
  type?: string | null;
};

type OpenAlexWorksResponse = {
  meta?: { count?: number };
  results?: OpenAlexWork[];
};

function mailtoParam(): string {
  const email =
    process.env.OPENALEX_MAILTO?.trim() ||
    process.env.CONTACT_EMAIL?.trim() ||
    "studyflow@localhost";
  return email;
}

/** Rebuild abstract text from OpenAlex inverted index. */
export function abstractFromInvertedIndex(
  index: Record<string, number[]> | null | undefined,
  maxChars = 320,
): string | null {
  if (!index || Object.keys(index).length === 0) return null;
  const positions: Array<{ word: string; pos: number }> = [];
  for (const [word, idxs] of Object.entries(index)) {
    for (const pos of idxs) {
      positions.push({ word, pos });
    }
  }
  positions.sort((a, b) => a.pos - b.pos);
  const text = positions.map((p) => p.word).join(" ");
  if (!text) return null;
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars).trimEnd()}…`;
}

function normalizeDoi(doi: string | null | undefined): string | null {
  if (!doi) return null;
  return doi
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
    .trim()
    .toLowerCase();
}

function formatAuthors(authorships: OpenAlexAuthor[] | null | undefined): string | null {
  if (!authorships?.length) return null;
  const names = authorships
    .map((a) => a.author?.display_name || a.raw_author_name || null)
    .filter((n): n is string => Boolean(n?.trim()));
  if (names.length === 0) return null;
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 3).join(", ")} et al.`;
}

export function mapOpenAlexWork(work: OpenAlexWork): LiteratureSearchHit {
  const doi = normalizeDoi(work.doi);
  const openAccess = Boolean(work.open_access?.is_oa);
  const url =
    work.open_access?.oa_url ||
    work.primary_location?.landing_page_url ||
    work.primary_location?.pdf_url ||
    (doi ? `https://doi.org/${doi}` : null) ||
    work.id ||
    null;

  const openAlexId = work.id?.replace("https://openalex.org/", "") ?? null;
  const title = (work.display_name || work.title || "Untitled").trim();

  return {
    id: openAlexId || doi || title,
    openAlexId,
    title,
    authors: formatAuthors(work.authorships),
    year: work.publication_year ?? null,
    venue: work.primary_location?.source?.display_name ?? null,
    doi,
    url,
    openAccess,
    abstractSnippet: abstractFromInvertedIndex(work.abstract_inverted_index),
    citedByCount: work.cited_by_count ?? null,
    type: work.type ?? null,
  };
}

export type OpenAlexSearchParams = {
  query: string;
  page?: number;
  perPage?: number;
  openAccess?: boolean;
  peerReviewed?: boolean;
};

export async function searchOpenAlex(
  params: OpenAlexSearchParams,
): Promise<{ results: LiteratureSearchHit[]; count: number }> {
  const query = params.query.trim();
  if (!query) {
    return { results: [], count: 0 };
  }

  const page = Math.max(1, params.page ?? 1);
  const perPage = Math.min(25, Math.max(1, params.perPage ?? 10));

  const url = new URL(`${OPENALEX_BASE}/works`);
  url.searchParams.set("search", query);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("mailto", mailtoParam());
  url.searchParams.set(
    "select",
    [
      "id",
      "display_name",
      "authorships",
      "publication_year",
      "primary_location",
      "open_access",
      "doi",
      "abstract_inverted_index",
      "cited_by_count",
      "type",
    ].join(","),
  );

  const filters: string[] = [];
  if (params.openAccess) filters.push("is_oa:true");
  // Prefer journal articles when "peer-reviewed" filter is on (heuristic).
  if (params.peerReviewed) filters.push("type:article");
  if (filters.length) {
    url.searchParams.set("filter", filters.join(","));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": `StudyFlow/0.1 (mailto:${mailtoParam()})`,
    },
    // Avoid Next caching across users for live search; we use our own short cache.
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `OpenAlex error ${res.status}${body ? `: ${body.slice(0, 200)}` : ""}`,
    );
  }

  const data = (await res.json()) as OpenAlexWorksResponse;
  const results = (data.results ?? []).map(mapOpenAlexWork);
  return {
    results,
    count: data.meta?.count ?? results.length,
  };
}
