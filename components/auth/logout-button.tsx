"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export function LogoutButton({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <form action={logoutAction}>
      <Button
        type="submit"
        variant="ghost"
        size={compact ? "icon-sm" : "sm"}
        className={className ?? "text-muted-foreground"}
        aria-label="Sign out"
        title="Sign out"
      >
        <LogOut className="size-4" />
        {!compact ? <span>Sign out</span> : null}
      </Button>
    </form>
  );
}
