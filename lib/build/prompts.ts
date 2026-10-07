import { ASSIGNMENT_TYPE_IDS, typeLabel } from "@/lib/assignment-types";

export const BUILD_SYSTEM = `你是 StudyFlow Build orchestrator：要**實際寫入作業工作流產物**（結構化 JSON），不是只給 tips。

硬規則（必須遵守）：
1. 上傳的 guideline（若有）是權威來源；沒有 guideline 就用 brief／requirements／rubric。
2. 作業類型多元：essay/report、problem set、lab、presentation、reading response、coding、other。依 assignmentType + guideline 推斷交付物，不要硬套 essay。
3. Understand / Gather / Plan：只產 scaffolding（checklist、研究問題、outline／里程碑 stubs），不要完整正文。
4. **Produce 步驟（僅此一步）必須寫出實際可編輯的交付物草稿**——按類型填滿章節正文／解題過程／程式 stub + README／lab 方法與結果骨架／簡報內容與講者備註等。這是 Build 的核心產出，不是 plan card。
5. 不要捏造 DOI、假文獻或假數據；需要引用時標成「[需核實]」並提示學生核對來源。
6. 只輸出 JSON（不要 markdown fence、不要解釋文字）。
7. 語言跟 guideline／brief 走（港大學生常用繁中或英文）。

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
  "requirements": [{"title": string, "done": false, "note": string}],
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
- 此步不要寫完整答案正文（留給 Produce）。`;
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
- 此步仍是結構計畫；完整正文留到 Produce。`;
}

export function producePrompt(ctx: {
  assignmentType: string;
  title: string;
  writing: boolean;
  guidelineText: string;
  question: string | null;
  sections: Array<{ title: string; purpose: string; claimOrPoint?: string }>;
  researchQuestions: string[];
  requirements: Array<{ title: string; note: string; done: boolean }>;
}): string {
  const typeHint = produceTypeHint(ctx.assignmentType);
  const reqList =
    ctx.requirements
      .map(
        (r, i) =>
          `${i + 1}. [${r.done ? "done" : "open"}] ${r.title}${r.note ? ` — ${r.note}` : ""}`,
      )
      .join("\n") || "(none)";

  return `STEP: produce — WRITE THE ACTUAL DELIVERABLE DRAFT (not plan cards)

Assignment type: ${ctx.assignmentType} (${typeLabel(ctx.assignmentType)})
Title: ${ctx.title}
Brief: ${ctx.question ?? "(empty)"}
Writing-focused: ${ctx.writing}

Guideline (authoritative — follow closely):
${ctx.guidelineText.slice(0, 20_000) || "(none — use brief + plan)"}

Brief requirement checklist (mark which ones this draft satisfies):
${reqList}

Research / gather questions:
${ctx.researchQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n") || "(none)"}

Plan sections to expand into the deliverable:
${ctx.sections
  .map(
    (s, i) =>
      `${i + 1}. ${s.title} — ${s.purpose}${s.claimOrPoint ? ` | point: ${s.claimOrPoint}` : ""}`,
  )
  .join("\n") || "(infer structure from guideline)"}

Type-specific output guidance:
${typeHint}

Return JSON:
{
  "title": string,
  "format": "essay" | "problem_set" | "lab" | "coding" | "presentation" | "reading_response" | "other",
  "sections": [{
    "heading": string,
    "body": string
  }],
  "appendix": string | null,
  "satisfiedRequirementTitles": [string],
  "nextAction": string
}

規則：
- **必須寫出完整可編輯草稿**：每個 section 的 body 要有實質內容（段落／解題步驟／程式碼／方法敘述／投影片要點+講者備註），不是一句 stub。
- 嚴格跟 guideline 的要求、字數／題目數、格式、評分點對齊。
- 引用標「[需核實]」；假 DOI／假數據禁止。
- coding：sections 可為檔名（如 main.py、src/App.tsx），body 為可運行或接近可運行的 stub／核心實作；appendix 放 README 步驟。
- presentation：每個 section = 一組投影片；body 用「## Slide N: …」＋要點＋「Speaker notes: …」。
- problem_set：每題一個 section；body 含思路、步驟、最終答案（標明假設）。
- lab：method／results／discussion 等填好可編輯骨架與示例填寫。
- essay／reading_response：結構化章節，每段完整論證草稿（學生之後可改）。
- satisfiedRequirementTitles：列出草稿**已實質覆蓋**的 checklist 標題（必須用上面清單的原標題字串；可多選）。只標真正寫到的項，不要全部亂勾。
- nextAction：學生審閱／修改這份草稿的下一步。`;
}

function produceTypeHint(assignmentType: string): string {
  switch (assignmentType) {
    case "essay_report":
    case "reading_response":
      return "Write structured draft sections with full paragraphs that argue claims from the plan. Match guideline length/tone if stated.";
    case "problem_set":
      return "For each question/problem: worked approach, key formulas, step-by-step reasoning, and a clear final answer. Flag assumptions.";
    case "lab":
      return "Fill method, materials, procedure, results placeholders (sample tables/notes if needed), and discussion skeleton grounded in the guideline.";
    case "coding":
      return "Produce code stubs / core modules matching the guideline deliverables, plus README setup & run steps in appendix.";
    case "presentation":
      return "Slide outline with bullet content and speaker notes for each block. Cover audience goal from guideline.";
    default:
      return "Infer the deliverable from the guideline and write a complete editable draft in sections.";
  }
}
