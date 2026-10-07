import { and, asc, desc, eq, sql } from "drizzle-orm";
import { EMPTY_STUDENT_PROFILE } from "@/lib/constants";
import { isUserId } from "@/lib/auth/ids";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import {
  aiConversations,
  aiMessages,
  assignments,
  claims,
  courseMaterials,
  courses,
  evidence,
  notes,
  outlines,
  referencesTable,
  researchQuestions,
  researchSources,
  users,
} from "@/lib/db/schema";
import type {
  AssignmentDetail,
  AssignmentListItem,
  CourseMaterialItem,
  DashboardStat,
  DeadlineItem,
  ReferenceItem,
  ResearchQuestionItem,
  ResearchSourceItem,
  StudentProfile,
  WeeklyProgressPoint,
} from "@/lib/types";

export type { AssignmentListItem };

export type DashboardSummary = {
  studentName: string;
  assignmentCount: number;
  assignments: AssignmentListItem[];
};

function requireDb() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured");
  }
  const db = getDb();
  if (!db) throw new Error("DB client unavailable");
  return db;
}

function formatDue(dueAt: Date | null, dueLabel: string | null): string {
  if (dueLabel) return dueLabel;
  if (!dueAt) return "No due date";
  return dueAt.toLocaleDateString("en-HK", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function urgencyFromDays(days: number | null): DeadlineItem["urgency"] {
  if (days === null) return "success";
  if (days <= 5) return "danger";
  if (days <= 14) return "warning";
  return "success";
}

function daysLeftLabel(days: number | null): string {
  if (days === null) return "No date";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "1 day";
  return `${days} days`;
}

export async function getStudentProfile(userId: string): Promise<StudentProfile> {
  if (!isUserId(userId)) {
    return { ...EMPTY_STUDENT_PROFILE };
  }
  try {
    const db = requireDb();
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return { ...EMPTY_STUDENT_PROFILE };
    }
    return {
      id: user.id,
      name: user.name,
      initials: user.initials?.trim() || user.name.slice(0, 2).toUpperCase(),
      tagline: user.tagline,
    };
  } catch (error) {
    console.warn("[studyflow] getStudentProfile failed:", error);
    return { ...EMPTY_STUDENT_PROFILE };
  }
}

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  if (!isUserId(userId)) {
    return {
      studentName: EMPTY_STUDENT_PROFILE.name,
      assignmentCount: 0,
      assignments: [],
    };
  }
  try {
    const db = requireDb();
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const rows = await db
      .select({
        id: assignments.id,
        slug: assignments.slug,
        title: assignments.title,
        courseName: assignments.courseName,
        dueAt: assignments.dueAt,
        dueLabel: assignments.dueLabel,
        progress: assignments.progress,
        nextAction: assignments.nextAction,
      })
      .from(assignments)
      .where(eq(assignments.userId, userId))
      .orderBy(asc(assignments.dueAt))
      .limit(50);

    return {
      studentName: user?.name ?? EMPTY_STUDENT_PROFILE.name,
      assignmentCount: rows.length,
      assignments: rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        course: row.courseName ?? "Course",
        due: formatDue(row.dueAt, row.dueLabel),
        progress: row.progress,
        nextAction: row.nextAction,
      })),
    };
  } catch (error) {
    console.warn("[studyflow] getDashboardSummary failed:", error);
    return {
      studentName: EMPTY_STUDENT_PROFILE.name,
      assignmentCount: 0,
      assignments: [],
    };
  }
}

export async function listAssignments(userId: string): Promise<AssignmentListItem[]> {
  const summary = await getDashboardSummary(userId);
  return summary.assignments;
}

