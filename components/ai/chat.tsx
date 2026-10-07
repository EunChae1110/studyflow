"use client";

import * as React from "react";
import { Check, Copy, Reply } from "lucide-react";
import type { Citation } from "@/lib/types";
import { CitationBadge } from "@/components/ai/citation-badge";
import { Markdown } from "@/components/ai/markdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MessageActions({
  text,
  onReply,
}: {
  text: string;
  onReply?: (text: string) => void;
}) {
  const [copied, setCopied] = React.useState(false);

  const copy = React.useCallback(async () => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard failures
    }
  }, [text]);

  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {onReply ? (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="h-7 gap-1 px-2 text-[11px] text-muted hover:text-foreground"
          onClick={() => onReply(text)}
        >
          <Reply className="size-3" />
          Reply
        </Button>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="xs"
        className="h-7 gap-1 px-2 text-[11px] text-muted hover:text-foreground"
        onClick={() => void copy()}
      >
        {copied ? <Check className="size-3 text-[var(--success)]" /> : <Copy className="size-3" />}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

export function UserBubble({
  children,
  text,
  onReply,
}: {
  children: React.ReactNode;
  text?: string;
  onReply?: (text: string) => void;
}) {
  const copyText = text ?? (typeof children === "string" ? children : "");
  return (
    <div className="ml-6">
      <div className="rounded-xl rounded-br-sm bg-surface-muted px-3 py-2.5 text-sm whitespace-pre-wrap">
        {children}
      </div>
      {copyText ? <MessageActions text={copyText} onReply={onReply} /> : null}
    </div>
  );
}

export function AssistantAnswer({
  children,
  markdown,
  citation,
  actions,
  dimmed = false,
  onReply,
}: {
  children?: React.ReactNode;
  markdown?: string;
  citation?: Citation;
  actions?: React.ReactNode;
  dimmed?: boolean;
  onReply?: (text: string) => void;
}) {
  const body = markdown?.trim() ? (
    <Markdown>{markdown}</Markdown>
  ) : (
    children
  );

  return (
    <div
      className={cn(
        "rounded-xl rounded-bl-sm border border-border bg-surface px-3 py-3 text-sm leading-6",
        dimmed && "opacity-60",
      )}
    >
      {body}
      {citation ? <CitationBadge citation={citation} /> : null}
      {actions ? <div className="mt-2 flex flex-wrap gap-1.5">{actions}</div> : null}
      {markdown?.trim() ? <MessageActions text={markdown} onReply={onReply} /> : null}
    </div>
  );
}
