"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ChevronDown, Send, Square } from "lucide-react";
import {
  DEFAULT_MODEL_ID,
  STUDYFLOW_MODELS,
  type StudyflowModelOption,
} from "@/lib/ai/models";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AssistantMode = "Notes-only" | "Research" | "Outline";

type PromptBarProps = {
  mode: AssistantMode;
  onModeChange?: (mode: AssistantMode) => void;
  placeholder: string;
  hint: string;
  extraChips?: string[];
  isStreaming?: boolean;
  modelId?: string;
  onModelChange?: (modelId: string) => void;
  seedValue?: string;
  onSend?: (value: string) => void | Promise<void>;
  onStop?: () => void;
  showModeChips?: boolean;
};

const ALL_MODES: AssistantMode[] = ["Notes-only", "Research", "Outline"];

export function PromptBar({
  mode,
  onModeChange,
  placeholder,
  hint,
  extraChips = [],
  isStreaming = false,
  modelId,
  onModelChange,
  seedValue = "",
  onSend,
  onStop,
  showModeChips = true,
}: PromptBarProps) {
  const [value, setValue] = React.useState(seedValue);
  const [internalModelId, setInternalModelId] = React.useState(DEFAULT_MODEL_ID);
  const selectedModelId = modelId ?? internalModelId;

  React.useEffect(() => {
    setValue(seedValue);
  }, [seedValue]);

  const setModel = (next: string) => {
    if (onModelChange) onModelChange(next);
    else setInternalModelId(next);
  };

  const selected =
    STUDYFLOW_MODELS.find((m) => m.id === selectedModelId) ?? STUDYFLOW_MODELS[0]!;

  const submit = React.useCallback(async () => {
    const next = value.trim();
    if (!next || !onSend) return;
    setValue("");
    await onSend(next);
  }, [onSend, value]);

  const sendChip = React.useCallback(
    async (text: string) => {
      if (!onSend || isStreaming) return;
      setValue("");
      await onSend(text);
    },
    [onSend, isStreaming],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-2"
    >
      <div className="rounded-xl border border-border bg-surface p-3 shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {showModeChips
            ? ALL_MODES.map((m) => (
                <Chip
                  key={m}
                  active={m === mode}
                  disabled={isStreaming || !onModeChange}
                  onClick={() => onModeChange?.(m)}
                >
                  {m}
                </Chip>
              ))
            : (
                <Chip active>{mode}</Chip>
              )}
          <ModelSelector selected={selected} onChange={setModel} disabled={isStreaming} />
          {extraChips.map((chip) => (
            <Chip
              key={chip}
              disabled={isStreaming || !onSend}
              onClick={() => void sendChip(chip)}
            >
              {chip}
            </Chip>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                if (isStreaming) {
                  onStop?.();
                } else {
                  void submit();
                }
              }
            }}
            rows={2}
            placeholder={placeholder}
            className="min-h-11 max-h-28 flex-1 resize-none bg-transparent text-sm leading-6 text-foreground outline-none placeholder:text-muted"
          />
          <div className="flex items-center gap-1">
<Button
              type="button"
              size="icon-sm"
              className={cn(
                "bg-primary text-primary-foreground hover:bg-primary/90",
                isStreaming && "bg-foreground text-background",
              )}
              disabled={!isStreaming && !value.trim()}
              onClick={() => {
                if (isStreaming) onStop?.();
                else void submit();
              }}
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

function ModelSelector({
  selected,
  onChange,
  disabled,
}: {
  selected: StudyflowModelOption;
  onChange: (modelId: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">選擇模型</span>
      <select
        value={selected.id}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="appearance-none rounded-full border border-border bg-surface-muted py-1 pr-7 pl-2.5 text-[11.5px] font-medium text-foreground outline-none hover:bg-surface disabled:opacity-60"
        aria-label="AI model"
      >
        {STUDYFLOW_MODELS.map((model) => (
          <option key={model.id} value={model.id}>
            {model.label} · {model.id}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-2 size-3 -translate-y-1/2 text-muted" />
    </label>
  );
}

function Chip({
  children,
  active = false,
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const interactive = Boolean(onClick) && !disabled;
  const Comp = interactive ? "button" : "span";
  return (
    <Comp
      type={interactive ? "button" : undefined}
      disabled={interactive ? disabled : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-surface-muted px-2.5 py-1 text-[11.5px] font-medium text-muted",
        active && "border-transparent bg-primary-soft text-primary",
        interactive && "cursor-pointer hover:bg-surface hover:text-foreground",
        disabled && "opacity-60",
      )}
    >
      {children}
    </Comp>
  );
}