export async function getAssignmentBySlug(
  slug: string,
  userId?: string,
): Promise<AssignmentDetail | null> {
  const db = requireDb();
  const [row] = await db
    .select()
    .from(assignments)
    .where(eq(assignments.slug, slug))
    .limit(1);

  if (!row) return null;
  if (userId && row.userId !== userId) return null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    course: row.courseName ?? "Course",
    wordLimit: row.wordLimit,
    citationStyle: row.citationStyle,
    due: formatDue(row.dueAt, row.dueLabel),
    dueAt: row.dueAt,
    progress: row.progress,
    supportMode: row.supportMode,
    question: row.question,
    nextAction: row.nextAction,
    requirements: Array.isArray(row.requirements) ? row.requirements : [],
    rubric: Array.isArray(row.rubric) ? row.rubric : [],
    status: row.status,
  };
}

export async function getDeadlines(userId: string, limit = 20): Promise<DeadlineItem[]> {
  if (!isUserId(userId)) return [];
  const db = requireDb();
  const rows = await db
    .select({
      slug: assignments.slug,
      title: assignments.title,
      courseName: assignments.courseName,
      dueAt: assignments.dueAt,
      dueLabel: assignments.dueLabel,
      progress: assignments.progress,
    })
    .from(assignments)
    .where(eq(assignments.userId, userId))
    .orderBy(asc(assignments.dueAt))
    .limit(limit);

  const now = new Date();
  return rows.map((row) => {
    const days = row.dueAt ? daysBetween(now, row.dueAt) : null;
    return {
      slug: row.slug,
      title: row.title,
      course: row.courseName ?? "Course",
      due: formatDue(row.dueAt, row.dueLabel),
      dueAt: row.dueAt,
      urgency: urgencyFromDays(days),
      daysLeft: daysLeftLabel(days),
      progress: row.progress,
    };
  });
}

export async function getResearchSources(params?: {
  userId?: string;
  assignmentSlug?: string;
  limit?: number;
}): Promise<ResearchSourceItem[]> {
  const db = requireDb();
  const limit = params?.limit ?? 50;

  if (params?.assignmentSlug) {
    const assignment = await getAssignmentBySlug(
      params.assignmentSlug,
      params.userId,
    );
    if (!assignment) return [];
    const rows = await db
      .select()
      .from(researchSources)
      .where(eq(researchSources.assignmentId, assignment.id))
      .orderBy(desc(researchSources.updatedAt))
      .limit(limit);
    return rows.map(mapSource);
  }

  if (!params?.userId) return [];

  const rows = await db
    .select()
    .from(researchSources)
    .where(eq(researchSources.userId, params.userId))
    .orderBy(desc(researchSources.updatedAt))
    .limit(limit);
  return rows.map(mapSource);
}

function mapSource(row: typeof researchSources.$inferSelect): ResearchSourceItem {
  return {
    id: row.id,
    title: row.title,
    authors: row.authors,
    venue: row.venue,
    year: row.year,
    doi: row.doi,
    url: row.url,
    verified: row.verified,
    openAccess: row.openAccess,
    selected: row.selected,
  };
}

