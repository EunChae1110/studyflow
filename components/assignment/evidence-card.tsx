"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { verifyEvidenceAction } from "@/lib/workspace/actions";

export function EvidenceCard({
  evidenceId,
  source,
  status,
  quote,
  needsReview = false,
}: {
  evidenceId?: string;
  source: string;
  status: string;
  quote: string;
  needsReview?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  return (
    <article
      className={`rounded-xl border bg-surface p-3 ${
        needsReview ? "border-amber-300" : "border-emerald-300"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold">{source}</p>
        <Badge
          className={
            needsReview
              ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          }
        >
          {status}
        </Badge>
      </div>
      <blockquote className="rounded-lg border border-border bg-surface-muted p-3 text-sm italic leading-6">
        “{quote}”
      </blockquote>
      <div className="mt-2 flex gap-1.5">
        <Button
          size="sm"
          variant={needsReview ? "default" : "outline"}
          disabled={!evidenceId || pending || !needsReview}
          title={!evidenceId ? "Save evidence first" : needsReview ? "Mark verified" : "Already verified"}
          onClick={async () => {
            if (!evidenceId) return;
            setPending(true);
            try {
              const result = await verifyEvidenceAction(evidenceId);
              if (!result.ok) window.alert(result.error ?? "Verify failed");
              else router.refresh();
            } finally {
              setPending(false);
            }
          }}
        >
          {pending ? "Saving…" : needsReview ? "Verify source" : "Verified"}
        </Button>
      </div>
    </article>
  );
}
