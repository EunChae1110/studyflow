import { BookOpen, HelpCircle, Lightbulb, Search } from "lucide-react";
import { StudyflowChat } from "@/components/ai/studyflow-chat";
import { aiMessages, courseMaterials } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AssignmentNotesPage() {
  return (
    <div className="grid min-h-[640px] overflow-hidden rounded-xl border border-border bg-surface lg:grid-cols-[260px_1fr]">
      <aside className="study-scroll border-b border-border bg-surface p-4 lg:border-r lg:border-b-0">
        <h3 className="mb-3 text-sm font-semibold">Course materials</h3>
        <div className="space-y-1">
          {courseMaterials.map((doc, index) => (
            <button
              type="button"
              key={doc.title}
              className={`w-full rounded-lg px-3 py-2 text-left ${
                index === 0 ? "bg-primary-soft text-primary" : "hover:bg-surface-muted"
              }`}
            >
              <p className="text-sm font-medium">{doc.title}</p>
              <p className="text-xs text-muted">
                {doc.pages} pages · {doc.status}
              </p>
            </button>
          ))}
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
          extraChips={["Lecture 04 in context"]}
          seedQuestions={[
            aiMessages.notes.firstQuestion,
            aiMessages.notes.secondQuestion,
          ]}
        />
      </section>
    </div>
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
