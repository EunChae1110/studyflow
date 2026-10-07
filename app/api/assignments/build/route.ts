import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { runAssignmentBuild } from "@/lib/build/orchestrator";
import type { BuildEvent } from "@/lib/build/types";
import { hasAiCredentials } from "@/lib/ai/provider";
import { getAssignmentBySlug } from "@/lib/db/queries";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasAiCredentials()) {
    return Response.json(
      { error: "AI mid-station is not configured." },
      { status: 503 },
    );
  }

  let body: { assignmentSlug?: string; modelId?: string };
  try {
    body = (await req.json()) as { assignmentSlug?: string; modelId?: string };
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const assignmentSlug = body.assignmentSlug?.trim();
  if (!assignmentSlug) {
    return Response.json({ error: "assignmentSlug is required" }, { status: 400 });
  }

  const assignment = await getAssignmentBySlug(assignmentSlug, session.userId);
  if (!assignment) {
    return Response.json({ error: "Assignment not found." }, { status: 404 });
  }

  const encoder = new TextEncoder();
  const signal = req.signal;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (event: BuildEvent) => {
        if (signal.aborted) return;
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        } catch {
          /* stream closed */
        }
      };

      try {
        await runAssignmentBuild({
          userId: session.userId,
          assignmentSlug,
          modelId: body.modelId,
          signal,
          emit,
        });
      } catch (error) {
        emit({
          type: "error",
          error:
            error instanceof Error ? error.message : "Build failed unexpectedly",
        });
      } finally {
        try {
          revalidatePath(`/assignments/${assignmentSlug}`);
          revalidatePath(`/assignments/${assignmentSlug}/brief`);
          revalidatePath(`/assignments/${assignmentSlug}/notes`);
          revalidatePath(`/assignments/${assignmentSlug}/research`);
          revalidatePath(`/assignments/${assignmentSlug}/outline`);
          revalidatePath(`/assignments/${assignmentSlug}/draft`);
          revalidatePath(`/assignments/${assignmentSlug}/references`);
          revalidatePath("/assignments");
          revalidatePath("/dashboard");
        } catch {
          /* ignore revalidate errors during stream */
        }
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
    cancel() {
      /* client aborted — AbortSignal on req handles orchestrator */
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
