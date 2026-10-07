import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { eq } from "drizzle-orm";
import { getDb } from "../lib/db";
import {
  assignments,
  courseMaterials,
  courses,
  referencesTable,
  researchQuestions,
  researchSources,
  users,
} from "../lib/db/schema";

async function main() {
  const db = getDb();
  if (!db) {
    console.error("Seed failed: DATABASE_URL not configured.");
    process.exit(1);
  }

  let [user] = await db.select().from(users).limit(1);
  if (!user) {
    [user] = await db
      .insert(users)
      .values({
        name: "Alex",
        email: "alex@studyflow.local",
        initials: "AL",
        tagline: "Turn every assignment into a clear, evidence-based workflow.",
      })
      .returning();
  }

  let [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.userId, user.id))
    .limit(1);

  if (!course) {
    [course] = await db
      .insert(courses)
      .values({
        userId: user.id,
        code: "DBS201",
        name: "Database Systems",
        term: "2026 Autumn",
      })
      .returning();
  }

  // Extra courses for nav (optional)
  for (const c of [
    { code: "ENG102", name: "Academic English", term: "2026 Autumn" },
    { code: "ECO110", name: "Economics", term: "2026 Autumn" },
  ]) {
    const existing = await db
      .select()
      .from(courses)
      .where(eq(courses.name, c.name))
      .limit(1);
    if (!existing[0]) {
      await db.insert(courses).values({ userId: user.id, ...c });
    }
  }

  const slug = "database-normalisation-report";
  let [assignment] = await db
    .select()
    .from(assignments)
    .where(eq(assignments.slug, slug))
    .limit(1);

  const dueAt = new Date("2026-10-11T23:59:00+08:00");

  if (!assignment) {
    [assignment] = await db
      .insert(assignments)
      .values({
        userId: user.id,
        courseId: course.id,
        slug,
        title: "Database Normalisation Report",
        courseName: "Database Systems",
        question:
          "Evaluate how database normalisation improves data integrity and reduces redundancy.",
        wordLimit: "1,500 words",
        citationStyle: "Harvard",
        dueAt,
        dueLabel: "Due in 4 days",
        progress: 62,
        status: "in_progress",
        supportMode: "Learning support only",
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
      })
      .returning();
  }

  const materials = [
    { title: "Lecture 04 — Normal Forms.pdf", pages: 18, status: "Indexed" },
    { title: "Lecture 03 — Relational Model.pdf", pages: 14, status: "Indexed" },
    { title: "Tutorial 02 — Anomalies.pdf", pages: 6, status: "Indexed" },
    { title: "Module Handbook 2026.pdf", pages: 42, status: "Indexed" },
  ];
  const existingMaterials = await db
    .select()
    .from(courseMaterials)
    .where(eq(courseMaterials.assignmentId, assignment.id))
    .limit(1);
  if (!existingMaterials[0]) {
    await db.insert(courseMaterials).values(
      materials.map((m) => ({ ...m, assignmentId: assignment.id })),
    );
  }

  const questions = [
    { title: "How does 3NF reduce update anomalies?", active: true, sortOrder: 0 },
    { title: "What are trade-offs of over-normalisation?", active: false, sortOrder: 1 },
    { title: "How is integrity enforced in practice?", active: false, sortOrder: 2 },
  ];
  const existingQs = await db
    .select()
    .from(researchQuestions)
    .where(eq(researchQuestions.assignmentId, assignment.id))
    .limit(1);
  if (!existingQs[0]) {
    await db.insert(researchQuestions).values(
      questions.map((q) => ({ ...q, assignmentId: assignment.id })),
    );
  }

  const sources = [
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
  const existingSources = await db
    .select()
    .from(researchSources)
    .where(eq(researchSources.assignmentId, assignment.id))
    .limit(1);
  if (!existingSources[0]) {
    const inserted = await db
      .insert(researchSources)
      .values(
        sources.map((s) => ({
          ...s,
          assignmentId: assignment.id,
          userId: user.id,
          kind: "external-research" as const,
        })),
      )
      .returning();

    await db.insert(referencesTable).values([
      {
        assignmentId: assignment.id,
        sourceLabel: "Chen, L. & Okonkwo, A.",
        title: "Reducing Update Anomalies Through Third Normal Form",
        type: "Journal",
        year: "2023",
        doi: "10.1145/fict.2023.041",
        status: "Verified",
        researchSourceId: inserted[0]?.id,
      },
      {
        assignmentId: assignment.id,
        sourceLabel: "Patel, S. et al.",
        title: "Integrity Constraints and Redundancy",
        type: "Workshop",
        year: "2021",
        doi: "10.14778/fict.2021.09",
        status: "Verified",
        researchSourceId: inserted[2]?.id,
      },
      {
        assignmentId: assignment.id,
        sourceLabel: "Rivera, M.",
        title: "A Practical Guide to Database Normal Forms…",
        type: "Bulletin",
        year: "2022",
        doi: "10.1109/fict.2022.118",
        status: "Needs review",
        researchSourceId: inserted[1]?.id,
      },
      {
        assignmentId: assignment.id,
        sourceLabel: "Course notes",
        title: "Lecture 04 — Normal Forms",
        type: "Notes",
        year: "2026",
        doi: "—",
        status: "Notes-only",
      },
      {
        assignmentId: assignment.id,
        sourceLabel: "Unknown author",
        title: "Missing title & publisher",
        type: "Incomplete",
        year: "—",
        doi: "—",
        status: "Incomplete",
      },
    ]);
  }

  // Additional seeded deadlines (other assignments)
  for (const extra of [
    {
      slug: "critical-analysis-essay",
      title: "Critical Analysis Essay",
      courseName: "Academic English",
      dueAt: new Date("2026-10-16T23:59:00+08:00"),
      dueLabel: "Wed 16 Oct",
      progress: 28,
      status: "in_progress" as const,
      nextAction: "Gather three peer-reviewed sources",
    },
    {
      slug: "market-failure-case-study",
      title: "Market Failure Case Study",
      courseName: "Economics",
      dueAt: new Date("2026-10-28T23:59:00+08:00"),
      dueLabel: "Mon 28 Oct",
      progress: 10,
      status: "not_started" as const,
      nextAction: "Read the brief and list evaluation criteria",
    },
  ]) {
    const [exists] = await db
      .select()
      .from(assignments)
      .where(eq(assignments.slug, extra.slug))
      .limit(1);
    if (!exists) {
      await db.insert(assignments).values({
        userId: user.id,
        courseId: course.id,
        question: null,
        wordLimit: null,
        citationStyle: "Harvard",
        supportMode: "Learning support only",
        requirements: [],
        rubric: [],
        ...extra,
      });
    }
  }

  console.log("Seeded demo user + assignment suite:", {
    userId: user.id,
    assignmentId: assignment.id,
    slug: assignment.slug,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
