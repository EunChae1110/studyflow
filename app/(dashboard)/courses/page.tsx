import { BookOpen, FileCheck2, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const courses = [
  {
    name: "Database Systems",
    summary: "Normalisation, SQL optimisation, and integrity constraints.",
    assignments: 2,
  },
  {
    name: "Academic English",
    summary: "Critical reading, argument structure, and referencing conventions.",
    assignments: 1,
  },
  {
    name: "Economics",
    summary: "Policy analysis and evidence-based case writing.",
    assignments: 1,
  },
];

export default function CoursesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Courses</h1>
        <p className="text-sm text-muted">
          Course hubs keep lecture notes, assignment requirements, and source evidence connected.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.name} className="border-border bg-surface">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="size-4 text-primary" />
                {course.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted">{course.summary}</p>
              <p className="flex items-center gap-2 text-xs text-muted">
                <FileCheck2 className="size-3.5" />
                {course.assignments} active assignments
              </p>
              <p className="flex items-center gap-2 text-xs text-muted">
                <GraduationCap className="size-3.5" />
                Learning support mode enabled
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
