import { Citation } from "@/lib/mock-data";
import { CitationBadge } from "@/components/ai/citation-badge";
import { cn } from "@/lib/utils";

export function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="ml-6 rounded-xl rounded-br-sm bg-surface-muted px-3 py-2.5 text-sm">
      {children}
    </div>
  );
}

export function AssistantAnswer({
  children,
  citation,
  actions,
  dimmed = false,
}: {
  children: React.ReactNode;
  citation?: Citation;
  actions?: React.ReactNode;
  dimmed?: boolean;
}) {
  return (
    <div className={cn("rounded-xl rounded-bl-sm border border-border bg-surface px-3 py-3 text-sm leading-6", dimmed && "opacity-60")}>
      {children}
      {citation ? <CitationBadge citation={citation} /> : null}
      {actions ? <div className="mt-2 flex flex-wrap gap-1.5">{actions}</div> : null}
    </div>
  );
}
