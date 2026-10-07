import type { WorkflowStep } from "@/lib/types";

/** Assignment kinds — writing is only one option among many. */
export const ASSIGNMENT_TYPE_IDS = [
  "essay_report",
  "problem_set",
  "lab",
  "presentation",
  "reading_response",
  "coding",
  "other",
] as const;

export type AssignmentTypeId = (typeof ASSIGNMENT_TYPE_IDS)[number];

export type AssignmentTypeMeta = {
  id: AssignmentTypeId;
  label: string;
  /** Short hint shown under the selector. */
  hint: string;
  /** True when claim–evidence / essay outline framing is primary. */
  writingFocused: boolean;
  /** Show word-limit / citation fields in create advanced section by default. */
  showWritingFields: boolean;
};

export const ASSIGNMENT_TYPES: AssignmentTypeMeta[] = [
  {
    id: "essay_report",
    label: "Essay / report",
    hint: "Written argument or report with optional citations",
    writingFocused: true,
    showWritingFields: true,
  },
  {
    id: "problem_set",
    label: "Problem set",
    hint: "Questions, calculations, or short answers",
    writingFocused: false,
    showWritingFields: false,
  },
  {
    id: "lab",
    label: "Lab / practical",
    hint: "Experiment, practical, or lab write-up",
    writingFocused: false,
    showWritingFields: false,
  },
  {
    id: "presentation",
    label: "Presentation",
    hint: "Slides, talk, or demo",
    writingFocused: false,
    showWritingFields: false,
  },
  {
    id: "reading_response",
    label: "Reading response",
    hint: "Reflect on readings; light writing, not a full essay",
    writingFocused: true,
    showWritingFields: true,
  },
  {
    id: "coding",
    label: "Coding / project",
    hint: "Code, build, or technical project",
    writingFocused: false,
    showWritingFields: false,
  },
  {
    id: "other",
    label: "Other / custom",
    hint: "No fixed framework — shape the workflow yourself",
    writingFocused: false,
    showWritingFields: false,
  },
];

export function isAssignmentTypeId(value: string | null | undefined): value is AssignmentTypeId {
  return Boolean(value && (ASSIGNMENT_TYPE_IDS as readonly string[]).includes(value));
}

export function parseAssignmentType(
  value: string | null | undefined,
): AssignmentTypeId {
  if (isAssignmentTypeId(value)) return value;
  return "other";
}

export function getAssignmentTypeMeta(
  value: string | null | undefined,
): AssignmentTypeMeta {
  const id = parseAssignmentType(value);
  return ASSIGNMENT_TYPES.find((t) => t.id === id) ?? ASSIGNMENT_TYPES[ASSIGNMENT_TYPES.length - 1]!;
}

export function isWritingFocusedType(value: string | null | undefined): boolean {
  return getAssignmentTypeMeta(value).writingFocused;
}

export type AssignmentTabDef = { label: string; href: string };

/** Tabs adapt by type — keep useful tools, drop essay-only emphasis. */
export function tabsForAssignmentType(
  value: string | null | undefined,
): AssignmentTabDef[] {
  const type = parseAssignmentType(value);

  switch (type) {
    case "essay_report":
    case "reading_response":
      return [
        { label: "Brief", href: "brief" },
        { label: "Notes", href: "notes" },
        { label: "Research", href: "research" },
        { label: "Outline", href: "outline" },
        { label: "Draft", href: "draft" },
        { label: "References", href: "references" },
      ];
    case "presentation":
      return [
        { label: "Brief", href: "brief" },
        { label: "Notes", href: "notes" },
        { label: "Research", href: "research" },
        { label: "Plan", href: "outline" },
        { label: "Build", href: "draft" },
        { label: "References", href: "references" },
      ];
    case "problem_set":
    case "coding":
      return [
        { label: "Brief", href: "brief" },
        { label: "Notes", href: "notes" },
        { label: "Research", href: "research" },
        { label: "Plan", href: "outline" },
        { label: "Work", href: "draft" },
      ];
    case "lab":
      return [
        { label: "Brief", href: "brief" },
        { label: "Notes", href: "notes" },
        { label: "Research", href: "research" },
        { label: "Plan", href: "outline" },
        { label: "Record", href: "draft" },
      ];
    case "other":
    default:
      return [
        { label: "Brief", href: "brief" },
        { label: "Notes", href: "notes" },
        { label: "Research", href: "research" },
        { label: "Plan", href: "outline" },
        { label: "Work", href: "draft" },
        { label: "References", href: "references" },
      ];
  }
}

export function workflowLabelsForType(
  value: string | null | undefined,
): readonly string[] {
  const type = parseAssignmentType(value);
  switch (type) {
    case "essay_report":
    case "reading_response":
      return ["Understand", "Gather evidence", "Plan", "Draft", "Check"] as const;
    case "problem_set":
      return ["Understand", "Gather materials", "Plan approach", "Solve", "Check"] as const;
    case "coding":
      return ["Understand", "Gather materials", "Design", "Build", "Check"] as const;
    case "lab":
      return ["Understand", "Prep", "Plan", "Record", "Check"] as const;
    case "presentation":
      return ["Understand", "Research", "Structure", "Build", "Rehearse"] as const;
    case "other":
    default:
      return ["Understand", "Gather", "Plan", "Produce", "Check"] as const;
  }
}

export function deriveWorkflowStepsForType(
  progress: number,
  value: string | null | undefined,
): WorkflowStep[] {
  const labels = workflowLabelsForType(value);
  const thresholds = [0, 20, 40, 60, 80];
  let currentIdx = 0;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (progress >= thresholds[i]!) {
      currentIdx = i;
      break;
    }
  }
  if (progress >= 100) {
    return labels.map((label) => ({ label, state: "done" as const }));
  }
  return labels.map((label, index) => ({
    label,
    state:
      index < currentIdx ? "done" : index === currentIdx ? "current" : "pending",
  }));
}

export function defaultNextActionForType(
  value: string | null | undefined,
): string {
  const type = parseAssignmentType(value);
  switch (type) {
    case "essay_report":
      return "Read the brief and list what you must verify before drafting";
    case "reading_response":
      return "Skim the reading and note 3 points to respond to";
    case "problem_set":
      return "List each question and what concepts or formulas you need";
    case "coding":
      return "Clarify deliverables, constraints, and a first milestone";
    case "lab":
      return "Note safety/prep steps and what you must record";
    case "presentation":
      return "List the audience goal and 3 key points to cover";
    case "other":
    default:
      return "Clarify what success looks like, then pick the first small step";
  }
}

export function typeLabel(value: string | null | undefined): string {
  return getAssignmentTypeMeta(value).label;
}
