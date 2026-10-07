/** Normalized hit from OpenAlex (and optional Crossref enrichment). */
export type LiteratureSearchHit = {
  id: string;
  openAlexId: string | null;
  title: string;
  authors: string | null;
  year: number | null;
  venue: string | null;
  doi: string | null;
  url: string | null;
  openAccess: boolean;
  abstractSnippet: string | null;
  citedByCount: number | null;
  type: string | null;
};

export type LiteratureSearchResponse = {
  query: string;
  results: LiteratureSearchHit[];
  count: number;
  page: number;
  perPage: number;
  source: "openalex" | "cache";
  error?: string;
};

export type SaveResearchSourceInput = {
  assignmentId?: string | null;
  assignmentSlug?: string | null;
  title: string;
  authors?: string | null;
  venue?: string | null;
  year?: number | null;
  doi?: string | null;
  url?: string | null;
  openAccess?: boolean;
  selected?: boolean;
  openAlexId?: string | null;
};
