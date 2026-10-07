"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { assignments, courses } from "@/lib/db/schema";
import {
  removeAssignmentUploadDir,
  saveGuidelineFile,
  deleteGuideline,
} from "@/lib/guidelines/store";
import {
  deleteCourseMaterial,
  saveCourseMaterialFile,
} from "@/lib/materials/store";
import {
  defaultNextActionForType,
  parseAssignmentType,
} from "@/lib/assignment-types";
import {
  ensureAssignmentProgressAtLeast,
  recomputeAssignmentProgress,
} from "@/lib/workspace/progress";

export type WorkspaceActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function dbUnavailable(): WorkspaceActionState {
  return { ok: false, error: "Database is not configured." };
}

function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  const suffix = Date.now().toString(36);
  return `${base || "assignment"}-${suffix}`;
}

export async function createCourseAction(
  _prev: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  if (!isDatabaseConfigured()) return dbUnavailable();
  const db = getDb();
  if (!db) return dbUnavailable();

  const user = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim() || null;
  const term = String(formData.get("term") ?? "").trim() || null;

  if (!name || name.length < 2) {
    return {
      ok: false,
      error: "Course name is required.",
      fieldErrors: { name: ["Enter a course name (at least 2 characters)."] },
    };
  }
  if (name.length > 255) {
    return {
      ok: false,
      fieldErrors: { name: ["Name is too long."] },
    };
  }

  const [created] = await db
    .insert(courses)
    .values({
      userId: user.id,
      name,
      code,
      term,
    })
    .returning();

  if (!created) {
    return { ok: false, error: "Could not create course." };
  }

  revalidatePath("/courses");
  revalidatePath("/dashboard");
  revalidatePath("/assignments");
  redirect(`/courses/${created.id}`);
}

