import "server-only";

import { generateText } from "ai";
import { and, eq, sql } from "drizzle-orm";
import { resolveModelId } from "@/lib/ai/models";
import { getChatModel, hasAiCredentials } from "@/lib/ai/provider";
import {
  isWritingFocusedType,
  parseAssignmentType,
} from "@/lib/assignment-types";
import { asStringArray, extractJsonObject } from "@/lib/build/json";
import {
  BUILD_SYSTEM,
  gatherPrompt,
  planPrompt,
  producePrompt,
  understandPrompt,
} from "@/lib/build/prompts";
import type {
  BuildEvent,
  BuildGatherResult,
  BuildPlanResult,
  BuildProduceResult,
  BuildUnderstandResult,
} from "@/lib/build/types";
import { buildStepsForType } from "@/lib/build/workflow";
import { getDb } from "@/lib/db";
import { getAssignmentBySlug, insertResearchSource } from "@/lib/db/queries";
import {
  assignments,
  claims,
  memories,
  notes,
  outlines,
  researchQuestions,
} from "@/lib/db/schema";
import { getGuidelineTextsForAssignment } from "@/lib/guidelines/store";
import { searchOpenAlex } from "@/lib/research/openalex";
import {
  ensureAssignmentProgressAtLeast,
  recomputeAssignmentProgress,
} from "@/lib/workspace/progress";

type Emit = (event: BuildEvent) => void;

function signalAborted(signal?: AbortSignal): boolean {
  return Boolean(signal?.aborted);
}

async function aiJson<T>(
  prompt: string,
  modelId?: string | null,
): Promise<T> {
  const { text } = await generateText({
    model: getChatModel(resolveModelId(modelId)),
    system: BUILD_SYSTEM,
    prompt,
    temperature: 0.25,
  });
  return extractJsonObject(text) as T;
}

async function loadGuidelineBundle(
  assignmentId: string,
  userId: string,
  question: string | null,
): Promise<string> {
  const docs = await getGuidelineTextsForAssignment(assignmentId, userId);
  const parts: string[] = [];
  if (docs.length) {
    for (const d of docs) {
      parts.push(`### ${d.originalName} (${d.kind})\n${d.text}`);
    }
  }
  if (question?.trim()) {
    parts.push(`### Brief text\n${question.trim()}`);
  }
  return parts.join("\n\n").slice(0, 28_000);
}

function normalizeUnderstand(raw: unknown): BuildUnderstandResult {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const requirements = Array.isArray(obj.requirements)
    ? obj.requirements
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const row = item as Record<string, unknown>;
          const title = String(row.title ?? "").trim();
          if (!title) return null;
          return {
            title: title.slice(0, 240),
            note: String(row.note ?? "").trim().slice(0, 500),
            done: false,
          };
        })
        .filter(Boolean)
        .slice(0, 40)
    : [];
  const rubric = Array.isArray(obj.rubric)
    ? obj.rubric
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const row = item as Record<string, unknown>;
          const criterion = String(row.criterion ?? "").trim();
          if (!criterion) return null;
          return {
            criterion: criterion.slice(0, 240),
            weight: String(row.weight ?? "").trim().slice(0, 64) || "—",
          };
        })
        .filter(Boolean)
        .slice(0, 40)
    : [];

  return {
    nextAction:
      String(obj.nextAction ?? "").trim().slice(0, 500) ||
      "Review the brief checklist, then gather materials",
    question: obj.question
      ? String(obj.question).trim().slice(0, 8000)
      : null,
    requirements: requirements as BuildUnderstandResult["requirements"],
    rubric: rubric as BuildUnderstandResult["rubric"],
    checklistNote: obj.checklistNote
      ? String(obj.checklistNote).trim().slice(0, 2000)
      : undefined,
    memories: asStringArray(obj.memories, 8),
  };
}

function normalizeGather(raw: unknown): BuildGatherResult {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const gatherNotes = Array.isArray(obj.gatherNotes)
    ? obj.gatherNotes
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const row = item as Record<string, unknown>;
          const title = String(row.title ?? "").trim();
          const body = String(row.body ?? "").trim();
          if (!title || !body) return null;
          return {
            title: title.slice(0, 255),
            body: body.slice(0, 4000),
          };
        })
        .filter(Boolean)
        .slice(0, 8)
    : [];

  return {
    researchQuestions: asStringArray(obj.researchQuestions, 8),
    searchQueries: asStringArray(obj.searchQueries, 4),
    gatherNotes: gatherNotes as BuildGatherResult["gatherNotes"],
    nextAction:
      String(obj.nextAction ?? "").trim().slice(0, 500) ||
      "Review gathered materials and start planning",
  };
}

