import { Lock } from "lucide-react";
import { DraftPlannerForm } from "@/components/assignment/draft-planner-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AssignmentDraftPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Draft workspace</h2>
        <p className="text-sm text-muted">
          This area supports planning, verification, and logic checks. Final writing stays student-authored.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <DraftPlannerForm assignmentSlug={assignmentId} />
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-base">Support guardrails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted">
            <p className="rounded-lg border border-primary/25 bg-primary-soft p-3 text-primary">
              <Lock className="mr-1 inline size-3.5" />
              No generate-essay action is available in StudyFlow.
            </p>
            <p>Use AI to understand requirements, verify factual claims, and improve structure.</p>
            <div className="space-y-1">
              <Badge variant="secondary">Understand</Badge>{" "}
              <Badge variant="secondary">Check logic</Badge>{" "}
              <Badge variant="secondary">Build evidence</Badge>{" "}
              <Badge variant="secondary">Review</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
