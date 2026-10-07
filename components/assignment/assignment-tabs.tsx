import Link from "next/link";
import { assignmentTabs } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function AssignmentTabs({
  assignmentId,
  activeTab,
}: {
  assignmentId: string;
  activeTab: string;
}) {
  return (
    <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border">
      {assignmentTabs.map((tab) => {
        const active = tab.href === activeTab;
        return (
          <Link
            key={tab.href}
            href={`/assignments/${assignmentId}/${tab.href}`}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
