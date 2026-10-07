"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { bottomNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface lg:hidden">
      <div className="grid grid-cols-5 px-2 py-1">
        {bottomNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              href={href}
              key={label}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-md px-2 py-2 text-[10px] font-medium",
                active ? "text-primary" : "text-muted",
              )}
            >
              <Icon className="size-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
