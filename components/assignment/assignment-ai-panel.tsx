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
              "Quiz me on one idea I should master before drafting.",
            ]
          : view === "brief"
            ? writing
              ? [
                  'What does "evaluate" mean for this rubric?',
                  "Which requirements should I tackle first?",
                  "What would a strong submission look like?",
                ]
              : [
                  "What does success look like for this assignment type?",
                  "Which requirements should I clarify first?",
                  "What should I prepare before starting the work?",
                ]
            : view === "research"
              ? writing
                ? [
                    "How do I judge if this source is strong enough?",
                    "What evidence am I still missing for my claims?",
                  ]
                : [
                    "What should I look up next for this assignment?",
                    "How do I tell if a source is reliable enough?",
                  ]
              : view === "outline" || view === "draft"
                ? writing
                  ? [
                      "Where is my argument weakest right now?",
                      "Which claim still needs clearer evidence?",
                    ]
                  : [
                      "Break my next steps into a simple plan.",
                      "What should I verify before I submit?",
                    ]
                : view === "references"
                  ? [
                      "Which references look incomplete for this citation style?",
                      "How should I format the bibliography entries I already have?",
                    ]
                  : undefined
      }
    />
  );
}
