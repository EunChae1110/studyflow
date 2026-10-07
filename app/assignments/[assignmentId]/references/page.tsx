import { AlertTriangle } from "lucide-react";
import { ReferencesTable } from "@/components/research/references-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AssignmentReferencesPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold">References</h2>
          <p className="text-sm text-muted">Verify metadata and format citations before submission.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">Citation style</span>
          <Select defaultValue="harvard">
            <SelectTrigger className="w-36 bg-surface">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="harvard">Harvard</SelectItem>
              <SelectItem value="apa">APA</SelectItem>
              <SelectItem value="mla">MLA</SelectItem>
              <SelectItem value="ieee">IEEE</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            Export .bib
          </Button>
          <Button size="sm">+ Add source</Button>
        </div>
      </div>

      <div className="rounded-lg border border-amber-300 bg-amber-100/55 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/25 dark:text-amber-200">
        <p className="inline-flex items-start gap-2">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          1 source has incomplete metadata. Fill missing fields before exporting your reference list.
        </p>
      </div>

      <ReferencesTable />

      <Card className="border-border bg-surface">
        <CardHeader>
          <CardTitle className="text-base">AI disclosure</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-muted">
          AI was used to summarise course materials, suggest research keywords, organise evidence, and
          provide structural feedback. The final interpretation and submission were written and verified
          by the student.
        </CardContent>
      </Card>
    </div>
  );
}
