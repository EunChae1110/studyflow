export const GUIDELINE_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
export const GUIDELINE_MAX_EXTRACT_CHARS = 80_000;

export const GUIDELINE_ALLOWED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "text/markdown",
  "text/x-markdown",
]);

export const GUIDELINE_ALLOWED_EXT = new Set([
  ".pdf",
  ".docx",
  ".txt",
  ".md",
  ".markdown",
]);

export type GuidelineKind = "guideline" | "rubric" | "brief";

export type GuidelineListItem = {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  kind: string;
  status: string;
  charCount: number | null;
  createdAt: string;
  hasExtractedText: boolean;
};
