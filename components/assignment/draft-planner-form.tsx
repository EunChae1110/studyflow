"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheckBig } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const plannerSchema = z.object({
  section: z.string().min(3, "Section name is required."),
  claim: z.string().min(20, "Add a clearer claim."),
  evidence: z.string().min(12, "Add at least one evidence note."),
  logicCheck: z.string().min(12, "Document how the claim is justified."),
});

type PlannerValues = z.infer<typeof plannerSchema>;

export function DraftPlannerForm() {
  const [saved, setSaved] = React.useState(false);
  const form = useForm<PlannerValues>({
    resolver: zodResolver(plannerSchema),
    defaultValues: {
      section: "Body — Integrity benefits",
      claim: "3NF reduces update anomalies by removing transitive dependencies.",
      evidence: "Chen & Okonkwo (2023), p.214 + Lecture 04, p.15",
      logicCheck: "",
    },
  });

  const onSubmit = form.handleSubmit(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <h3 className="text-sm font-semibold">Draft planning worksheet</h3>
      <p className="text-xs text-muted">
        Use AI to organise and verify. You write the final argument in your own words.
      </p>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted">Section</label>
        <Input {...form.register("section")} className="bg-background" />
        <FieldError message={form.formState.errors.section?.message} />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted">Claim</label>
        <Textarea {...form.register("claim")} className="min-h-16 bg-background" />
        <FieldError message={form.formState.errors.claim?.message} />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted">Evidence anchors</label>
        <Textarea {...form.register("evidence")} className="min-h-16 bg-background" />
        <FieldError message={form.formState.errors.evidence?.message} />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted">Logic check</label>
        <Textarea
          {...form.register("logicCheck")}
          placeholder="Explain why the evidence supports the claim, and one limitation to evaluate."
          className="min-h-20 bg-background"
        />
        <FieldError message={form.formState.errors.logicCheck?.message} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit">Save planning note</Button>
        <Button type="button" variant="outline">
          Verify logic
        </Button>
        <Button type="button" variant="outline">
          Build evidence
        </Button>
      </div>

      {saved ? (
        <p className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
          <CircleCheckBig className="size-3.5" />
          Saved to draft notes.
        </p>
      ) : null}
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-600 dark:text-red-400">{message}</p>;
}
