"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";
import { StudyFlowLockup } from "@/components/brand/studyflow-logo";
import { APP_TAGLINE } from "@/lib/constants";
import { supportNav, toolNav, workspaceNav } from "@/lib/navigation";
import type { StudentProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MobileSidebarContent({
  onNavigate,
  profile,
  courseLabels = [],
}: {
  onNavigate?: () => void;
  profile?: StudentProfile;
  courseLabels?: string[];
}) {
  const pathname = usePathname();
  const tagline = profile?.tagline?.trim() || APP_TAGLINE;

  return (
    <div className="h-full overflow-y-auto bg-surface p-4">
      <StudyFlowLockup
        className="mb-5 gap-2.5"
        markClassName="size-8"
        wordmarkClassName="text-[17px]"
      />

      <MobileGroup title="Workspace">
        {workspaceNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <MobileItem key={label} href={href} active={active} onNavigate={onNavigate}>
              <Icon className="size-4.5" />
              <span>{label}</span>
            </MobileItem>
          );
        })}
      </MobileGroup>

      <MobileGroup title="Courses">
        {courseLabels.length === 0 ? (
          <MobileItem href="/courses" active={pathname === "/courses"} onNavigate={onNavigate}>
            <BookOpen className="size-4.5" />
            <span className="text-muted">No courses yet</span>
          </MobileItem>
        ) : (
          courseLabels.map((label) => (
            <MobileItem
              key={label}
              href="/courses"
              active={pathname === "/courses"}
              onNavigate={onNavigate}
            >
              <BookOpen className="size-4.5" />
              <span>{label}</span>
            </MobileItem>
          ))
        )}
      </MobileGroup>

      <MobileGroup title="Tools">
        {toolNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <MobileItem key={label} href={href} active={active} onNavigate={onNavigate}>
              <Icon className="size-4.5" />
              <span>{label}</span>
            </MobileItem>
          );
        })}
      </MobileGroup>

      <div className="mt-4 border-t border-border pt-3">
        {supportNav.map(({ href, label, icon: Icon }) => (
          <MobileItem key={label} href={href} active={false} onNavigate={onNavigate}>
            <Icon className="size-4.5" />
            <span>{label}</span>
          </MobileItem>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted">{tagline}</p>
    </div>
  );
}

function MobileGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="px-2 pb-2 text-[11px] font-medium tracking-wide text-muted uppercase">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function MobileItem({
  href,
  active,
  children,
  onNavigate,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium",
        active ? "bg-primary-soft text-primary" : "text-muted hover:bg-surface-muted",
      )}
    >
      {children}
    </Link>
  );
}