function normalizePlan(raw: unknown): BuildPlanResult {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const sections = Array.isArray(obj.sections)
    ? obj.sections
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const row = item as Record<string, unknown>;
          const title = String(row.title ?? "").trim();
          if (!title) return null;
          return {
            title: title.slice(0, 240),
            purpose: String(row.purpose ?? "").trim().slice(0, 500),
            claimOrPoint: String(row.claimOrPoint ?? "").trim().slice(0, 500) ||
              undefined,
          };
        })
        .filter(Boolean)
        .slice(0, 16)
    : [];

  return {
    outlineTitle:
      String(obj.outlineTitle ?? "").trim().slice(0, 255) || "Main plan",
    sections: sections as BuildPlanResult["sections"],
    claims: asStringArray(obj.claims, 10),
    nextAction:
      String(obj.nextAction ?? "").trim().slice(0, 500) ||
      "Turn the plan into draft / work cards",
  };
}

function normalizeProduce(raw: unknown): BuildProduceResult {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const plans = Array.isArray(obj.plans)
    ? obj.plans
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const row = item as Record<string, unknown>;
          const section = String(row.section ?? "").trim();
          if (!section) return null;
          return {
            section: section.slice(0, 240),
            claimOrGoal: String(row.claimOrGoal ?? "").trim().slice(0, 500),
            evidenceOrChecks: String(row.evidenceOrChecks ?? "")
              .trim()
              .slice(0, 1000),
            logicOrVerify: String(row.logicOrVerify ?? "").trim().slice(0, 500),
          };
        })
        .filter(Boolean)
        .slice(0, 16)
    : [];

  return {
    plans: plans as BuildProduceResult["plans"],
    nextAction:
      String(obj.nextAction ?? "").trim().slice(0, 500) ||
      "Fill each plan card yourself — Build will not write the full deliverable",
  };
}

/**
 * Run the full Build pipeline for an assignment.
 * Streams NDJSON-friendly events via `emit`. Honours AbortSignal between steps.
 */
