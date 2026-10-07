import {
  isWritingFocusedType,
  parseAssignmentType,
  type AssignmentTypeId,
} from "@/lib/assignment-types";
import type { BuildStepDef, BuildStepId } from "@/lib/build/types";

/** Guideline + type drive the step labels; structure stays Understand → Gather → Plan → Produce. */
export function buildStepsForType(
  assignmentType: string | null | undefined,
): BuildStepDef[] {
  const type = parseAssignmentType(assignmentType);

  const labels = stepLabels(type);
  return [
    {
      id: "understand",
      label: labels.understand,
      tab: "brief",
      mode: "Research",
    },
    {
      id: "gather",
      label: labels.gather,
      tab: isWritingFocusedType(type) ? "research" : "notes",
      mode: isWritingFocusedType(type) ? "Research" : "Notes-only",
    },
    {
      id: "plan",
      label: labels.plan,
      tab: "outline",
      mode: "Outline",
    },
    {
      id: "produce",
      label: labels.produce,
      tab: "draft",
      mode: "Outline",
    },
    {
      id: "handoff",
      label: "Review handoff",
      tab: "draft",
      mode: "Outline",
    },
  ];
}

function stepLabels(type: AssignmentTypeId): Record<
  Exclude<BuildStepId, "handoff">,
  string
> {
  switch (type) {
    case "essay_report":
    case "reading_response":
      return {
        understand: "1 · Understand brief & rubric",
        gather: "2 · Research questions & sources",
        plan: "3 · Outline & claims",
        produce: "4 · Write draft from guideline",
      };
    case "problem_set":
      return {
        understand: "1 · Break down questions",
        gather: "2 · Gather formulas & materials",
        plan: "3 · Solution approach plan",
        produce: "4 · Write worked solutions",
      };
    case "lab":
      return {
        understand: "1 · Prep & safety from guideline",
        gather: "2 · Materials & method notes",
        plan: "3 · Experiment / record plan",
        produce: "4 · Write lab record draft",
      };
    case "coding":
      return {
        understand: "1 · Clarify deliverables",
        gather: "2 · Docs & constraints",
        plan: "3 · Design & milestones",
        produce: "4 · Write code stubs + README",
      };
    case "presentation":
      return {
        understand: "1 · Audience & goal",
        gather: "2 · Research & examples",
        plan: "3 · Slide / talk structure",
        produce: "4 · Write slides & speaker notes",
      };
    case "other":
    default:
      return {
        understand: "1 · Understand from guideline",
        gather: "2 · Gather materials",
        plan: "3 · Plan structure",
        produce: "4 · Write deliverable draft",
      };
  }
}

export function buildSupported(assignmentType?: string | null): boolean {
  // All types supported — guideline is source of truth.
  void assignmentType;
  return true;
}
