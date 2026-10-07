import { Suspense } from "react";
import { BookOpen, HelpCircle, Lightbulb, Search } from "lucide-react";
import { StudyflowChat } from "@/components/ai/studyflow-chat";
import { NotesAskButton } from "@/components/assignment/notes-ask-button";
import { getCourseMaterials } from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

async function NotesWorkspace({ assignmentId }: { assignmentId: string }) {
  const materials = await getCourseMaterials(assignmentId);

  return (
    <div className="grid min-h-[640px] overflow-hidden rounded-xl border border-border bg-surface lg:grid-cols-[260px_1fr]">
      <aside className="study-scroll border-b border-border bg-surface p-4 lg:border-r lg:border-b-0">
        <h3 className="mb-3 text-sm font-semibold">Course materials</h3>
        <div className="space-y-1">
          {materials.length === 0 ? (
            <p className="px-1 text-xs text-muted">No materials uploaded yet.</p>
          ) : (
            materials.map((doc, index) => (
              <div
                key={doc.id}
                className={`w-full rounded-lg px-3 py-2 text-left ${
                  index === 0 ? "bg-primary-soft text-primary" : ""
                }`}
              >
                <p className="text-sm font-medium">{doc.title}</p>
                <p className="text-xs text-muted">
                  {doc.pages != null ? `${doc.pages} pages · ` : ""}
                  {doc.status}
                </p>
              </div>
            ))
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 w-full"
          disabled
          title="Material upload coming next"
        >
          + Upload material
        </Button>
      </aside>

      <section className="flex min-h-0 flex-col bg-background">
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface px-4 py-3">
          <Badge className="bg-primary-soft text-primary">Notes-only</Badge>
          <p className="text-xs text-muted">External sources disabled</p>
          <div className="ml-auto flex flex-wrap gap-1">
            <NotesAskButton
              icon={Lightbulb}
              label="Explain"
              prompt="Explain the key concepts in my lecture notes for this assignment. Ground answers only in my materials."
            />
            <NotesAskButton
              icon={Search}
              label="Find related"
              prompt="What related ideas in my notes should I connect for this assignment?"
            />
            <NotesAskButton
              icon={HelpCircle}
              label="Quiz me"
              prompt="Quiz me on my lecture notes for this assignment. Ask one question at a time."
            />
            <NotesAskButton
              icon={BookOpen}
              label="Show source page"
              prompt="When you cite my notes, always include the source title and page if available."
            />
          </div>
        </div>

        <StudyflowChat
          mode="Notes-only"
          placeholder="Ask about your lecture materials..."
          hint="External sources disabled. Answers are grounded only in your course materials."
          extraChips={["Explain this concept", "Quiz me"]}
          assignmentId={assignmentId}
          seedQuestions={[
            "Summarise the key definitions in my lecture notes",
            "What should I verify before using a claim from these notes?",
          ]}
        />
      </section>
    </div>
  );
}

export default async function AssignmentNotesPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  return (
    <Suspense fallback={<div className="h-[640px] animate-pulse rounded-xl bg-surface-muted" />}>
      <NotesWorkspace assignmentId={assignmentId} />
    </Suspense>
  );
}
