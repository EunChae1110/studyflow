"use client";

import { AssistantPanel } from "@/components/ai/assistant-panel";
import { isWritingFocusedType } from "@/lib/assignment-types";

type View = "brief" | "notes" | "research" | "outline" | "draft" | "references";

export function AssignmentAiPanel({
  view,
  assignmentSlug,
  assignmentType,
  onClose,
}: {
  view: View;
  assignmentSlug?: string;
  assignmentType?: string | null;
  onClose?: () => void;
}) {
  const writing = isWritingFocusedType(assignmentType);

  const configByView: Record<
    View,
    {
      title?: string;
      mode: "Notes-only" | "Research" | "Outline";
      placeholder: string;
      hint: string;
      chips?: string[];
    }
  > = {
    notes: {
      mode: "Notes-only",
      placeholder: "Ask about your course materials...",
      hint: "External sources disabled. Answers are grounded only in your course materials.",
      chips: ["Explain this concept", "Quiz me"],
    },
    outline: {
      title: writing ? "Outline feedback" : "Plan coach",
      mode: "Outline",
      placeholder: writing
        ? "Ask for structural feedback or guiding questions..."
        : "Ask for a step plan, milestones, or structure — not a full write-up...",
      hint: writing
        ? "Primary actions: Check logic · Build evidence · Plan sections. No essay generation."
        : "Help plan the work for this assignment type. No full deliverable generation.",
      chips: writing ? ["Check claim coverage"] : ["Break into steps"],
    },
    draft: {
      title: writing ? "Draft coach" : "Work coach",
      mode: "Outline",
      placeholder: writing
        ? "Ask for structural feedback or guiding questions..."
        : "Ask for checks on your approach or gaps — not a full solution...",
      hint: writing
        ? "Primary actions: Check logic · Build evidence · Plan sections. No essay generation."
        : "Learning support only — coach the process, do not produce the full deliverable.",
      chips: writing ? ["Check logic"] : ["What should I verify?"],
    },
    brief: {
      mode: "Research",
      placeholder: "Ask about requirements, criteria, or next steps...",
      hint: "Learning support for any assignment type — understand, verify, and plan. No full write-up.",
      chips: ["Break down the brief"],
    },
    research: {
      mode: "Research",
      placeholder: writing
        ? "Ask about sources, DOI checks, or evidence strength..."
        : "Ask about materials, docs, formulas, or source quality...",
      hint: "Learning support only — understand, verify, and plan.",
      chips: writing ? ["Evaluate this source"] : ["What should I look up?"],
    },
    references: {
      mode: "Research",
      placeholder: "Ask about citation style or incomplete metadata...",
      hint: "Only when citations matter for this assignment.",
      chips: ["Citation style help"],
    },
  };

  const cfg = configByView[view] ?? configByView.brief;

  return (
    <AssistantPanel
      title={cfg.title}
      activeMode={cfg.mode}
      promptPlaceholder={cfg.placeholder}
      promptHint={cfg.hint}
      promptChips={cfg.chips}
      live
      assignmentId={assignmentSlug}
      onClose={onClose}
      acceptAskEvents={view !== "notes"}
      seedQuestions={
        view === "notes"
          ? [
              "Explain the key concept from my notes for this assignment.",
              "What am I still missing from the materials?",
            ]
          : view === "brief"
            ? [
                writing
                  ? 'What does "evaluate" mean for this rubric?'
                  : "What does success look like for this assignment type?",
              ]
            : undefined
      }
    />
  );
}
