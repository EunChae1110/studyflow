"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { AssistantAnswer, UserBubble } from "@/components/ai/chat";
import { PromptBar } from "@/components/ai/prompt-bar";
import { ThinkingBlock } from "@/components/ai/thinking-block";
import { DEFAULT_MODEL_ID } from "@/lib/ai/models";
import { Button } from "@/components/ui/button";

type StudyflowChatProps = {
  mode: "Notes-only" | "Research" | "Outline";
  placeholder: string;
  hint: string;
  extraChips?: string[];
  showAttach?: boolean;
  seedQuestions?: string[];
  assignmentId?: string;
};

type MessagePart = { type: string; text?: string; state?: string };

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

export function StudyflowChat({
  mode,
  placeholder,
  hint,
  extraChips,
  showAttach = true,
  seedQuestions = [],
  assignmentId,
}: StudyflowChatProps) {
  const [conversationId] = React.useState(() => crypto.randomUUID());
  const [modelId, setModelId] = React.useState(DEFAULT_MODEL_ID);
  const [draft, setDraft] = React.useState("");
  const [draftKey, setDraftKey] = React.useState(0);

  const transport = React.useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: {
          mode,
          conversationId,
          model: modelId,
          ...(assignmentId ? { assignmentId } : {}),
        },
      }),
    [mode, conversationId, modelId, assignmentId],
  );

  const { messages, sendMessage, status, stop, error } = useChat({
    id: conversationId,
    transport,
  });

  const isStreaming = status === "submitted" || status === "streaming";
  const lastMessage = messages[messages.length - 1];
  const waitingForFirstToken =
    isStreaming && (!lastMessage || lastMessage.role === "user");
  const elapsed = useElapsedSeconds(isStreaming);
  const elapsedLive = elapsed.live;
  const elapsedFinished = elapsed.finished;

  const handleSend = React.useCallback(
    async (text: string) => {
      await sendMessage({ text });
    },
    [sendMessage],
  );

  const handleReply = React.useCallback((text: string) => {
    const clipped = text.length > 120 ? `${text.slice(0, 117)}…` : text;
    setDraft(`Regarding: “${clipped}”\n\n`);
    setDraftKey((key) => key + 1);
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
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
            // Honest progress: show while waiting for answer tokens when no
            // real reasoning yet; keep after finish only if reasoning exists.
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
          placeholder={placeholder}
          hint={hint}
          extraChips={extraChips}
          showAttach={showAttach}
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
