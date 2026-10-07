"use client";

import { useActionState } from "react";
import {
  addClaimAction,
  type WorkspaceActionState,
} from "@/lib/workspace/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initial: WorkspaceActionState = { ok: false };

export function AddClaimForm({ assignmentSlug }: { assignmentSlug: string }) {
  const [state, formAction, pending] = useActionState(addClaimAction, initial);

  return (
    <form action={formAction} className="mx-auto mt-4 max-w-lg space-y-3 text-left">
      <input type="hidden" name="assignmentSlug" value={assignmentSlug} />
      {state.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="text-xs text-emerald-600">Claim added.</p>
      ) : null}
      <div>
        <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
          Claim
        </p>
        <Input
          name="statement"
          required
          minLength={8}
          placeholder="State your first claim..."
          className="mt-1 bg-background"
          aria-invalid={Boolean(state.fieldErrors?.statement)}
        />
        {state.fieldErrors?.statement?.[0] ? (
          <p className="mt-1 text-xs text-destructive">
            {state.fieldErrors.statement[0]}
          </p>
        ) : null}
      </div>
      <div>
        <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
          Your explanation (write this yourself)
        </p>
        <Textarea
          name="explanation"
          placeholder="Paraphrase the claim and evidence in your own words..."
          className="mt-1 min-h-20 bg-background"
        />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Adding…" : "Add claim"}
      </Button>
    </form>
  );
}
