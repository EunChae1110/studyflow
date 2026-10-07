import Link from "next/link";
import { assignmentTabs, tabsForAssignmentType } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AssignmentTabs({
  assignmentId,
  activeTab,
  assignmentType,
  preview = false,
}: {
  assignmentId: string;
  activeTab: string;
  assignmentType?: string | null;
  preview?: boolean;
}) {
  const tabs = assignmentType
    ? tabsForAssignmentType(assignmentType)
    : [...assignmentTabs];

  return (
    <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border">
      {tabs.map((tab) => {
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
