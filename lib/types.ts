export type CitationKind =
  | "lecture-notes"
  | "external-research"
  | "ai-summary"
  | "source-quote"
  | "student-content"
  | "student-verified-evidence";

export type Citation = {
  source: string;
  page: string;
  kind: CitationKind;
};

export type StudentProfile = {
  id?: string;
  name: string;
  initials: string;
  tagline: string | null;
};

export type RequirementItem = {
  title: string;
  note: string;
  done: boolean;
};

export type RubricItem = {
  criterion: string;
  weight: string;
};

export type WorkflowStepState = "done" | "current" | "pending";

export type WorkflowStep = {
  label: string;
  state: WorkflowStepState;
};

export type DeadlineItem = {
  slug: string;
  title: string;
  course: string;
  due: string;
  dueAt: Date | null;
  urgency: "danger" | "warning" | "success";
  daysLeft: string;
  progress: number;
};

export type ResearchSourceItem = {
  id: string;
  title: string;
  authors: string | null;
  venue: string | null;
  year: number | null;
  doi: string | null;
  url: string | null;
  verified: boolean;
  openAccess: boolean;
  selected: boolean;
};

export type ReferenceItem = {
  id: string;
  source: string;
  title: string;
  type: string | null;
  year: string | null;
  doi: string | null;
  status: string;
};

export type CourseMaterialItem = {
  id: string;
  title: string;
  pages: number | null;
  status: string;
};

export type ResearchQuestionItem = {
  id: string;
  title: string;
  active: boolean;
};

export type AssignmentDetail = {
  id: string;
  slug: string;
  title: string;
  course: string;
  wordLimit: string | null;
  citationStyle: string | null;
  due: string;
  dueAt: Date | null;
  progress: number;
  supportMode: string | null;
  question: string | null;
  nextAction: string | null;
  requirements: RequirementItem[];
  rubric: RubricItem[];
  status: string;
};

export type DashboardStat = {
  label: string;
  value: string;
  meta: string;
};

export type WeeklyProgressPoint = {
  day: string;
  progress: number;
};


export type AssignmentListItem = {
  id: string;
  slug: string;
  title: string;
  course: string;
  due: string;
  progress: number;
  nextAction?: string | null;
};
