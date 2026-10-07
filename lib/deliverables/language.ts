/** Detect output language from guideline / brief text. */
export type OutputLanguage = "zh-Hant" | "zh-Hans" | "en";

export function detectOutputLanguage(text: string): OutputLanguage {
  const sample = (text || "").slice(0, 12_000);
  if (/繁體中文|繁体中文|用繁中|以中文撰寫|報告須以中文|以中文撰寫報告|中文撰寫/.test(sample)) {
    return "zh-Hant";
  }
  if (/简体中文|簡體改簡|用简体/.test(sample)) {
    return "zh-Hans";
  }
  if (/written in English|in English only|English only|must be in English|report in English/i.test(sample)) {
    return "en";
  }
  const han = (sample.match(/[\u4e00-\u9fff]/g) || []).length;
  const latin = (sample.match(/[A-Za-z]/g) || []).length;
  if (han > 30 && han >= latin * 0.25) {
    // Prefer Traditional for HK polyU-style briefs
    return "zh-Hant";
  }
  return "en";
}

export function languageInstruction(lang: OutputLanguage): string {
  switch (lang) {
    case "zh-Hant":
      return "OUTPUT LANGUAGE (mandatory): Traditional Chinese (繁體中文). All prose, report sections, GenAI usage notes, and comments meant for markers must be 繁體中文. Code identifiers may stay English.";
    case "zh-Hans":
      return "OUTPUT LANGUAGE (mandatory): Simplified Chinese (简体中文). All prose for markers must be 简体中文. Code identifiers may stay English.";
    default:
      return "OUTPUT LANGUAGE (mandatory): English. All report prose and GenAI usage notes in English.";
  }
}

/** Guess student id token for filenames from guideline naming patterns. */
export function guessStudentIdPlaceholder(text: string, fallback = "STUDENTID"): string {
  const m =
    text.match(/TriangleChecker[_\s]*[<(\[]?\s*([A-Za-z0-9_]+)[>)\]]?/i) ||
    text.match(/student\s*id[^\n]{0,40}?([0-9]{6,12})/i) ||
    text.match(/學號[^\n]{0,20}?([0-9]{6,12})/);
  if (m?.[1] && !/yourStudentID|studentId|學號/i.test(m[1])) {
    return m[1].replace(/[^A-Za-z0-9_-]/g, "").slice(0, 32) || fallback;
  }
  return fallback;
}

export function safeDeliverableBasename(name: string): string {
  const base = name.replace(/\\/g, "/").split("/").pop() || "file";
  return base.replace(/[^\w.\- ()[\]]+/g, "_").slice(0, 180) || "file";
}
