"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { studentProfile } from "@/lib/mock-data";
import { courseNav, supportNav, toolNav, workspaceNav } from "@/lib/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function MobileSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="h-full overflow-y-auto bg-surface p-4">
      <div className="mb-5 flex items-center gap-2">
        <div className="grid size-8 place-items-center rounded-[10px] bg-primary text-sm font-bold text-primary-foreground">
          S
        </div>
        <span className="text-base font-semibold">StudyFlow</span>
      </div>

      <MobileGroup title="Workspace">
        {workspaceNav.map(({ href, label, icon: Icon, count }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <MobileItem key={label} href={href} active={active} onNavigate={onNavigate}>
              <Icon className="size-4.5" />
              <span>{label}</span>
              {count ? <Badge className="ml-auto rounded-full px-1.5 text-[11px]">{count}</Badge> : null}
            </MobileItem>
          );
        })}
      </MobileGroup>

      <MobileGroup title="Courses">
        {courseNav.map(({ href, label, icon: Icon }) => (
          <MobileItem key={label} href={href} active={pathname === href} onNavigate={onNavigate}>
            <Icon className="size-4.5" />
            <span>{label}</span>
          </MobileItem>
        ))}
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

      <p className="mt-4 text-xs text-muted">{studentProfile.tagline}</p>
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
