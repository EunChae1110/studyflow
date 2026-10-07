"use client";

import * as React from "react";
import { Sparkles, X } from "lucide-react";
import { StudyflowChat } from "@/components/ai/studyflow-chat";
import type { AssistantMode } from "@/components/ai/prompt-bar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AssistantPanelProps = {
  title?: string;
  activeMode: AssistantMode;
  promptPlaceholder: string;
  promptHint: string;
  promptChips?: string[];
  live?: boolean;
  assignmentId?: string;
  seedQuestions?: string[];
  children?: React.ReactNode;
  className?: string;
  onClose?: () => void;
  acceptAskEvents?: boolean;
};

const MODE_COPY: Record<
  AssistantMode,
  { placeholder: string; hint: string }
> = {
  "Notes-only": {
    placeholder: "Ask about your lecture materials...",
    hint: "External sources disabled. Answers are grounded only in your course materials.",
  },
  Research: {
    placeholder: "Ask about sources, DOI checks, or evidence strength...",
    hint: "Learning support only — understand, verify, and plan. No essay generation.",
  },
  Outline: {
    placeholder: "Ask for structural feedback or guiding questions...",
    hint: "Primary actions: Check logic · Build evidence · Add to outline. No essay generation.",
  },
};

const modes: AssistantMode[] = ["Notes-only", "Research", "Outline"];

export function AssistantPanel({
  title = "AI Assistant",
  activeMode,
  promptPlaceholder,
  promptHint,
  promptChips,
  live = false,
  assignmentId,
  seedQuestions,
  children,
  className,
  onClose,
  acceptAskEvents = true,
}: AssistantPanelProps) {
  const [mode, setMode] = React.useState<AssistantMode>(activeMode);

  React.useEffect(() => {
    setMode(activeMode);
  }, [activeMode]);

  const copy = MODE_COPY[mode];
  const resolvedPlaceholder =
    mode === activeMode ? promptPlaceholder || copy.placeholder : copy.placeholder;
  const resolvedHint = mode === activeMode ? promptHint || copy.hint : copy.hint;

  return (
    <section className={cn("flex h-full min-h-[500px] flex-col bg-surface", className)}>
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="text-muted"
            aria-label="Close AI assistant"
            onClick={onClose}
          >
            <X className="size-3.5" />
          </Button>
        ) : null}
      </header>
      <div className="grid grid-cols-3 gap-1 border-b border-border p-2">
        {modes.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "rounded-md border border-transparent py-1 text-[11px] font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground",
              m === mode && "bg-primary-soft text-primary",
            )}
          >
            {m}
          </button>
        ))}
      </div>

      {live ? (
        <StudyflowChat
          mode={mode}
          onModeChange={setMode}
          placeholder={resolvedPlaceholder}
          hint={resolvedHint}
          extraChips={promptChips}
          assignmentId={assignmentId}
          seedQuestions={seedQuestions}
          acceptAskEvents={acceptAskEvents}
        />
      ) : (
        <div className="study-scroll flex-1 space-y-4 overflow-y-auto p-4">
          {children ?? (
            <p className="text-sm text-muted">Ask a question to get started.</p>
          )}
        </div>
      )}
    </section>
  );
}
