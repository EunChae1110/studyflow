import {
  convertToModelMessages,
  type UIMessage,
  streamText,
} from "ai";
import { getSession } from "@/lib/auth/session";
import { resolveModelId } from "@/lib/ai/models";
import { getChatModel, hasAiCredentials } from "@/lib/ai/provider";
import { buildModeInstruction, STUDYFLOW_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { isDatabaseConfigured } from "@/lib/db";
import {
  getOrCreateConversation,
  persistChatMessage,
  resolveAssignmentId,
  resolveChatUser,
} from "@/lib/db/queries";

export const maxDuration = 60;

type ChatBody = {
  messages: UIMessage[];
  id?: string;
  conversationId?: string;
  mode?: "Notes-only" | "Research" | "Outline";
  assignmentId?: string;
  model?: string;
};

function textFromMessage(message: UIMessage | undefined): string {
  if (!message) return "";
  const parts = message.parts ?? [];
  return parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasAiCredentials()) {
    return Response.json(
      {
        error:
          "AI mid-station is not configured. Add AI_BASE_URL and AI_API_KEY (or OPENAI_BASE_URL / OPENAI_API_KEY) to .env.local.",
      },
      { status: 503 },
    );
  }

  const body = (await req.json()) as ChatBody;
  const messages = body.messages ?? [];
  const mode = body.mode ?? "Notes-only";
  const modelId = resolveModelId(body.model);

  let conversationId = body.conversationId ?? body.id ?? null;

  if (isDatabaseConfigured()) {
    try {
      const chatUser = await resolveChatUser(session.userId);
      if (chatUser) {
        const assignmentUuid = await resolveAssignmentId(body.assignmentId);
        const conversation = await getOrCreateConversation({
          userId: chatUser.userId,
          assignmentId: assignmentUuid,
          mode,
          conversationId,
        });
        conversationId = conversation?.id ?? conversationId;

        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        const userText = textFromMessage(lastUser);
        if (conversationId && userText) {
          await persistChatMessage({
            conversationId,
            role: "user",
            content: userText,
          });
        }
      }
    } catch (error) {
      console.warn("[studyflow] chat persistence (pre) failed:", error);
    }
  }

  const result = streamText({
    model: getChatModel(modelId),
    system: `${STUDYFLOW_SYSTEM_PROMPT}\n\n${buildModeInstruction(mode)}`,
    messages: await convertToModelMessages(messages),
    onFinish: async ({ text }) => {
      if (!conversationId || !isDatabaseConfigured() || !text.trim()) return;
      try {
        await persistChatMessage({
          conversationId,
          role: "assistant",
          content: text,
        });
      } catch (error) {
        console.warn("[studyflow] chat persistence (post) failed:", error);
      }
    },
  });

  return result.toUIMessageStreamResponse({
    headers: {
      "x-model-id": modelId,
      ...(conversationId ? { "x-conversation-id": conversationId } : {}),
    },
  });
}
