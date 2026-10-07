import { BookOpen, FileCheck2, GraduationCap } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getCoursesForUser } from "@/lib/db/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CoursesPage() {
  const user = await requireUser();
  const courses = await getCoursesForUser(user.id);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Courses</h1>
        <p className="text-sm text-muted">
          Course hubs keep lecture notes, assignment requirements, and source evidence connected.
        </p>
      </div>
      {courses.length === 0 ? (
        <Card className="border-border bg-surface">
          <CardContent className="p-6 text-sm text-muted">
            No courses yet. Create a course when you add your first assignment.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="border-border bg-surface">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="size-4 text-primary" />
                  {course.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted">
                  {[course.code, course.term].filter(Boolean).join(" · ") || "Course workspace"}
                </p>
                <p className="flex items-center gap-2 text-xs text-muted">
                  <FileCheck2 className="size-3.5" />
                  Linked to your assignments
                </p>
                <p className="flex items-center gap-2 text-xs text-muted">
                  <GraduationCap className="size-3.5" />
                  Learning support mode enabled
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
