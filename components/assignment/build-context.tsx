"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { BuildEvent, BuildStepId } from "@/lib/build/types";

export type BuildStepRow = {
  id: BuildStepId;
  label: string;
  status: "pending" | "running" | "done" | "error";
  message?: string;
  artifacts?: string[];
};

export type BuildSessionState = {
  running: boolean;
  open: boolean;
  steps: BuildStepRow[];
  statusLine: string | null;
  error: string | null;
  doneNote: string | null;
  progressPct: number;
  finished: boolean;
  cancelled: boolean;
  produceTab: string;
  produceTabLabel: string;
  hasGuideline: boolean;
  assignmentSlug: string;
  start: () => void;
  cancel: () => void;
  dismiss: () => void;
};

const BuildContext = React.createContext<BuildSessionState | null>(null);

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

export function BuildProvider({
  assignmentSlug,
  hasGuideline,
  produceTabLabel = "Draft",
  children,
}: {
  assignmentSlug: string;
  hasGuideline: boolean;
  produceTabLabel?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [running, setRunning] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [steps, setSteps] = React.useState<BuildStepRow[]>([]);
  const [statusLine, setStatusLine] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [doneNote, setDoneNote] = React.useState<string | null>(null);
  const [progressPct, setProgressPct] = React.useState(0);
  const [finished, setFinished] = React.useState(false);
  const [cancelled, setCancelled] = React.useState(false);
  const [produceTab, setProduceTab] = React.useState("draft");
  const abortRef = React.useRef<AbortController | null>(null);
  const runningRef = React.useRef(false);

  const dismiss = React.useCallback(() => {
    if (runningRef.current) return;
    setOpen(false);
  }, []);

  const cancel = React.useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    runningRef.current = false;
    setRunning(false);
    setCancelled(true);
    setStatusLine("Cancelled");
    setDoneNote("Build cancelled");
  }, []);

  const start = React.useCallback(async () => {
    if (runningRef.current) return;

    if (!hasGuideline) {
      const ok = window.confirm(
        "No guideline uploaded yet. Build works best from your assignment guideline.\n\nContinue anyway with whatever brief text is available?",
      );
      if (!ok) return;
    }

    runningRef.current = true;
    setOpen(true);
    setRunning(true);
    setError(null);
    setDoneNote(null);
    setFinished(false);
    setCancelled(false);
    setProgressPct(0);
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
            setStatusLine(
              `Scaffolding ${event.assignmentType.replace(/_/g, " ")} · ${event.total} steps`,
            );
            setProgressPct(0);
          }

          if (event.type === "step_start") {
            setSteps((prev) =>
              prev.map((s) =>
                s.id === event.step
                  ? { ...s, status: "running", message: undefined }
                  : s,
              ),
            );
            setStatusLine(
              `Step ${event.index}/${event.total}: ${event.label}`,
            );
            setProgressPct(
              Math.round(((event.index - 1) / event.total) * 100),
            );
            // Keep progress UI visible; still follow the tab Build is driving.
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
            setProgressPct(Math.round((event.index / event.total) * 100));
            if (event.tab === "draft" || event.step === "produce") {
              setProduceTab(event.tab);
            }
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
            const wasCancelled = Boolean(event.cancelled);
            setCancelled(wasCancelled);
            setFinished(true);
            setProgressPct(event.progress);
            const note = wasCancelled
              ? `Build cancelled · progress ${event.progress}%`
              : "Scaffold ready — fill plan cards yourself; AI won't write the full deliverable.";
            setDoneNote(note);
            setStatusLine(
              wasCancelled
                ? note
                : `Build finished · progress ${event.progress}%`,
            );
            if (event.tab) {
              setProduceTab(event.tab);
              router.push(`/assignments/${assignmentSlug}/${event.tab}`);
            }
            router.refresh();
            if (event.askPrompt && !wasCancelled) {
              openAiWithPrompt(event.askPrompt, event.mode);
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error)?.name === "AbortError") {
        setCancelled(true);
        setFinished(true);
        setStatusLine("Cancelled");
        setDoneNote("Build cancelled");
      } else {
        const message = err instanceof Error ? err.message : "Build failed";
        setError(message);
        setStatusLine(message);
        setFinished(true);
      }
    } finally {
      runningRef.current = false;
      setRunning(false);
      abortRef.current = null;
    }
  }, [assignmentSlug, hasGuideline, router]);

  React.useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const value = React.useMemo<BuildSessionState>(
    () => ({
      running,
      open,
      steps,
      statusLine,
      error,
      doneNote,
      progressPct,
      finished,
      cancelled,
      produceTab,
      produceTabLabel,
      hasGuideline,
      assignmentSlug,
      start,
      cancel,
      dismiss,
    }),
    [
      running,
      open,
      steps,
      statusLine,
      error,
      doneNote,
      progressPct,
      finished,
      cancelled,
      produceTab,
      produceTabLabel,
      hasGuideline,
      assignmentSlug,
      start,
      cancel,
      dismiss,
    ],
  );

  return (
    <BuildContext.Provider value={value}>{children}</BuildContext.Provider>
  );
}

export function useBuildSession(): BuildSessionState {
  const ctx = React.useContext(BuildContext);
  if (!ctx) {
    throw new Error("useBuildSession must be used within BuildProvider");
  }
  return ctx;
}

/** Optional — panel can render outside provider safely during SSR edge cases. */
export function useBuildSessionOptional(): BuildSessionState | null {
  return React.useContext(BuildContext);
}
