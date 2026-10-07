import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Citation } from "@/lib/types";

const labelMap: Record<Citation["kind"], string> = {
  "lecture-notes": "Lecture notes",
  "external-research": "External research",
  "ai-summary": "AI summary",
  "source-quote": "Source quote",
  "student-content": "Student content",
  "student-verified-evidence": "Student-verified evidence",
};

export function CitationBadge({ citation }: { citation: Citation }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <Badge className="rounded-md border border-border bg-surface px-2 py-1 text-[11px] font-medium text-primary">
        <FileText className="size-3" />
        {citation.source}, {citation.page}
      </Badge>
      <Badge variant="secondary" className="rounded-md text-[11px]">
        {labelMap[citation.kind]}
      </Badge>
    </div>
  );
}
