"use client";

import * as React from "react";
import { useActionState } from "react";
import { FileText, Trash2, Upload } from "lucide-react";
import {
  deleteCourseMaterialAction,
  uploadCourseMaterialAction,
  type WorkspaceActionState,
} from "@/lib/workspace/actions";
import type { CourseMaterialItem } from "@/lib/types";
import { Button } from "@/components/ui/button";

const initial: WorkspaceActionState = { ok: false };

export function MaterialUploadPanel({
  assignmentId,
  assignmentSlug,
  materials,
}: {
  assignmentId: string;
  assignmentSlug: string;
  materials: CourseMaterialItem[];
}) {
  const [state, formAction, pending] = useActionState(
    uploadCourseMaterialAction,
    initial,
  );
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const onDelete = async (id: string) => {
    if (!window.confirm("Remove this course material?")) return;
    setDeletingId(id);
    try {
      await deleteCourseMaterialAction(id, assignmentSlug);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        {materials.length === 0 ? (
          <p className="px-1 text-xs text-muted">No materials uploaded yet.</p>
        ) : (
          materials.map((doc, index) => (
            <div
              key={doc.id}
              className={`flex items-start justify-between gap-2 rounded-lg px-3 py-2 ${
                index === 0 ? "bg-primary-soft text-primary" : "bg-surface-muted/50"
              }`}
            >
              <div className="min-w-0 flex items-start gap-2">
                <FileText className="mt-0.5 size-4 shrink-0 opacity-70" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{doc.title}</p>
                  <p className="text-xs text-muted">
                    {doc.pages != null ? `${doc.pages} pages · ` : ""}
                    {doc.status}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${doc.title}`}
                disabled={deletingId === doc.id}
                onClick={() => onDelete(doc.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>

      {state.error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          {state.error}
        </div>
      ) : null}

      <form action={formAction} className="space-y-2">
        <input type="hidden" name="assignmentId" value={assignmentId} />
        <input type="hidden" name="assignmentSlug" value={assignmentSlug} />
        <label className="block">
          <span className="sr-only">Course material file</span>
          <input
            type="file"
            name="material"
            accept=".pdf,.docx,.txt,.md,.markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
            required
            className="block w-full text-xs file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-2 file:py-1 file:text-xs file:font-medium file:text-primary-foreground"
          />
        </label>
        <Button type="submit" variant="outline" size="sm" className="w-full" disabled={pending}>
          <Upload className="size-3.5" />
          {pending ? "Uploading…" : "+ Upload material"}
        </Button>
      </form>
      <p className="text-[11px] leading-4 text-muted">
        PDF / DOCX / TXT / MD. When materials exist, Build & Notes-only AI stay within this learning scope.
      </p>
    </div>
  );
}