export async function createAssignmentAction(
  _prev: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  if (!isDatabaseConfigured()) return dbUnavailable();
  const db = getDb();
  if (!db) return dbUnavailable();

  const user = await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  const courseIdRaw = String(formData.get("courseId") ?? "").trim();
  const assignmentType = parseAssignmentType(
    String(formData.get("assignmentType") ?? "").trim(),
  );
  const question = String(formData.get("question") ?? "").trim() || null;
  const wordLimit = String(formData.get("wordLimit") ?? "").trim() || null;
  const citationStyle =
    String(formData.get("citationStyle") ?? "").trim() || null;
  const dueRaw = String(formData.get("dueAt") ?? "").trim();
  const requirementsRaw = String(formData.get("requirementsJson") ?? "").trim();
  const rubricRaw = String(formData.get("rubricJson") ?? "").trim();
  let requirements: Array<{ title: string; note: string; done: boolean }> = [];
  let rubric: Array<{ criterion: string; weight: string }> = [];
  if (requirementsRaw) {
    try {
      const parsed = JSON.parse(requirementsRaw) as unknown;
      if (Array.isArray(parsed)) {
        requirements = parsed
          .map((item) => {
            if (!item || typeof item !== "object") return null;
            const row = item as Record<string, unknown>;
            const reqTitle = String(row.title ?? "").trim();
            if (!reqTitle) return null;
            return {
              title: reqTitle.slice(0, 240),
              note: String(row.note ?? "").trim().slice(0, 500),
              done: Boolean(row.done),
            };
          })
          .filter((x): x is { title: string; note: string; done: boolean } => Boolean(x))
          .slice(0, 40);
      }
    } catch {
      /* ignore bad JSON from AI fill */
    }
  }
  if (rubricRaw) {
    try {
      const parsed = JSON.parse(rubricRaw) as unknown;
      if (Array.isArray(parsed)) {
        rubric = parsed
          .map((item) => {
            if (!item || typeof item !== "object") return null;
            const row = item as Record<string, unknown>;
            const criterion = String(row.criterion ?? "").trim();
            if (!criterion) return null;
            return {
              criterion: criterion.slice(0, 240),
              weight: String(row.weight ?? "").trim().slice(0, 64) || "—",
            };
          })
          .filter((x): x is { criterion: string; weight: string } => Boolean(x))
          .slice(0, 40);
      }
    } catch {
      /* ignore */
    }
  }
  const nextAction =
    String(formData.get("nextAction") ?? "").trim() ||
    defaultNextActionForType(assignmentType);

  if (!title || title.length < 2) {
    return {
      ok: false,
      error: "Assignment title is required.",
      fieldErrors: { title: ["Enter a title (at least 2 characters)."] },
    };
  }

  let courseId: string | null = null;
  let courseName: string | null = null;

  if (courseIdRaw) {
    const [course] = await db
      .select()
      .from(courses)
      .where(and(eq(courses.id, courseIdRaw), eq(courses.userId, user.id)))
      .limit(1);
    if (!course) {
      return {
        ok: false,
        error: "Selected course was not found.",
        fieldErrors: { courseId: ["Pick a valid course or leave blank."] },
      };
    }
    courseId = course.id;
    courseName = course.name;
  }

  let dueAt: Date | null = null;
  let dueLabel: string | null = null;
  if (dueRaw) {
    const parsed = new Date(dueRaw);
    if (Number.isNaN(parsed.getTime())) {
      return {
        ok: false,
        fieldErrors: { dueAt: ["Invalid due date."] },
      };
    }
    dueAt = parsed;
    dueLabel = parsed.toLocaleDateString("en-HK", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }

  let slug = slugifyTitle(title);
  // Extremely unlikely collision; retry once.
  const [existing] = await db
    .select({ id: assignments.id })
    .from(assignments)
    .where(eq(assignments.slug, slug))
    .limit(1);
  if (existing) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const [created] = await db
    .insert(assignments)
    .values({
      userId: user.id,
      courseId,
      slug,
      title,
      assignmentType,
      courseName,
      question,
      wordLimit,
      citationStyle,
      dueAt,
      dueLabel,
      progress: 0,
      status: "not_started",
      supportMode: "Learning support",
      nextAction,
      requirements,
      rubric,
    })
    .returning();

  if (!created) {
    return { ok: false, error: "Could not create assignment." };
  }

  const guidelineFile = formData.get("guideline");
  if (guidelineFile instanceof File && guidelineFile.size > 0) {
    const saved = await saveGuidelineFile({
      userId: user.id,
      assignmentId: created.id,
      file: guidelineFile,
      kind: "guideline",
    });
    if (!saved.ok) {
      // Assignment exists; surface extract/upload error but still land on brief.
      console.warn("[studyflow] guideline upload on create:", saved.error);
    }
  }

  await recomputeAssignmentProgress(created.id);

  revalidatePath("/assignments");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  revalidatePath("/courses");
  if (courseId) revalidatePath(`/courses/${courseId}`);
  redirect(`/assignments/${created.slug}/brief`);
}

export async function deleteCourseAction(
  courseId: string,
): Promise<WorkspaceActionState> {
  if (!isDatabaseConfigured()) return dbUnavailable();
  const db = getDb();
  if (!db) return dbUnavailable();

  const user = await requireUser();

  const [existing] = await db
    .select({ id: courses.id })
    .from(courses)
    .where(and(eq(courses.id, courseId), eq(courses.userId, user.id)))
    .limit(1);

  if (!existing) {
    return { ok: false, error: "Course not found." };
  }

  // assignments.courseId uses onDelete: set null — child assignments remain.
  await db
    .delete(courses)
    .where(and(eq(courses.id, courseId), eq(courses.userId, user.id)));

  revalidatePath("/courses");
  revalidatePath("/dashboard");
  revalidatePath("/assignments");
  return { ok: true };
}

export async function deleteAssignmentAction(
  slug: string,
): Promise<WorkspaceActionState> {
  if (!isDatabaseConfigured()) return dbUnavailable();
  const db = getDb();
  if (!db) return dbUnavailable();

  const user = await requireUser();

  const [existing] = await db
    .select({ id: assignments.id, slug: assignments.slug })
    .from(assignments)
    .where(and(eq(assignments.slug, slug), eq(assignments.userId, user.id)))
    .limit(1);

  if (!existing) {
    return { ok: false, error: "Assignment not found." };
  }

  // Child rows cascade via Drizzle FKs (notes, sources, claims, etc.).
  await db
    .delete(assignments)
    .where(and(eq(assignments.id, existing.id), eq(assignments.userId, user.id)));

  await removeAssignmentUploadDir(existing.id);

  revalidatePath("/assignments");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  revalidatePath("/courses");
  revalidatePath(`/assignments/${existing.slug}`);
  return { ok: true };
}

export async function upsertMemoryAction(params: {
  scope: "user" | "course" | "assignment";
  content: string;
  kind?: string;
  courseId?: string | null;
  assignmentId?: string | null;
}): Promise<WorkspaceActionState> {
  if (!isDatabaseConfigured()) return dbUnavailable();
  const db = getDb();
  if (!db) return dbUnavailable();

  const user = await requireUser();
  const content = params.content.trim();
  if (!content) return { ok: false, error: "Memory content is required." };

  const { memories } = await import("@/lib/db/schema");

  if (params.scope === "course") {
    if (!params.courseId) return { ok: false, error: "courseId required." };
    const [course] = await db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.id, params.courseId), eq(courses.userId, user.id)))
      .limit(1);
    if (!course) return { ok: false, error: "Course not found." };
  }

  if (params.scope === "assignment") {
    if (!params.assignmentId) {
      return { ok: false, error: "assignmentId required." };
    }
    const [row] = await db
      .select({ id: assignments.id })
      .from(assignments)
      .where(
        and(
          eq(assignments.id, params.assignmentId),
          eq(assignments.userId, user.id),
        ),
      )
      .limit(1);
    if (!row) return { ok: false, error: "Assignment not found." };
  }

  await db.insert(memories).values({
    userId: user.id,
    scope: params.scope,
    courseId: params.scope === "course" ? params.courseId ?? null : null,
    assignmentId:
      params.scope === "assignment" ? params.assignmentId ?? null : null,
    kind: params.kind ?? "fact",
    content,
    metadata: {},
  });

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function addClaimAction(
  _prev: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  if (!isDatabaseConfigured()) return dbUnavailable();
  const db = getDb();
  if (!db) return dbUnavailable();

  const user = await requireUser();
  const assignmentSlug = String(formData.get("assignmentSlug") ?? "").trim();
  const statement = String(formData.get("statement") ?? "").trim();
  const explanation = String(formData.get("explanation") ?? "").trim();

  if (!assignmentSlug) return { ok: false, error: "Missing assignment." };
  if (!statement || statement.length < 8) {
    return {
      ok: false,
      fieldErrors: { statement: ["Enter a clearer claim (8+ characters)."] },
    };
  }

  const { claims, notes } = await import("@/lib/db/schema");
  const { getAssignmentBySlug } = await import("@/lib/db/queries");
  const assignment = await getAssignmentBySlug(assignmentSlug, user.id);
  if (!assignment) return { ok: false, error: "Assignment not found." };

  const existing = await db
    .select({ id: claims.id })
    .from(claims)
    .where(eq(claims.assignmentId, assignment.id));

  await db.insert(claims).values({
    assignmentId: assignment.id,
    statement,
    sortOrder: existing.length,
  });

  if (explanation) {
    await db.insert(notes).values({
      assignmentId: assignment.id,
      title: `Explanation · ${statement.slice(0, 48)}`,
      body: explanation,
      sourceLabel: "outline",
    });
  }

  await recomputeAssignmentProgress(assignment.id);

  revalidatePath(`/assignments/${assignment.slug}/outline`);
  revalidatePath(`/assignments/${assignment.slug}/claim-evidence`);
  revalidatePath(`/assignments/${assignment.slug}/brief`);
  revalidatePath("/assignments");
  return { ok: true };
}

