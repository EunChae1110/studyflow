import { generateText } from "ai";
import { getSession } from "@/lib/auth/session";
import { resolveModelId } from "@/lib/ai/models";
import { getChatModel, hasAiCredentials } from "@/lib/ai/provider";
import {
  ASSIGNMENT_TYPE_IDS,
  parseAssignmentType,
} from "@/lib/assignment-types";
import {
  extractGuidelineText,
  resolveMime,
  validateGuidelineFile,
} from "@/lib/guidelines/extract";
import { getGuidelineTextsForAssignment } from "@/lib/guidelines/store";
import { getAssignmentBySlug } from "@/lib/db/queries";

export const maxDuration = 60;

type SuggestResult = {
  title?: string | null;
  question?: string | null;
  assignmentType?: string | null;
  wordLimit?: string | null;
  citationStyle?: string | null;
  nextAction?: string | null;
  requirements?: Array<{ title: string; note: string; done?: boolean }>;
  rubric?: Array<{ criterion: string; weight: string }>;
};

const SUGGEST_SYSTEM = `你是 StudyFlow 的作業 brief 解析助手。

規則：
- 作業類型多元，沒有特定框架。可能是 essay/report、problem set、lab、presentation、reading response、coding/project、或其他。
- 不要預設一定是寫報告或 essay。只有當 guideline 明確是寫作類時，才建議 essay_report / reading_response，並才填 wordLimit / citationStyle。
- 從 guideline 抽出：title、question（題目／交付說明）、assignmentType、requirements（檢查清單）、rubric（若有）、nextAction（第一個小步驟）、以及僅在相關時的 wordLimit / citationStyle。
- 用學生可用的簡潔英文或繁中（跟 guideline 語言走）。
- 只輸出 JSON，不要 markdown fence。

assignmentType 必須是以下之一：
${ASSIGNMENT_TYPE_IDS.join(" | ")}

JSON shape:
{
  "title": string | null,
  "question": string | null,
  "assignmentType": string,
  "wordLimit": string | null,
  "citationStyle": string | null,
  "nextAction": string | null,
  "requirements": [{"title": string, "note": string, "done": false}],
  "rubric": [{"criterion": string, "weight": string}]
}`;

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("Model did not return JSON");
  }
}

function normalizeSuggest(raw: unknown, hintType: string | null): SuggestResult {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const requirements = Array.isArray(obj.requirements)
    ? obj.requirements
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const row = item as Record<string, unknown>;
          const title = String(row.title ?? "").trim();
          if (!title) return null;
          return {
            title: title.slice(0, 240),
            note: String(row.note ?? "").trim().slice(0, 500),
            done: false,
          };
        })
        .filter(Boolean)
        .slice(0, 40)
    : [];
  const rubric = Array.isArray(obj.rubric)
    ? obj.rubric
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const row = item as Record<string, unknown>;
          const criterion = String(row.criterion ?? "").trim();
          if (!criterion) return null;
          return {
            criterion: criterion.slice(0, 240),
            weight: String(row.weight ?? "").trim().slice(0, 64) || "—",
          };
        })
        .filter(Boolean)
        .slice(0, 40)
    : [];

  const type = parseAssignmentType(
    String(obj.assignmentType ?? hintType ?? "other"),
  );

  return {
    title: obj.title ? String(obj.title).trim().slice(0, 255) : null,
    question: obj.question ? String(obj.question).trim().slice(0, 8000) : null,
    assignmentType: type,
    wordLimit: obj.wordLimit ? String(obj.wordLimit).trim().slice(0, 64) : null,
    citationStyle: obj.citationStyle
      ? String(obj.citationStyle).trim().slice(0, 64)
      : null,
    nextAction: obj.nextAction
      ? String(obj.nextAction).trim().slice(0, 500)
      : null,
    requirements: requirements as SuggestResult["requirements"],
    rubric: rubric as SuggestResult["rubric"],
  };
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasAiCredentials()) {
    return Response.json(
      { error: "AI mid-station is not configured." },
      { status: 503 },
    );
  }

  const contentType = req.headers.get("content-type") ?? "";
  let guidelineText = "";
  let hintType: string | null = null;
  let existingTitle: string | null = null;

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    hintType = String(form.get("assignmentType") ?? "").trim() || null;
    const file = form.get("guideline");
    if (!(file instanceof File) || file.size <= 0) {
      return Response.json(
        { error: "Choose a PDF, DOCX, TXT, or Markdown file." },
        { status: 400 },
      );
    }
    const validationError = validateGuidelineFile(file);
    if (validationError) {
      return Response.json({ error: validationError }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = resolveMime(file);
    const extracted = await extractGuidelineText(buffer, mime, file.name);
    if (!extracted.text?.trim()) {
      return Response.json(
        {
          error:
            extracted.error ??
            "Could not extract text from the guideline file.",
        },
        { status: 422 },
      );
    }
    guidelineText = extracted.text.trim();
  } else {
    const body = (await req.json()) as {
      assignmentSlug?: string;
      assignmentType?: string;
      text?: string;
    };
    hintType = body.assignmentType?.trim() || null;
    if (body.text?.trim()) {
      guidelineText = body.text.trim();
    } else if (body.assignmentSlug) {
      const assignment = await getAssignmentBySlug(
        body.assignmentSlug,
        session.userId,
      );
      if (!assignment) {
        return Response.json({ error: "Assignment not found." }, { status: 404 });
      }
      existingTitle = assignment.title;
      hintType = hintType || assignment.assignmentType || null;
      const docs = await getGuidelineTextsForAssignment(
        assignment.id,
        session.userId,
      );
      if (!docs.length) {
        return Response.json(
          {
            error:
              "No guideline text on this assignment. Upload a guideline first.",
          },
          { status: 422 },
        );
      }
      guidelineText = docs
        .map((d) => `### ${d.originalName}\n${d.text}`)
        .join("\n\n")
        .slice(0, 28_000);
    } else {
      return Response.json(
        { error: "Provide a guideline file or assignmentSlug." },
        { status: 400 },
      );
    }
  }

  const clipped = guidelineText.slice(0, 28_000);
  const userPrompt = [
    hintType ? `User-selected type hint (may be wrong): ${hintType}` : null,
    existingTitle ? `Current title: ${existingTitle}` : null,
    "Guideline text:",
    clipped,
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const { text } = await generateText({
      model: getChatModel(resolveModelId(undefined)),
      system: SUGGEST_SYSTEM,
      prompt: userPrompt,
      temperature: 0.2,
    });
    const parsed = extractJsonObject(text);
    const result = normalizeSuggest(parsed, hintType);
    return Response.json(result);
  } catch (error) {
    console.warn("[studyflow] suggest-from-guideline failed:", error);
    return Response.json(
      { error: "AI could not parse this guideline. Try again or fill manually." },
      { status: 502 },
    );
  }
}
