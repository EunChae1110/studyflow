"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { assignments, courses } from "@/lib/db/schema";

export type WorkspaceActionState = {
  ok: boolean;
  error?: string;
};

function dbUnavailable(): WorkspaceActionState {
  return { ok: false, error: "Database is not configured." };
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

  revalidatePath("/assignments");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  revalidatePath("/courses");
  revalidatePath(`/assignments/${existing.slug}`);
  return { ok: true };
}