export async function saveDraftPlannerAction(
  _prev: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  if (!isDatabaseConfigured()) return dbUnavailable();
  const db = getDb();
  if (!db) return dbUnavailable();

  const user = await requireUser();
  const assignmentSlug = String(formData.get("assignmentSlug") ?? "").trim();
  const section = String(formData.get("section") ?? "").trim();
  const claim = String(formData.get("claim") ?? "").trim();
  const evidenceNote = String(formData.get("evidence") ?? "").trim();
  const logicCheck = String(formData.get("logicCheck") ?? "").trim();

  if (!assignmentSlug) return { ok: false, error: "Missing assignment." };
  if (!section || !claim) {
    return { ok: false, error: "Section and claim are required." };
  }

  const { notes } = await import("@/lib/db/schema");
  const { getAssignmentBySlug } = await import("@/lib/db/queries");
  const assignment = await getAssignmentBySlug(assignmentSlug, user.id);
  if (!assignment) return { ok: false, error: "Assignment not found." };

  const body = [
    `Section: ${section}`,
    `Claim: ${claim}`,
    evidenceNote ? `Evidence: ${evidenceNote}` : null,
    logicCheck ? `Logic check: ${logicCheck}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  await db.insert(notes).values({
    assignmentId: assignment.id,
    title: `Draft plan · ${section}`,
    body,
    sourceLabel: "draft-planner",
  });

  await recomputeAssignmentProgress(assignment.id);

  revalidatePath(`/assignments/${assignment.slug}/draft`);
  revalidatePath(`/assignments/${assignment.slug}/notes`);
  revalidatePath(`/assignments/${assignment.slug}/brief`);
  revalidatePath("/assignments");
  return { ok: true };
}

export async function saveOutlineStructureAction(
  assignmentSlug: string,
): Promise<WorkspaceActionState> {
  if (!isDatabaseConfigured()) return dbUnavailable();
  const db = getDb();
  if (!db) return dbUnavailable();

  const user = await requireUser();
  const { getAssignmentBySlug, getClaimsWithEvidence } = await import(
    "@/lib/db/queries"
  );
  const { outlines } = await import("@/lib/db/schema");
  const assignment = await getAssignmentBySlug(assignmentSlug, user.id);
  if (!assignment) return { ok: false, error: "Assignment not found." };

  const claimRows = await getClaimsWithEvidence(assignmentSlug);
  const structure = claimRows.map((c, index) => ({
    order: index + 1,
    claimId: c.id,
    statement: c.statement,
    evidenceCount: c.evidence.length,
  }));

  const [existing] = await db
    .select({ id: outlines.id })
    .from(outlines)
    .where(eq(outlines.assignmentId, assignment.id))
    .limit(1);

  if (existing) {
    await db
      .update(outlines)
      .set({ structure, updatedAt: sql`now()` })
      .where(eq(outlines.id, existing.id));
  } else {
    await db.insert(outlines).values({
      assignmentId: assignment.id,
      title: "Main outline",
      structure,
    });
  }

  await recomputeAssignmentProgress(assignment.id);

  revalidatePath(`/assignments/${assignment.slug}/outline`);
  revalidatePath(`/assignments/${assignment.slug}/brief`);
  revalidatePath("/assignments");
  return { ok: true };
}

export async function verifyEvidenceAction(
  evidenceId: string,
): Promise<WorkspaceActionState> {
  if (!isDatabaseConfigured()) return dbUnavailable();
  const db = getDb();
  if (!db) return dbUnavailable();

  const user = await requireUser();
  const { evidence, claims, assignments } = await import("@/lib/db/schema");

  const [row] = await db
    .select({
      id: evidence.id,
      claimId: evidence.claimId,
      assignmentId: claims.assignmentId,
      userId: assignments.userId,
      slug: assignments.slug,
    })
    .from(evidence)
    .innerJoin(claims, eq(evidence.claimId, claims.id))
    .innerJoin(assignments, eq(claims.assignmentId, assignments.id))
    .where(eq(evidence.id, evidenceId))
    .limit(1);

  if (!row || row.userId !== user.id) {
    return { ok: false, error: "Evidence not found." };
  }

  await db
    .update(evidence)
    .set({ studentVerified: true })
    .where(eq(evidence.id, evidenceId));

  await recomputeAssignmentProgress(row.assignmentId);

  revalidatePath(`/assignments/${row.slug}/claim-evidence`);
  revalidatePath(`/assignments/${row.slug}/outline`);
  revalidatePath(`/assignments/${row.slug}/brief`);
  revalidatePath("/assignments");
  return { ok: true };
}

export async function uploadGuidelineAction(
  _prev: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  if (!isDatabaseConfigured()) return dbUnavailable();

  const user = await requireUser();
  const assignmentId = String(formData.get("assignmentId") ?? "").trim();
  const assignmentSlug = String(formData.get("assignmentSlug") ?? "").trim();
  const kindRaw = String(formData.get("kind") ?? "guideline").trim();
  const kind =
    kindRaw === "rubric" || kindRaw === "brief" ? kindRaw : "guideline";
  const file = formData.get("guideline");

  if (!assignmentId) {
    return { ok: false, error: "Missing assignment." };
  }
  if (!(file instanceof File) || file.size <= 0) {
    return {
      ok: false,
      error: "Choose a PDF, DOCX, TXT, or Markdown guideline file.",
      fieldErrors: { guideline: ["File is required."] },
    };
  }

  const saved = await saveGuidelineFile({
    userId: user.id,
    assignmentId,
    file,
    kind,
  });

  if (!saved.ok) {
    return { ok: false, error: saved.error, fieldErrors: { guideline: [saved.error] } };
  }

  await recomputeAssignmentProgress(assignmentId);

  if (assignmentSlug) {
    revalidatePath(`/assignments/${assignmentSlug}`);
    revalidatePath(`/assignments/${assignmentSlug}/brief`);
  }
  revalidatePath("/assignments");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteGuidelineAction(
  guidelineId: string,
  assignmentSlug?: string,
): Promise<WorkspaceActionState> {
  if (!isDatabaseConfigured()) return dbUnavailable();
  const user = await requireUser();

  const result = await deleteGuideline({
    guidelineId,
    userId: user.id,
  });
  if (!result.ok) return { ok: false, error: result.error };

  if (result.assignmentId) {
    await recomputeAssignmentProgress(result.assignmentId);
  }

  const slug = assignmentSlug ?? result.assignmentSlug;
  if (slug) {
    revalidatePath(`/assignments/${slug}`);
    revalidatePath(`/assignments/${slug}/brief`);
  }
  revalidatePath("/assignments");
  return { ok: true };
}



export async function uploadCourseMaterialAction(
  _prev: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  if (!isDatabaseConfigured()) return dbUnavailable();

  const user = await requireUser();
  const assignmentId = String(formData.get("assignmentId") ?? "").trim();
  const assignmentSlug = String(formData.get("assignmentSlug") ?? "").trim();
  const file = formData.get("material");

  if (!assignmentId) {
    return { ok: false, error: "Missing assignment." };
  }
  if (!(file instanceof File) || file.size <= 0) {
    return {
      ok: false,
      error: "Choose a PDF, DOCX, TXT, or Markdown material file.",
      fieldErrors: { material: ["File is required."] },
    };
  }

  const saved = await saveCourseMaterialFile({
    userId: user.id,
    assignmentId,
    file,
  });

  if (!saved.ok) {
    return { ok: false, error: saved.error, fieldErrors: { material: [saved.error] } };
  }

  await recomputeAssignmentProgress(assignmentId);

  if (assignmentSlug) {
    revalidatePath(`/assignments/${assignmentSlug}`);
    revalidatePath(`/assignments/${assignmentSlug}/notes`);
    revalidatePath(`/assignments/${assignmentSlug}/brief`);
    revalidatePath(`/assignments/${assignmentSlug}/draft`);
  }
  revalidatePath("/assignments");
  return { ok: true };
}

export async function deleteCourseMaterialAction(
  materialId: string,
  assignmentSlug?: string,
): Promise<WorkspaceActionState> {
  if (!isDatabaseConfigured()) return dbUnavailable();
  const user = await requireUser();

  const result = await deleteCourseMaterial({
    materialId,
    userId: user.id,
  });
  if (!result.ok) return { ok: false, error: result.error };

  const slug = assignmentSlug ?? result.assignmentSlug;
  if (slug) {
    revalidatePath(`/assignments/${slug}`);
    revalidatePath(`/assignments/${slug}/notes`);
    revalidatePath(`/assignments/${slug}/brief`);
    revalidatePath(`/assignments/${slug}/draft`);
  }
  revalidatePath("/assignments");
  return { ok: true };
}


export async function applyAiBriefSuggestionsAction(params: {
  assignmentSlug: string;
  title?: string | null;
  question?: string | null;
  assignmentType?: string | null;
  wordLimit?: string | null;
  citationStyle?: string | null;
  nextAction?: string | null;
  requirements?: Array<{ title: string; note: string; done?: boolean }>;
  rubric?: Array<{ criterion: string; weight: string }>;
}): Promise<WorkspaceActionState> {
  if (!isDatabaseConfigured()) return dbUnavailable();
  const db = getDb();
  if (!db) return dbUnavailable();

  const user = await requireUser();
  const slug = params.assignmentSlug.trim();
  if (!slug) return { ok: false, error: "Missing assignment." };

  const [row] = await db
    .select({ id: assignments.id, slug: assignments.slug })
    .from(assignments)
    .where(and(eq(assignments.slug, slug), eq(assignments.userId, user.id)))
    .limit(1);
  if (!row) return { ok: false, error: "Assignment not found." };

  const patch: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (params.title?.trim()) patch.title = params.title.trim().slice(0, 255);
  if (params.question !== undefined) {
    patch.question = params.question?.trim() || null;
  }
  if (params.assignmentType) {
    patch.assignmentType = parseAssignmentType(params.assignmentType);
  }
  if (params.wordLimit !== undefined) {
    patch.wordLimit = params.wordLimit?.trim() || null;
  }
  if (params.citationStyle !== undefined) {
    patch.citationStyle = params.citationStyle?.trim() || null;
  }
  if (params.nextAction?.trim()) {
    patch.nextAction = params.nextAction.trim();
  }
  if (params.requirements) {
    patch.requirements = params.requirements
      .map((r) => ({
        title: String(r.title ?? "").trim().slice(0, 240),
        note: String(r.note ?? "").trim().slice(0, 500),
        done: Boolean(r.done),
      }))
      .filter((r) => r.title)
      .slice(0, 40);
  }
  if (params.rubric) {
    patch.rubric = params.rubric
      .map((r) => ({
        criterion: String(r.criterion ?? "").trim().slice(0, 240),
        weight: String(r.weight ?? "").trim().slice(0, 64) || "—",
      }))
      .filter((r) => r.criterion)
      .slice(0, 40);
  }

  await db
    .update(assignments)
    .set(patch as Partial<typeof assignments.$inferInsert>)
    .where(eq(assignments.id, row.id));

  await recomputeAssignmentProgress(row.id);

  revalidatePath(`/assignments/${row.slug}`);
  revalidatePath(`/assignments/${row.slug}/brief`);
  revalidatePath("/assignments");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function markUnderstandCompleteAction(
  assignmentSlug: string,
): Promise<WorkspaceActionState> {
  if (!isDatabaseConfigured()) return dbUnavailable();
  const db = getDb();
  if (!db) return dbUnavailable();

  const user = await requireUser();
  const slug = assignmentSlug.trim();
  if (!slug) return { ok: false, error: "Missing assignment." };

  const [row] = await db
    .select({ id: assignments.id, slug: assignments.slug })
    .from(assignments)
    .where(and(eq(assignments.slug, slug), eq(assignments.userId, user.id)))
    .limit(1);
  if (!row) return { ok: false, error: "Assignment not found." };

  // Manually advance past Understand (≥20). Recompute may raise further.
  await ensureAssignmentProgressAtLeast(row.id, 20);

  revalidatePath(`/assignments/${row.slug}`);
  revalidatePath(`/assignments/${row.slug}/brief`);
  revalidatePath("/assignments");
  revalidatePath("/dashboard");
  return { ok: true };
}
