import "server-only";
import path from "path";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import {
  GUIDELINE_ALLOWED_EXT,
  GUIDELINE_ALLOWED_MIME,
  GUIDELINE_MAX_BYTES,
  GUIDELINE_MAX_EXTRACT_CHARS,
} from "./types";

function extOf(filename: string): string {
  const i = filename.lastIndexOf(".");
  return i >= 0 ? filename.slice(i).toLowerCase() : "";
}

export function validateGuidelineFile(file: File): string | null {
  if (!file || file.size <= 0) return "Empty file.";
  if (file.size > GUIDELINE_MAX_BYTES) {
    return `File is too large (max ${Math.round(GUIDELINE_MAX_BYTES / (1024 * 1024))} MB).`;
  }
  const ext = extOf(file.name);
  const mimeOk =
    !file.type ||
    GUIDELINE_ALLOWED_MIME.has(file.type) ||
    file.type === "application/octet-stream";
  const extOk = GUIDELINE_ALLOWED_EXT.has(ext);
  if (!mimeOk && !extOk) {
    return "Unsupported type. Use PDF, DOCX, TXT, or Markdown.";
  }
  if (!extOk) {
    return "Unsupported extension. Use .pdf, .docx, .txt, or .md.";
  }
  // .doc (legacy Word) is not supported — mammoth needs docx.
  if (ext === ".doc" || file.type === "application/msword") {
    return "Legacy .doc is not supported. Save as .docx or PDF.";
  }
  return null;
}

export function resolveMime(file: File): string {
  if (file.type && file.type !== "application/octet-stream") return file.type;
  const ext = extOf(file.name);
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (ext === ".md" || ext === ".markdown") return "text/markdown";
  return "text/plain";
}

function truncate(text: string): string {
  const cleaned = text.replace(/\u0000/g, "").trim();
  if (cleaned.length <= GUIDELINE_MAX_EXTRACT_CHARS) return cleaned;
  return (
    cleaned.slice(0, GUIDELINE_MAX_EXTRACT_CHARS) +
    "\n\n[…truncated for AI context…]"
  );
}

/**
 * pdf-parse v2 uses pdfjs-dist. Under Next/Turbopack, the default relative
 * worker resolves to `.next/dev/server/chunks/pdf.worker.mjs` and throws
 * "Setting up fake worker failed". Pin an absolute/data-url worker once.
 */
function isStableWorkerSrc(src: string | undefined): boolean {
  if (!src) return false;
  // data: URLs and absolute file paths survive Turbopack chunk remapping.
  return (
    src.startsWith("data:") ||
    src.startsWith("file:") ||
    path.isAbsolute(src)
  );
}

async function ensurePdfWorker(
  PDFParse: { setWorker: (workerSrc?: string) => string },
): Promise<void> {
  try {
    if (isStableWorkerSrc(PDFParse.setWorker())) return;
  } catch {
    // continue and set explicitly
  }

  try {
    const worker = await import("pdf-parse/worker");
    if (typeof worker.getData === "function") {
      PDFParse.setWorker(worker.getData());
      return;
    }
    if (typeof worker.getPath === "function") {
      const workerPath = worker.getPath();
      PDFParse.setWorker(
        path.isAbsolute(workerPath)
          ? pathToFileURL(workerPath).href
          : workerPath,
      );
      return;
    }
  } catch {
    // fall through to filesystem path
  }

  const require = createRequire(path.join(process.cwd(), "package.json"));
  const workerPath = require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
  PDFParse.setWorker(pathToFileURL(workerPath).href);
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  await ensurePdfWorker(PDFParse);
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    return result.text ?? "";
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}

export async function extractGuidelineText(
  buffer: Buffer,
  mimeType: string,
  filename: string,
): Promise<{ text: string; error?: string }> {
  const ext = extOf(filename);

  try {
    if (mimeType === "application/pdf" || ext === ".pdf") {
      const text = truncate(await extractPdfText(buffer));
      if (!text) {
        return {
          text: "",
          error: "PDF had no extractable text (may be scanned/image-only).",
        };
      }
      return { text };
    }

    if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      ext === ".docx"
    ) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      const text = truncate(result.value ?? "");
      if (!text) {
        return { text: "", error: "DOCX had no extractable text." };
      }
      return { text };
    }

    // plain text / markdown
    const text = truncate(buffer.toString("utf8"));
    if (!text) return { text: "", error: "File was empty." };
    return { text };
  } catch (error) {
    console.warn("[studyflow] guideline extract failed:", error);
    return {
      text: "",
      error: error instanceof Error ? error.message : "Extraction failed.",
    };
  }
}
