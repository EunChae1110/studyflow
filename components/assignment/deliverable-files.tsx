import { Download, FileArchive, FileCode2, FileText } from "lucide-react";
import type { DeliverableListItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "cn";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function iconFor(kind: string, name: string) {
  if (kind === "zip" || name.endsWith(".zip")) return FileArchive;
  if (kind === "code" || /\.(java|py|ts|js|c|cpp)$/i.test(name)) return FileCode2;
  return FileText;
}

export function DeliverableFilesCard({
  assignmentSlug,
  deliverables,
}: {
  assignmentSlug: string;
  deliverables: DeliverableListItem[];
}) {
  if (deliverables.length === 0) return null;

  const zip = deliverables.filter((d) => d.kind === "zip");
  const rest = deliverables.filter((d) => d.kind !== "zip");
  const ordered = [...zip, ...rest];

  return (
    <Card className="border-emerald-500/30 bg-surface">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Download className="size-4 text-emerald-600" />
          Downloadable submission files
        </CardTitle>
        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          {deliverables.length} file{deliverables.length === 1 ? "" : "s"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted">
          Build generated these from your guideline (and course materials). Rename student ID if needed before submit.
        </p>
        <ul className="space-y-2">
          {ordered.map((d) => {
            const Icon = iconFor(d.kind, d.originalName);
            const href = `/api/assignments/${encodeURIComponent(assignmentSlug)}/deliverables/${d.id}`;
            return (
              <li
                key={d.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2"
              >
                <div className="min-w-0 flex items-center gap-2">
                  <Icon className="size-4 shrink-0 text-muted" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{d.originalName}</p>
                    <p className="text-xs text-muted">
                      {d.kind} · {formatBytes(d.sizeBytes)}
                    </p>
                  </div>
                </div>
                <a
                  href={href}
                  download={d.originalName}
                  className={cn(
                    buttonVariants({
                      size: "sm",
                      variant: d.kind === "zip" ? "default" : "outline",
                    }),
                    "gap-1.5",
                  )}
                >
                  <Download className="size-3.5" />
                  Download
                </a>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
