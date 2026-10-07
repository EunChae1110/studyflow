"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { History, Plus } from "lucide-react";
import { AssistantAnswer, UserBubble } from "@/components/ai/chat";
import { PromptBar, type AssistantMode } from "@/components/ai/prompt-bar";
import { ThinkingBlock } from "@/components/ai/thinking-block";
import { DEFAULT_MODEL_ID } from "@/lib/ai/models";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StudyflowChatProps = {
  mode: AssistantMode;
  onModeChange?: (mode: AssistantMode) => void;
  placeholder: string;
  hint: string;
  extraChips?: string[];
  seedQuestions?: string[];
  assignmentId?: string;
  /** Listen for window `studyflow:ask-ai` events (default true). */
  acceptAskEvents?: boolean;
};

type MessagePart = { type: string; text?: string; state?: string };

type HistoryItem = {
  id: string;
  title: string | null;
  mode: string;
  updatedAt: string;
  preview: string | null;
};

function messageText(message: { parts?: MessagePart[] }): string {
  return (message.parts ?? [])
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text as string)
    .join("\n");
}

function messageReasoning(message: { parts?: MessagePart[] }): string {
  return (message.parts ?? [])
    .filter(
      (part) =>
        (part.type === "reasoning" || part.type === "thinking") &&
        typeof part.text === "string",
    )
    .map((part) => part.text as string)
    .join("\n")
    .trim();
}

