import Link from "next/link";
import { BookOpen, FileCheck2, GraduationCap } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getCoursesForUser } from "@/lib/db/queries";
import { CreateCourseForm } from "@/components/workspace/create-course-form";
import { DeleteButton } from "@/components/workspace/delete-button";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function CoursesPage() {
  const user = await requireUser();
  const courses = await getCoursesForUser(user.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Courses</h1>
          <p className="text-sm text-muted">
            Course hubs keep lecture notes, assignment requirements, and source evidence connected.
          </p>
        </div>
        <CreateCourseForm />
      </div>
      {courses.length === 0 ? (
        <Card className="border-border bg-surface">
          <CardContent className="space-y-3 p-6 text-sm text-muted">
            <p>No courses yet. Create your first course to group assignments and durable AI memory.</p>
            <CreateCourseForm triggerVariant="outline" />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="border-border bg-surface">
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="size-4 shrink-0 text-primary" />
                  <Link href={`/courses/${course.id}`} className="hover:underline">
                    {course.name}
                  </Link>
                </CardTitle>
                <DeleteButton
                  kind="course"
                  id={course.id}
                  label={course.name}
                  size="xs"
                  variant="ghost"
                />
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
                <Link
                  href={`/courses/${course.id}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-1")}
                >
                  Open course
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
