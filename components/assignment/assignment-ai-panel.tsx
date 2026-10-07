"use client";

import { AssistantPanel } from "@/components/ai/assistant-panel";

type View = "brief" | "notes" | "research" | "outline" | "draft" | "references";

const configByView: Record<
  View,
  {
    title?: string;
    mode: "Notes-only" | "Research" | "Outline";
    placeholder: string;
    hint: string;
    chips?: string[];
    showAttach?: boolean;
  }
> = {
  notes: {
    mode: "Notes-only",
    placeholder: "Ask about your lecture materials...",
    hint: "External sources disabled. Answers are grounded only in your course materials.",
    chips: ["Explain this concept", "Quiz me"],
  },
  outline: {
    title: "Outline feedback",
    mode: "Outline",
    placeholder: "Ask for structural feedback or guiding questions...",
    hint: "Primary actions: Check logic · Build evidence · Add to outline. No essay generation.",
    chips: ["Check claim coverage"],
    showAttach: false,
  },
  draft: {
    title: "Draft coach",
    mode: "Outline",
    placeholder: "Ask for structural feedback or guiding questions...",
    hint: "Primary actions: Check logic · Build evidence · Add to outline. No essay generation.",
    chips: ["Check logic"],
    showAttach: false,
  },
  brief: {
    mode: "Research",
    placeholder: "Ask about requirements, rubric, or next steps...",
    hint: "Learning support only — understand, verify, and plan. No essay generation.",
    chips: ["Break down the brief"],
  },
  research: {
    mode: "Research",
    placeholder: "Ask about sources, DOI checks, or evidence strength...",
    hint: "Learning support only — understand, verify, and plan. No essay generation.",
    chips: ["Evaluate this source"],
  },
  references: {
    mode: "Research",
    placeholder: "Ask about citation style or incomplete metadata...",
    hint: "Learning support only — understand, verify, and plan. No essay generation.",
    chips: ["Citation style help"],
  },
};

export function AssignmentAiPanel({
  view,
  assignmentSlug,
}: {
  view: View;
  assignmentSlug?: string;
}) {
  const cfg = configByView[view] ?? configByView.brief;

  return (
    <AssistantPanel
      title={cfg.title}
      activeMode={cfg.mode}
      promptPlaceholder={cfg.placeholder}
      promptHint={cfg.hint}
      promptChips={cfg.chips}
      showAttach={cfg.showAttach}
      live
      assignmentId={assignmentSlug}
      seedQuestions={
        view === "notes"
          ? [
              "What is second normal form (2NF), based on my lecture notes?",
              "Does my lecturer mention denormalisation trade-offs?",
            ]
          : view === "brief"
            ? ['What does "evaluate" mean for this rubric?']
            : undefined
      }
    />
  );
}