export async function insertResearchSource(params: {
  userId: string;
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
}): Promise<ResearchSourceItem | null> {
  const db = requireDb();

  let assignmentUuid: string | null = params.assignmentId ?? null;
  if (!assignmentUuid && params.assignmentSlug) {
    const assignment = await getAssignmentBySlug(params.assignmentSlug, params.userId);
    // Soft-fail: allow library-only save when slug is missing/invalid.
    assignmentUuid = assignment?.id ?? null;
  } else if (assignmentUuid) {
    const [row] = await db
      .select({ id: assignments.id, userId: assignments.userId })
      .from(assignments)
      .where(eq(assignments.id, assignmentUuid))
      .limit(1);
    if (!row || row.userId !== params.userId) return null;
  }

  const doi = params.doi?.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").trim().toLowerCase() || null;

  // Dedupe by DOI within the same assignment (or user library if no assignment).
  if (doi) {
    const existing = await db
      .select()
      .from(researchSources)
      .where(
        assignmentUuid
          ? eq(researchSources.assignmentId, assignmentUuid)
          : eq(researchSources.userId, params.userId),
      )
      .limit(100);
    const dup = existing.find(
      (s) =>
        s.doi?.toLowerCase() === doi &&
        (assignmentUuid ? s.assignmentId === assignmentUuid : true) &&
        s.userId === params.userId,
    );
    if (dup) {
      const [updated] = await db
        .update(researchSources)
        .set({
          title: params.title,
          authors: params.authors ?? dup.authors,
          venue: params.venue ?? dup.venue,
          year: params.year ?? dup.year,
          url: params.url ?? dup.url,
          openAccess: params.openAccess ?? dup.openAccess,
          selected: params.selected ?? dup.selected,
          updatedAt: sql`now()`,
        })
        .where(eq(researchSources.id, dup.id))
        .returning();
      return updated ? mapSource(updated) : mapSource(dup);
    }
  }

  // If selecting this source, clear other selected flags on the assignment.
  if (params.selected && assignmentUuid) {
    await db
      .update(researchSources)
      .set({ selected: false, updatedAt: sql`now()` })
      .where(eq(researchSources.assignmentId, assignmentUuid));
  }

  const [created] = await db
    .insert(researchSources)
    .values({
      userId: params.userId,
      assignmentId: assignmentUuid,
      title: params.title,
      authors: params.authors ?? null,
      venue: params.venue ?? null,
      year: params.year ?? null,
      doi,
      url: params.url ?? null,
      openAccess: Boolean(params.openAccess),
      selected: Boolean(params.selected),
      verified: false,
      kind: "external-research",
    })
    .returning();

  return created ? mapSource(created) : null;
}

export async function setResearchSourceSelected(params: {
  userId: string;
  sourceId: string;
  selected: boolean;
}): Promise<ResearchSourceItem | null> {
  const db = requireDb();
  const [existing] = await db
    .select()
    .from(researchSources)
    .where(eq(researchSources.id, params.sourceId))
    .limit(1);
  if (!existing || existing.userId !== params.userId) return null;

  if (params.selected && existing.assignmentId) {
    await db
      .update(researchSources)
      .set({ selected: false, updatedAt: sql`now()` })
      .where(eq(researchSources.assignmentId, existing.assignmentId));
  }

  const [updated] = await db
    .update(researchSources)
    .set({ selected: params.selected, updatedAt: sql`now()` })
    .where(eq(researchSources.id, params.sourceId))
    .returning();

  return updated ? mapSource(updated) : null;
}

export async function getReferences(assignmentSlug: string): Promise<ReferenceItem[]> {
  const assignment = await getAssignmentBySlug(assignmentSlug);
  if (!assignment) return [];
  const db = requireDb();
  const rows = await db
    .select()
    .from(referencesTable)
    .where(eq(referencesTable.assignmentId, assignment.id))
    .orderBy(asc(referencesTable.createdAt));

  return rows.map((row) => ({
    id: row.id,
    source: row.sourceLabel ?? "Unknown",
    title: row.title,
    type: row.type,
    year: row.year,
    doi: row.doi,
    status: row.status ?? "Needs review",
  }));
}

export async function getNotes(assignmentSlug: string) {
  const assignment = await getAssignmentBySlug(assignmentSlug);
  if (!assignment) return [];
  const db = requireDb();
  return db
    .select()
    .from(notes)
    .where(eq(notes.assignmentId, assignment.id))
    .orderBy(asc(notes.createdAt));
}

export async function getCourseMaterials(
  assignmentSlug: string,
): Promise<CourseMaterialItem[]> {
  const assignment = await getAssignmentBySlug(assignmentSlug);
  if (!assignment) return [];
  const db = requireDb();
  const rows = await db
    .select()
    .from(courseMaterials)
    .where(eq(courseMaterials.assignmentId, assignment.id))
    .orderBy(asc(courseMaterials.createdAt));

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    pages: row.pages,
    status: row.status,
  }));
}

