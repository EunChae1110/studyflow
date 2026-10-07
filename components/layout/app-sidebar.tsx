"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { studentProfile } from "@/lib/mock-data";
import { courseNav, supportNav, toolNav, workspaceNav } from "@/lib/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
};

export function AppSidebar({ collapsed, onToggle, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: collapsed ? 78 : 240 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "hidden border-r border-border bg-surface lg:flex lg:flex-col",
        className,
      )}
    >
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="grid size-8 place-items-center rounded-[10px] bg-primary text-sm font-bold text-primary-foreground">
          S
        </div>
        {!collapsed && <span className="text-base font-semibold">StudyFlow</span>}
        <Button
          variant="ghost"
          size="icon-sm"
          className="ml-auto text-muted-foreground"
          onClick={onToggle}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </Button>
      </div>

      <SidebarGroup title="Workspace" collapsed={collapsed}>
        {workspaceNav.map(({ href, label, icon: Icon, count }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <SidebarItem key={label} href={href} active={active} collapsed={collapsed}>
              <Icon className="size-4.5" />
              {!collapsed && (
                <>
                  <span>{label}</span>
                  {count ? <Badge className="ml-auto rounded-full px-1.5 text-[11px]">{count}</Badge> : null}
                </>
              )}
            </SidebarItem>
          );
        })}
      </SidebarGroup>

      <SidebarGroup title="Courses" collapsed={collapsed}>
        {courseNav.map(({ href, label, icon: Icon }) => (
          <SidebarItem key={label} href={href} active={pathname === href} collapsed={collapsed}>
            <Icon className="size-4.5" />
            {!collapsed && <span>{label}</span>}
          </SidebarItem>
        ))}
      </SidebarGroup>

      <SidebarGroup title="Tools" collapsed={collapsed}>
        {toolNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <SidebarItem key={label} href={href} active={active} collapsed={collapsed}>
              <Icon className="size-4.5" />
              {!collapsed && <span>{label}</span>}
            </SidebarItem>
          );
        })}
      </SidebarGroup>

      <div className="mt-auto border-t border-border p-3">
        {supportNav.map(({ href, label, icon: Icon }) => (
          <SidebarItem key={label} href={href} active={false} collapsed={collapsed}>
            <Icon className="size-4.5" />
            {!collapsed && <span>{label}</span>}
          </SidebarItem>
        ))}
      </div>

      {!collapsed && (
        <p className="px-4 pb-3 text-xs text-muted">
          {studentProfile.tagline}
        </p>
      )}
    </motion.aside>
  );
}

function SidebarGroup({
  title,
  collapsed,
  children,
}: {
  title: string;
  collapsed: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="px-3 pb-4">
      {!collapsed && (
        <p className="px-2 pb-2 text-[11px] font-medium tracking-wide text-muted uppercase">
          {title}
        </p>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SidebarItem({
  href,
  active,
  collapsed,
  children,
}: {
  href: string;
  active: boolean;
  collapsed: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary-soft text-primary"
          : "text-muted hover:bg-surface-muted hover:text-foreground",
        collapsed && "justify-center px-1",
      )}
    >
      {children}
    </Link>
  );
}
