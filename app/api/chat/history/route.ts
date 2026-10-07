import { getSession } from "@/lib/auth/session";
import { listConversationsForAssignment } from "@/lib/db/queries";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const assignmentId = searchParams.get("assignmentId");
  if (!assignmentId) {
    return Response.json({ error: "assignmentId required" }, { status: 400 });
  }

  const conversations = await listConversationsForAssignment({
    userId: session.userId,
    assignmentId,
  });

  return Response.json({ conversations });
}