export async function getResearchQuestions(
  assignmentSlug: string,
): Promise<ResearchQuestionItem[]> {
  const assignment = await getAssignmentBySlug(assignmentSlug);
  if (!assignment) return [];
  const db = requireDb();
  const rows = await db
    .select()
    .from(researchQuestions)
    .where(eq(researchQuestions.assignmentId, assignment.id))
    .orderBy(asc(researchQuestions.sortOrder));

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    active: row.active,
  }));
}

export async function getClaimsWithEvidence(assignmentSlug: string) {
  const assignment = await getAssignmentBySlug(assignmentSlug);
  if (!assignment) return [];
  const db = requireDb();
  const claimRows = await db
    .select()
    .from(claims)
    .where(eq(claims.assignmentId, assignment.id))
    .orderBy(asc(claims.sortOrder));

  const result = [];
  for (const claim of claimRows) {
    const evidenceRows = await db
      .select()
      .from(evidence)
      .where(eq(evidence.claimId, claim.id))
      .orderBy(asc(evidence.createdAt));
    result.push({ ...claim, evidence: evidenceRows });
  }
  return result;
}

export async function getOutline(assignmentSlug: string) {
  const assignment = await getAssignmentBySlug(assignmentSlug);
  if (!assignment) return null;
  const db = requireDb();
  const [row] = await db
    .select()
    .from(outlines)
    .where(eq(outlines.assignmentId, assignment.id))
    .orderBy(desc(outlines.updatedAt))
    .limit(1);
  return row ?? null;
}

export async function getCoursesForUser(userId: string) {
  if (!isUserId(userId)) return [];
  try {
    const db = requireDb();
    return await db
      .select()
      .from(courses)
      .where(eq(courses.userId, userId))
      .orderBy(asc(courses.name));
  } catch (error) {
    console.warn("[studyflow] getCoursesForUser failed:", error);
    return [];
  }
}


export async function getCourseById(courseId: string, userId: string) {
  if (!isUserId(userId)) return null;
  try {
    const db = requireDb();
    const [row] = await db
      .select()
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.userId, userId)))
      .limit(1);
    return row ?? null;
  } catch (error) {
    console.warn("[studyflow] getCourseById failed:", error);
    return null;
  }
}

export async function listAssignmentsForCourse(
  courseId: string,
  userId: string,
): Promise<AssignmentListItem[]> {
  if (!isUserId(userId)) return [];
  try {
    const db = requireDb();
    const rows = await db
      .select({
        id: assignments.id,
        slug: assignments.slug,
        title: assignments.title,
        courseName: assignments.courseName,
        dueAt: assignments.dueAt,
        dueLabel: assignments.dueLabel,
        progress: assignments.progress,
        nextAction: assignments.nextAction,
      })
      .from(assignments)
      .where(and(eq(assignments.courseId, courseId), eq(assignments.userId, userId)))
      .orderBy(asc(assignments.dueAt));

    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      course: row.courseName ?? "Course",
      due: formatDue(row.dueAt, row.dueLabel),
      progress: row.progress,
      nextAction: row.nextAction,
    }));
  } catch (error) {
    console.warn("[studyflow] listAssignmentsForCourse failed:", error);
    return [];
  }
}


