import "server-only";
import { randomUUID } from "crypto";
import { mkdir, writeFile, unlink, rm } from "fs/promises";
import path from "path";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { assignmentGuidelines, assignments } from "@/lib/db/schema";
import {
  extractGuidelineText,
  resolveMime,
  validateGuidelineFile,
} from "./extract";
import type { GuidelineKind, GuidelineListItem } from "./types";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads", "assignments");

function safeFilename(name: string): string {
  const base = path.basename(name).replace(/[^\w.\- ()[\]]+/g, "_");
  return base.slice(0, 180) || "guideline";
}

export async function assertAssignmentOwned(
  assignmentId: string,
  userId: string,
): Promise<{ id: string; slug: string } | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db
    .select({ id: assignments.id, slug: assignments.slug, userId: assignments.userId })
    .from(assignments)
    .where(eq(assignments.id, assignmentId))
    .limit(1);
  if (!row || row.userId !== userId) return null;
  return { id: row.id, slug: row.slug };
}

export async function saveGuidelineFile(params: {
  userId: string;
  assignmentId: string;
  file: File;
  kind?: GuidelineKind;
}): Promise<{ ok: true; guideline: GuidelineListItem } | { ok: false; error: string }> {
  const db = getDb();
  if (!db) return { ok: false, error: "Database is not configured." };

  const owned = await assertAssignmentOwned(params.assignmentId, params.userId);
  if (!owned) return { ok: false, error: "Assignment not found." };

  const validationError = validateGuidelineFile(params.file);
  if (validationError) return { ok: false, error: validationError };

  const mimeType = resolveMime(params.file);
  const originalName = safeFilename(params.file.name);
  const id = randomUUID();
  const storageName = `${id}-${originalName}`;
  const dir = path.join(UPLOAD_ROOT, params.assignmentId);
  const absolutePath = path.join(dir, storageName);
  const storagePath = path.join("uploads", "assignments", params.assignmentId, storageName);

  const buffer = Buffer.from(await params.file.arrayBuffer());

  await mkdir(dir, { recursive: true });
  await writeFile(absolutePath, buffer);

  const extracted = await extractGuidelineText(buffer, mimeType, originalName);
  const status = extracted.text
    ? "ready"
    : extracted.error
      ? "extract_failed"
      : "ready";

  const [row] = await db
    .insert(assignmentGuidelines)
    .values({
      id,
      assignmentId: params.assignmentId,
      userId: params.userId,
      originalName,
      storagePath,
      mimeType,
      sizeBytes: buffer.length,
      kind: params.kind ?? "guideline",
      extractedText: extracted.text || null,
      extractError: extracted.error ?? null,
      status,
    })
    .returning();

  if (!row) {
    await unlink(absolutePath).catch(() => undefined);
    return { ok: false, error: "Could not save guideline metadata." };
  }

  return {
    ok: true,
    guideline: mapGuideline(row),
  };
}

export async function listGuidelinesForAssignment(
  assignmentId: string,
  userId: string,
): Promise<GuidelineListItem[]> {
  const db = getDb();
  if (!db) return [];
  const owned = await assertAssignmentOwned(assignmentId, userId);
  if (!owned) return [];

  const rows = await db
    .select()
    .from(assignmentGuidelines)
    .where(
      and(
        eq(assignmentGuidelines.assignmentId, assignmentId),
        eq(assignmentGuidelines.userId, userId),
      ),
    )
    .orderBy(asc(assignmentGuidelines.createdAt));

  return rows.map(mapGuideline);
}

export async function getGuidelineTextsForAssignment(
  assignmentId: string,
  userId: string,
): Promise<Array<{ originalName: string; kind: string; text: string }>> {
  const db = getDb();
  if (!db) return [];

  const rows = await db
    .select({
      originalName: assignmentGuidelines.originalName,
      kind: assignmentGuidelines.kind,
      extractedText: assignmentGuidelines.extractedText,
      userId: assignmentGuidelines.userId,
      assignmentUserId: assignments.userId,
    })
    .from(assignmentGuidelines)
    .innerJoin(
      assignments,
      eq(assignmentGuidelines.assignmentId, assignments.id),
    )
    .where(eq(assignmentGuidelines.assignmentId, assignmentId))
    .orderBy(asc(assignmentGuidelines.createdAt));

  return rows
    .filter((r) => r.userId === userId && r.assignmentUserId === userId)
    .filter((r) => Boolean(r.extractedText?.trim()))
    .map((r) => ({
      originalName: r.originalName,
      kind: r.kind,
      text: r.extractedText!.trim(),
    }));
}

export async function deleteGuideline(params: {
  guidelineId: string;
  userId: string;
}): Promise<{ ok: boolean; error?: string; assignmentSlug?: string; assignmentId?: string }> {
  const db = getDb();
  if (!db) return { ok: false, error: "Database is not configured." };

  const [row] = await db
    .select()
    .from(assignmentGuidelines)
    .where(eq(assignmentGuidelines.id, params.guidelineId))
    .limit(1);

  if (!row || row.userId !== params.userId) {
    return { ok: false, error: "Guideline not found." };
  }

  const owned = await assertAssignmentOwned(row.assignmentId, params.userId);
  if (!owned) return { ok: false, error: "Assignment not found." };

  await db
    .delete(assignmentGuidelines)
    .where(
      and(
        eq(assignmentGuidelines.id, params.guidelineId),
        eq(assignmentGuidelines.userId, params.userId),
      ),
    );

  const abs = path.join(process.cwd(), row.storagePath);
  await unlink(abs).catch(() => undefined);

  return { ok: true, assignmentSlug: owned.slug, assignmentId: owned.id };
}

export async function removeAssignmentUploadDir(
  assignmentId: string,
): Promise<void> {
  const dir = path.join(UPLOAD_ROOT, assignmentId);
  await rm(dir, { recursive: true, force: true }).catch(() => undefined);
}

function mapGuideline(
  row: typeof assignmentGuidelines.$inferSelect,
): GuidelineListItem {
  return {
    id: row.id,
    originalName: row.originalName,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    kind: row.kind,
    status: row.status,
    charCount: row.extractedText?.length ?? null,
    createdAt: row.createdAt.toISOString(),
    hasExtractedText: Boolean(row.extractedText?.trim()),
  };
}