export async function runAssignmentBuild(params: {
  userId: string;
  assignmentSlug: string;
  modelId?: string | null;
  signal?: AbortSignal;
  emit: Emit;
}): Promise<void> {
  const { userId, assignmentSlug, modelId, signal, emit } = params;

  if (!hasAiCredentials()) {
    emit({ type: "error", error: "AI mid-station is not configured." });
    return;
  }

  const db = getDb();
  if (!db) {
    emit({ type: "error", error: "Database is not configured." });
    return;
  }

  const detail = await getAssignmentBySlug(assignmentSlug, userId);
  if (!detail) {
    emit({ type: "error", error: "Assignment not found." });
    return;
  }

  const [row] = await db
    .select()
    .from(assignments)
    .where(and(eq(assignments.id, detail.id), eq(assignments.userId, userId)))
    .limit(1);
  if (!row) {
    emit({ type: "error", error: "Assignment not found." });
    return;
  }

  const assignmentType = parseAssignmentType(row.assignmentType);
  const writing = isWritingFocusedType(assignmentType);
  const steps = buildStepsForType(assignmentType);
  const total = steps.length;

  emit({
    type: "start",
    assignmentSlug: row.slug,
    assignmentType,
    steps: steps.map((s) => ({ id: s.id, label: s.label })),
    total,
  });

  const guidelineText = await loadGuidelineBundle(
    row.id,
    userId,
    row.question,
  );

  let planSections: BuildPlanResult["sections"] = [];
  let researchQs: string[] = [];
  let lastAsk: string | undefined;
  let lastTab = "brief";
  let lastMode: "Notes-only" | "Research" | "Outline" = "Research";
  let lastNextAction = row.nextAction;

  const revalidateHints = () => {
    // Caller (API route) will revalidatePath after stream ends.
  };

  for (let index = 0; index < steps.length; index++) {
    if (signalAborted(signal)) {
      const progress = (await recomputeAssignmentProgress(row.id)) ?? row.progress;
      emit({
        type: "done",
        cancelled: true,
        progress,
        nextAction: lastNextAction,
        askPrompt: lastAsk,
        tab: lastTab,
        mode: lastMode,
      });
      return;
    }

    const step = steps[index]!;
    emit({
      type: "step_start",
      step: step.id,
      index: index + 1,
      total,
      label: step.label,
      tab: step.tab,
    });

    try {
      if (step.id === "understand") {
        emit({
          type: "step_progress",
          step: step.id,
          message: "Reading guideline & filling brief…",
        });
        const raw = await aiJson<unknown>(
          understandPrompt({
            assignmentType,
            title: row.title,
            question: row.question,
            guidelineText,
            hasRequirements:
              Array.isArray(row.requirements) && row.requirements.length > 0,
            hasRubric: Array.isArray(row.rubric) && row.rubric.length > 0,
          }),
          modelId,
        );
        if (signalAborted(signal)) break;
        const result = normalizeUnderstand(raw);
        const patch: Record<string, unknown> = {
          nextAction: result.nextAction,
          updatedAt: new Date(),
          status: row.status === "not_started" ? "in_progress" : row.status,
        };
        if (result.question) patch.question = result.question;
        if (result.requirements?.length) patch.requirements = result.requirements;
        if (result.rubric?.length) patch.rubric = result.rubric;

        await db
          .update(assignments)
          .set(patch as Partial<typeof assignments.$inferInsert>)
          .where(eq(assignments.id, row.id));

        if (result.checklistNote) {
          await db.insert(notes).values({
            assignmentId: row.id,
            title: "Build · Brief breakdown",
            body: result.checklistNote,
            sourceLabel: "build-understand",
          });
        }

        for (const mem of result.memories ?? []) {
          await db.insert(memories).values({
            userId,
            scope: "assignment",
            assignmentId: row.id,
            courseId: row.courseId,
            kind: "build",
            content: mem.slice(0, 1000),
            metadata: { step: "understand" },
          });
        }

        await ensureAssignmentProgressAtLeast(row.id, 20);
        lastNextAction = result.nextAction;
        lastAsk = writing
          ? "Summarise what I must deliver and what to verify first against the rubric. Do not write the essay."
          : "Summarise what I must deliver from the guideline and my first concrete next step. Do not produce the full deliverable.";
        lastTab = step.tab;
        lastMode = step.mode;

        emit({
          type: "step_done",
          step: step.id,
          index: index + 1,
          total,
          label: step.label,
          tab: step.tab,
          mode: step.mode,
          summary: result.nextAction,
          artifacts: [
            result.question ? "brief" : null,
            result.requirements?.length
              ? `${result.requirements.length} requirements`
              : null,
            result.rubric?.length ? `${result.rubric.length} rubric items` : null,
            result.memories?.length
              ? `${result.memories.length} memories`
              : null,
          ].filter(Boolean) as string[],
          askPrompt: lastAsk,
        });
        continue;
      }

      if (step.id === "gather") {
        emit({
          type: "step_progress",
          step: step.id,
          message: writing
            ? "Creating research questions & searching literature…"
            : "Creating gather notes & lookup questions…",
        });
        const raw = await aiJson<unknown>(
          gatherPrompt({
            assignmentType,
            title: row.title,
            question: row.question,
            guidelineText,
            writing,
          }),
          modelId,
        );
        if (signalAborted(signal)) break;
        const result = normalizeGather(raw);
        researchQs = result.researchQuestions;

        // Replace prior build-generated questions to keep Build idempotent-ish.
        const existingQs = await db
          .select({ id: researchQuestions.id, title: researchQuestions.title })
          .from(researchQuestions)
          .where(eq(researchQuestions.assignmentId, row.id));

        let sortOrder = existingQs.length;
        for (const [i, q] of result.researchQuestions.entries()) {
          const dup = existingQs.some(
            (e) => e.title.toLowerCase() === q.toLowerCase(),
          );
          if (dup) continue;
          await db.insert(researchQuestions).values({
            assignmentId: row.id,
            title: q.slice(0, 500),
            active: i === 0,
            sortOrder: sortOrder++,
          });
        }

        for (const note of result.gatherNotes ?? []) {
          await db.insert(notes).values({
            assignmentId: row.id,
            title: note.title,
            body: note.body,
            sourceLabel: "build-gather",
          });
        }

        let sourcesAdded = 0;
        if (writing && result.searchQueries.length) {
          for (const query of result.searchQueries.slice(0, 2)) {
            if (signalAborted(signal)) break;
            emit({
              type: "step_progress",
              step: step.id,
              message: `OpenAlex: ${query.slice(0, 60)}…`,
            });
            try {
              const { results } = await searchOpenAlex({
                query,
                page: 1,
                perPage: 3,
              });
              for (const hit of results.slice(0, 2)) {
                const saved = await insertResearchSource({
                  userId,
                  assignmentId: row.id,
                  title: hit.title,
                  authors: hit.authors,
                  venue: hit.venue,
                  year: hit.year,
                  doi: hit.doi,
                  url: hit.url,
                  openAccess: hit.openAccess,
                  selected: true,
                });
                if (saved) sourcesAdded += 1;
              }
            } catch (err) {
              console.warn("[studyflow] build OpenAlex search failed:", err);
            }
          }
        }

        await db
          .update(assignments)
          .set({ nextAction: result.nextAction, updatedAt: sql`now()` })
          .where(eq(assignments.id, row.id));

        await ensureAssignmentProgressAtLeast(row.id, 40);
        lastNextAction = result.nextAction;
        lastAsk = writing
          ? "Evaluate the sources Build added — which need verification, and what is still missing?"
          : "What materials am I still missing before I can execute the plan?";
        lastTab = step.tab;
        lastMode = step.mode;

        emit({
          type: "step_done",
          step: step.id,
          index: index + 1,
          total,
          label: step.label,
          tab: step.tab,
          mode: step.mode,
          summary: result.nextAction,
          artifacts: [
            result.researchQuestions.length
              ? `${result.researchQuestions.length} questions`
              : null,
            result.gatherNotes?.length
              ? `${result.gatherNotes.length} notes`
              : null,
            sourcesAdded ? `${sourcesAdded} sources` : null,
          ].filter(Boolean) as string[],
          askPrompt: lastAsk,
        });
        continue;
      }

      if (step.id === "plan") {
        emit({
          type: "step_progress",
          step: step.id,
          message: writing
            ? "Building outline & claim stubs…"
            : "Building type-appropriate plan…",
        });
        const raw = await aiJson<unknown>(
          planPrompt({
            assignmentType,
            title: row.title,
            question: row.question,
            guidelineText,
            writing,
            researchQuestions: researchQs,
          }),
          modelId,
        );
        if (signalAborted(signal)) break;
        const result = normalizePlan(raw);
        planSections = result.sections;

        const structure = result.sections.map((s, i) => ({
          order: i + 1,
          title: s.title,
          purpose: s.purpose,
          claimOrPoint: s.claimOrPoint ?? null,
        }));

        const [existingOutline] = await db
          .select({ id: outlines.id })
          .from(outlines)
          .where(eq(outlines.assignmentId, row.id))
          .limit(1);

        if (existingOutline) {
          await db
            .update(outlines)
            .set({
              title: result.outlineTitle,
              structure,
              updatedAt: sql`now()`,
            })
            .where(eq(outlines.id, existingOutline.id));
        } else {
          await db.insert(outlines).values({
            assignmentId: row.id,
            title: result.outlineTitle,
            structure,
          });
        }

        // Claims: writing uses explicit claims; others use section claimOrPoint.
        const claimTexts =
          result.claims && result.claims.length > 0
            ? result.claims
            : result.sections
                .map((s) => s.claimOrPoint)
                .filter((c): c is string => Boolean(c?.trim()));

        const existingClaims = await db
          .select({ id: claims.id, statement: claims.statement })
          .from(claims)
          .where(eq(claims.assignmentId, row.id));

        let claimOrder = existingClaims.length;
        let claimsAdded = 0;
        for (const statement of claimTexts) {
          const dup = existingClaims.some(
            (c) =>
              c.statement.trim().toLowerCase() === statement.trim().toLowerCase(),
          );
          if (dup) continue;
          await db.insert(claims).values({
            assignmentId: row.id,
            statement: statement.slice(0, 2000),
            sortOrder: claimOrder++,
          });
          claimsAdded += 1;
        }

        await db
          .update(assignments)
          .set({ nextAction: result.nextAction, updatedAt: sql`now()` })
          .where(eq(assignments.id, row.id));

        await ensureAssignmentProgressAtLeast(row.id, 60);
        lastNextAction = result.nextAction;
        lastAsk = writing
          ? "Check claim coverage against the rubric — what gaps remain? Do not write paragraphs."
          : "Review this plan against the guideline — what should I adjust before producing?";
        lastTab = step.tab;
        lastMode = step.mode;

        emit({
          type: "step_done",
          step: step.id,
          index: index + 1,
          total,
          label: step.label,
          tab: step.tab,
          mode: step.mode,
          summary: result.nextAction,
          artifacts: [
            `${result.sections.length} sections`,
            claimsAdded ? `${claimsAdded} claims` : null,
          ].filter(Boolean) as string[],
          askPrompt: lastAsk,
        });
        continue;
      }

      if (step.id === "produce") {
        emit({
          type: "step_progress",
          step: step.id,
          message: "Writing plan cards (no full deliverable)…",
        });
        const raw = await aiJson<unknown>(
          producePrompt({
            assignmentType,
            title: row.title,
            writing,
            sections: planSections,
          }),
          modelId,
        );
        if (signalAborted(signal)) break;
        const result = normalizeProduce(raw);

        for (const plan of result.plans) {
          const body = [
            `Section: ${plan.section}`,
            `Claim/goal: ${plan.claimOrGoal}`,
            plan.evidenceOrChecks
              ? `Evidence/checks: ${plan.evidenceOrChecks}`
              : null,
            plan.logicOrVerify ? `Verify: ${plan.logicOrVerify}` : null,
            "",
            "(Build scaffolding only — fill this yourself. No full essay/report body was generated.)",
          ]
            .filter(Boolean)
            .join("\n");

          await db.insert(notes).values({
            assignmentId: row.id,
            title: `Draft plan · ${plan.section}`.slice(0, 255),
            body,
            sourceLabel: "draft-planner",
          });
        }

        await db
          .update(assignments)
          .set({ nextAction: result.nextAction, updatedAt: sql`now()` })
          .where(eq(assignments.id, row.id));

        await ensureAssignmentProgressAtLeast(row.id, 80);
        lastNextAction = result.nextAction;
        lastAsk = writing
          ? "Coach me through the first section plan card — questions only, no essay paragraphs."
          : "Coach me through the first work card — questions and checks only, no full solution.";
        lastTab = step.tab;
        lastMode = step.mode;

        emit({
          type: "step_done",
          step: step.id,
          index: index + 1,
          total,
          label: step.label,
          tab: step.tab,
          mode: step.mode,
          summary: result.nextAction,
          artifacts: [`${result.plans.length} plan cards`],
          askPrompt: lastAsk,
        });
        continue;
      }

      if (step.id === "handoff") {
        emit({
          type: "step_progress",
          step: step.id,
          message: "Opening coach handoff…",
        });
        await db.insert(memories).values({
          userId,
          scope: "assignment",
          assignmentId: row.id,
          courseId: row.courseId,
          kind: "build",
          content: `Build completed for ${assignmentType}. Student should own the final deliverable; scaffolding only.`,
          metadata: { step: "handoff" },
        });

        lastAsk =
          lastAsk ??
          "What should I do next with the scaffolding Build created? Do not write the full deliverable.";
        lastTab = step.tab;
        lastMode = step.mode;

        emit({
          type: "step_done",
          step: step.id,
          index: index + 1,
          total,
          label: step.label,
          tab: step.tab,
          mode: step.mode,
          summary: "Scaffolding ready — your turn to produce.",
          artifacts: ["coach handoff"],
          askPrompt: lastAsk,
        });
        continue;
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Build step failed";
      console.warn(`[studyflow] build step ${step.id} failed:`, error);
      emit({
        type: "step_error",
        step: step.id,
        index: index + 1,
        total,
        error: message,
      });
      // Continue to next step when possible — partial build is still useful.
    }

    revalidateHints();
  }

  const progress = (await recomputeAssignmentProgress(row.id)) ?? row.progress;
  const [fresh] = await db
    .select({ nextAction: assignments.nextAction })
    .from(assignments)
    .where(eq(assignments.id, row.id))
    .limit(1);

  emit({
    type: "done",
    cancelled: signalAborted(signal),
    progress,
    nextAction: fresh?.nextAction ?? lastNextAction,
    askPrompt: lastAsk,
    tab: lastTab,
    mode: lastMode,
  });
}
