import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit, getCached, setCached } from "@/lib/research/cache";
import { fetchCrossrefByDoi } from "@/lib/research/crossref";
import { searchOpenAlex } from "@/lib/research/openalex";
import type { LiteratureSearchHit, LiteratureSearchResponse } from "@/lib/research/types";

export const maxDuration = 30;

const DOI_RE = /\b10\.\d{4,9}\/[^\s]+/i;

function parseSearchParams(input: {
  q?: string | null;
  query?: string | null;
  page?: string | number | null;
  perPage?: string | number | null;
  openAccess?: string | boolean | null;
  peerReviewed?: string | boolean | null;
  enrich?: string | boolean | null;
}) {
  const q = String(input.q ?? input.query ?? "").trim();
  const page = Math.max(1, Number(input.page) || 1);
  const perPage = Math.min(25, Math.max(1, Number(input.perPage) || 10));
  const openAccess =
    input.openAccess === true ||
    input.openAccess === "1" ||
    input.openAccess === "true";
  const peerReviewed =
    input.peerReviewed === true ||
    input.peerReviewed === "1" ||
    input.peerReviewed === "true";
  const enrich =
    input.enrich === true ||
    input.enrich === "1" ||
    input.enrich === "true";
  return { q, page, perPage, openAccess, peerReviewed, enrich };
}

async function maybeEnrichWithCrossref(
  results: LiteratureSearchHit[],
  enrich: boolean,
): Promise<LiteratureSearchHit[]> {
  if (!enrich) return results;

  return Promise.all(
    results.map(async (hit) => {
      if (!hit.doi) return hit;
      // Only enrich when OpenAlex left title/authors thin.
      if (hit.title && hit.authors && hit.venue) return hit;
      try {
        const xref = await fetchCrossrefByDoi(hit.doi);
        if (!xref) return hit;
        return {
          ...hit,
          title: hit.title || xref.title || hit.title,
          authors: hit.authors || xref.authors,
          venue: hit.venue || xref.venue,
          year: hit.year ?? xref.year,
          url: hit.url || xref.url,
          abstractSnippet: hit.abstractSnippet || xref.abstractSnippet,
        };
      } catch {
        return hit;
      }
    }),
  );
}

async function runSearch(opts: {
  q: string;
  page: number;
  perPage: number;
  openAccess: boolean;
  peerReviewed: boolean;
  enrich: boolean;
}): Promise<LiteratureSearchResponse> {
  const cacheKey = JSON.stringify({
    q: opts.q.toLowerCase(),
    page: opts.page,
    perPage: opts.perPage,
    openAccess: opts.openAccess,
    peerReviewed: opts.peerReviewed,
    enrich: opts.enrich,
  });

  const cached = getCached<LiteratureSearchResponse>(cacheKey);
  if (cached) {
    return { ...cached, source: "cache" };
  }

  // Direct DOI lookup via Crossref when query looks like a DOI.
  const doiMatch = opts.q.match(DOI_RE);
  if (doiMatch && !opts.q.includes(" ")) {
    const xref = await fetchCrossrefByDoi(doiMatch[0]);
    if (xref) {
      const hit: LiteratureSearchHit = {
        id: xref.doi,
        openAlexId: null,
        title: xref.title || opts.q,
        authors: xref.authors,
        year: xref.year,
        venue: xref.venue,
        doi: xref.doi,
        url: xref.url,
        openAccess: false,
        abstractSnippet: xref.abstractSnippet,
        citedByCount: null,
        type: null,
      };
      // Still try OpenAlex for OA status.
      try {
        const oa = await searchOpenAlex({
          query: xref.doi,
          page: 1,
          perPage: 1,
        });
        if (oa.results[0]) {
          hit.openAccess = oa.results[0].openAccess;
          hit.openAlexId = oa.results[0].openAlexId;
          hit.abstractSnippet =
            hit.abstractSnippet || oa.results[0].abstractSnippet;
          hit.citedByCount = oa.results[0].citedByCount;
        }
      } catch {
        // ignore OA enrichment failure
      }
      const payload: LiteratureSearchResponse = {
        query: opts.q,
        results: [hit],
        count: 1,
        page: 1,
        perPage: 1,
        source: "openalex",
      };
      setCached(cacheKey, payload);
      return payload;
    }
  }

  const { results, count } = await searchOpenAlex({
    query: opts.q,
    page: opts.page,
    perPage: opts.perPage,
    openAccess: opts.openAccess,
    peerReviewed: opts.peerReviewed,
  });

  const enriched = await maybeEnrichWithCrossref(results, opts.enrich);

  const payload: LiteratureSearchResponse = {
    query: opts.q,
    results: enriched,
    count,
    page: opts.page,
    perPage: opts.perPage,
    source: "openalex",
  };
  setCached(cacheKey, payload);
  return payload;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rate = checkRateLimit(session.userId);
  if (!rate.allowed) {
    return Response.json(
      { error: "Too many searches. Please wait a moment.", retryAfterSec: rate.retryAfterSec },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSec) },
      },
    );
  }

  const sp = request.nextUrl.searchParams;
  const opts = parseSearchParams({
    q: sp.get("q"),
    query: sp.get("query"),
    page: sp.get("page"),
    perPage: sp.get("perPage") ?? sp.get("per_page"),
    openAccess: sp.get("openAccess") ?? sp.get("open_access"),
    peerReviewed: sp.get("peerReviewed") ?? sp.get("peer_reviewed"),
    enrich: sp.get("enrich"),
  });

  if (!opts.q) {
    return Response.json(
      { error: "Missing query. Pass ?q=..." },
      { status: 400 },
    );
  }

  try {
    const payload = await runSearch(opts);
    return Response.json(payload);
  } catch (error) {
    console.warn("[studyflow] research search failed:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Literature search failed. Try again.",
        query: opts.q,
        results: [],
        count: 0,
        page: opts.page,
        perPage: opts.perPage,
        source: "openalex",
      } satisfies LiteratureSearchResponse & { error: string },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rate = checkRateLimit(session.userId);
  if (!rate.allowed) {
    return Response.json(
      { error: "Too many searches. Please wait a moment.", retryAfterSec: rate.retryAfterSec },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSec) },
      },
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const opts = parseSearchParams({
    q: typeof body.q === "string" ? body.q : null,
    query: typeof body.query === "string" ? body.query : null,
    page: body.page as string | number | null,
    perPage: (body.perPage ?? body.per_page) as string | number | null,
    openAccess: (body.openAccess ?? body.open_access) as string | boolean | null,
    peerReviewed: (body.peerReviewed ?? body.peer_reviewed) as
      | string
      | boolean
      | null,
    enrich: body.enrich as string | boolean | null,
  });

  if (!opts.q) {
    return Response.json(
      { error: "Missing query. Pass { q: \"...\" }" },
      { status: 400 },
    );
  }

  try {
    const payload = await runSearch(opts);
    return Response.json(payload);
  } catch (error) {
    console.warn("[studyflow] research search failed:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Literature search failed. Try again.",
        query: opts.q,
        results: [],
        count: 0,
        page: opts.page,
        perPage: opts.perPage,
        source: "openalex",
      } satisfies LiteratureSearchResponse & { error: string },
      { status: 502 },
    );
  }
}
