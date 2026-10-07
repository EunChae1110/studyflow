import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function EvidenceCard({
  source,
  status,
  quote,
  needsReview = false,
}: {
  source: string;
  status: string;
  quote: string;
  needsReview?: boolean;
}) {
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
        <Button size="sm" variant={needsReview ? "default" : "outline"}>
          {needsReview ? "Verify source" : "Verify"}
        </Button>
        <Button size="sm" variant="ghost">
          {needsReview ? "Remove" : "Add note"}
        </Button>
      </div>
    </article>
  );
}
