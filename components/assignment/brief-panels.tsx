"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { WorkflowStepper } from "@/components/assignment/workflow-stepper";
import { isWritingFocusedType, typeLabel } from "@/lib/assignment-types";
import {
  applyAiBriefSuggestionsAction,
  markUnderstandCompleteAction,
} from "@/lib/workspace/actions";
import type { AssignmentDetail } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BuildRunner } from "@/components/assignment/build-runner";
import { GuidelineUploadCard } from "@/components/assignment/guideline-upload";

/** Shared brief workspace body — used by assignment Brief page and landing preview. */
export function BriefPanels({
  assignment,
  showAskAi = true,
}: {
  assignment: AssignmentDetail;
  showAskAi?: boolean;
}) {
  const router = useRouter();
  const doneCount = assignment.requirements.filter((r) => r.done).length;
  const total = assignment.requirements.length;
  const writing = isWritingFocusedType(assignment.assignmentType);
  const [filling, setFilling] = React.useState(false);
  const [fillError, setFillError] = React.useState<string | null>(null);
  const [fillNote, setFillNote] = React.useState<string | null>(null);
  const [marking, setMarking] = React.useState(false);
  const understandDone = assignment.progress >= 20;

  const askAi = () => {
    window.dispatchEvent(new CustomEvent("studyflow:open-ai"));
    window.dispatchEvent(
      new CustomEvent("studyflow:ask-ai", {
        detail: {
          prompt: writing
            ? "What does this assignment ask me to do, and what should I verify first against the rubric? Do not write the essay."
            : "What does this assignment ask me to deliver, and what should I clarify or prepare first? Adapt to the assignment type — do not assume it is an essay.",
        },
      }),
    );
  };

  const fillFromGuideline = async () => {
    setFillError(null);
    setFillNote(null);
    if (!(assignment.guidelines ?? []).some((g) => g.hasExtractedText)) {
      setFillError("Upload a guideline with extractable text first.");
      return;
    }
    setFilling(true);
    try {
      const res = await fetch("/api/assignments/suggest-from-guideline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentSlug: assignment.slug,
          assignmentType: assignment.assignmentType,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        title?: string | null;
        question?: string | null;
        assignmentType?: string | null;
        wordLimit?: string | null;
        citationStyle?: string | null;
        nextAction?: string | null;
        requirements?: Array<{ title: string; note: string; done?: boolean }>;
        rubric?: Array<{ criterion: string; weight: string }>;
      };
      if (!res.ok) {
        setFillError(json.error ?? "AI fill failed.");
        return;
      }
      const result = await applyAiBriefSuggestionsAction({
        assignmentSlug: assignment.slug,
        title: json.title,
        question: json.question,
        assignmentType: json.assignmentType,
        wordLimit: json.wordLimit,
        citationStyle: json.citationStyle,
        nextAction: json.nextAction,
        requirements: json.requirements,
        rubric: json.rubric,
      });
      if (!result.ok) {
        setFillError(result.error ?? "Could not save suggestions.");
        return;
      }
      setFillNote("Brief updated from guideline. Review the checklist.");
      router.refresh();
    } catch {
      setFillError("Could not reach AI fill.");
    } finally {
      setFilling(false);
    }
  };

  const markUnderstand = async () => {
    setFillError(null);
    setMarking(true);
    try {
      const result = await markUnderstandCompleteAction(assignment.slug);
      if (!result.ok) {
        setFillError(result.error ?? "Could not update progress.");
        return;
      }
      setFillNote("Understand marked complete — move on to gather materials.");
      router.refresh();
    } catch {
      setFillError("Could not update progress.");
    } finally {
      setMarking(false);
    }
  };

  return (
    <div>
      <WorkflowStepper
        progress={assignment.progress}
        assignmentType={assignment.assignmentType}
      />
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          {showAskAi ? (
            <GuidelineUploadCard
              assignmentId={assignment.id}
              assignmentSlug={assignment.slug}
              guidelines={assignment.guidelines ?? []}
            />
          ) : null}

          {showAskAi ? (
            <BuildRunner assignmentSlug={assignment.slug} variant="panel" />
          ) : null}

          <Card className="border-border bg-surface">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">Assignment brief</CardTitle>
              <Badge variant="outline">{typeLabel(assignment.assignmentType)}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-[15px] leading-7">
                {assignment.question ?? "No brief text yet — paste a prompt or upload a guideline."}
              </p>
              <p className="mt-3 text-sm text-muted">
                {[
                  assignment.wordLimit ? `Length: ${assignment.wordLimit}` : null,
                  assignment.citationStyle
                    ? `Citation: ${assignment.citationStyle}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ") ||
                  (writing
                    ? "Add length or citation only if the brief requires them."
                    : "No essay defaults — add constraints only if relevant.")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-surface">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Requirement checklist</CardTitle>
              {total > 0 ? (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {doneCount} of {total}
                </Badge>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-2">
              {assignment.requirements.length === 0 ? (
                <p className="text-sm text-muted">
                  No requirements recorded yet. Use AI fill from guideline for any
                  assignment type.
                </p>
              ) : (
                assignment.requirements.map((item) => (
                  <div key={item.title} className="flex gap-2 rounded-lg bg-surface-muted p-2.5">
                    <div
                      className={`mt-0.5 grid size-4.5 place-items-center rounded-[4px] border text-[11px] ${
                        item.done
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-border bg-surface text-transparent"
                      }`}
                    >
                      ✓
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted">{item.note}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {showAskAi ? (
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 bg-primary-soft text-primary hover:bg-primary-soft/80"
                  onClick={askAi}
                >
                  <Sparkles className="size-4" />
                  Ask AI to break down this brief
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  disabled={filling}
                  onClick={fillFromGuideline}
                >
                  <Sparkles className="size-4" />
                  {filling ? "Filling…" : "AI fill from guideline"}
                </Button>
              </div>
              <Button
                type="button"
                variant={understandDone ? "outline" : "default"}
                className="w-full sm:w-auto"
                disabled={marking || understandDone}
                onClick={markUnderstand}
              >
                {understandDone
                  ? "Understand complete"
                  : marking
                    ? "Updating…"
                    : "Mark Understand complete → step 2"}
              </Button>
            </div>
          ) : null}
          {fillError ? (
            <p className="text-xs text-destructive">{fillError}</p>
          ) : null}
          {fillNote ? (
            <p className="text-xs text-emerald-700 dark:text-emerald-400">{fillNote}</p>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card className="border-border bg-surface">
            <CardHeader>
              <CardTitle className="text-base">
                {writing ? "Rubric" : "Marking / success criteria"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {assignment.rubric.length === 0 ? (
                <p className="text-sm text-muted">No criteria yet.</p>
              ) : (
                assignment.rubric.map((item) => (
                  <div
                    key={item.criterion}
                    className="flex items-center justify-between border-b border-border py-2 last:border-0"
                  >
                    <span className="text-sm font-medium">{item.criterion}</span>
                    <span className="rounded bg-surface-muted px-2 py-0.5 text-xs text-muted">
                      {item.weight}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-surface">
            <CardHeader>
              <CardTitle className="text-base">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted">Overall</span>
                <span className="font-semibold">{assignment.progress}%</span>
              </div>
              <Progress value={assignment.progress} className="h-1.5 bg-surface-muted" />
              {assignment.nextAction ? (
                <p className="mt-3 text-xs text-muted">{assignment.nextAction}</p>
              ) : null}
              {!understandDone ? (
                <p className="mt-2 text-xs text-muted">
                  Upload a guideline, fill the brief, or mark Understand complete
                  to unlock step 2.
                </p>
              ) : (
                <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
                  Step 1 done — gather notes or research sources for step 3.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
