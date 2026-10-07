export function mimeForFilename(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".java")) return "text/x-java-source";
  if (lower.endsWith(".py")) return "text/x-python";
  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return "text/typescript";
  if (lower.endsWith(".js") || lower.endsWith(".jsx")) return "text/javascript";
  if (lower.endsWith(".c") || lower.endsWith(".h")) return "text/x-c";
  if (lower.endsWith(".cpp") || lower.endsWith(".cc")) return "text/x-c++src";
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "text/markdown";
  if (lower.endsWith(".txt")) return "text/plain";
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".zip")) return "application/zip";
  if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html";
  if (lower.endsWith(".json")) return "application/json";
  return "application/octet-stream";
}

export function kindForFilename(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".zip")) return "zip";
  if (lower.endsWith(".pdf") || /report/i.test(lower)) return "report";
  if (/\.(java|py|ts|tsx|js|jsx|c|cpp|h|cs|go|rs|kt|swift)$/.test(lower)) return "code";
  if (/genai|ai.?usage|使用紀錄|使用记录/i.test(lower)) return "genai";
  if (/test|evidence|測試|测试/i.test(lower)) return "evidence";
  return "source";
}
