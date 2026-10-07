/**
 * Optional Crossref enrichment for DOI metadata.
 * Used when OpenAlex returns thin metadata or as a DOI lookup fallback.
 */

export type CrossrefWork = {
  title?: string[];
  author?: Array<{ given?: string; family?: string; name?: string }>;
  "container-title"?: string[];
  published?: { "date-parts"?: number[][] };
  DOI?: string;
  URL?: string;
  abstract?: string;
};

function stripJats(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchCrossrefByDoi(doi: string): Promise<{
  title: string | null;
  authors: string | null;
  venue: string | null;
  year: number | null;
  doi: string;
  url: string | null;
  abstractSnippet: string | null;
} | null> {
  const cleaned = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").trim();
  if (!cleaned) return null;

  const mailto =
    process.env.CROSSREF_MAILTO?.trim() ||
    process.env.OPENALEX_MAILTO?.trim() ||
    "studyflow@localhost";

  const res = await fetch(
    `https://api.crossref.org/works/${encodeURIComponent(cleaned)}`,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": `StudyFlow/0.1 (mailto:${mailto})`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) return null;

  const json = (await res.json()) as { message?: CrossrefWork };
  const work = json.message;
  if (!work) return null;

  const authors =
    work.author
      ?.map((a) => {
        if (a.name) return a.name;
        return [a.given, a.family].filter(Boolean).join(" ");
      })
      .filter(Boolean)
      .join(", ") || null;

  const year = work.published?.["date-parts"]?.[0]?.[0] ?? null;
  const abstract = work.abstract ? stripJats(work.abstract) : null;

  return {
    title: work.title?.[0] ?? null,
    authors,
    venue: work["container-title"]?.[0] ?? null,
    year,
    doi: cleaned.toLowerCase(),
    url: work.URL || `https://doi.org/${cleaned}`,
    abstractSnippet: abstract
      ? abstract.length > 320
        ? `${abstract.slice(0, 320).trimEnd()}…`
        : abstract
      : null,
  };
}
