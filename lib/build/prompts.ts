import { ASSIGNMENT_TYPE_IDS, typeLabel } from "@/lib/assignment-types";

export const BUILD_SYSTEM = `你是 StudyFlow Build orchestrator：要**實際寫入作業工作流產物**（結構化 JSON），不是只給 tips。

硬規則（必須遵守）：
1. 上傳的 guideline（若有）是權威來源；沒有 guideline 就用 brief／requirements／rubric。
2. 作業類型多元：essay/report、problem set、lab、presentation、reading response、coding、other。依 assignmentType + guideline 推斷交付物，不要硬套 essay。
3. **禁止**輸出可直接交的完整 essay 正文、完整 lab report、完整程式專案、完整講稿。
4. 你產出的是學生可擁有／可改的 scaffolding：checklist、研究問題、搜尋關鍵字、outline／里程碑、claim 或要點 stubs、draft／work **計畫**（每段目的＋要驗證什麼），不是代寫。
5. 只輸出 JSON（不要 markdown fence、不要解釋文字）。
6. 語言跟 guideline／brief 走（港大學生常用繁中或英文）。

assignmentType 必須是：${ASSIGNMENT_TYPE_IDS.join(" | ")}
`;

export function understandPrompt(ctx: {
  assignmentType: string;
  title: string;
  question: string | null;
  guidelineText: string;
  hasRequirements: boolean;
  hasRubric: boolean;
}): string {
  return `STEP: understand

Assignment type: ${ctx.assignmentType} (${typeLabel(ctx.assignmentType)})
Title: ${ctx.title}
Current brief: ${ctx.question ?? "(empty)"}
Already has requirements: ${ctx.hasRequirements}
Already has rubric: ${ctx.hasRubric}

Guideline / brief text (authoritative):
${ctx.guidelineText.slice(0, 24_000) || "(none — use title/brief only)"}

Return JSON:
{
  "nextAction": string,
  "question": string | null,
  "requirements": [{"title": string, "note": string, "done": false}],
  "rubric": [{"criterion": string, "weight": string}],
  "checklistNote": string,
  "memories": [string]
}

規則：
- 填入／補強 question（交付說明）、requirements（檢查清單）、rubric（若 guideline 有評分準則）。
- memories：2–5 條短事實（來自 guideline，之後 AI 要用）。
- 若已有 requirements／rubric 且完整，可輕量補強，不要無意義重寫。
- nextAction：完成 Understand 後學生該做的第一個小步驟。`;
}

export function gatherPrompt(ctx: {
  assignmentType: string;
  title: string;
  question: string | null;
  guidelineText: string;
  writing: boolean;
}): string {
  return `STEP: gather

Assignment type: ${ctx.assignmentType} (${typeLabel(ctx.assignmentType)})
Title: ${ctx.title}
Brief: ${ctx.question ?? "(empty)"}
Writing-focused: ${ctx.writing}

Guideline excerpt:
${ctx.guidelineText.slice(0, 16_000) || "(none)"}

Return JSON:
{
  "researchQuestions": [string],
  "searchQueries": [string],
  "gatherNotes": [{"title": string, "body": string}],
  "nextAction": string
}

規則：
- writing 類：researchQuestions 3–6 條；searchQueries 2–4 條（給文獻庫用，英文關鍵字較佳若主題是學術英文）。
- 非 writing：researchQuestions 可改為「要釐清／要查找的問題」；searchQueries 可為公式／API／方法關鍵字；gatherNotes 必填 2–4 則「要準備／要讀／要記錄」的筆記骨架。
- 不要捏造文獻 DOI 或假來源。
- 不要寫完整答案。`;
}

export function planPrompt(ctx: {
  assignmentType: string;
  title: string;
  question: string | null;
  guidelineText: string;
  writing: boolean;
  researchQuestions: string[];
}): string {
  return `STEP: plan

Assignment type: ${ctx.assignmentType} (${typeLabel(ctx.assignmentType)})
Title: ${ctx.title}
Brief: ${ctx.question ?? "(empty)"}
Writing-focused: ${ctx.writing}
Research / gather questions already set:
${ctx.researchQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n") || "(none)"}

Guideline excerpt:
${ctx.guidelineText.slice(0, 16_000) || "(none)"}

Return JSON:
{
  "outlineTitle": string,
  "sections": [{"title": string, "purpose": string, "claimOrPoint": string}],
  "claims": [string],
  "nextAction": string
}

規則：
- essay／reading_response：sections = 大綱段落；claims = 3–6 條可辯護主張 stubs（不是完整段落）。
- problem_set：sections = 各題／題組 approach；claims 可空或放「關鍵中間結論」。
- lab：sections = 方法／步驟／數據／討論骨架。
- coding：sections = 模組／里程碑。
- presentation：sections = 簡報區塊。
- other：依 guideline 推斷。
- 每 section 的 purpose 一句話；claimOrPoint 是該段要點／主張 stub。
- 禁止完整正文。`;
}

export function producePrompt(ctx: {
  assignmentType: string;
  title: string;
  writing: boolean;
  sections: Array<{ title: string; purpose: string; claimOrPoint?: string }>;
}): string {
  return `STEP: produce (scaffolding only — NO full deliverable body)

Assignment type: ${ctx.assignmentType} (${typeLabel(ctx.assignmentType)})
Title: ${ctx.title}
Writing-focused: ${ctx.writing}
Plan sections:
${ctx.sections
  .map(
    (s, i) =>
      `${i + 1}. ${s.title} — ${s.purpose}${s.claimOrPoint ? ` | point: ${s.claimOrPoint}` : ""}`,
  )
  .join("\n") || "(none)"}

Return JSON:
{
  "plans": [{
    "section": string,
    "claimOrGoal": string,
    "evidenceOrChecks": string,
    "logicOrVerify": string
  }],
  "nextAction": string
}

規則：
- 為每個主要 section 產出一份 **plan card**（學生自己填寫／撰寫時用）。
- claimOrGoal：該段目標或主張 stub（短）。
- evidenceOrChecks：要找的證據／要跑的測試／要記錄的數據（短條列文字）。
- logicOrVerify：完成後要檢查什麼。
- **絕對不要**寫可直接交的長段落、完整程式、完整實驗報告。
- nextAction：學生動手寫／解／做時的下一步。`;
}
