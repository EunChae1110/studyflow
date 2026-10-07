"use client";

import { Sparkles } from "lucide-react";
import { WorkflowStepper } from "@/components/assignment/workflow-stepper";
import type { AssignmentDetail } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

/** Shared brief workspace body — used by assignment Brief page and landing preview. */
export function BriefPanels({
  assignment,
  showAskAi = true,
}: {
  assignment: AssignmentDetail;
  showAskAi?: boolean;
}) {
  const doneCount = assignment.requirements.filter((r) => r.done).length;
  const total = assignment.requirements.length;

  const askAi = () => {
    window.dispatchEvent(new CustomEvent("studyflow:open-ai"));
    window.dispatchEvent(
      new CustomEvent("studyflow:ask-ai", {
        detail: {
          prompt:
            'What does this assignment ask me to do, and what should I verify first against the rubric?',
        },
      }),
    );
  };

  return (
    <div>
      <WorkflowStepper progress={assignment.progress} />
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <Card className="border-border bg-surface">
            <CardHeader>
              <CardTitle className="text-base">Assignment question</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[15px] leading-7">
                {assignment.question ?? "No question text yet."}
              </p>
              <p className="mt-3 text-sm text-muted">
                {[
                  assignment.wordLimit ? `Word limit: ${assignment.wordLimit}` : null,
                  assignment.citationStyle
                    ? `Citation style: ${assignment.citationStyle}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || "Add brief details to get started."}
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
                <p className="text-sm text-muted">No requirements recorded yet.</p>
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
            <Button
              type="button"
              variant="secondary"
              className="w-full bg-primary-soft text-primary hover:bg-primary-soft/80"
              onClick={askAi}
            >
              <Sparkles className="size-4" />
              Ask AI to break down this requirement
            </Button>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card className="border-border bg-surface">
            <CardHeader>
              <CardTitle className="text-base">Rubric</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {assignment.rubric.length === 0 ? (
                <p className="text-sm text-muted">No rubric criteria yet.</p>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