export async function getDashboardStats(userId: string): Promise<{
  stats: DashboardStat[];
  weeklyProgress: WeeklyProgressPoint[];
}> {
  if (!isUserId(userId)) {
    return {
      stats: [
        { label: "Active assignments", value: "0", meta: "—" },
        { label: "Sources saved", value: "0", meta: "—" },
        { label: "Claims mapped", value: "0", meta: "—" },
        { label: "Study streak", value: "0", meta: "days" },
      ],
      weeklyProgress: [],
    };
  }
  const db = requireDb();
  const assignmentRows = await db
    .select()
    .from(assignments)
    .where(eq(assignments.userId, userId));
  const sourceRows = await db
    .select()
    .from(researchSources)
    .where(eq(researchSources.userId, userId));

  const activeCount = assignmentRows.filter((a) => a.status !== "submitted").length;
  const dueSoon = assignmentRows.filter((a) => {
    if (!a.dueAt) return false;
    const days = daysBetween(new Date(), a.dueAt);
    return days >= 0 && days <= 7;
  }).length;
  const avgProgress =
    assignmentRows.length === 0
      ? 0
      : Math.round(
          assignmentRows.reduce((sum, a) => sum + a.progress, 0) / assignmentRows.length,
        );
  const verified = sourceRows.filter((s) => s.verified).length;

  const stats: DashboardStat[] = [
    {
      label: "Active assignments",
      value: String(activeCount),
      meta: dueSoon ? `${dueSoon} due this week` : "None due this week",
    },
    {
      label: "Overall progress",
      value: `${avgProgress}%`,
      meta: assignmentRows.length ? "Across all assignments" : "No assignments yet",
    },
    {
      label: "Sources collected",
      value: String(sourceRows.length),
      meta: `${verified} student-verified`,
    },
    {
      label: "Study streak",
      value: "—",
      meta: "Activity tracking coming soon",
    },
  ];

  // No activity log yet — empty chart rather than fake momentum.
  const weeklyProgress: WeeklyProgressPoint[] = [];

  return { stats, weeklyProgress };
}

/** Resolve chat user from an authenticated session user id. */
export async function resolveChatUser(
  userId: string,
): Promise<{ userId: string } | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) return null;
    return { userId: user.id };
  } catch (error) {
    console.warn("[studyflow] resolveChatUser failed:", error);
    return null;
  }
}

export async function resolveAssignmentId(slugOrId?: string | null): Promise<string | null> {
  if (!slugOrId) return null;
  const db = getDb();
  if (!db) return null;
  const bySlug = await db
    .select({ id: assignments.id })
    .from(assignments)
    .where(eq(assignments.slug, slugOrId))
    .limit(1);
  if (bySlug[0]) return bySlug[0].id;
  const byId = await db
    .select({ id: assignments.id })
    .from(assignments)
    .where(eq(assignments.id, slugOrId))
    .limit(1);
  return byId[0]?.id ?? null;
}

export async function getOrCreateConversation(params: {
  userId: string;
  assignmentId?: string | null;
  mode: "Notes-only" | "Research" | "Outline";
  conversationId?: string | null;
}) {
  const db = getDb();
  if (!db) return null;

  if (params.conversationId) {
    const [existing] = await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.id, params.conversationId))
      .limit(1);
    if (existing) return existing;
  }

  const [created] = await db
    .insert(aiConversations)
    .values({
      ...(params.conversationId ? { id: params.conversationId } : {}),
      userId: params.userId,
      assignmentId: params.assignmentId ?? null,
      mode: params.mode,
      title: `${params.mode} chat`,
    })
    .returning();

  return created;
}

export async function persistChatMessage(params: {
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  thinking?: string | null;
}) {
  const db = getDb();
  if (!db) return null;

  const [row] = await db
    .insert(aiMessages)
    .values({
      conversationId: params.conversationId,
      role: params.role,
      content: params.content,
      thinking: params.thinking ?? null,
    })
    .returning();

  await db
    .update(aiConversations)
    .set({ updatedAt: sql`now()` })
    .where(eq(aiConversations.id, params.conversationId));

  return row;
}

export async function listRecentMessages(conversationId: string, limit = 40) {
  const db = getDb();
  if (!db) return [];

  return db
    .select()
    .from(aiMessages)
    .where(eq(aiMessages.conversationId, conversationId))
    .orderBy(desc(aiMessages.createdAt))
    .limit(limit)
    .then((rows) => rows.reverse());
}
