import { Suspense } from "react";
import { StudyflowChat } from "@/components/ai/studyflow-chat";
import { MaterialUploadPanel } from "@/components/assignment/material-upload";
import { NotesAskButton } from "@/components/assignment/notes-ask-button";
import { requireUser } from "@/lib/auth";
import { getAssignmentBySlug, getCourseMaterials } from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";

async function NotesWorkspace({ assignmentSlug }: { assignmentSlug: string }) {
  const user = await requireUser();
  const assignment = await getAssignmentBySlug(assignmentSlug, user.id);
  const materials = await getCourseMaterials(assignmentSlug);

  if (!assignment) {
    return (
      <p className="text-sm text-muted">Assignment not found.</p>
    );
  }

  return (
    <div className="grid min-h-[640px] overflow-hidden rounded-xl border border-border bg-surface lg:grid-cols-[260px_1fr]">
      <aside className="study-scroll border-b border-border bg-surface p-4 lg:border-r lg:border-b-0">
        <h3 className="mb-3 text-sm font-semibold">Course materials</h3>
        <MaterialUploadPanel
          assignmentId={assignment.id}
          assignmentSlug={assignment.slug}
          materials={materials}
        />
      </aside>

      <section className="flex min-h-0 flex-col bg-background">
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface px-4 py-3">
          <Badge className="bg-primary-soft text-primary">Notes-only</Badge>
          <p className="text-xs text-muted">
            {materials.length > 0
              ? "Grounded in your uploaded materials"
              : "Upload materials to ground answers"}
          </p>
          <div className="ml-auto flex flex-wrap gap-1">
            <NotesAskButton
              icon="lightbulb"
              label="Explain"
              prompt="Explain the key concepts in my lecture notes for this assignment. Ground answers only in my materials."
            />
            <NotesAskButton
              icon="search"
              label="Find related"
              prompt="What related ideas in my notes should I connect for this assignment?"
            />
            <NotesAskButton
              icon="help-circle"
              label="Quiz me"
              prompt="Quiz me on my lecture notes for this assignment. Ask one question at a time."
            />
            <NotesAskButton
              icon="book-open"
              label="Show source page"
              prompt="When you cite my notes, always include the source title and page if available."
            />
          </div>
        </div>

        <StudyflowChat
          mode="Notes-only"
          placeholder="Ask about your lecture materials..."
          hint="External sources disabled. Answers are grounded only in your course materials + guideline."
          extraChips={["Explain this concept", "Quiz me"]}
          assignmentId={assignmentSlug}
          seedQuestions={[
            "Summarise the key definitions in my lecture notes",
            "What should I verify before using a claim from these notes?",
          ]}
        />
      </section>
    </div>
  );
}

export default function AssignmentNotesPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  return (
    <Suspense fallback={<div className="h-[640px] animate-pulse rounded-xl bg-surface-muted" />}>
      <AssignmentNotesPageParams params={params} />
    </Suspense>
  );
}

async function AssignmentNotesPageParams({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  return <NotesWorkspace assignmentSlug={assignmentId} />;
}
