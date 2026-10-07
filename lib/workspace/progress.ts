import "server-only";

import { and, count, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  assignmentGuidelines,
  assignments,
  claims,
  courseMaterials,
  notes,
  outlines,
  researchSources,
} from "@/lib/db/schema";
import { isWritingFocusedType } from "@/lib/assignment-types";

/**
 * Milestone thresholds map to workflow stepper steps:
 *   0  → step 1 Understand (current)
 *  20  → step 2 Gather
 *  40  → step 3 Plan
 *  60  → step 4 Produce / Draft
 *  80  → step 5 Check
 * 100  → all done
 *
 * Progress only increases (never drops below earned) unless the caller
 * explicitly resets. Status completed/submitted always yields 100.
 */
export async function recomputeAssignmentProgress(
  assignmentId: string,
): Promise<number | null> {
  const db = getDb();
  if (!db) return null;

  const [row] = await db
    .select({
      id: assignments.id,
      progress: assignments.progress,
      status: assignments.status,
      question: assignments.question,
      requirements: assignments.requirements,
      rubric: assignments.rubric,
      assignmentType: assignments.assignmentType,
      slug: assignments.slug,
    })
    .from(assignments)
    .where(eq(assignments.id, assignmentId))
    .limit(1);

  if (!row) return null;

  if (row.status === "completed" || row.status === "submitted") {
    if (row.progress < 100) {
      await db
        .update(assignments)
        .set({ progress: 100, updatedAt: sql`now()` })
        .where(eq(assignments.id, assignmentId));
    }
    return 100;
  }

  const [
    [guidelineCount],
    [noteCount],
    [materialCount],
    [sourceCount],
    [outlineCount],
    [claimCount],
    [draftNoteCount],
  ] = await Promise.all([
    db
      .select({ n: count() })
      .from(assignmentGuidelines)
      .where(eq(assignmentGuidelines.assignmentId, assignmentId)),
    db
      .select({ n: count() })
      .from(notes)
      .where(eq(notes.assignmentId, assignmentId)),
    db
      .select({ n: count() })
      .from(courseMaterials)
      .where(eq(courseMaterials.assignmentId, assignmentId)),
    db
      .select({ n: count() })
      .from(researchSources)
      .where(eq(researchSources.assignmentId, assignmentId)),
    db
      .select({ n: count() })
      .from(outlines)
      .where(eq(outlines.assignmentId, assignmentId)),
    db
      .select({ n: count() })
      .from(claims)
      .where(eq(claims.assignmentId, assignmentId)),
    db
      .select({ n: count() })
      .from(notes)
      .where(
        and(
          eq(notes.assignmentId, assignmentId),
          eq(notes.sourceLabel, "draft-planner"),
        ),
      ),
  ]);

  const hasBrief =
    Boolean(row.question?.trim()) ||
    (Array.isArray(row.requirements) && row.requirements.length > 0) ||
    (Array.isArray(row.rubric) && row.rubric.length > 0);
  const hasGuideline = Number(guidelineCount?.n ?? 0) > 0;
  const hasNotes = Number(noteCount?.n ?? 0) > 0;
  const hasMaterials = Number(materialCount?.n ?? 0) > 0;
  const hasSources = Number(sourceCount?.n ?? 0) > 0;
  const hasOutline = Number(outlineCount?.n ?? 0) > 0;
  const hasClaims = Number(claimCount?.n ?? 0) > 0;
  const hasDraftWork = Number(draftNoteCount?.n ?? 0) > 0;

  const writing = isWritingFocusedType(row.assignmentType);

  let computed = 0;

  // Step 1→2: Understand complete — brief/guideline present
  if (hasBrief || hasGuideline) {
    computed = Math.max(computed, 20);
  }

  // Step 2→3: Gather materials / evidence
  if (hasNotes || hasMaterials || hasSources) {
    computed = Math.max(computed, 40);
  }

  // Step 3→4: Plan / outline
  if (hasOutline || (writing && hasClaims) || (!writing && hasClaims)) {
    computed = Math.max(computed, 60);
  }

  // Step 4→5: Draft / produce work activity
  if (hasDraftWork || (writing && hasOutline && hasClaims && hasSources)) {
    computed = Math.max(computed, 80);
  }

  // Never decrease below what's already earned
  const next = Math.max(row.progress, computed);

  if (next !== row.progress) {
    const statusPatch =
      next > 0 && row.status === "not_started"
        ? ({ status: "in_progress" as const })
        : {};
    await db
      .update(assignments)
      .set({
        progress: next,
        updatedAt: sql`now()`,
        ...statusPatch,
      })
      .where(eq(assignments.id, assignmentId));
  }

  return next;
}

/** Force at least `minProgress` without lowering existing progress. */
export async function ensureAssignmentProgressAtLeast(
  assignmentId: string,
  minProgress: number,
): Promise<number | null> {
  const db = getDb();
  if (!db) return null;

  const [row] = await db
    .select({
      progress: assignments.progress,
      status: assignments.status,
    })
    .from(assignments)
    .where(eq(assignments.id, assignmentId))
    .limit(1);
  if (!row) return null;

  if (row.status === "completed" || row.status === "submitted") {
    return recomputeAssignmentProgress(assignmentId);
  }

  const next = Math.max(row.progress, Math.min(100, Math.max(0, minProgress)));
  if (next !== row.progress) {
    await db
      .update(assignments)
      .set({
        progress: next,
        status: next > 0 && row.status === "not_started" ? "in_progress" : row.status,
        updatedAt: sql`now()`,
      })
      .where(eq(assignments.id, assignmentId));
  }

  // Still recompute in case milestones already unlock further steps
  return recomputeAssignmentProgress(assignmentId);
}
