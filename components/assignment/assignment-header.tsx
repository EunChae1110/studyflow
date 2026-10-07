import Link from "next/link";
import { Download, Share2, Shield, Sparkles } from "lucide-react";
import { assignment } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AssignmentHeader() {
  return (
    <section className="mb-5 space-y-3">
      <Link href="/dashboard" className="inline-flex text-xs font-medium text-muted hover:text-foreground">
        ← Back to overview
      </Link>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{assignment.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{assignment.course}</Badge>
            <Badge variant="outline">{assignment.wordLimit}</Badge>
            <Badge variant="outline">{assignment.citationStyle}</Badge>
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              {assignment.due}
            </Badge>
            <Badge className="bg-primary-soft text-primary">
              <Shield className="size-3" />
              {assignment.supportMode}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="size-3.5" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="size-3.5" />
            Export
          </Button>
          <Button variant="ghost" size="sm">
            <Sparkles className="size-3.5" />
            Actions
          </Button>
        </div>
      </div>
    </section>
  );
}
