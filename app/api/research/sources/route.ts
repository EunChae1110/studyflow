import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { insertResearchSource } from "@/lib/db/queries";
import type { SaveResearchSourceInput } from "@/lib/research/types";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SaveResearchSourceInput;
  try {
    body = (await request.json()) as SaveResearchSourceInput;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = body.title?.trim();
  if (!title) {
    return Response.json({ error: "title is required" }, { status: 400 });
  }

  try {
    const source = await insertResearchSource({
      userId: session.userId,
      assignmentId: body.assignmentId ?? null,
      assignmentSlug: body.assignmentSlug ?? null,
      title,
      authors: body.authors?.trim() || null,
      venue: body.venue?.trim() || null,
      year: typeof body.year === "number" ? body.year : null,
      doi: body.doi?.trim() || null,
      url: body.url?.trim() || null,
      openAccess: Boolean(body.openAccess),
      selected: Boolean(body.selected),
    });

    if (!source) {
      return Response.json(
        { error: "Assignment not found or access denied" },
        { status: 404 },
      );
    }

    return Response.json({ source }, { status: 201 });
  } catch (error) {
    console.warn("[studyflow] save research source failed:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to save source",
      },
      { status: 500 },
    );
  }
}
