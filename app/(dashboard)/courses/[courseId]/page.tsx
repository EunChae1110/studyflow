import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen } from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  getCourseById,
  listAssignmentsForCourse,
} from "@/lib/db/queries";
import { DeleteButton } from "@/components/workspace/delete-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type CoursePageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { courseId } = await params;
  const user = await requireUser();
  const course = await getCourseById(courseId, user.id);
  if (!course) notFound();

  const items = await listAssignmentsForCourse(course.id, user.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/courses"
            className="mb-2 inline-flex text-xs font-medium text-muted hover:text-foreground"
          >
            ← All courses
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <BookOpen className="size-5 text-primary" />
            {course.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {[course.code, course.term].filter(Boolean).join(" · ") || "Course workspace"}
          </p>
        </div>
        <DeleteButton
          kind="course"
          id={course.id}
          label={course.name}
          redirectTo="/courses"
        />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold">Assignments</h2>
        {items.length === 0 ? (
          <Card className="border-border bg-surface">
            <CardContent className="p-6 text-sm text-muted">
              No assignments linked to this course yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((assignment) => (
              <Card key={assignment.slug} className="border-border bg-surface">
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{assignment.title}</CardTitle>
                    <p className="mt-1 text-xs text-muted">{assignment.due}</p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    {assignment.progress}%
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Progress value={assignment.progress} className="h-1.5 bg-surface-muted" />
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/assignments/${assignment.slug}/brief`}
                      className={cn(
                        buttonVariants(),
                        "inline-flex items-center gap-1.5",
                      )}
                    >
                      Open workspace
                      <ArrowRight className="size-4" />
                    </Link>
                    <DeleteButton
                      kind="assignment"
                      id={assignment.slug}
                      label={assignment.title}
                      variant="ghost"
                      size="sm"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
