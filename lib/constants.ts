import type { WorkflowStep } from "@/lib/types";

/** Static UI chrome — not content/mock data. */
export const assignmentTabs = [
  { label: "Brief", href: "brief" },
  { label: "Notes", href: "notes" },
  { label: "Research", href: "research" },
  { label: "Outline", href: "outline" },
  { label: "Draft", href: "draft" },
  { label: "References", href: "references" },
] as const;

export const WORKFLOW_STEP_LABELS = [
  "Understand",
  "Gather evidence",
  "Plan",
  "Draft",
  "Check",
] as const;

/** Default stepper labels; state is derived from assignment progress when available. */
export const workflowSteps: WorkflowStep[] = WORKFLOW_STEP_LABELS.map((label) => ({
  label,
  state: "pending" as const,
}));

export function deriveWorkflowSteps(progress: number): WorkflowStep[] {
  const thresholds = [0, 20, 40, 60, 80];
  let currentIdx = 0;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (progress >= thresholds[i]!) {
      currentIdx = i;
      break;
    }
  }
  if (progress >= 100) {
    return WORKFLOW_STEP_LABELS.map((label) => ({ label, state: "done" as const }));
  }
  return WORKFLOW_STEP_LABELS.map((label, index) => ({
    label,
    state: index < currentIdx ? "done" : index === currentIdx ? "current" : "pending",
  }));
}

export const sourceKinds = [
  { label: "Lecture notes", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  {
    label: "External research",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  {
    label: "AI summary",
    color: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  },
  {
    label: "Source quote",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  {
    label: "Student content",
    color: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
  },
  {
    label: "Student-verified evidence",
    color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  },
] as const;

export const APP_TAGLINE =
  "Turn every assignment into a clear, evidence-based workflow.";

export const EMPTY_STUDENT_PROFILE = {
  name: "Student",
  initials: "?",
  tagline: APP_TAGLINE,
} as const;
