import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AssignmentOutlinePage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Outline builder</h2>
          <p className="text-sm text-muted">Build claims, attach evidence, then write explanations yourself.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="../claim-evidence">Claim–evidence map</Link>
          </Button>
          <Button>Save outline</Button>
        </div>
      </div>

      <OutlineSection title="1. Introduction" state={<Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Claim set</Badge>}>
        <LabeledInput label="Claim" defaultValue="Normalisation systematically improves integrity by removing harmful dependencies." />
        <div>
          <Label>Evidence</Label>
          <div className="rounded-lg border border-border bg-surface p-3">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-medium">Chen &amp; Okonkwo (2023)</p>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Supports</Badge>
            </div>
            <p className="text-xs text-muted">“3NF eliminated 41% of observed update anomalies…”</p>
          </div>
        </div>
        <LabeledTextArea label="Your explanation (write this yourself)" placeholder="Paraphrase the claim and evidence in your own words..." />
      </OutlineSection>

      <OutlineSection title="2. Body — Integrity benefits" state={<Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">Needs evidence</Badge>}>
        <LabeledInput label="Claim" defaultValue="3NF reduces update anomalies by removing transitive dependencies." />
        <div>
          <Label>Evidence</Label>
          <div className="rounded-lg border border-amber-300 bg-amber-100/50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
            <p className="inline-flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              Source needs review before it can be used as evidence. Verify in Research first.
            </p>
          </div>
        </div>
        <LabeledTextArea label="Your explanation" placeholder="Explain how this evidence supports your claim..." />
      </OutlineSection>

      <OutlineSection title="3. Body — Redundancy reduction" state={<Badge variant="secondary">Draft</Badge>}>
        <LabeledInput label="Claim" placeholder="State a claim about redundancy..." />
        <div>
          <Label>Evidence</Label>
          <Button size="sm" variant="outline">
            + Attach evidence from library
          </Button>
        </div>
        <LabeledTextArea label="Your explanation" placeholder="Write your explanation..." />
      </OutlineSection>

      <OutlineSection title="4. Conclusion" state={<Badge variant="secondary">Empty</Badge>}>
        <LabeledTextArea label="Judgement" placeholder="Weigh benefits against limitations and state your overall evaluation..." />
      </OutlineSection>
    </div>
  );
}

function OutlineSection({
  title,
  state,
  children,
}: {
  title: string;
  state: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface">
      <header className="flex items-center justify-between border-b border-border bg-surface-muted px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {state}
      </header>
      <div className="space-y-3 p-4">{children}</div>
    </section>
  );
}

function LabeledInput({
  label,
  defaultValue,
  placeholder,
}: {
  label: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input defaultValue={defaultValue} placeholder={placeholder} className="mt-1 bg-background" />
    </div>
  );
}

function LabeledTextArea({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Textarea placeholder={placeholder} className="mt-1 min-h-20 bg-background" />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">{children}</p>;
}
