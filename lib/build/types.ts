import type { AssignmentTypeId } from "@/lib/assignment-types";

export type BuildStepId =
  | "understand"
  | "gather"
  | "plan"
  | "produce"
  | "handoff";

export type BuildStepStatus = "pending" | "running" | "done" | "skipped" | "error";

export type BuildStepDef = {
  id: BuildStepId;
  label: string;
  /** Tab to navigate to after this step (href segment). */
  tab: string;
  /** Preferred AI panel mode after step. */
  mode: "Notes-only" | "Research" | "Outline";
};

export type BuildEvent =
  | {
      type: "start";
      assignmentSlug: string;
      assignmentType: AssignmentTypeId;
      steps: Array<{ id: BuildStepId; label: string }>;
      total: number;
    }
  | {
      type: "step_start";
      step: BuildStepId;
      index: number;
      total: number;
      label: string;
      tab: string;
    }
  | {
      type: "step_progress";
      step: BuildStepId;
      message: string;
    }
  | {
      type: "step_done";
      step: BuildStepId;
      index: number;
      total: number;
      label: string;
      tab: string;
      mode: "Notes-only" | "Research" | "Outline";
      summary: string;
      artifacts: string[];
      askPrompt?: string;
    }
  | {
      type: "step_error";
      step: BuildStepId;
      index: number;
      total: number;
      error: string;
    }
  | {
      type: "done";
      cancelled?: boolean;
      progress: number;
      nextAction: string | null;
      askPrompt?: string;
      tab?: string;
      mode?: "Notes-only" | "Research" | "Outline";
    }
  | {
      type: "error";
      error: string;
    };

export type BuildUnderstandResult = {
  nextAction: string;
  question?: string | null;
  requirements?: Array<{ title: string; note: string; done: boolean }>;
  rubric?: Array<{ criterion: string; weight: string }>;
  checklistNote?: string;
  memories?: string[];
};

export type BuildGatherResult = {
  researchQuestions: string[];
  searchQueries: string[];
  gatherNotes?: Array<{ title: string; body: string }>;
  nextAction: string;
};

export type BuildPlanResult = {
  outlineTitle: string;
  /** Sections / milestones / questions — type-flexible. */
  sections: Array<{
    title: string;
    purpose: string;
    claimOrPoint?: string;
  }>;
  claims?: string[];
  nextAction: string;
};

export type BuildProduceSection = {
  heading: string;
  body: string;
};

export type BuildProduceResult = {
  title: string;
  format: string;
  sections: BuildProduceSection[];
  appendix?: string | null;
  /** Brief checklist titles this draft satisfies (exact match preferred). */
  satisfiedRequirementTitles?: string[];
  nextAction: string;
};

/** Notes sourceLabel used for Build-written deliverables shown on Draft/Work. */
export const BUILD_DELIVERABLE_SOURCE = "build-deliverable" as const;
