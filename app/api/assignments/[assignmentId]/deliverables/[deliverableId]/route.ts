import { getSession } from "@/lib/auth/session";
import { getAssignmentBySlug } from "@/lib/db/queries";
import { getDeliverableFile } from "@/lib/deliverables/store";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ assignmentId: string; deliverableId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assignmentId: slug, deliverableId } = await ctx.params;
  const assignment = await getAssignmentBySlug(slug, session.userId);
  if (!assignment) {
    return Response.json({ error: "Assignment not found." }, { status: 404 });
  }

  const file = await getDeliverableFile({
    deliverableId,
    userId: session.userId,
  });
  if (!file) {
    return Response.json({ error: "File not found." }, { status: 404 });
  }

  const encoded = encodeURIComponent(file.originalName).replace(/['()]/g, escape);
  return new Response(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": file.mimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encoded}`,
      "Cache-Control": "private, no-cache",
    },
  });
}
