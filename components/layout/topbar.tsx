"use client";

import { Bot, Menu } from "lucide-react";
import { EMPTY_STUDENT_PROFILE } from "@/lib/constants";
import type { StudentProfile } from "@/lib/types";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Crumb = { label: string };

type TopbarProps = {
  crumbs: Crumb[];
  onOpenSidebar: () => void;
  onOpenAi?: () => void;
  /** When true, desktop AI panel is visible — hide the reopen button on lg+. */
  aiOpen?: boolean;
  className?: string;
  profile?: StudentProfile;
  preview?: boolean;
};

export function Topbar({
  crumbs,
  onOpenSidebar,
  onOpenAi,
  aiOpen = false,
  className,
  profile,
  preview = false,
}: TopbarProps) {
  const initials = profile?.initials?.trim() || EMPTY_STUDENT_PROFILE.initials;

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-surface px-3 sm:px-5",
        className,
      )}
    >
      {!preview ? (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onOpenSidebar}
          className="text-muted lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="size-4" />
        </Button>
      ) : null}

      <nav className="hidden items-center gap-2 text-sm text-muted md:flex">
        {crumbs.map((crumb, idx) => (
          <span key={`${crumb.label}-${idx}`} className="inline-flex items-center gap-2">
            {idx > 0 ? <span className="text-muted/50">/</span> : null}
            <span className={idx === crumbs.length - 1 ? "font-medium text-foreground" : ""}>
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-1.5">
        {onOpenAi ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn("text-muted", aiOpen && "lg:hidden")}
            aria-label="Open AI assistant"
            onClick={onOpenAi}
          >
            <Bot className="size-4" />
          </Button>
        ) : null}
        <ThemeToggle />
        <div className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {initials}
        </div>
        {!preview ? <LogoutButton compact className="text-muted" /> : null}
      </div>
    </header>
  );
}
