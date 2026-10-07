"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { LoaderCircle } from "lucide-react";
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

type MessagePart = { type: string; text?: string };

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
          const streamingThis = isStreaming && isLast && message.role === "assistant";

          if (message.role === "user") {
            return (
              <UserBubble key={message.id} text={text} onReply={handleReply}>
                {text}
              </UserBubble>
            );
          }

          if (message.role === "assistant") {
            return (
              <div key={message.id} className="space-y-2">
                {reasoning ? (
                  <ThinkingBlock
                    state={streamingThis ? "active" : "done"}
                    title={streamingThis ? "Thinking..." : "Thought process"}
                    defaultOpen={streamingThis}
                    steps={reasoning
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line) => ({
                        text: line,
                        status: streamingThis ? ("active" as const) : ("done" as const),
                      }))}
                  />
                ) : null}
                {text ? (
                  <AssistantAnswer
                    markdown={text}
                    onReply={streamingThis ? undefined : handleReply}
                  />
                ) : streamingThis ? (
                  <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-muted">
                    <LoaderCircle className="size-3.5 animate-spin" />
                    Generating response…
                  </div>
                ) : null}
              </div>
            );
          }

          return null;
        })}

        {waitingForFirstToken ? (
          <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-muted">
            <LoaderCircle className="size-3.5 animate-spin" />
            Generating response…
          </div>
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
