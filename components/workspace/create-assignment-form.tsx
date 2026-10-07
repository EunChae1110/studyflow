"use client";

import * as React from "react";
import { useActionState } from "react";
import { ChevronDown, Plus, Sparkles } from "lucide-react";
import {
  createAssignmentAction,
  type WorkspaceActionState,
} from "@/lib/workspace/actions";
import {
  ASSIGNMENT_TYPES,
  getAssignmentTypeMeta,
  parseAssignmentType,
  type AssignmentTypeId,
} from "@/lib/assignment-types";
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
import { cn } from "@/lib/utils";

const initial: WorkspaceActionState = { ok: false };

type CourseOption = { id: string; name: string; code?: string | null };

type SuggestPayload = {
  title?: string | null;
  question?: string | null;
  assignmentType?: string | null;
  wordLimit?: string | null;
  citationStyle?: string | null;
  nextAction?: string | null;
  requirements?: Array<{ title: string; note: string; done?: boolean }>;
  rubric?: Array<{ criterion: string; weight: string }>;
};

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
  const [assignmentType, setAssignmentType] =
    React.useState<AssignmentTypeId>("other");
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [question, setQuestion] = React.useState("");
  const [wordLimit, setWordLimit] = React.useState("");
  const [citationStyle, setCitationStyle] = React.useState("");
  const [nextAction, setNextAction] = React.useState("");
  const [requirementsJson, setRequirementsJson] = React.useState("");
  const [rubricJson, setRubricJson] = React.useState("");
  const [scanError, setScanError] = React.useState<string | null>(null);
  const [scanning, setScanning] = React.useState(false);
  const [guidelineFile, setGuidelineFile] = React.useState<File | null>(null);

  const typeMeta = getAssignmentTypeMeta(assignmentType);

  React.useEffect(() => {
    if (typeMeta.showWritingFields) setShowAdvanced(true);
  }, [typeMeta.showWritingFields]);

  const applySuggest = (data: SuggestPayload) => {
    if (data.title?.trim()) setTitle(data.title.trim());
    if (data.question?.trim()) setQuestion(data.question.trim());
    if (data.assignmentType) {
      setAssignmentType(parseAssignmentType(data.assignmentType));
    }
    if (data.wordLimit?.trim()) {
      setWordLimit(data.wordLimit.trim());
      setShowAdvanced(true);
    }
    if (data.citationStyle?.trim()) {
      setCitationStyle(data.citationStyle.trim());
      setShowAdvanced(true);
    }
    if (data.nextAction?.trim()) setNextAction(data.nextAction.trim());
    if (data.requirements?.length) {
      setRequirementsJson(JSON.stringify(data.requirements));
    }
    if (data.rubric?.length) {
      setRubricJson(JSON.stringify(data.rubric));
    }
  };

  const scanGuideline = async () => {
    setScanError(null);
    const file = guidelineFile;
    if (!file) {
      setScanError("Choose a guideline file first.");
      return;
    }
    setScanning(true);
    try {
      const body = new FormData();
      body.set("guideline", file);
      body.set("assignmentType", assignmentType);
      const res = await fetch("/api/assignments/suggest-from-guideline", {
        method: "POST",
        body,
      });
      const json = (await res.json()) as SuggestPayload & { error?: string };
      if (!res.ok) {
        setScanError(json.error ?? "AI scan failed.");
        return;
      }
      applySuggest(json);
    } catch {
      setScanError("Could not reach AI scan endpoint.");
    } finally {
      setScanning(false);
    }
  };

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
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Create assignment</SheetTitle>
            <SheetDescription>
              Any assignment type — only a title is required. No fixed essay
              framework.
            </SheetDescription>
          </SheetHeader>
          <form
            action={formAction}
            encType="multipart/form-data"
            className="flex flex-col gap-4 p-4 pt-0"
          >
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lab 3 · Sorting, or Week 5 problem set"
                className="h-10"
                aria-invalid={Boolean(state.fieldErrors?.title)}
              />
              {state.fieldErrors?.title?.[0] ? (
                <p className="text-xs text-destructive">
                  {state.fieldErrors.title[0]}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <span className="text-sm font-medium">
                Type <span className="text-muted">(optional)</span>
              </span>
              <input type="hidden" name="assignmentType" value={assignmentType} />
              <div className="grid grid-cols-2 gap-1.5">
                {ASSIGNMENT_TYPES.map((t) => {
                  const active = t.id === assignmentType;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setAssignmentType(t.id)}
                      className={cn(
                        "rounded-lg border px-2.5 py-2 text-left text-xs transition-colors",
                        active
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border bg-surface text-foreground hover:bg-surface-muted",
                      )}
                    >
                      <span className="font-medium">{t.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted">{typeMeta.hint}</p>
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
            </div>

            <div className="space-y-1.5">
              <label htmlFor="asg-question" className="text-sm font-medium">
                Brief / prompt <span className="text-muted">(optional)</span>
              </label>
              <Textarea
                id="asg-question"
                name="question"
                rows={4}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Paste the question, deliverables, or paste later from a guideline…"
              />
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

            <div className="space-y-1.5">
              <label htmlFor="asg-guideline" className="text-sm font-medium">
                Guideline / brief / rubric{" "}
                <span className="text-muted">(optional)</span>
              </label>
              <Input
                id="asg-guideline"
                name="guideline"
                type="file"
                accept=".pdf,.docx,.txt,.md,.markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
                className="h-10 cursor-pointer py-1.5 file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-2.5 file:py-1 file:text-xs file:font-medium"
                onChange={(e) => setGuidelineFile(e.target.files?.[0] ?? null)}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={scanning || pending}
                  onClick={scanGuideline}
                >
                  <Sparkles className="size-3.5" />
                  {scanning ? "Scanning…" : "AI fill from guideline"}
                </Button>
                <p className="text-xs text-muted">
                  Works for any type — does not assume an essay.
                </p>
              </div>
              {scanError ? (
                <p className="text-xs text-destructive">{scanError}</p>
              ) : null}
              {requirementsJson || rubricJson ? (
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  AI suggestions loaded
                  {requirementsJson ? " · requirements" : ""}
                  {rubricJson ? " · rubric" : ""}. Review before creating.
                </p>
              ) : null}
              {state.fieldErrors?.guideline?.[0] ? (
                <p className="text-xs text-destructive">
                  {state.fieldErrors.guideline[0]}
                </p>
              ) : null}
            </div>

            <input type="hidden" name="requirementsJson" value={requirementsJson} />
            <input type="hidden" name="rubricJson" value={rubricJson} />
            <input type="hidden" name="nextAction" value={nextAction} />

            <div className="rounded-lg border border-border">
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium"
                onClick={() => setShowAdvanced((v) => !v)}
              >
                <span>
                  Advanced{" "}
                  <span className="font-normal text-muted">
                    (word limit, citation — optional)
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted transition-transform",
                    showAdvanced && "rotate-180",
                  )}
                />
              </button>
              {showAdvanced ? (
                <div className="grid grid-cols-2 gap-3 border-t border-border p-3">
                  <div className="space-y-1.5">
                    <label htmlFor="asg-words" className="text-sm font-medium">
                      Word / length limit
                    </label>
                    <Input
                      id="asg-words"
                      name="wordLimit"
                      value={wordLimit}
                      onChange={(e) => setWordLimit(e.target.value)}
                      placeholder="Only if relevant"
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
                      value={citationStyle}
                      onChange={(e) => setCitationStyle(e.target.value)}
                      placeholder="Only if needed"
                      className="h-10"
                    />
                  </div>
                  {!typeMeta.showWritingFields ? (
                    <p className="col-span-2 text-xs text-muted">
                      Hidden by default for {typeMeta.label.toLowerCase()} — fill
                      only when the brief asks for them.
                    </p>
                  ) : null}
                </div>
              ) : (
                <>
                  {/* Keep empty names out of POST when collapsed and unused */}
                  {!wordLimit ? null : (
                    <input type="hidden" name="wordLimit" value={wordLimit} />
                  )}
                  {!citationStyle ? null : (
                    <input
                      type="hidden"
                      name="citationStyle"
                      value={citationStyle}
                    />
                  )}
                </>
              )}
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
