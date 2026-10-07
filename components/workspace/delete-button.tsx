"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  deleteAssignmentAction,
  deleteCourseAction,
} from "@/lib/workspace/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DeleteButtonProps = {
  kind: "course" | "assignment";
  id: string;
  label: string;
  className?: string;
  variant?: "outline" | "ghost" | "destructive";
  size?: "sm" | "xs" | "icon-sm" | "default";
  /** After deleting an assignment from its workspace, navigate away. */
  redirectTo?: string;
};

export function DeleteButton({
  kind,
  id,
  label,
  className,
  variant = "outline",
  size = "sm",
  redirectTo,
}: DeleteButtonProps) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const onClick = async () => {
    const ok = window.confirm(
      `Delete “${label}”? This cannot be undone${
        kind === "assignment"
          ? " and will remove notes, sources, claims, and outlines for this assignment"
          : ""
      }.`,
    );
    if (!ok) return;

    setPending(true);
    try {
      const result =
        kind === "course"
          ? await deleteCourseAction(id)
          : await deleteAssignmentAction(id);

      if (!result.ok) {
        window.alert(result.error ?? "Could not delete.");
        return;
      }

      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch {
      window.alert("Delete failed. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn("text-[var(--danger)]", className)}
      disabled={pending}
      onClick={() => void onClick()}
    >
      <Trash2 className="size-3.5" />
      {pending ? "Deleting…" : "Delete"}
    </Button>
  );
}
