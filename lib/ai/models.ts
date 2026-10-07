export type StudyflowModelOption = {
  id: string;
  label: string;
  family: "gpt" | "claude";
  description: string;
};

const GPT_MODEL_ID =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_AI_MODEL_GPT?.trim()) ||
  "gpt-6.1-sol";

const CLAUDE_MODEL_ID =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_AI_MODEL_CLAUDE?.trim()) ||
  "claude-opus-5.5";

/**
 * Model ids are OpenAI-compatible names expected by the mid-station (中轉站).
 * Override via NEXT_PUBLIC_AI_MODEL_GPT / NEXT_PUBLIC_AI_MODEL_CLAUDE if needed.
 */
export const STUDYFLOW_MODELS: StudyflowModelOption[] = [
  {
    id: GPT_MODEL_ID,
    label: "GPT",
    family: "gpt",
    description: "OpenAI GPT via mid-station",
  },
  {
    id: CLAUDE_MODEL_ID,
    label: "Claude",
    family: "claude",
    description: "Anthropic Claude via mid-station",
  },
];

export const DEFAULT_MODEL_ID = STUDYFLOW_MODELS[0]!.id;

export function resolveModelId(candidate: string | undefined | null): string {
  const next = candidate?.trim();
  if (!next) return DEFAULT_MODEL_ID;
  if (/^[a-zA-Z0-9._:-]+$/.test(next)) return next;
  return DEFAULT_MODEL_ID;
}
