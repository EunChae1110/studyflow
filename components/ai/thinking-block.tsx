"use client";

import * as React from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { Brain, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type ThinkingState = "active" | "done";

type ThinkingStep = {
  text: string;
  status: "done" | "active" | "pending";
};

type ThinkingBlockProps = {
  state: ThinkingState;
  title: string;
  defaultOpen?: boolean;
  steps?: ThinkingStep[];
};

export function ThinkingBlock({
  state,
  title,
  defaultOpen = true,
  steps = [],
}: ThinkingBlockProps) {
  return (
    <Collapsible.Root defaultOpen={defaultOpen} className="overflow-hidden rounded-xl border border-border bg-surface-muted">
      <Collapsible.Trigger className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-medium text-muted">
        <span
          className={cn(
            "size-2 shrink-0 rounded-full",
            state === "active" ? "thinking-pulse bg-primary" : "bg-[var(--success)]",
          )}
        />
        <span className="flex flex-1 items-center gap-1.5">
          <Brain className="size-3.5" />
          {state === "active" ? <span className="shimmer-text">{title}</span> : title}
        </span>
        <ChevronDown className="size-3.5 transition-transform data-[state=open]:rotate-180" />
      </Collapsible.Trigger>
      <Collapsible.Content className="border-t border-border px-3 pb-3 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0">
        <div className="space-y-2 pt-2">
          {steps.length === 0 && state === "active" ? (
            <div className="space-y-2">
              <SkeletonLine width="w-4/5" />
              <SkeletonLine width="w-2/3" />
              <SkeletonLine width="w-1/2" />
            </div>
          ) : (
            steps.map((step) => (
              <div key={step.text} className={cn("flex items-start gap-2 text-xs text-muted", step.status === "active" && "text-foreground")}>
                <span
                  className={cn(
                    "mt-1.5 size-1.5 shrink-0 rounded-full bg-border",
                    step.status === "active" && "bg-primary shadow-[0_0_0_4px_var(--primary-soft)]",
                    step.status === "done" && "bg-[var(--success)]",
                  )}
                />
                <span>{step.text}</span>
              </div>
            ))
          )}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function SkeletonLine({ width }: { width: string }) {
  return <div className={cn("h-2 rounded bg-border/70", width)} />;
}
