import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const assignmentStatusEnum = pgEnum("assignment_status", [
  "not_started",
  "in_progress",
  "completed",
  "submitted",
]);

export const citationKindEnum = pgEnum("citation_kind", [
  "lecture-notes",
  "external-research",
  "ai-summary",
  "source-quote",
  "student-content",
  "student-verified-evidence",
]);

export const messageRoleEnum = pgEnum("message_role", [
  "user",
  "assistant",
  "system",
]);

export const assistantModeEnum = pgEnum("assistant_mode", [
  "Notes-only",
  "Research",
  "Outline",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  initials: varchar("initials", { length: 8 }),
  tagline: text("tagline"),
  ...timestamps,
});

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 64 }),
  name: varchar("name", { length: 255 }).notNull(),
  term: varchar("term", { length: 64 }),
  ...timestamps,
});

export const assignments = pgTable("assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  courseId: uuid("course_id").references(() => courses.id, { onDelete: "set null" }),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  courseName: varchar("course_name", { length: 255 }),
  question: text("question"),
  wordLimit: varchar("word_limit", { length: 64 }),
  citationStyle: varchar("citation_style", { length: 64 }),
  dueAt: timestamp("due_at", { withTimezone: true }),
  dueLabel: varchar("due_label", { length: 120 }),
  progress: integer("progress").default(0).notNull(),
  status: assignmentStatusEnum("status").default("not_started").notNull(),
  supportMode: varchar("support_mode", { length: 120 }),
  nextAction: text("next_action"),
  ...timestamps,
});

export const notes = pgTable("notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  assignmentId: uuid("assignment_id")
    .notNull()
    .references(() => assignments.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull().default(""),
  sourceLabel: varchar("source_label", { length: 255 }),
  page: varchar("page", { length: 64 }),
  ...timestamps,
});

export const researchSources = pgTable("research_sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  assignmentId: uuid("assignment_id").references(() => assignments.id, {
    onDelete: "cascade",
  }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  authors: varchar("authors", { length: 500 }),
  venue: varchar("venue", { length: 255 }),
  year: integer("year"),
  doi: varchar("doi", { length: 255 }),
  url: text("url"),
  verified: boolean("verified").default(false).notNull(),
  openAccess: boolean("open_access").default(false).notNull(),
  selected: boolean("selected").default(false).notNull(),
  kind: citationKindEnum("kind").default("external-research"),
  ...timestamps,
});

export const referencesTable = pgTable("references", {
  id: uuid("id").defaultRandom().primaryKey(),
  assignmentId: uuid("assignment_id")
    .notNull()
    .references(() => assignments.id, { onDelete: "cascade" }),
  sourceLabel: varchar("source_label", { length: 255 }),
  title: varchar("title", { length: 500 }).notNull(),
  type: varchar("type", { length: 64 }),
  year: varchar("year", { length: 16 }),
  doi: varchar("doi", { length: 255 }),
  status: varchar("status", { length: 64 }).default("Needs review"),
  researchSourceId: uuid("research_source_id").references(() => researchSources.id, {
    onDelete: "set null",
  }),
  ...timestamps,
});

export const claims = pgTable("claims", {
  id: uuid("id").defaultRandom().primaryKey(),
  assignmentId: uuid("assignment_id")
    .notNull()
    .references(() => assignments.id, { onDelete: "cascade" }),
  statement: text("statement").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  ...timestamps,
});

export const evidence = pgTable("evidence", {
  id: uuid("id").defaultRandom().primaryKey(),
  claimId: uuid("claim_id")
    .notNull()
    .references(() => claims.id, { onDelete: "cascade" }),
  researchSourceId: uuid("research_source_id").references(() => researchSources.id, {
    onDelete: "set null",
  }),
  quote: text("quote"),
  paraphrase: text("paraphrase"),
  page: varchar("page", { length: 64 }),
  kind: citationKindEnum("kind").default("source-quote"),
  studentVerified: boolean("student_verified").default(false).notNull(),
  ...timestamps,
});

export const outlines = pgTable("outlines", {
  id: uuid("id").defaultRandom().primaryKey(),
  assignmentId: uuid("assignment_id")
    .notNull()
    .references(() => assignments.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull().default("Main outline"),
  structure: jsonb("structure").$type<unknown>().default([]).notNull(),
  ...timestamps,
});

export const aiConversations = pgTable("ai_conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  assignmentId: uuid("assignment_id").references(() => assignments.id, {
    onDelete: "set null",
  }),
  mode: assistantModeEnum("mode").default("Notes-only").notNull(),
  title: varchar("title", { length: 255 }),
  ...timestamps,
});

export const aiMessages = pgTable("ai_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => aiConversations.id, { onDelete: "cascade" }),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull().default(""),
  thinking: text("thinking"),
  citations: jsonb("citations").$type<unknown>().default([]),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  ...timestamps,
});

export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  assignments: many(assignments),
  researchSources: many(researchSources),
  aiConversations: many(aiConversations),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  user: one(users, { fields: [courses.userId], references: [users.id] }),
  assignments: many(assignments),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  user: one(users, { fields: [assignments.userId], references: [users.id] }),
  course: one(courses, { fields: [assignments.courseId], references: [courses.id] }),
  notes: many(notes),
  researchSources: many(researchSources),
  references: many(referencesTable),
  claims: many(claims),
  outlines: many(outlines),
  aiConversations: many(aiConversations),
}));

export const claimsRelations = relations(claims, ({ one, many }) => ({
  assignment: one(assignments, {
    fields: [claims.assignmentId],
    references: [assignments.id],
  }),
  evidence: many(evidence),
}));

export const aiConversationsRelations = relations(aiConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [aiConversations.userId],
    references: [users.id],
  }),
  assignment: one(assignments, {
    fields: [aiConversations.assignmentId],
    references: [assignments.id],
  }),
  messages: many(aiMessages),
}));

export const aiMessagesRelations = relations(aiMessages, ({ one }) => ({
  conversation: one(aiConversations, {
    fields: [aiMessages.conversationId],
    references: [aiConversations.id],
  }),
}));
