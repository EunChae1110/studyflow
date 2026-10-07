"use client";

import { Sparkles, X } from "lucide-react";
import { StudyflowChat } from "@/components/ai/studyflow-chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AssistantMode = "Notes-only" | "Research" | "Outline";

type AssistantPanelProps = {
  title?: string;
  activeMode: AssistantMode;
  promptPlaceholder: string;
  promptHint: string;
  promptChips?: string[];
  showAttach?: boolean;
  live?: boolean;
  assignmentId?: string;
  seedQuestions?: string[];
  children?: React.ReactNode;
};

const modes: AssistantMode[] = ["Notes-only", "Research", "Outline"];

export function AssistantPanel({
  title = "AI Assistant",
  activeMode,
  promptPlaceholder,
  promptHint,
  promptChips,
  showAttach = true,
  live = false,
  assignmentId,
  seedQuestions,
  children,
}: AssistantPanelProps) {
  return (
    <section className="flex h-full min-h-[500px] flex-col bg-surface">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <Button variant="ghost" size="icon-xs" className="text-muted">
          <X className="size-3.5" />
        </Button>
      </header>
      <div className="grid grid-cols-3 gap-1 border-b border-border p-2">
        {modes.map((mode) => (
          <Badge
            key={mode}
            className={cn(
              "justify-center rounded-md border border-transparent bg-transparent py-1 text-[11px] text-muted",
              mode === activeMode && "bg-primary-soft text-primary",
            )}
          >
            {mode}
          </Badge>
        ))}
      </div>

      {live ? (
        <StudyflowChat
          mode={activeMode}
          placeholder={promptPlaceholder}
          hint={promptHint}
          extraChips={promptChips}
          showAttach={showAttach}
          assignmentId={assignmentId}
          seedQuestions={seedQuestions}
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
