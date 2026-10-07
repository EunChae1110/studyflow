"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Hammer, Loader2, Square, X } from "lucide-react";
import type { BuildEvent, BuildStepId } from "@/lib/build/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StepRow = {
  id: BuildStepId;
  label: string;
  status: "pending" | "running" | "done" | "error";
  message?: string;
  artifacts?: string[];
};

type BuildRunnerProps = {
  assignmentSlug: string;
  /** Compact = header button; panel = brief card with live log. */
  variant?: "header" | "panel";
  className?: string;
};

function openAiWithPrompt(
  prompt: string,
  mode?: "Notes-only" | "Research" | "Outline",
) {
  window.dispatchEvent(new CustomEvent("studyflow:open-ai"));
  if (mode) {
    window.dispatchEvent(
      new CustomEvent("studyflow:set-mode", { detail: { mode } }),
    );
  }
  window.dispatchEvent(
    new CustomEvent("studyflow:ask-ai", { detail: { prompt } }),
  );
}

export function BuildRunner({
  assignmentSlug,
  variant = "panel",
  className,
}: BuildRunnerProps) {
  const router = useRouter();
  const [running, setRunning] = React.useState(false);
  const [steps, setSteps] = React.useState<StepRow[]>([]);
  const [statusLine, setStatusLine] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [doneNote, setDoneNote] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  const cancel = React.useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setRunning(false);
    setStatusLine("Cancelled");
  }, []);

  const start = React.useCallback(async () => {
    if (running) return;
    setOpen(true);
    setRunning(true);
    setError(null);
    setDoneNote(null);
    setStatusLine("Starting Build…");
    setSteps([]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/assignments/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentSlug }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(json.error ?? `Build failed (${res.status})`);
      }
      if (!res.body) throw new Error("No response stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          let event: BuildEvent;
          try {
            event = JSON.parse(trimmed) as BuildEvent;
          } catch {
            continue;
          }

          if (event.type === "start") {
            setSteps(
              event.steps.map((s) => ({
                id: s.id,
                label: s.label,
                status: "pending",
              })),
            );
            setStatusLine(`Building ${event.assignmentType} · ${event.total} steps`);
          }

          if (event.type === "step_start") {
            setSteps((prev) =>
              prev.map((s) =>
                s.id === event.step
                  ? { ...s, status: "running", message: undefined }
                  : s,
              ),
            );
            setStatusLine(`Building… step ${event.index}/${event.total}: ${event.label}`);
            // Navigate so the student sees the tab Build is driving.
            router.push(`/assignments/${assignmentSlug}/${event.tab}`);
          }

          if (event.type === "step_progress") {
            setSteps((prev) =>
              prev.map((s) =>
                s.id === event.step ? { ...s, message: event.message } : s,
              ),
            );
            setStatusLine(event.message);
          }

          if (event.type === "step_done") {
            setSteps((prev) =>
              prev.map((s) =>
                s.id === event.step
                  ? {
                      ...s,
                      status: "done",
                      message: event.summary,
                      artifacts: event.artifacts,
                    }
                  : s,
              ),
            );
            setStatusLine(`Done · ${event.label}`);
            router.push(`/assignments/${assignmentSlug}/${event.tab}`);
            router.refresh();
            if (event.askPrompt) {
              openAiWithPrompt(event.askPrompt, event.mode);
            }
          }

          if (event.type === "step_error") {
            setSteps((prev) =>
              prev.map((s) =>
                s.id === event.step
                  ? { ...s, status: "error", message: event.error }
                  : s,
              ),
            );
            setStatusLine(`Error on ${event.step}: ${event.error}`);
          }

          if (event.type === "error") {
            setError(event.error);
            setStatusLine(event.error);
          }

          if (event.type === "done") {
            const note = event.cancelled
              ? `Build cancelled · progress ${event.progress}%`
              : `Build finished · progress ${event.progress}%`;
            setDoneNote(note);
            setStatusLine(note);
            if (event.tab) {
              router.push(`/assignments/${assignmentSlug}/${event.tab}`);
            }
            router.refresh();
            if (event.askPrompt && !event.cancelled) {
              openAiWithPrompt(event.askPrompt, event.mode);
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error)?.name === "AbortError") {
        setStatusLine("Cancelled");
        setDoneNote("Build cancelled");
      } else {
        const message = err instanceof Error ? err.message : "Build failed";
        setError(message);
        setStatusLine(message);
      }
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  }, [assignmentSlug, router, running]);

  React.useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  if (variant === "header") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          type="button"
          size="sm"
          onClick={start}
          disabled={running}
          className="gap-1.5"
        >
          {running ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Hammer className="size-3.5" />
          )}
          {running ? "Building…" : "Build"}
        </Button>
        {running ? (
          <Button type="button" size="sm" variant="outline" onClick={cancel}>
            <Square className="size-3.5" />
            Cancel
          </Button>
        ) : null}
        {(open || running) && statusLine ? (
          <span className="hidden max-w-[220px] truncate text-xs text-muted sm:inline">
            {statusLine}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Hammer className="size-4 text-primary" />
            Build
          </h3>
          <p className="mt-1 text-xs text-muted">
            AI drives the workflow from your guideline — fills brief, gather,
            plan, and produce scaffolding. Never dumps a full deliverable.
          </p>
        </div>
        <div className="flex gap-2">
          {running ? (
            <Button type="button" size="sm" variant="outline" onClick={cancel}>
              <Square className="size-3.5" />
              Cancel
            </Button>
          ) : (
            <Button type="button" size="sm" onClick={start}>
              <Hammer className="size-3.5" />
              Build
            </Button>
          )}
          {open && !running ? (
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Dismiss"
              onClick={() => setOpen(false)}
            >
              <X className="size-3.5" />
            </Button>
          ) : null}
        </div>
      </div>

      {(running || open) && (statusLine || steps.length > 0) ? (
        <div className="mt-3 space-y-2">
          {statusLine ? (
            <p className="flex items-center gap-2 text-xs font-medium text-foreground">
              {running ? <Loader2 className="size-3.5 animate-spin" /> : null}
              {statusLine}
            </p>
          ) : null}
          <ul className="space-y-1.5">
            {steps.map((s) => (
              <li
                key={s.id}
                className={cn(
                  "rounded-lg border px-2.5 py-2 text-xs",
                  s.status === "running" &&
                    "border-primary/40 bg-primary-soft/40",
                  s.status === "done" &&
                    "border-emerald-500/30 bg-emerald-500/5",
                  s.status === "error" && "border-destructive/40 bg-destructive/5",
                  s.status === "pending" && "border-border bg-surface-muted/50",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{s.label}</span>
                  <span className="text-[10px] uppercase tracking-wide text-muted">
                    {s.status}
                  </span>
                </div>
                {s.message ? (
                  <p className="mt-0.5 text-muted">{s.message}</p>
                ) : null}
                {s.artifacts?.length ? (
                  <p className="mt-0.5 text-muted">
                    Wrote: {s.artifacts.join(" · ")}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      ) : null}
      {doneNote ? (
        <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
          {doneNote}
        </p>
      ) : null}
    </div>
  );
}
