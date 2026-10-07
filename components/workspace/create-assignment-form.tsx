"use client";

import * as React from "react";
import { useActionState } from "react";
import { Plus } from "lucide-react";
import {
  createAssignmentAction,
  type WorkspaceActionState,
} from "@/lib/workspace/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const initial: WorkspaceActionState = { ok: false };

type CourseOption = { id: string; name: string; code?: string | null };

export function CreateAssignmentForm({
  courses,
  defaultCourseId,
  triggerLabel = "New assignment",
  triggerVariant = "default" as const,
  triggerSize = "sm" as const,
}: {
  courses: CourseOption[];
  defaultCourseId?: string;
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "secondary";
  triggerSize?: "sm" | "default" | "xs";
}) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState(
    createAssignmentAction,
    initial,
  );

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
            <SheetTitle>Create assignment</SheetTitle>
            <SheetDescription>
              Link to a course optionally. AI working memory is scoped to this assignment.
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
              <label htmlFor="asg-title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="asg-title"
                name="title"
                required
                minLength={2}
                placeholder="Essay 1: Normalisation"
                className="h-10"
                aria-invalid={Boolean(state.fieldErrors?.title)}
              />
              {state.fieldErrors?.title?.[0] ? (
                <p className="text-xs text-destructive">{state.fieldErrors.title[0]}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="asg-course" className="text-sm font-medium">
                Course <span className="text-muted">(optional)</span>
              </label>
              <select
                id="asg-course"
                name="courseId"
                defaultValue={defaultCourseId ?? ""}
                className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">No course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code ? `${c.code} · ` : ""}
                    {c.name}
                  </option>
                ))}
              </select>
              {state.fieldErrors?.courseId?.[0] ? (
                <p className="text-xs text-destructive">
                  {state.fieldErrors.courseId[0]}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="asg-question" className="text-sm font-medium">
                Brief / question <span className="text-muted">(optional)</span>
              </label>
              <Textarea
                id="asg-question"
                name="question"
                rows={4}
                placeholder="Paste the assignment question…"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="asg-words" className="text-sm font-medium">
                  Word limit
                </label>
                <Input
                  id="asg-words"
                  name="wordLimit"
                  placeholder="1500"
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="asg-cite" className="text-sm font-medium">
                  Citation style
                </label>
                <Input
                  id="asg-cite"
                  name="citationStyle"
                  placeholder="Harvard"
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="asg-due" className="text-sm font-medium">
                Due date <span className="text-muted">(optional)</span>
              </label>
              <Input
                id="asg-due"
                name="dueAt"
                type="date"
                className="h-10"
                aria-invalid={Boolean(state.fieldErrors?.dueAt)}
              />
            </div>

            <Button type="submit" className="h-10 w-full" disabled={pending}>
              {pending ? "Creating…" : "Create assignment"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
