import "server-only";
import { randomUUID } from "crypto";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { courseMaterials } from "@/lib/db/schema";
import {
  extractGuidelineText,
  resolveMime,
  validateGuidelineFile,
} from "@/lib/guidelines/extract";
import { assertAssignmentOwned } from "@/lib/guidelines/store";
import type { CourseMaterialItem } from "@/lib/types";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads", "assignments");

function safeFilename(name: string): string {
  const base = path.basename(name).replace(/[^\w.\- ()[\]]+/g, "_");
  return base.slice(0, 180) || "material";
}

export async function saveCourseMaterialFile(params: {
  userId: string;
  assignmentId: string;
  file: File;
}): Promise<{ ok: true; material: CourseMaterialItem } | { ok: false; error: string }> {
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
  const dir = path.join(UPLOAD_ROOT, params.assignmentId, "materials");
  const absolutePath = path.join(dir, storageName);
  const storagePath = path.join(
    "uploads",
    "assignments",
    params.assignmentId,
    "materials",
    storageName,
  );

  const buffer = Buffer.from(await params.file.arrayBuffer());
  await mkdir(dir, { recursive: true });
  await writeFile(absolutePath, buffer);

  const extracted = await extractGuidelineText(buffer, mimeType, originalName);
  const status = extracted.text
    ? "Indexed"
    : extracted.error
      ? "extract_failed"
      : "Indexed";

  // Rough page estimate for PDFs from text length / form feeds
  const pages =
    mimeType === "application/pdf" && extracted.text
      ? Math.max(1, Math.ceil(extracted.text.length / 1800))
      : null;

  const [row] = await db
    .insert(courseMaterials)
    .values({
      id,
      assignmentId: params.assignmentId,
      userId: params.userId,
      title: originalName,
      originalName,
      storagePath,
      mimeType,
      sizeBytes: buffer.length,
      extractedText: extracted.text || null,
      extractError: extracted.error ?? null,
      pages,
      status,
    })
    .returning();

  if (!row) {
    await unlink(absolutePath).catch(() => undefined);
    return { ok: false, error: "Could not save material metadata." };
  }

  return {
    ok: true,
    material: {
      id: row.id,
      title: row.title,
      pages: row.pages,
      status: row.status,
    },
  };
}

export async function deleteCourseMaterial(params: {
  materialId: string;
  userId: string;
}): Promise<{ ok: boolean; error?: string; assignmentSlug?: string }> {
  const db = getDb();
  if (!db) return { ok: false, error: "Database is not configured." };

  const [row] = await db
    .select()
    .from(courseMaterials)
    .where(eq(courseMaterials.id, params.materialId))
    .limit(1);

  if (!row) return { ok: false, error: "Material not found." };
  if (row.userId && row.userId !== params.userId) {
    return { ok: false, error: "Material not found." };
  }

  const owned = await assertAssignmentOwned(row.assignmentId, params.userId);
  if (!owned) return { ok: false, error: "Assignment not found." };

  await db
    .delete(courseMaterials)
    .where(eq(courseMaterials.id, params.materialId));

  if (row.storagePath) {
    const abs = path.join(process.cwd(), row.storagePath);
    await unlink(abs).catch(() => undefined);
  }

  return { ok: true, assignmentSlug: owned.slug };
}

export async function getMaterialTextsForAssignment(
  assignmentId: string,
  userId: string,
): Promise<Array<{ title: string; text: string }>> {
  const db = getDb();
  if (!db) return [];
  const owned = await assertAssignmentOwned(assignmentId, userId);
  if (!owned) return [];

  const rows = await db
    .select({
      title: courseMaterials.title,
      extractedText: courseMaterials.extractedText,
      userId: courseMaterials.userId,
    })
    .from(courseMaterials)
    .where(eq(courseMaterials.assignmentId, assignmentId))
    .orderBy(asc(courseMaterials.createdAt));

  return rows
    .filter((r) => !r.userId || r.userId === userId)
    .filter((r) => Boolean(r.extractedText?.trim()))
    .map((r) => ({
      title: r.title,
      text: r.extractedText!.trim(),
    }));
}
