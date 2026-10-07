"use client";

import * as React from "react";
import Link from "next/link";
import {
  Check,
  Circle,
  Hammer,
  Loader2,
  Square,
  X,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import {
  useBuildSession,
  type BuildStepRow,
} from "@/components/assignment/build-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BuildRunnerProps = {
  /** Compact = header button + floating overlay; panel = brief card. */
  variant?: "header" | "panel";
  className?: string;
};

function StepIcon({ status }: { status: BuildStepRow["status"] }) {
  if (status === "done") {
    return (
      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-600 text-white">
        <Check className="size-3" />
      </span>
    );
  }
  if (status === "running") {
    return <Loader2 className="size-5 shrink-0 animate-spin text-primary" />;
  }
  if (status === "error") {
    return (
      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-destructive/15 text-destructive">
        <X className="size-3" />
      </span>
    );
  }
  return <Circle className="size-5 shrink-0 text-muted" />;
}

function ProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

function StepList({ steps }: { steps: BuildStepRow[] }) {
  if (steps.length === 0) return null;
  return (
    <ul className="space-y-1.5">
      {steps.map((s) => (
        <li
          key={s.id}
          className={cn(
            "rounded-lg border px-2.5 py-2 text-xs transition-colors",
            s.status === "running" && "border-primary/40 bg-primary-soft/40",
            s.status === "done" && "border-emerald-500/30 bg-emerald-500/5",
            s.status === "error" && "border-destructive/40 bg-destructive/5",
            s.status === "pending" && "border-border bg-surface-muted/50",
          )}
        >
          <div className="flex items-start gap-2">
            <StepIcon status={s.status} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground">{s.label}</span>
                <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted">
                  {s.status === "running"
                    ? "active"
                    : s.status === "done"
                      ? "done"
                      : s.status}
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
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function BuildProgressBody({
  compact = false,
}: {
  compact?: boolean;
}) {
  const {
    running,
    steps,
    statusLine,
    error,
    doneNote,
    progressPct,
    finished,
    cancelled,
    produceTab,
    produceTabLabel,
    assignmentSlug,
    hasGuideline,
    cancel,
    dismiss,
  } = useBuildSession();

  return (
    <div className={cn("space-y-3", compact && "space-y-2.5")}>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-medium text-foreground">
            {running
              ? "Writing assignment…"
              : finished && !cancelled
                ? "Deliverable ready"
                : finished && cancelled
                  ? "Build cancelled"
                  : "Build progress"}
          </span>
          <span className="tabular-nums text-muted">{progressPct}%</span>
        </div>
        <ProgressBar value={progressPct} />
      </div>

      {!hasGuideline && running ? (
        <p className="flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 size-3 shrink-0" />
          Running without a guideline — results may be thinner.
        </p>
      ) : null}

      {statusLine ? (
        <p className="flex items-center gap-2 text-xs font-medium text-foreground">
          {running ? <Loader2 className="size-3.5 shrink-0 animate-spin" /> : null}
          <span className="min-w-0">{statusLine}</span>
        </p>
      ) : null}

      <StepList steps={steps} />

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {doneNote && finished && !cancelled ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2.5 text-xs">
          <p className="font-medium text-emerald-800 dark:text-emerald-300">
            {doneNote}
          </p>
          <p className="mt-1 text-muted">
            Open {produceTabLabel} to read the written deliverable. Matching Brief
            checklist items are marked done — revise before you submit.
          </p>
          <Link
            href={`/assignments/${assignmentSlug}/${produceTab}`}
            className="mt-2 inline-flex items-center gap-1 font-medium text-primary hover:underline"
            onClick={dismiss}
          >
            Go to {produceTabLabel}
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      ) : null}

      {doneNote && cancelled ? (
        <p className="text-xs text-muted">{doneNote}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {running ? (
          <Button type="button" size="sm" variant="outline" onClick={cancel}>
            <Square className="size-3.5" />
            Cancel
          </Button>
        ) : finished ? (
          <Button type="button" size="sm" variant="ghost" onClick={dismiss}>
            Dismiss
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/** Fixed overlay — stays visible while Build navigates between tabs. */
function BuildFloatingPanel() {
  const { open, running, dismiss } = useBuildSession();
  if (!open) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-3 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:justify-end sm:p-0"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto w-full max-w-md rounded-xl border border-border bg-surface p-4 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Hammer className="size-4 text-primary" />
              Build
            </h3>
            <p className="mt-0.5 text-[11px] text-muted">
              Understand → Gather → Plan → Write deliverable. Tabs update as each
              step finishes.
            </p>
          </div>
          {!running ? (
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Dismiss Build panel"
              onClick={dismiss}
            >
              <X className="size-3.5" />
            </Button>
          ) : null}
        </div>
        <BuildProgressBody compact />
      </div>
    </div>
  );
}

export function BuildRunner({
  variant = "panel",
  className,
}: BuildRunnerProps) {
  const { running, start, cancel, hasGuideline } = useBuildSession();

  if (variant === "header") {
    return (
      <>
        <div className={cn("flex items-center gap-2", className)}>
          <Button
            type="button"
            size="sm"
            onClick={start}
            disabled={running}
            className="gap-1.5"
            title={
              hasGuideline
                ? "Write assignment from guideline"
                : "Build (no guideline uploaded yet)"
            }
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
        </div>
        <BuildFloatingPanel />
      </>
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
            One click runs Understand → Gather → Plan → Write deliverable from
            your guideline. The draft lands on Work / Draft and matching Brief
            checklist items are ticked. Progress stays visible while tabs update.
          </p>
          {!hasGuideline ? (
            <p className="mt-2 flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 size-3 shrink-0" />
              Upload a guideline first for better results (you'll get a soft
              warn if you Build without one).
            </p>
          ) : null}
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
        </div>
      </div>

      <p className="mt-3 text-[11px] text-muted">
        Progress appears in the floating Build panel (bottom-right) so it stays
        visible while tabs update.
      </p>
    </div>
  );
}
