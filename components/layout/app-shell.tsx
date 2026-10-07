"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { MobileSidebarContent } from "@/components/layout/mobile-sidebar-content";
import { Crumb, Topbar } from "@/components/layout/topbar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import type { StudentProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

type AppShellProps = {
  crumbs: Crumb[];
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  mainClassName?: string;
  profile?: StudentProfile;
  courseLabels?: string[];
  /** Read-only marketing embed: no mobile chrome, constrained height, forced nav active. */
  preview?: boolean;
  previewActivePath?: string;
  className?: string;
};

export function AppShell({
  crumbs,
  children,
  rightPanel,
  mainClassName,
  profile,
  courseLabels,
  preview = false,
  previewActivePath,
  className,
}: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [mobileAiOpen, setMobileAiOpen] = React.useState(false);

  return (
    <div
      className={cn(
        "bg-background text-foreground",
        preview ? "h-full min-h-0" : "min-h-screen",
        className,
      )}
    >
      <div className={cn("flex", preview ? "h-full min-h-0" : "min-h-screen")}>
        <AppSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          profile={profile}
          courseLabels={courseLabels}
          preview={preview}
          previewActivePath={previewActivePath}
          className={preview ? "lg:flex" : undefined}
        />
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col",
            preview ? "h-full min-h-0" : "min-h-screen",
          )}
        >
          <Topbar
            crumbs={crumbs}
            onOpenSidebar={() => setMobileNavOpen(true)}
            onOpenAi={rightPanel ? () => setMobileAiOpen(true) : undefined}
            profile={profile}
            preview={preview}
          />

          <div className={cn("flex min-h-0 flex-1", mainClassName)}>
            <main
              className={cn(
                "study-scroll flex-1 overflow-y-auto px-4 pt-5 sm:px-6 lg:px-8",
                preview ? "pb-5" : "pb-20 lg:pb-8",
              )}
            >
              {children}
            </main>

            {rightPanel ? (
              <aside className="study-scroll hidden w-[360px] shrink-0 overflow-y-auto border-l border-border bg-surface lg:block">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={crumbs[crumbs.length - 1]?.label ?? "panel"}
                    initial={preview ? false : { opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={preview ? undefined : { opacity: 0, x: -8 }}
                    transition={{ duration: 0.18 }}
                    className="h-full"
                  >
                    {rightPanel}
                  </motion.div>
                </AnimatePresence>
              </aside>
            ) : null}
          </div>
        </div>
      </div>

      {!preview ? <MobileBottomNav /> : null}

      {!preview ? (
        <>
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetContent side="left" className="w-[310px] p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <MobileSidebarContent
                onNavigate={() => setMobileNavOpen(false)}
                profile={profile}
                courseLabels={courseLabels}
              />
            </SheetContent>
          </Sheet>

          <Sheet open={mobileAiOpen} onOpenChange={setMobileAiOpen}>
            <SheetContent side="bottom" className="h-[76vh] rounded-t-2xl p-0 lg:hidden">
              <SheetTitle className="sr-only">AI Assistant</SheetTitle>
              {rightPanel}
            </SheetContent>
          </Sheet>
        </>
      ) : null}
    </div>
  );
}