function useElapsedSeconds(active: boolean): { live: number; finished: number } {
  const [live, setLive] = React.useState(0);
  const [finished, setFinished] = React.useState(0);
  const startedAtRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!active) {
      if (startedAtRef.current != null) {
        const total = Math.max(
          1,
          Math.floor((Date.now() - startedAtRef.current) / 1000),
        );
        setFinished(total);
        setLive(total);
      }
      startedAtRef.current = null;
      return;
    }

    if (startedAtRef.current == null) {
      startedAtRef.current = Date.now();
      setLive(0);
    }

    const tick = () => {
      const start = startedAtRef.current ?? Date.now();
      setLive(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [active]);

  return { live, finished };
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function toUiMessages(
  rows: Array<{ id: string; role: string; content: string; thinking?: string | null }>,
): UIMessage[] {
  return rows
    .filter((r) => r.role === "user" || r.role === "assistant")
    .map((r) => {
      const parts: MessagePart[] = [];
      if (r.thinking) {
        parts.push({ type: "reasoning", text: r.thinking });
      }
      parts.push({ type: "text", text: r.content });
      return {
        id: r.id,
        role: r.role as "user" | "assistant",
        parts,
      } as UIMessage;
    });
}

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

export function StudyflowChat({
  mode: modeProp,
  onModeChange,
  placeholder,
  hint,
  extraChips,
  seedQuestions = [],
  assignmentId,
  acceptAskEvents = true,
}: StudyflowChatProps) {
  const [localMode, setLocalMode] = React.useState<AssistantMode>(modeProp);
  React.useEffect(() => {
    setLocalMode(modeProp);
  }, [modeProp]);
  const mode = localMode;
  const setMode = React.useCallback(
    (next: AssistantMode) => {
      setLocalMode(next);
      onModeChange?.(next);
    },
    [onModeChange],
  );
  const resolvedPlaceholder =
    mode === modeProp ? placeholder : MODE_COPY[mode].placeholder;
  const resolvedHint = mode === modeProp ? hint : MODE_COPY[mode].hint;

  const [conversationId, setConversationId] = React.useState(() =>
    crypto.randomUUID(),
  );
  const [modelId, setModelId] = React.useState(DEFAULT_MODEL_ID);
  const [draft, setDraft] = React.useState("");
  const [draftKey, setDraftKey] = React.useState(0);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = React.useState(false);
  const [bootMessages, setBootMessages] = React.useState<UIMessage[]>([]);
  const [chatKey, setChatKey] = React.useState(0);

  const modeRef = React.useRef(mode);
  const modelRef = React.useRef(modelId);
  const conversationRef = React.useRef(conversationId);
  React.useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  React.useEffect(() => {
    modelRef.current = modelId;
  }, [modelId]);
  React.useEffect(() => {
    conversationRef.current = conversationId;
  }, [conversationId]);

  const transport = React.useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({
          mode: modeRef.current,
          conversationId: conversationRef.current,
          model: modelRef.current,
          ...(assignmentId ? { assignmentId } : {}),
        }),
      }),
    [assignmentId, chatKey],
  );

  const { messages, sendMessage, status, stop, error, setMessages } = useChat({
    id: `${conversationId}-${chatKey}`,
    transport,
    messages: bootMessages,
  });

  const isStreaming = status === "submitted" || status === "streaming";
  const lastMessage = messages[messages.length - 1];
  const waitingForFirstToken =
    isStreaming && (!lastMessage || lastMessage.role === "user");
  const elapsed = useElapsedSeconds(isStreaming);
  const elapsedLive = elapsed.live;
  const elapsedFinished = elapsed.finished;

  const loadHistory = React.useCallback(async () => {
    if (!assignmentId) return;
    setHistoryLoading(true);
    try {
      const res = await fetch(
        `/api/chat/history?assignmentId=${encodeURIComponent(assignmentId)}`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as { conversations?: HistoryItem[] };
      setHistory(data.conversations ?? []);
    } catch {
      /* ignore */
    } finally {
      setHistoryLoading(false);
    }
  }, [assignmentId]);

  React.useEffect(() => {
    if (historyOpen) void loadHistory();
  }, [historyOpen, loadHistory]);

  const handleSend = React.useCallback(
    async (text: string) => {
      await sendMessage({ text });
    },
    [sendMessage],
  );

  React.useEffect(() => {
    if (!acceptAskEvents) return;
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ prompt?: string }>).detail;
      const prompt = detail?.prompt?.trim();
      if (!prompt || isStreaming) return;
      void handleSend(prompt);
    };
    window.addEventListener("studyflow:ask-ai", handler);
    return () => window.removeEventListener("studyflow:ask-ai", handler);
  }, [acceptAskEvents, handleSend, isStreaming]);

  const handleReply = React.useCallback((text: string) => {
    const clipped = text.length > 120 ? `${text.slice(0, 117)}…` : text;
    setDraft(`Regarding: “${clipped}”\n\n`);
    setDraftKey((key) => key + 1);
  }, []);

  const startNewChat = React.useCallback(() => {
    const nextId = crypto.randomUUID();
    setConversationId(nextId);
    setBootMessages([]);
    setChatKey((k) => k + 1);
    setHistoryOpen(false);
    setMessages([]);
  }, [setMessages]);

  const openConversation = React.useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/chat/conversations/${id}`);
        if (!res.ok) return;
        const data = (await res.json()) as {
          conversation?: { id: string; mode?: AssistantMode };
          messages?: Array<{
            id: string;
            role: string;
            content: string;
            thinking?: string | null;
          }>;
        };
        const ui = toUiMessages(data.messages ?? []);
        setConversationId(id);
        setBootMessages(ui);
        setChatKey((k) => k + 1);
        if (data.conversation?.mode && onModeChange) {
          onModeChange(data.conversation.mode);
        }
        setHistoryOpen(false);
      } catch {
        /* ignore */
      }
    },
    [onModeChange],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
        <Button
          type="button"
          size="xs"
          variant="ghost"
          className="text-muted"
          onClick={() => setHistoryOpen((o) => !o)}
          disabled={!assignmentId}
          title={assignmentId ? "Chat history" : "Open an assignment to use history"}
        >
          <History className="size-3.5" />
          History
        </Button>
        <Button
          type="button"
          size="xs"
          variant="ghost"
          className="text-muted"
          onClick={startNewChat}
        >
          <Plus className="size-3.5" />
          New chat
        </Button>
      </div>

      {historyOpen ? (
        <div className="max-h-40 overflow-y-auto border-b border-border bg-surface-muted/40 px-2 py-2">
          {historyLoading ? (
            <p className="px-2 text-xs text-muted">Loading…</p>
          ) : history.length === 0 ? (
            <p className="px-2 text-xs text-muted">No past chats for this assignment.</p>
          ) : (
            <ul className="space-y-1">
              {history.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => void openConversation(item.id)}
                    className={cn(
                      "w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-surface",
                      item.id === conversationId && "bg-primary-soft text-primary",
                    )}
                  >
                    <span className="font-medium">
                      {item.title || "Untitled chat"}
                    </span>
                    <span className="mt-0.5 block truncate text-muted">
                      {item.preview || item.mode}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <div className="study-scroll flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              StudyFlow 會引導你理解題目、整理證據與大綱——唔會代寫全文。
            </p>
            {seedQuestions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {seedQuestions.map((q) => (
                  <Button
                    key={q}
                    type="button"
                    size="sm"
                    variant="outline"
                    className="max-w-full whitespace-normal text-left text-xs"
                    disabled={isStreaming}
                    onClick={() => void handleSend(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {messages.map((message) => {
          const text = messageText(message);
          const reasoning = messageReasoning(message);
          const isLast = message.id === lastMessage?.id;
          const streamingThis =
            isStreaming && isLast && message.role === "assistant";

          if (message.role === "user") {
            return (
              <UserBubble key={message.id} text={text} onReply={handleReply}>
                {text}
              </UserBubble>
            );
          }

          if (message.role === "assistant") {
            const showProgressOnly =
              streamingThis && !reasoning && !text.trim();
            const showReasoningBlock = Boolean(reasoning) || showProgressOnly;
            const progressTitle = text.trim()
              ? "Generating…"
              : reasoning
                ? "Thinking…"
                : "Thinking…";

            return (
              <div key={message.id} className="space-y-2">
                {showReasoningBlock ? (
                  <ThinkingBlock
                    state={streamingThis ? "active" : "done"}
                    title={
                      streamingThis
                        ? progressTitle
                        : reasoning
                          ? `Thought for ${formatElapsed(elapsedFinished || elapsedLive || 1)}`
                          : "Thought process"
                    }
                    subtitle={
                      streamingThis ? formatElapsed(elapsedLive) : undefined
                    }
                    defaultOpen={streamingThis}
                    reasoning={reasoning}
                  />
                ) : null}
                {text ? (
                  <AssistantAnswer
                    markdown={text}
                    onReply={streamingThis ? undefined : handleReply}
                  />
                ) : null}
              </div>
            );
          }

          return null;
        })}

        {waitingForFirstToken ? (
          <ThinkingBlock
            state="active"
            title="Thinking…"
            subtitle={formatElapsed(elapsedLive)}
            defaultOpen
          />
        ) : null}

        {error ? (
          <p className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-xs text-[var(--danger)]">
            {error.message || "Chat request failed."}
          </p>
        ) : null}
      </div>

      <div className="border-t border-border bg-background p-3">
        <PromptBar
          key={draftKey}
          mode={mode}
          onModeChange={setMode}
          placeholder={resolvedPlaceholder}
          hint={resolvedHint}
          extraChips={extraChips}
          isStreaming={isStreaming}
          modelId={modelId}
          onModelChange={setModelId}
          seedValue={draft}
          onSend={handleSend}
          onStop={() => stop()}
        />
      </div>
    </div>
  );
}
