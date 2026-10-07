import { AlertTriangle } from "lucide-react";
import { AssistantPanel } from "@/components/ai/assistant-panel";
import { AssistantAnswer, UserBubble } from "@/components/ai/chat";
import { ThinkingBlock } from "@/components/ai/thinking-block";
import { Button } from "@/components/ui/button";

export function AssignmentAiPanel({ view }: { view: "brief" | "notes" | "research" | "outline" | "draft" | "references" }) {
  if (view === "notes") {
    return (
      <AssistantPanel
        activeMode="Notes-only"
        promptPlaceholder="Ask about your lecture materials..."
        promptHint="External sources disabled. Answers are grounded only in your course materials."
        promptChips={["Lecture 04 in context"]}
      >
        <UserBubble>What is second normal form (2NF), based on my lecture notes?</UserBubble>
        <div className="space-y-2">
          <ThinkingBlock
            state="done"
            title="Thought for 3 seconds"
            defaultOpen={false}
            steps={[
              { text: "Checking Lecture 04 — Normal Forms.pdf...", status: "done" },
              { text: "Matching definition to indexed pages...", status: "done" },
              { text: "Attaching citation from p.12...", status: "done" },
            ]}
          />
          <AssistantAnswer
            citation={{
              source: "Lecture 04 — Normal Forms.pdf",
              page: "p.12",
              kind: "lecture-notes",
            }}
            actions={
              <>
                <Button size="sm" variant="outline">
                  View sources
                </Button>
                <Button size="sm" variant="secondary">
                  Save to notes
                </Button>
              </>
            }
          >
            Second normal form requires the relation to be in 1NF, with each non-prime attribute fully dependent on the whole candidate key.
          </AssistantAnswer>
        </div>

        <UserBubble>Does my lecturer mention denormalisation trade-offs?</UserBubble>
        <ThinkingBlock
          state="active"
          title="Thinking..."
          defaultOpen
          steps={[
            { text: "Searching uploaded course materials...", status: "done" },
            { text: "Checking Lecture 03 & Tutorial 02 for trade-offs...", status: "active" },
            { text: "Verifying if a citation can be attached...", status: "pending" },
          ]}
        />
        <AssistantAnswer dimmed>Preparing a grounded answer...</AssistantAnswer>
      </AssistantPanel>
    );
  }

  if (view === "outline" || view === "draft") {
    return (
      <AssistantPanel
        title={view === "draft" ? "Draft coach" : "Outline feedback"}
        activeMode="Outline"
        promptPlaceholder="Ask for structural feedback or guiding questions..."
        promptHint="Primary actions: Check logic · Build evidence · Add to outline. No essay generation."
        promptChips={["4 sections"]}
        showAttach={false}
      >
        <ThinkingBlock
          state="done"
          title="Reviewed outline structure"
          steps={[
            { text: "Checking claim coverage against rubric...", status: "done" },
            { text: "Matching claims to verified sources...", status: "done" },
            { text: "Flagging unverified evidence...", status: "done" },
          ]}
        />
        <AssistantAnswer>
          Your introduction claim is clear. Body 1 still has unverified evidence. Verify it first, then add one counterargument source so your evaluation balances strengths and limitations.
          <div className="mt-2 grid gap-1.5">
            <Button size="sm" variant="outline" className="justify-start">
              Ask guiding questions
            </Button>
            <Button size="sm" variant="outline" className="justify-start">
              Check logic
            </Button>
            <Button size="sm" variant="outline" className="justify-start">
              Find missing evidence
            </Button>
            <Button size="sm" variant="outline" className="justify-start">
              Suggest counterargument
            </Button>
          </div>
        </AssistantAnswer>
        <div className="rounded-lg border border-primary/20 bg-primary-soft p-3 text-xs text-primary">
          AI helps you plan and review structure. It will not write your essay for you.
        </div>
      </AssistantPanel>
    );
  }

  return (
    <AssistantPanel
      activeMode="Research"
      promptPlaceholder="Ask about requirements, rubric, or next steps..."
      promptHint="Learning support only — understand, verify, and plan. No essay generation."
      promptChips={view === "references" ? ["Citation style in context"] : ["Rubric · 5 criteria"]}
    >
      <ThinkingBlock
        state="done"
        title="Thought for 2 seconds"
        defaultOpen={false}
        steps={[
          { text: "Reading assignment brief & rubric weights...", status: "done" },
          { text: "Mapping question verbs to criteria...", status: "done" },
          { text: "Attaching citation badge...", status: "done" },
        ]}
      />
      <AssistantAnswer
        citation={{
          source: "Lecture 01 — Assessment Guide",
          page: "p.3",
          kind: "lecture-notes",
        }}
        actions={
          <>
            <Button size="sm" variant="outline">
              View sources
            </Button>
            <Button size="sm" variant="secondary">
              Save to notes
            </Button>
          </>
        }
      >
        The brief asks you to <strong>evaluate</strong>. That means weighing both benefits and limitations with evidence, then reaching a reasoned judgement.
      </AssistantAnswer>
      <UserBubble>What does “evaluate” mean for this rubric?</UserBubble>
      <AssistantAnswer
        citation={{
          source: "Module Handbook",
          page: "§4.2",
          kind: "lecture-notes",
        }}
      >
        In this module, evaluate means: compare strengths and weaknesses using evidence, then produce a justified judgement that aligns with analysis and evidence criteria.
      </AssistantAnswer>

      {view === "references" ? (
        <div className="rounded-lg border border-warning/35 bg-amber-100/50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            <p>One source has incomplete metadata. Complete it before exporting Harvard references.</p>
          </div>
        </div>
      ) : null}
    </AssistantPanel>
  );
}
