"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Paperclip, Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PromptBarProps = {
  mode: "Notes-only" | "Research" | "Outline";
  placeholder: string;
  hint: string;
  extraChips?: string[];
  showAttach?: boolean;
  isStreaming?: boolean;
};

export function PromptBar({
  mode,
  placeholder,
  hint,
  extraChips = [],
  showAttach = true,
  isStreaming = false,
}: PromptBarProps) {
  const [value, setValue] = React.useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-2"
    >
      <div className="rounded-xl border border-border bg-surface p-3 shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <Chip active>{mode}</Chip>
          {extraChips.map((chip) => (
            <Chip key={chip}>{chip}</Chip>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            rows={2}
            placeholder={placeholder}
            className="min-h-11 max-h-28 flex-1 resize-none bg-transparent text-sm leading-6 text-foreground outline-none placeholder:text-muted"
          />
          <div className="flex items-center gap-1">
            {showAttach ? (
              <Button variant="ghost" size="icon-sm" className="text-muted">
                <Paperclip className="size-4" />
              </Button>
            ) : null}
            <Button
              size="icon-sm"
              className={cn(
                "bg-primary text-primary-foreground hover:bg-primary/90",
                isStreaming && "bg-foreground text-background",
              )}
              disabled={!value.trim() && !isStreaming}
            >
              {isStreaming ? <Square className="size-3.5" /> : <Send className="size-3.5" />}
            </Button>
          </div>
        </div>
      </div>
      <p className="px-1 text-[11px] text-muted">
        {hint} <kbd className="rounded border border-border bg-surface px-1.5 py-0.5">↵</kbd> send ·{" "}
        <kbd className="rounded border border-border bg-surface px-1.5 py-0.5">⇧↵</kbd> new line
      </p>
    </motion.div>
  );
}

function Chip({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-surface-muted px-2.5 py-1 text-[11.5px] font-medium text-muted",
        active && "border-transparent bg-primary-soft text-primary",
      )}
    >
      {children}
    </span>
  );
}
