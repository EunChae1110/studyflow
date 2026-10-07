"use client";

import * as React from "react";
import { useActionState } from "react";
import { Plus } from "lucide-react";
import {
  createCourseAction,
  type WorkspaceActionState,
} from "@/lib/workspace/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const initial: WorkspaceActionState = { ok: false };

export function CreateCourseForm({
  triggerLabel = "New course",
  triggerVariant = "default" as const,
  triggerSize = "sm" as const,
}: {
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "secondary";
  triggerSize?: "sm" | "default" | "xs";
}) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState(createCourseAction, initial);

  return (
    <>
      <Button
        type="button"
        variant={triggerVariant}
        size={triggerSize}
        onClick={() => setOpen(true)}
      >
        <Plus className="size-3.5" />
        {triggerLabel}
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Create course</SheetTitle>
            <SheetDescription>
              Courses group assignments and durable AI memories (preferences, misconceptions).
            </SheetDescription>
          </SheetHeader>
          <form action={formAction} className="flex flex-col gap-4 p-4 pt-0">
            {state.error ? (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {state.error}
              </div>
            ) : null}

            <div className="space-y-1.5">
              <label htmlFor="course-name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="course-name"
                name="name"
                required
                minLength={2}
                placeholder="Database Systems"
                className="h-10"
                aria-invalid={Boolean(state.fieldErrors?.name)}
              />
              {state.fieldErrors?.name?.[0] ? (
                <p className="text-xs text-destructive">{state.fieldErrors.name[0]}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="course-code" className="text-sm font-medium">
                Code <span className="text-muted">(optional)</span>
              </label>
              <Input
                id="course-code"
                name="code"
                placeholder="DBS201"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="course-term" className="text-sm font-medium">
                Term <span className="text-muted">(optional)</span>
              </label>
              <Input
                id="course-term"
                name="term"
                placeholder="2026 Autumn"
                className="h-10"
              />
            </div>

            <Button type="submit" className="h-10 w-full" disabled={pending}>
              {pending ? "Creating…" : "Create course"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
