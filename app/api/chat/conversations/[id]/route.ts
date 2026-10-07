import { getSession } from "@/lib/auth/session";
import { getConversationForUser } from "@/lib/db/queries";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await getConversationForUser({
    userId: session.userId,
    conversationId: id,
  });

  if (!result) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({
    conversation: {
      id: result.conversation.id,
      title: result.conversation.title,
      mode: result.conversation.mode,
      assignmentId: result.conversation.assignmentId,
      updatedAt: result.conversation.updatedAt.toISOString(),
    },
    messages: result.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      thinking: m.thinking,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}
