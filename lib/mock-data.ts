export type Citation = {
  source: string;
  page: string;
  kind:
    | "lecture-notes"
    | "external-research"
    | "ai-summary"
    | "source-quote"
    | "student-content"
    | "student-verified-evidence";
};

export const studentProfile = {
  name: "Alex",
  initials: "AL",
  tagline: "Turn every assignment into a clear, evidence-based workflow.",
};

export const dashboardStats = [
  { label: "Active assignments", value: "3", meta: "1 due this week" },
  { label: "Overall progress", value: "62%", meta: "+12% this week" },
  { label: "Sources collected", value: "18", meta: "5 student-verified" },
  { label: "Study streak", value: "6", meta: "days in a row" },
];

export const weeklyProgress = [
  { day: "Mon", progress: 34 },
  { day: "Tue", progress: 42 },
  { day: "Wed", progress: 46 },
  { day: "Thu", progress: 53 },
  { day: "Fri", progress: 57 },
  { day: "Sat", progress: 62 },
];

export const deadlines = [
  {
    title: "Database Normalisation Report",
    course: "Database Systems",
    due: "Fri 11 Oct",
    urgency: "danger" as const,
    daysLeft: "4 days",
  },
  {
    title: "Critical Analysis Essay",
    course: "Academic English",
    due: "Wed 16 Oct",
    urgency: "warning" as const,
    daysLeft: "9 days",
  },
  {
    title: "Market Failure Case Study",
    course: "Economics",
    due: "Mon 28 Oct",
    urgency: "success" as const,
    daysLeft: "21 days",
  },
];

export const assignment = {
  id: "database-normalisation-report",
  title: "Database Normalisation Report",
  course: "Database Systems",
  wordLimit: "1,500 words",
  citationStyle: "Harvard",
  due: "Due in 4 days",
  progress: 62,
  supportMode: "Learning support only",
  question:
    "Evaluate how database normalisation improves data integrity and reduces redundancy.",
  nextAction:
    "Verify 2 research sources, then build outline claims with balanced strengths and limitations.",
};

export const assignmentTabs = [
  { label: "Brief", href: "brief" },
  { label: "Notes", href: "notes" },
  { label: "Research", href: "research" },
  { label: "Outline", href: "outline" },
  { label: "Draft", href: "draft" },
  { label: "References", href: "references" },
];

export const workflowSteps = [
  { label: "Understand", state: "done" as const },
  { label: "Gather evidence", state: "done" as const },
  { label: "Plan", state: "current" as const },
  { label: "Draft", state: "pending" as const },
  { label: "Check", state: "pending" as const },
];

export const requirementChecklist = [
  {
    title: "Define 1NF, 2NF, and 3NF",
    note: "Covered in Lecture 04",
    done: true,
  },
  {
    title: "Explain data integrity benefits",
    note: "Evidence linked",
    done: true,
  },
  {
    title: "Explain redundancy reduction",
    note: "Evidence linked",
    done: true,
  },
  {
    title: "Use at least 5 academic sources",
    note: "5 verified, 2 pending",
    done: true,
  },
  {
    title: "Discuss a practical example or case",
    note: "Not started",
    done: false,
  },
  {
    title: "Evaluate limitations of normalisation",
    note: "Not started",
    done: false,
  },
];

export const rubric = [
  { criterion: "Understanding", weight: "20%" },
  { criterion: "Analysis", weight: "25%" },
  { criterion: "Evidence", weight: "25%" },
  { criterion: "Structure", weight: "15%" },
  { criterion: "Referencing", weight: "15%" },
];

export const courseMaterials = [
  { title: "Lecture 04 — Normal Forms.pdf", pages: 18, status: "Indexed" },
  { title: "Lecture 03 — Relational Model.pdf", pages: 14, status: "Indexed" },
  { title: "Tutorial 02 — Anomalies.pdf", pages: 6, status: "Indexed" },
  { title: "Module Handbook 2026.pdf", pages: 42, status: "Indexed" },
];

export const aiMessages = {
  notes: {
    firstQuestion: "What is second normal form (2NF), based on my lecture notes?",
    secondQuestion: "Does my lecturer mention denormalisation trade-offs?",
    firstAnswer:
      "According to your course materials, second normal form (2NF) requires that a relation is already in 1NF and that every non-prime attribute is fully functionally dependent on the whole candidate key.",
    firstCitation: {
      source: "Lecture 04 — Normal Forms.pdf",
      page: "p.12",
      kind: "lecture-notes",
    } satisfies Citation,
  },
};

export const researchQuestions = [
  {
    title: "How does 3NF reduce update anomalies?",
    active: true,
  },
  {
    title: "What are trade-offs of over-normalisation?",
    active: false,
  },
  {
    title: "How is integrity enforced in practice?",
    active: false,
  },
];

export const researchSources = [
  {
    title: "Reducing Update Anomalies Through Third Normal Form",
    authors: "Chen, L. & Okonkwo, A.",
    venue: "ACM Journal of Database Systems",
    year: 2023,
    doi: "10.1145/fict.2023.041",
    verified: true,
    openAccess: true,
    selected: true,
  },
  {
    title: "A Practical Guide to Database Normal Forms in Enterprise Systems",
    authors: "Rivera, M.",
    venue: "IEEE Data Engineering Bulletin",
    year: 2022,
    doi: "10.1109/fict.2022.118",
    verified: false,
    openAccess: false,
    selected: false,
  },
  {
    title: "Integrity Constraints and Redundancy: An Empirical Study",
    authors: "Patel, S. et al.",
    venue: "VLDB Workshop Proceedings",
    year: 2021,
    doi: "10.14778/fict.2021.09",
    verified: true,
    openAccess: true,
    selected: false,
  },
];

export const references = [
  {
    source: "Chen, L. & Okonkwo, A.",
    title: "Reducing Update Anomalies Through Third Normal Form",
    type: "Journal",
    year: "2023",
    doi: "10.1145/fict.2023.041",
    status: "Verified",
  },
  {
    source: "Patel, S. et al.",
    title: "Integrity Constraints and Redundancy",
    type: "Workshop",
    year: "2021",
    doi: "10.14778/fict.2021.09",
    status: "Verified",
  },
  {
    source: "Rivera, M.",
    title: "A Practical Guide to Database Normal Forms…",
    type: "Bulletin",
    year: "2022",
    doi: "10.1109/fict.2022.118",
    status: "Needs review",
  },
  {
    source: "Course notes",
    title: "Lecture 04 — Normal Forms",
    type: "Notes",
    year: "2026",
    doi: "—",
    status: "Notes-only",
  },
  {
    source: "Unknown author",
    title: "Missing title & publisher",
    type: "Incomplete",
    year: "—",
    doi: "—",
    status: "Incomplete",
  },
];

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
];
