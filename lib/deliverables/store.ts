import "server-only";
import { randomUUID } from "crypto";
import { mkdir, writeFile, unlink, readFile } from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { assignmentDeliverables } from "@/lib/db/schema";
import { kindForFilename, mimeForFilename } from "@/lib/deliverables/mime";
import {
  safeDeliverableBasename,
} from "@/lib/deliverables/language";
import { assertAssignmentOwned } from "@/lib/guidelines/store";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads", "assignments");

export type DeliverableListItem = {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  kind: string;
  batchId: string | null;
  createdAt: string;
};

export type DeliverableFileInput = {
  filename: string;
  content: string | Buffer;
  mimeType?: string;
  kind?: string;
};

async function zipFiles(
  files: Array<{ absPath: string; nameInZip: string }>,
  outAbs: string,
): Promise<boolean> {
  if (files.length === 0) return false;
  return new Promise((resolve) => {
    // zip -j junk paths; pass file list
    const args = ["-j", "-q", outAbs, ...files.map((f) => f.absPath)];
    const child = spawn("zip", args, { stdio: "ignore" });
    child.on("close", (code) => resolve(code === 0));
    child.on("error", () => resolve(false));
  });
}

export async function clearBuildDeliverables(
  assignmentId: string,
  userId: string,
): Promise<void> {
  const db = getDb();
  if (!db) return;
  const owned = await assertAssignmentOwned(assignmentId, userId);
  if (!owned) return;

  const rows = await db
    .select()
    .from(assignmentDeliverables)
    .where(
      and(
        eq(assignmentDeliverables.assignmentId, assignmentId),
        eq(assignmentDeliverables.userId, userId),
      ),
    );

  if (rows.length === 0) return;

  await db
    .delete(assignmentDeliverables)
    .where(
      and(
        eq(assignmentDeliverables.assignmentId, assignmentId),
        eq(assignmentDeliverables.userId, userId),
      ),
    );

  for (const row of rows) {
    const abs = path.join(process.cwd(), row.storagePath);
    await unlink(abs).catch(() => undefined);
  }

  const dir = path.join(UPLOAD_ROOT, assignmentId, "deliverables");
  // leave dir; files removed individually
  void dir;
}

export async function saveDeliverableFiles(params: {
  userId: string;
  assignmentId: string;
  files: DeliverableFileInput[];
  zipName?: string | null;
}): Promise<{
  ok: true;
  batchId: string;
  items: DeliverableListItem[];
} | { ok: false; error: string }> {
  const db = getDb();
  if (!db) return { ok: false, error: "Database is not configured." };

  const owned = await assertAssignmentOwned(params.assignmentId, params.userId);
  if (!owned) return { ok: false, error: "Assignment not found." };

  await clearBuildDeliverables(params.assignmentId, params.userId);

  const batchId = randomUUID();
  const dir = path.join(UPLOAD_ROOT, params.assignmentId, "deliverables", batchId);
  await mkdir(dir, { recursive: true });

  const items: DeliverableListItem[] = [];
  const staged: Array<{ absPath: string; nameInZip: string }> = [];

  for (const file of params.files) {
    const originalName = safeDeliverableBasename(file.filename);
    const id = randomUUID();
    const storageName = `${id}-${originalName}`;
    const absolutePath = path.join(dir, storageName);
    const storagePath = path.join(
      "uploads",
      "assignments",
      params.assignmentId,
      "deliverables",
      batchId,
      storageName,
    );
    const buf = Buffer.isBuffer(file.content)
      ? file.content
      : Buffer.from(file.content, "utf8");
    await writeFile(absolutePath, buf);
    const mimeType = file.mimeType || mimeForFilename(originalName);
    const kind = file.kind || kindForFilename(originalName);

    const [row] = await db
      .insert(assignmentDeliverables)
      .values({
        id,
        assignmentId: params.assignmentId,
        userId: params.userId,
        originalName,
        storagePath,
        mimeType,
        sizeBytes: buf.length,
        kind,
        batchId,
      })
      .returning();

    if (row) {
      items.push(mapDeliverable(row));
      if (kind !== "zip") {
        staged.push({ absPath: absolutePath, nameInZip: originalName });
      }
    }
  }

  // Create submission zip when we have non-zip files
  if (staged.length > 0) {
    const zipBase =
      safeDeliverableBasename(params.zipName || `deliverables_${batchId.slice(0, 8)}.zip`);
    const zipName = zipBase.toLowerCase().endsWith(".zip")
      ? zipBase
      : `${zipBase}.zip`;
    const zipId = randomUUID();
    const zipStorageName = `${zipId}-${zipName}`;
    const zipAbs = path.join(dir, zipStorageName);
    const okZip = await zipFiles(staged, zipAbs);
    if (okZip) {
      const zipBuf = await readFile(zipAbs);
      const zipStoragePath = path.join(
        "uploads",
        "assignments",
        params.assignmentId,
        "deliverables",
        batchId,
        zipStorageName,
      );
      const [zipRow] = await db
        .insert(assignmentDeliverables)
        .values({
          id: zipId,
          assignmentId: params.assignmentId,
          userId: params.userId,
          originalName: zipName,
          storagePath: zipStoragePath,
          mimeType: "application/zip",
          sizeBytes: zipBuf.length,
          kind: "zip",
          batchId,
        })
        .returning();
      if (zipRow) items.push(mapDeliverable(zipRow));
    } else {
      await unlink(zipAbs).catch(() => undefined);
      console.warn("[studyflow] zip creation failed for batch", batchId);
    }
  }

  return { ok: true, batchId, items };
}

export async function listDeliverablesForAssignment(
  assignmentId: string,
  userId: string,
): Promise<DeliverableListItem[]> {
  const db = getDb();
  if (!db) return [];
  const owned = await assertAssignmentOwned(assignmentId, userId);
  if (!owned) return [];

  const rows = await db
    .select()
    .from(assignmentDeliverables)
    .where(
      and(
        eq(assignmentDeliverables.assignmentId, assignmentId),
        eq(assignmentDeliverables.userId, userId),
      ),
    )
    .orderBy(asc(assignmentDeliverables.createdAt));

  return rows.map(mapDeliverable);
}

export async function getDeliverableFile(params: {
  deliverableId: string;
  userId: string;
}): Promise<{
  originalName: string;
  mimeType: string;
  buffer: Buffer;
} | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(assignmentDeliverables)
    .where(eq(assignmentDeliverables.id, params.deliverableId))
    .limit(1);
  if (!row || row.userId !== params.userId) return null;
  const owned = await assertAssignmentOwned(row.assignmentId, params.userId);
  if (!owned) return null;
  const abs = path.join(process.cwd(), row.storagePath);
  try {
    const buffer = await readFile(abs);
    return {
      originalName: row.originalName,
      mimeType: row.mimeType,
      buffer,
    };
  } catch {
    return null;
  }
}

function mapDeliverable(
  row: typeof assignmentDeliverables.$inferSelect,
): DeliverableListItem {
  return {
    id: row.id,
    originalName: row.originalName,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    kind: row.kind,
    batchId: row.batchId,
    createdAt: row.createdAt.toISOString(),
  };
}
