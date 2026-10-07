import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  assignments,
  claims,
  evidence,
  memories,
  notes,
  outlines,
  researchSources,
} from "@/lib/db/schema";

/**
 * Build hybrid memory context for /api/chat:
 * 1) assignment working pack
 * 2) course-scoped memories
 * 3) user-scoped prefs
 * (conversation turns travel separately in the request body)
 */
export async function buildHybridContextPack(params: {
  userId: string;
  assignmentUuid?: string | null;
}): Promise<string> {
  const db = getDb();
  if (!db || !params.assignmentUuid) {
    // Still load user prefs if any
    if (!db) return "";
    const userPrefs = await db
      .select()
      .from(memories)
      .where(and(eq(memories.userId, params.userId), eq(memories.scope, "user")))
      .orderBy(desc(memories.updatedAt))
      .limit(12);
    if (userPrefs.length === 0) return "";
    return [
      "## User preferences",
      ...userPrefs.map((m) => `- (${m.kind}) ${m.content}`),
    ].join("\n");
  }

  const [assignment] = await db
    .select()
    .from(assignments)
    .where(
      and(
        eq(assignments.id, params.assignmentUuid),
        eq(assignments.userId, params.userId),
      ),
    )
    .limit(1);

  if (!assignment) return "";

  const [noteRows, sourceRows, claimRows, outlineRows, assignmentMemories] =
    await Promise.all([
      db
        .select()
        .from(notes)
        .where(eq(notes.assignmentId, assignment.id))
        .limit(20),
      db
        .select()
        .from(researchSources)
        .where(eq(researchSources.assignmentId, assignment.id))
        .limit(20),
      db
        .select()
        .from(claims)
        .where(eq(claims.assignmentId, assignment.id))
        .limit(20),
      db
        .select()
        .from(outlines)
        .where(eq(outlines.assignmentId, assignment.id))
        .limit(1),
      db
        .select()
        .from(memories)
        .where(
          and(
            eq(memories.userId, params.userId),
            eq(memories.scope, "assignment"),
            eq(memories.assignmentId, assignment.id),
          ),
        )
        .orderBy(desc(memories.updatedAt))
        .limit(12),
    ]);

  const evidenceByClaim: string[] = [];
  for (const claim of claimRows.slice(0, 8)) {
    const ev = await db
      .select()
      .from(evidence)
      .where(eq(evidence.claimId, claim.id))
      .limit(5);
    evidenceByClaim.push(
      `- Claim: ${claim.statement}` +
        (ev.length
          ? `\n  Evidence: ${ev
              .map((e) => e.quote ?? e.paraphrase ?? "(empty)")
              .join(" | ")}`
          : "\n  Evidence: (none)"),
    );
  }

  const courseMemories = assignment.courseId
    ? await db
        .select()
        .from(memories)
        .where(
          and(
            eq(memories.userId, params.userId),
            eq(memories.scope, "course"),
            eq(memories.courseId, assignment.courseId),
          ),
        )
        .orderBy(desc(memories.updatedAt))
        .limit(12)
    : [];

  const userPrefs = await db
    .select()
    .from(memories)
    .where(and(eq(memories.userId, params.userId), eq(memories.scope, "user")))
    .orderBy(desc(memories.updatedAt))
    .limit(12);

  const sections: string[] = [];

  sections.push("## Assignment context (working memory)");
  sections.push(`Title: ${assignment.title}`);
  if (assignment.courseName) sections.push(`Course: ${assignment.courseName}`);
  if (assignment.question) sections.push(`Question: ${assignment.question}`);
  if (assignment.wordLimit) sections.push(`Word limit: ${assignment.wordLimit}`);
  if (assignment.citationStyle)
    sections.push(`Citation style: ${assignment.citationStyle}`);
  if (assignment.dueLabel || assignment.dueAt) {
    sections.push(
      `Due: ${assignment.dueLabel ?? assignment.dueAt?.toISOString() ?? ""}`,
    );
  }
  if (assignment.nextAction) sections.push(`Next action: ${assignment.nextAction}`);

  const reqs = Array.isArray(assignment.requirements)
    ? assignment.requirements
    : [];
  if (reqs.length) {
    sections.push(
      "Requirements:\n" +
        reqs
          .map(
            (r) =>
              `- [${r.done ? "x" : " "}] ${r.title}${r.note ? ` — ${r.note}` : ""}`,
          )
          .join("\n"),
    );
  }

  const rubric = Array.isArray(assignment.rubric) ? assignment.rubric : [];
  if (rubric.length) {
    sections.push(
      "Rubric:\n" +
        rubric.map((r) => `- ${r.criterion} (${r.weight})`).join("\n"),
    );
  }

  if (noteRows.length) {
    sections.push(
      "Student notes:\n" +
        noteRows
          .map(
            (n) =>
              `- ${n.title}${n.page ? ` (p.${n.page})` : ""}: ${n.body.slice(0, 400)}`,
          )
          .join("\n"),
    );
  }

  if (sourceRows.length) {
    sections.push(
      "Research sources:\n" +
        sourceRows
          .map((s) => {
            const bits = [
              s.title,
              s.authors,
              s.year ? String(s.year) : null,
              s.doi ? `DOI ${s.doi}` : null,
              s.selected ? "SELECTED" : null,
              s.verified ? "verified" : "unverified",
            ].filter(Boolean);
            return `- ${bits.join(" · ")}`;
          })
          .join("\n"),
    );
  }

  if (evidenceByClaim.length) {
    sections.push("Claims & evidence:\n" + evidenceByClaim.join("\n"));
  }

  if (outlineRows[0]) {
    const structure = outlineRows[0].structure;
    sections.push(
      `Outline (${outlineRows[0].title}): ${JSON.stringify(structure).slice(0, 1200)}`,
    );
  }

  if (assignmentMemories.length) {
    sections.push(
      "Assignment memories:\n" +
        assignmentMemories.map((m) => `- (${m.kind}) ${m.content}`).join("\n"),
    );
  }

  if (courseMemories.length) {
    sections.push(
      "## Course memories (durable, this course only)\n" +
        courseMemories.map((m) => `- (${m.kind}) ${m.content}`).join("\n"),
    );
  }

  if (userPrefs.length) {
    sections.push(
      "## User preferences\n" +
        userPrefs.map((m) => `- (${m.kind}) ${m.content}`).join("\n"),
    );
  }

  return sections.join("\n\n");
}
