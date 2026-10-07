import "server-only";
import { spawn } from "child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Very small markdown → HTML (headings, lists, code fences, paragraphs). */
export function markdownToHtml(md: string, title: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let inCode = false;
  let codeBuf: string[] = [];
  let inUl = false;

  const closeUl = () => {
    if (inUl) {
      out.push("</ul>");
      inUl = false;
    }
  };

  for (const raw of lines) {
    const line = raw;
    if (line.trim().startsWith("```")) {
      if (inCode) {
        out.push(`<pre><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
        codeBuf = [];
        inCode = false;
      } else {
        closeUl();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }
    if (/^#{1,3}\s+/.test(line)) {
      closeUl();
      const level = line.match(/^#+/)![0].length;
      const text = escapeHtml(line.replace(/^#{1,3}\s+/, ""));
      out.push(`<h${level}>${text}</h${level}>`);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      if (!inUl) {
        out.push("<ul>");
        inUl = true;
      }
      out.push(`<li>${escapeHtml(line.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    }
    closeUl();
    if (!line.trim()) {
      out.push("");
      continue;
    }
    out.push(`<p>${escapeHtml(line)}</p>`);
  }
  closeUl();
  if (inCode) {
    out.push(`<pre><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
  }

  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  @page { margin: 18mm; }
  body {
    font-family: "PingFang TC", "Hiragino Sans GB", "Noto Sans TC",
      "Microsoft JhengHei", "Songti TC", "Arial Unicode MS", sans-serif;
    font-size: 11pt; line-height: 1.55; color: #111;
  }
  h1 { font-size: 18pt; margin: 0 0 12pt; }
  h2 { font-size: 14pt; margin: 16pt 0 8pt; border-bottom: 1px solid #ddd; padding-bottom: 4pt; }
  h3 { font-size: 12pt; margin: 12pt 0 6pt; }
  pre {
    background: #f5f5f7; border: 1px solid #e5e5ea; border-radius: 6px;
    padding: 10px; font-size: 9pt; white-space: pre-wrap; word-break: break-word;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 9.5pt; }
  ul { padding-left: 1.2em; }
  p { margin: 0 0 8pt; }
</style>
</head>
<body>
${out.join("\n")}
</body>
</html>`;
}

function run(
  cmd: string,
  args: string[],
  timeoutMs = 60_000,
): Promise<{ code: number; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      resolve({ code: 1, stderr: stderr || "timeout" });
    }, timeoutMs);
    child.stderr?.on("data", (d) => {
      stderr += String(d);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code: code ?? 1, stderr });
    });
  });
}

const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

/**
 * Render markdown to PDF via headless Chrome (CJK-capable system fonts).
 * Falls back to null if Chrome is unavailable.
 */
export async function markdownToPdfBuffer(
  markdown: string,
  title: string,
): Promise<Buffer | null> {
  const dir = await mkdtemp(path.join(tmpdir(), "studyflow-pdf-"));
  const htmlPath = path.join(dir, "report.html");
  const pdfPath = path.join(dir, "report.pdf");
  try {
    const html = markdownToHtml(markdown, title);
    await writeFile(htmlPath, html, "utf8");
    const fileUrl = `file://${htmlPath}`;
    const result = await run(CHROME, [
      "--headless=new",
      "--disable-gpu",
      "--no-pdf-header-footer",
      `--print-to-pdf=${pdfPath}`,
      fileUrl,
    ]);
    if (result.code !== 0) {
      console.warn("[studyflow] chrome pdf failed:", result.stderr.slice(0, 400));
      return null;
    }
    return await readFile(pdfPath);
  } catch (err) {
    console.warn("[studyflow] markdownToPdfBuffer failed:", err);
    return null;
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}

export async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}
