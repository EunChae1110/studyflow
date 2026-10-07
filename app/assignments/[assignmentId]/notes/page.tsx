import { BookOpen, FileText, HelpCircle, Lightbulb, Search } from "lucide-react";
import { AssistantAnswer, UserBubble } from "@/components/ai/chat";
import { PromptBar } from "@/components/ai/prompt-bar";
import { ThinkingBlock } from "@/components/ai/thinking-block";
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

        <div className="study-scroll flex-1 space-y-4 overflow-y-auto p-4">
          <UserBubble>{aiMessages.notes.firstQuestion}</UserBubble>

          <div className="space-y-2">
            <ThinkingBlock
              state="done"
              title="Thought for 3 seconds"
              defaultOpen={false}
              steps={[
                { text: "Checking Lecture 04 — Normal Forms.pdf...", status: "done" },
                { text: "Matching definition of 2NF to indexed pages...", status: "done" },
                { text: "Confirming citation on p.12...", status: "done" },
              ]}
            />
            <AssistantAnswer
              citation={aiMessages.notes.firstCitation}
              actions={
                <>
                  <Button size="sm" variant="outline">
                    View sources
                  </Button>
                  <Button size="sm" variant="secondary">
                    Save to notes
                  </Button>
                  <Button size="sm" variant="ghost">
                    Show source page
                  </Button>
                </>
              }
            >
              {aiMessages.notes.firstAnswer}
            </AssistantAnswer>
          </div>

          <UserBubble>{aiMessages.notes.secondQuestion}</UserBubble>
          <ThinkingBlock
            state="active"
            title="Thinking..."
            steps={[
              { text: "Searching uploaded course materials...", status: "done" },
              { text: "Checking Lecture 03 & Tutorial 02 for denormalisation...", status: "active" },
              { text: "Verifying whether citation can be attached...", status: "pending" },
            ]}
          />
          <AssistantAnswer dimmed>
            <span className="inline-flex items-center gap-2 text-xs text-muted">
              <FileText className="size-3.5" />
              Preparing a grounded answer...
            </span>
          </AssistantAnswer>
        </div>

        <div className="border-t border-border bg-background p-3">
          <PromptBar
            mode="Notes-only"
            placeholder="Ask about your lecture materials..."
            hint="External sources disabled. Answers are grounded only in your course materials."
            extraChips={["Lecture 04 in context"]}
          />
        </div>
      </section>
    </div>
  );
}

function TopAction({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Button variant="ghost" size="sm" className="text-xs">
      <Icon className="size-3.5" />
      {label}
    </Button>
  );
}
