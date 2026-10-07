"use client";

import * as React from "react";
import { saveOutlineStructureAction } from "@/lib/workspace/actions";
import { Button } from "@/components/ui/button";

export function SaveOutlineButton({ assignmentSlug }: { assignmentSlug: string }) {
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  return (
    <div className="inline-flex items-center gap-2">
      <Button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setMessage(null);
          try {
            const result = await saveOutlineStructureAction(assignmentSlug);
            setMessage(result.ok ? "Outline saved." : result.error ?? "Save failed.");
          } catch {
            setMessage("Save failed.");
          } finally {
            setPending(false);
          }
        }}
      >
        {pending ? "Saving…" : "Save outline"}
      </Button>
      {message ? <span className="text-xs text-muted">{message}</span> : null}
    </div>
  );
}
