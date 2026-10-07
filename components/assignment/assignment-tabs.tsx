import Link from "next/link";
import { assignmentTabs } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AssignmentTabs({
  assignmentId,
  activeTab,
  preview = false,
}: {
  assignmentId: string;
  activeTab: string;
  preview?: boolean;
}) {
  return (
    <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border">
      {assignmentTabs.map((tab) => {
        const active = tab.href === activeTab;
        const className = cn(
          "border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
          active
            ? "border-primary text-primary"
            : "border-transparent text-muted hover:text-foreground",
        );

        if (preview) {
          return (
            <span key={tab.href} className={className}>
              {tab.label}
            </span>
          );
        }

        return (
          <Link
            key={tab.href}
            href={`/assignments/${assignmentId}/${tab.href}`}
            className={className}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
