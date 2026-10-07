"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { FileText } from "lucide-react";
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
};

function messageText(message: {
  parts?: Array<{ type: string; text?: string }>;
}): string {
  return (message.parts ?? [])
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text as string)
    .join("\n");
}

export function StudyflowChat({
  mode,
  placeholder,
  hint,
  extraChips,
  showAttach = true,
  seedQuestions = [],
}: StudyflowChatProps) {
  const [conversationId] = React.useState(() => crypto.randomUUID());
  const [modelId, setModelId] = React.useState(DEFAULT_MODEL_ID);

  const transport = React.useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: {
          mode,
          conversationId,
          model: modelId,
        },
      }),
    [mode, conversationId, modelId],
  );

  const { messages, sendMessage, status, stop, error } = useChat({
    id: conversationId,
    transport,
  });

  const isStreaming = status === "submitted" || status === "streaming";

  const handleSend = React.useCallback(
    async (text: string) => {
      await sendMessage({ text });
    },
    [sendMessage],
  );

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
          if (message.role === "user") {
            return <UserBubble key={message.id}>{text}</UserBubble>;
          }
          if (message.role === "assistant") {
            return (
              <div key={message.id} className="space-y-2">
                {isStreaming && message.id === messages[messages.length - 1]?.id ? (
                  <ThinkingBlock state="active" title="Thinking..." />
                ) : null}
                <AssistantAnswer>{text || "…"}</AssistantAnswer>
              </div>
            );
          }
          return null;
        })}

        {isStreaming && messages[messages.length - 1]?.role === "user" ? (
          <div className="space-y-2">
            <ThinkingBlock state="active" title="Thinking..." />
            <AssistantAnswer dimmed>
              <span className="inline-flex items-center gap-2 text-xs text-muted">
                <FileText className="size-3.5" />
                Preparing a grounded answer...
              </span>
            </AssistantAnswer>
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
          mode={mode}
          placeholder={placeholder}
          hint={hint}
          extraChips={extraChips}
          showAttach={showAttach}
          isStreaming={isStreaming}
          modelId={modelId}
          onModelChange={setModelId}
          onSend={handleSend}
          onStop={() => stop()}
        />
      </div>
    </div>
  );
}
