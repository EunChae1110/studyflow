import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import { resolveModelId } from "@/lib/ai/models";

/**
 * StudyFlow talks to an OpenAI-compatible mid-station (中轉站), not direct OpenAI/xAI.
 * Credentials: AI_BASE_URL + AI_API_KEY (aliases: OPENAI_BASE_URL / OPENAI_API_KEY).
 */
export function getMidStationConfig() {
  const baseURL = (
    process.env.AI_BASE_URL ||
    process.env.OPENAI_BASE_URL ||
    ""
  ).trim();
  const apiKey = (
    process.env.AI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    ""
  ).trim();

  return { baseURL, apiKey };
}

export function hasAiCredentials(): boolean {
  const { baseURL, apiKey } = getMidStationConfig();
  return Boolean(baseURL && apiKey);
}

export function getChatModel(modelId?: string | null): LanguageModel {
  const { baseURL, apiKey } = getMidStationConfig();

  if (!baseURL || !apiKey) {
    throw new Error(
      "Missing AI mid-station config. Set AI_BASE_URL and AI_API_KEY (or OPENAI_BASE_URL / OPENAI_API_KEY) in .env.local.",
    );
  }

  const openai = createOpenAI({
    apiKey,
    baseURL,
  });

  // Mid-stations (中轉站) almost always expose chat completions, not Responses.
  return openai.chat(resolveModelId(modelId));
}
