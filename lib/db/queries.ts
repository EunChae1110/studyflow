import { asc, desc, eq, sql } from "drizzle-orm";
import {
  assignment as mockAssignment,
  deadlines as mockDeadlines,
  studentProfile,
} from "@/lib/mock-data";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import {
  aiConversations,
  aiMessages,
  assignments,
  courses,
  users,
} from "@/lib/db/schema";

export type AssignmentListItem = {
  id: string;
  slug: string;
  title: string;
  course: string;
  due: string;
  progress: number;
  nextAction?: string | null;
  source: "database" | "mock";
};

export type DashboardSummary = {
  studentName: string;
  assignmentCount: number;
  assignments: AssignmentListItem[];
  source: "database" | "mock";
};

function formatDue(dueAt: Date | null, dueLabel: string | null): string {
  if (dueLabel) return dueLabel;
  if (!dueAt) return "No due date";
  return dueAt.toLocaleDateString("en-HK", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  if (!isDatabaseConfigured()) {
    return {
      studentName: studentProfile.name,
      assignmentCount: mockDeadlines.length,
      assignments: [
        {
          id: mockAssignment.id,
          slug: mockAssignment.id,
          title: mockAssignment.title,
          course: mockAssignment.course,
          due: mockAssignment.due,
          progress: mockAssignment.progress,
          nextAction: mockAssignment.nextAction,
          source: "mock",
        },
      ],
      source: "mock",
    };
  }

  try {
    const db = getDb();
    if (!db) throw new Error("DB client unavailable");

    const [user] = await db.select().from(users).limit(1);
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
      .orderBy(asc(assignments.dueAt))
      .limit(20);

    return {
      studentName: user?.name ?? studentProfile.name,
      assignmentCount: rows.length,
      assignments: rows.map((row) => ({
        id: row.slug,
        slug: row.slug,
        title: row.title,
        course: row.courseName ?? "Course",
        due: formatDue(row.dueAt, row.dueLabel),
        progress: row.progress,
        nextAction: row.nextAction,
        source: "database" as const,
      })),
      source: "database",
    };
  } catch (error) {
    console.warn("[studyflow] DB read failed, falling back to mock data:", error);
    return getDashboardSummaryMockOnly();
  }
}

function getDashboardSummaryMockOnly(): DashboardSummary {
  return {
    studentName: studentProfile.name,
    assignmentCount: mockDeadlines.length,
    assignments: [
      {
        id: mockAssignment.id,
        slug: mockAssignment.id,
        title: mockAssignment.title,
        course: mockAssignment.course,
        due: mockAssignment.due,
        progress: mockAssignment.progress,
        nextAction: mockAssignment.nextAction,
        source: "mock",
      },
    ],
    source: "mock",
  };
}

export async function listAssignments(): Promise<AssignmentListItem[]> {
  const summary = await getDashboardSummary();
  return summary.assignments;
}

export async function ensureDemoUserAndAssignment(): Promise<{
  userId: string;
  assignmentId: string;
} | null> {
  const db = getDb();
  if (!db) return null;

  try {
    let [user] = await db.select().from(users).limit(1);
    if (!user) {
      [user] = await db
        .insert(users)
        .values({
          name: studentProfile.name,
          email: "alex@studyflow.local",
          initials: studentProfile.initials,
          tagline: studentProfile.tagline,
        })
        .returning();
    }

    let [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.userId, user.id))
      .limit(1);

    if (!course) {
      [course] = await db
        .insert(courses)
        .values({
          userId: user.id,
          code: "DBS201",
          name: "Database Systems",
          term: "2026 Autumn",
        })
        .returning();
    }

    let [assignment] = await db
      .select()
      .from(assignments)
      .where(eq(assignments.slug, mockAssignment.id))
      .limit(1);

    if (!assignment) {
      [assignment] = await db
        .insert(assignments)
        .values({
          userId: user.id,
          courseId: course.id,
          slug: mockAssignment.id,
          title: mockAssignment.title,
          courseName: mockAssignment.course,
          question: mockAssignment.question,
          wordLimit: mockAssignment.wordLimit,
          citationStyle: mockAssignment.citationStyle,
          dueLabel: mockAssignment.due,
          progress: mockAssignment.progress,
          status: "in_progress",
          supportMode: mockAssignment.supportMode,
          nextAction: mockAssignment.nextAction,
        })
        .returning();
    }

    return { userId: user.id, assignmentId: assignment.id };
  } catch (error) {
    console.warn("[studyflow] ensureDemoUserAndAssignment failed:", error);
    return null;
  }
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
