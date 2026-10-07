"use client";

import * as React from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { Brain, ChevronDown, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ThinkingState = "active" | "done";

type ThinkingStep = {
  text: string;
  status: "done" | "active" | "pending";
};

type ThinkingBlockProps = {
  state: ThinkingState;
  /** Header label, e.g. "Thinking…" / "Thought process" */
  title: string;
  /** Optional secondary status, e.g. elapsed "12s" */
  subtitle?: string;
  defaultOpen?: boolean;
  /** Continuous reasoning text from the model (preferred over fake steps) */
  reasoning?: string;
  /** Optional structured steps derived from reasoning lines */
  steps?: ThinkingStep[];
};

export function ThinkingBlock({
  state,
  title,
  subtitle,
  defaultOpen = true,
  reasoning = "",
  steps = [],
}: ThinkingBlockProps) {
  const hasContent = Boolean(reasoning.trim()) || steps.length > 0;
  const [open, setOpen] = React.useState(defaultOpen);

  React.useEffect(() => {
    // Keep open while streaming; collapse when finished (user can re-open).
    if (state === "active") setOpen(true);
    else if (hasContent) setOpen(false);
  }, [state, hasContent]);

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={setOpen}
      className="overflow-hidden rounded-xl border border-border bg-surface-muted"
    >
      <Collapsible.Trigger className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-medium text-muted">
        {state === "active" ? (
          <LoaderCircle className="size-3.5 shrink-0 animate-spin text-primary" />
        ) : (
          <span className="size-2 shrink-0 rounded-full bg-[var(--success)]" />
        )}
        <span className="flex min-w-0 flex-1 items-center gap-1.5">
          <Brain className="size-3.5 shrink-0" />
          {state === "active" ? (
            <span className="shimmer-text truncate">{title}</span>
          ) : (
            <span className="truncate">{title}</span>
          )}
          {subtitle ? (
            <span className="shrink-0 font-normal tabular-nums text-muted/80">
              · {subtitle}
            </span>
          ) : null}
        </span>
        {hasContent ? (
          <ChevronDown
            className={cn(
              "size-3.5 shrink-0 transition-transform",
              open && "rotate-180",
            )}
          />
        ) : null}
      </Collapsible.Trigger>

      {hasContent || state === "active" ? (
        <Collapsible.Content className="border-t border-border px-3 pb-3 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0">
          <div className="space-y-2 pt-2">
            {reasoning.trim() ? (
              <pre className="study-scroll max-h-48 overflow-y-auto whitespace-pre-wrap font-sans text-xs leading-5 text-muted">
                {reasoning.trim()}
              </pre>
            ) : steps.length > 0 ? (
              steps.map((step, index) => (
                <div
                  key={`${index}-${step.text.slice(0, 24)}`}
                  className={cn(
                    "flex items-start gap-2 text-xs text-muted",
                    step.status === "active" && "text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "mt-1.5 size-1.5 shrink-0 rounded-full bg-border",
                      step.status === "active" &&
                        "bg-primary shadow-[0_0_0_4px_var(--primary-soft)]",
                      step.status === "done" && "bg-[var(--success)]",
                    )}
                  />
                  <span className="whitespace-pre-wrap">{step.text}</span>
                </div>
              ))
            ) : state === "active" ? (
              <p className="text-xs text-muted">
                Waiting for the model… progress updates as tokens arrive.
              </p>
            ) : null}
          </div>
        </Collapsible.Content>
      ) : null}
    </Collapsible.Root>
  );
}
