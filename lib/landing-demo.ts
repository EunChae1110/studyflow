/**
 * Props-only fixtures for the marketing landing product preview.
 * Not used by dashboard/assignment runtime paths.
 */
import type {
  AssignmentDetail,
  AssignmentListItem,
  CourseMaterialItem,
  DashboardStat,
  DeadlineItem,
  ResearchSourceItem,
  StudentProfile,
  WeeklyProgressPoint,
} from "@/lib/types";

export const landingProfile: StudentProfile = {
  id: "landing-demo",
  name: "Alex",
  initials: "AL",
  tagline: "Turn every assignment into a clear, evidence-based workflow.",
};

export const landingCourseLabels = [
  "Database Systems",
  "Academic English",
  "Economics",
];

export const landingCourses = [
  { id: "landing-db", name: "Database Systems" },
  { id: "landing-eng", name: "Academic English" },
  { id: "landing-econ", name: "Economics" },
];

export const landingAssignment: AssignmentDetail = {
  id: "landing-demo-assignment",
  slug: "database-normalisation-report",
  title: "Database Normalisation Report",
  course: "Database Systems",
  wordLimit: "1,500 words",
  citationStyle: "Harvard",
  due: "Due in 4 days",
  dueAt: new Date("2026-10-11T23:59:00+08:00"),
  progress: 62,
  supportMode: "Learning support only",
  question:
    "Evaluate how database normalisation improves data integrity and reduces redundancy.",
  nextAction:
    "Verify 2 research sources, then build outline claims with balanced strengths and limitations.",
  requirements: [
    { title: "Define 1NF, 2NF, and 3NF", note: "Covered in Lecture 04", done: true },
    { title: "Explain data integrity benefits", note: "Evidence linked", done: true },
    { title: "Explain redundancy reduction", note: "Evidence linked", done: true },
    { title: "Use at least 5 academic sources", note: "5 verified, 2 pending", done: true },
    { title: "Discuss a practical example or case", note: "Not started", done: false },
    { title: "Evaluate limitations of normalisation", note: "Not started", done: false },
  ],
  rubric: [
    { criterion: "Understanding", weight: "20%" },
    { criterion: "Analysis", weight: "25%" },
    { criterion: "Evidence", weight: "25%" },
    { criterion: "Structure", weight: "15%" },
    { criterion: "Referencing", weight: "15%" },
  ],
  status: "in_progress",
  guidelines: [],
};

export const landingContinueAssignment: AssignmentListItem = {
  id: landingAssignment.id,
  slug: landingAssignment.slug,
  title: landingAssignment.title,
  course: landingAssignment.course,
  due: landingAssignment.due,
  progress: landingAssignment.progress,
  nextAction: landingAssignment.nextAction,
};

export const landingStats: DashboardStat[] = [
  { label: "Active assignments", value: "3", meta: "1 due this week" },
  { label: "Sources saved", value: "12", meta: "2 need review" },
  { label: "Claims mapped", value: "7", meta: "5 verified" },
  { label: "Study streak", value: "4", meta: "days" },
];

export const landingWeeklyProgress: WeeklyProgressPoint[] = [
  { day: "Mon", progress: 20 },
  { day: "Tue", progress: 35 },
  { day: "Wed", progress: 42 },
  { day: "Thu", progress: 55 },
  { day: "Fri", progress: 62 },
  { day: "Sat", progress: 68 },
];

export const landingDeadlines: DeadlineItem[] = [
  {
    slug: landingAssignment.slug,
    title: landingAssignment.title,
    course: landingAssignment.course,
    due: landingAssignment.due,
    dueAt: landingAssignment.dueAt,
    urgency: "warning",
    daysLeft: "4 days",
    progress: landingAssignment.progress,
  },
  {
    slug: "econ-case-brief",
    title: "Market failure case brief",
    course: "Economics",
    due: "Due in 9 days",
    dueAt: null,
    urgency: "success",
    daysLeft: "9 days",
    progress: 20,
  },
];

export const landingSources: ResearchSourceItem[] = [
  {
    id: "src-1",
    title: "Further Normalization of the Data Base Relational Model",
    authors: "E. F. Codd",
    venue: "ACM",
    year: 1971,
    doi: "10.1145/example.codd",
    url: null,
    verified: true,
    openAccess: true,
    selected: true,
  },
  {
    id: "src-2",
    title: "Lecture 04 — Normal Forms",
    authors: "Course staff",
    venue: "Course material",
    year: 2026,
    doi: null,
    url: null,
    verified: true,
    openAccess: true,
    selected: false,
  },
  {
    id: "src-3",
    title: "An Introduction to Database Systems",
    authors: "C. J. Date",
    venue: "Addison-Wesley",
    year: 2003,
    doi: null,
    url: null,
    verified: false,
    openAccess: false,
    selected: false,
  },
];

export const landingMaterials: CourseMaterialItem[] = [
  { id: "mat-1", title: "Lecture 04 — Normal Forms.pdf", pages: 18, status: "Indexed" },
  { id: "mat-2", title: "Tutorial 02 — Anomalies.pdf", pages: 6, status: "Indexed" },
  { id: "mat-3", title: "Module Handbook 2026.pdf", pages: 42, status: "Indexed" },
];

export const landingClaim = {
  statement:
    "3NF eliminates update anomalies caused by transitive dependencies on non-key attributes.",
  evidence: [
    {
      id: "ev-1",
      page: "Lecture 04 p.12",
      quote:
        "…non-key attributes determined by other non-key attributes create redundant update sites.",
      studentVerified: true,
    },
    {
      id: "ev-2",
      page: "Codd 1971",
      quote: "Further normalisation isolates independently updatable facts.",
      studentVerified: false,
    },
  ],
};
