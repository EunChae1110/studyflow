"use client";

import { Bell, Bot, Menu, Search } from "lucide-react";
import { EMPTY_STUDENT_PROFILE } from "@/lib/constants";
import type { StudentProfile } from "@/lib/types";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Crumb = { label: string };

type TopbarProps = {
  crumbs: Crumb[];
  onOpenSidebar: () => void;
  onOpenAi?: () => void;
  className?: string;
  profile?: StudentProfile;
};

export function Topbar({
  crumbs,
  onOpenSidebar,
  onOpenAi,
  className,
  profile,
}: TopbarProps) {
  const initials = profile?.initials?.trim() || EMPTY_STUDENT_PROFILE.initials;

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-surface px-3 sm:px-5",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onOpenSidebar}
        className="text-muted lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-4" />
      </Button>

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
        <div className="hidden w-60 items-center gap-2 rounded-lg border border-border bg-surface-muted px-3 py-1.5 text-sm text-muted xl:flex">
          <Search className="size-4" />
          <span>Search workspace...</span>
          <kbd className="ml-auto rounded border border-border bg-surface px-1.5 py-0.5 text-[10px]">⌘K</kbd>
        </div>
        {onOpenAi ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted lg:hidden"
            aria-label="Open AI assistant"
            onClick={onOpenAi}
          >
            <Bot className="size-4" />
          </Button>
        ) : null}
        <ThemeToggle />
        <Button variant="ghost" size="icon-sm" className="relative text-muted">
          <Bell className="size-4" />
          <span className="absolute top-1 right-1 size-1.5 rounded-full bg-[var(--danger)]" />
        </Button>
        <div className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {initials}
        </div>
      </div>
    </header>
  );
}
