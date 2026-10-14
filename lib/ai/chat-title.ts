import { generateText } from "ai";
import { getChatModel } from "@/lib/ai/provider";
import {
  getConversationTitle,
  isPlaceholderConversationTitle,
  setConversationTitleIfEmpty,
  titleFromUserMessage,
} from "@/lib/db/queries";

function sanitizeGeneratedTitle(raw: string): string | null {
  const cleaned = raw
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/^title\s*:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);

  if (!cleaned) return null;
  if (isPlaceholderConversationTitle(cleaned)) return null;
  if (/^(new chat|untitled|chat)$/i.test(cleaned)) return null;
  return cleaned;
}

/** Immediate title from the first user message (no extra model call). */
export async function applyProvisionalChatTitle(params: {
  conversationId: string;
  userText: string;
}): Promise<string | null> {
  return setConversationTitleIfEmpty({
    conversationId: params.conversationId,
    title: titleFromUserMessage(params.userText),
  });
}

/**
 * Polish the conversation title with a short model call after the first reply.
 * Upgrades empty / "{Mode} chat" / provisional first-message titles only.
 */
export async function generateChatTitle(params: {
  conversationId: string;
  userText: string;
  assistantText: string;
  modelId?: string | null;
}): Promise<string | null> {
  const provisional = titleFromUserMessage(params.userText);
  const current = (await getConversationTitle(params.conversationId))?.trim() ?? "";

  // Already has a polished title — skip extra model call on later turns.
  if (
    current &&
    !isPlaceholderConversationTitle(current) &&
    current !== provisional
  ) {
    return current;
  }

  try {
    const { text } = await generateText({
      model: getChatModel(params.modelId),
      temperature: 0.3,
      prompt: [
        "Create a short study-chat title (3–7 words).",
        "No quotes, no trailing punctuation, no mode names like Notes-only/Research/Outline.",
        "Capture the student's question topic.",
        "",
        `Student: ${params.userText.slice(0, 400)}`,
        `Assistant: ${params.assistantText.slice(0, 400)}`,
        "Title:",
      ].join("\n"),
    });

    const generated = sanitizeGeneratedTitle(text);
    if (generated) {
      return setConversationTitleIfEmpty({
        conversationId: params.conversationId,
        title: generated,
        replaceProvisional: provisional,
      });
    }
  } catch (error) {
    console.warn("[studyflow] generateChatTitle failed:", error);
  }

  return setConversationTitleIfEmpty({
    conversationId: params.conversationId,
    title: provisional,
  });
}
