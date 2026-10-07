"use client";

import * as React from "react";
import { useActionState } from "react";
import { FileText, Trash2, Upload } from "lucide-react";
import {
  deleteGuidelineAction,
  uploadGuidelineAction,
  type WorkspaceActionState,
} from "@/lib/workspace/actions";
import type { GuidelineListItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const initial: WorkspaceActionState = { ok: false };

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function GuidelineUploadCard({
  assignmentId,
  assignmentSlug,
  guidelines,
  compact = false,
}: {
  assignmentId: string;
  assignmentSlug: string;
  guidelines: GuidelineListItem[];
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    uploadGuidelineAction,
    initial,
  );
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const missing = guidelines.length === 0;

  const onDelete = async (id: string) => {
    if (!window.confirm("Remove this guideline from the assignment?")) return;
    setDeletingId(id);
    try {
      await deleteGuidelineAction(id, assignmentSlug);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card
      className={
        missing
          ? "border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20"
          : "border-border bg-surface"
      }
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">
            {missing ? "Upload guideline for better AI" : "Assignment guidelines"}
          </CardTitle>
          <p className="mt-1 text-xs text-muted">
            PDF, DOCX, TXT, or Markdown (max 10 MB). Text is extracted for AI context.
          </p>
        </div>
        {missing ? (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            Recommended
          </Badge>
        ) : (
          <Badge variant="secondary">{guidelines.length} file{guidelines.length === 1 ? "" : "s"}</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {guidelines.length > 0 ? (
          <ul className="space-y-2">
            {guidelines.map((g) => (
              <li
                key={g.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-border bg-surface-muted/60 px-3 py-2"
              >
                <div className="min-w-0 flex items-start gap-2">
                  <FileText className="mt-0.5 size-4 shrink-0 text-muted" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{g.originalName}</p>
                    <p className="text-xs text-muted">
                      {formatBytes(g.sizeBytes)}
                      {g.hasExtractedText
                        ? ` · ${g.charCount?.toLocaleString() ?? 0} chars scanned`
                        : ` · ${g.status === "extract_failed" ? "extract failed" : "no text yet"}`}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${g.originalName}`}
                  disabled={deletingId === g.id}
                  onClick={() => onDelete(g.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        ) : null}

        {state.error ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {state.error}
          </div>
        ) : null}

        <form action={formAction} className="space-y-2">
          <input type="hidden" name="assignmentId" value={assignmentId} />
          <input type="hidden" name="assignmentSlug" value={assignmentSlug} />
          <input type="hidden" name="kind" value="guideline" />
          <label className="block space-y-1.5">
            <span className="sr-only">Guideline file</span>
            <input
              type="file"
              name="guideline"
              accept=".pdf,.docx,.txt,.md,.markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
              required
              className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
            />
          </label>
          <Button type="submit" className="w-full" disabled={pending} size={compact ? "sm" : "default"}>
            <Upload className="size-3.5" />
            {pending ? "Uploading & scanning…" : missing ? "Upload guideline" : "Add another file"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
