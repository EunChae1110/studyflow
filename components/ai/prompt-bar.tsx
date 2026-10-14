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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
};

const MODE_OPTIONS: Array<{
  id: AssistantMode;
  label: string;
  description: string;
}> = [
  {
    id: "Notes-only",
    label: "Notes-only",
    description:
      "Ground answers only in your course materials. External sources stay off.",
  },
  {
    id: "Research",
    label: "Research",
    description:
      "Verify sources, check evidence, and plan next steps — no full write-up.",
  },
  {
    id: "Outline",
    label: "Outline",
    description:
      "Structural feedback, logic checks, and evidence planning for your draft.",
  },
];

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
      {extraChips.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 px-0.5">
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
      ) : null}

      <div className="rounded-xl border border-border bg-surface p-3 shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
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
          <Button
            type="button"
            size="icon-sm"
            className={cn(
              "shrink-0 bg-primary text-primary-foreground hover:bg-primary/90",
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

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-border/70 pt-2.5">
          <ModeSelector
            mode={mode}
            onChange={onModeChange}
            disabled={isStreaming || !onModeChange}
          />
          <ModelSelector
            selected={selected}
            onChange={setModel}
            disabled={isStreaming}
          />
        </div>
      </div>

      <p className="px-1 text-[11px] text-muted">
        {hint} <kbd className="rounded border border-border bg-surface px-1.5 py-0.5">↵</kbd> send ·{" "}
        <kbd className="rounded border border-border bg-surface px-1.5 py-0.5">⇧↵</kbd> new line
      </p>
    </motion.div>
  );
}

function SelectorTrigger({
  children,
  disabled,
  className,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  "aria-label": string;
}) {
  return (
    <DropdownMenuTrigger
      disabled={disabled}
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-lg border border-border bg-surface-muted py-1 pr-1.5 pl-2 text-[11.5px] font-medium text-foreground outline-none",
        "hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      aria-label={ariaLabel}
    >
      {children}
      <ChevronDown className="size-3 shrink-0 text-muted" />
    </DropdownMenuTrigger>
  );
}

function ModeSelector({
  mode,
  onChange,
  disabled,
}: {
  mode: AssistantMode;
  onChange?: (mode: AssistantMode) => void;
  disabled?: boolean;
}) {
  const selected = MODE_OPTIONS.find((m) => m.id === mode) ?? MODE_OPTIONS[0]!;

  return (
    <DropdownMenu>
      <SelectorTrigger
        disabled={disabled}
        aria-label="Assistant mode"
        className="border-transparent bg-primary-soft text-primary hover:bg-primary-soft/80"
      >
        <span className="truncate">{selected.label}</span>
      </SelectorTrigger>
      <DropdownMenuContent
        align="start"
        side="bottom"
        sideOffset={6}
        className="w-72"
      >
        <DropdownMenuRadioGroup
          value={mode}
          onValueChange={(value) => {
            if (value === "Notes-only" || value === "Research" || value === "Outline") {
              onChange?.(value);
            }
          }}
        >
          {MODE_OPTIONS.map((option) => (
            <DropdownMenuRadioItem
              key={option.id}
              value={option.id}
              className="items-start gap-2 py-2"
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-medium text-foreground">{option.label}</p>
                <p className="text-[11px] leading-4 whitespace-normal text-muted">
                  {option.description}
                </p>
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
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
    <DropdownMenu>
      <SelectorTrigger disabled={disabled} aria-label="AI model">
        <span className="truncate">{selected.label}</span>
      </SelectorTrigger>
      <DropdownMenuContent
        align="start"
        side="bottom"
        sideOffset={6}
        className="w-72"
      >
        <DropdownMenuRadioGroup
          value={selected.id}
          onValueChange={(value) => {
            if (typeof value === "string" && value) onChange(value);
          }}
        >
          {STUDYFLOW_MODELS.map((model) => (
            <DropdownMenuRadioItem
              key={model.id}
              value={model.id}
              className="items-start gap-2 py-2"
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-medium text-foreground">{model.label}</p>
                <p className="text-[11px] leading-4 whitespace-normal text-muted">
                  {model.description}
                </p>
                <p className="font-mono text-[10px] text-muted/80">{model.id}</p>
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
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
