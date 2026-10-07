import { createOpenAI } from "@ai-sdk/openai";
import { createXai } from "@ai-sdk/xai";
import type { LanguageModel } from "ai";

export function getChatModel(): LanguageModel {
  if (process.env.XAI_API_KEY) {
    const xai = createXai({ apiKey: process.env.XAI_API_KEY });
    return xai(process.env.XAI_MODEL?.trim() || "grok-4-fast-reasoning");
  }

  if (process.env.OPENAI_API_KEY) {
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openai(process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini");
  }

  throw new Error(
    "Missing AI API key. Set XAI_API_KEY (preferred) or OPENAI_API_KEY in .env.local.",
  );
}

export function hasAiCredentials(): boolean {
  return Boolean(process.env.XAI_API_KEY || process.env.OPENAI_API_KEY);
}
