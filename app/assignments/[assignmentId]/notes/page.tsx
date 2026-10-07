import { Suspense } from "react";
import { BookOpen, HelpCircle, Lightbulb, Search } from "lucide-react";
import { StudyflowChat } from "@/components/ai/studyflow-chat";
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
              <button
                type="button"
                key={doc.id}
                className={`w-full rounded-lg px-3 py-2 text-left ${
                  index === 0 ? "bg-primary-soft text-primary" : "hover:bg-surface-muted"
                }`}
              >
                <p className="text-sm font-medium">{doc.title}</p>
                <p className="text-xs text-muted">
                  {doc.pages != null ? `${doc.pages} pages · ` : ""}
                  {doc.status}
                </p>
              </button>
            ))
          )}
        </div>
        <Button variant="outline" size="sm" className="mt-4 w-full">
          + Upload material
        </Button>
      </aside>

      <section className="flex min-h-0 flex-col bg-background">
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface px-4 py-3">
          <Badge className="bg-primary-soft text-primary">Notes-only</Badge>
          <p className="text-xs text-muted">External sources disabled</p>
          <div className="ml-auto flex flex-wrap gap-1">
            <TopAction icon={Lightbulb} label="Explain" />
            <TopAction icon={Search} label="Find related" />
            <TopAction icon={HelpCircle} label="Quiz me" />
            <TopAction icon={BookOpen} label="Show source page" />
          </div>
        </div>

        <StudyflowChat
          mode="Notes-only"
          placeholder="Ask about your lecture materials..."
          hint="External sources disabled. Answers are grounded only in your course materials."
          extraChips={materials[0] ? [materials[0].title] : undefined}
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

function TopAction({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Button variant="ghost" size="sm" className="text-xs">
      <Icon className="size-3.5" />
      {label}
    </Button>
  );
}
