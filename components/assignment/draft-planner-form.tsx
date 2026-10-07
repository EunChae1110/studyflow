"use client";

import * as React from "react";
import { useActionState } from "react";
import { CircleCheckBig } from "lucide-react";
import {
  saveDraftPlannerAction,
  type WorkspaceActionState,
} from "@/lib/workspace/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initial: WorkspaceActionState = { ok: false };

export function DraftPlannerForm({ assignmentSlug }: { assignmentSlug: string }) {
  const [state, formAction, pending] = useActionState(
    saveDraftPlannerAction,
    initial,
  );

  const askAi = (prompt: string) => {
    window.dispatchEvent(new CustomEvent("studyflow:open-ai"));
    window.dispatchEvent(
      new CustomEvent("studyflow:ask-ai", { detail: { prompt } }),
    );
  };

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <input type="hidden" name="assignmentSlug" value={assignmentSlug} />
      <h3 className="text-sm font-semibold">Draft planning worksheet</h3>
      <p className="text-xs text-muted">
        Use AI to organise and verify. You write the final argument in your own words.
        Notes save to this assignment.
      </p>

      {state.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted">Section</label>
        <Input name="section" required minLength={3} className="bg-background" />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted">Claim</label>
        <Textarea name="claim" required minLength={12} className="min-h-16 bg-background" />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted">Evidence anchors</label>
        <Textarea name="evidence" className="min-h-16 bg-background" />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted">Logic check</label>
        <Textarea
          name="logicCheck"
          placeholder="Explain why the evidence supports the claim, and one limitation to evaluate."
          className="min-h-20 bg-background"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save planning note"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            askAi(
              "Check the logic of my draft plan for this assignment. Point out gaps between claims and evidence — do not rewrite my essay.",
            )
          }
        >
          Verify logic
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            askAi(
              "Help me build stronger evidence for my claims. Suggest what to look for in sources — do not invent citations.",
            )
          }
        >
          Build evidence
        </Button>
      </div>

      {state.ok ? (
        <p className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
          <CircleCheckBig className="size-3.5" />
          Saved to assignment notes.
        </p>
      ) : null}
    </form>
  );
}
