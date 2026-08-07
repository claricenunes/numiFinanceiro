import { createClient } from "@/lib/supabase/server";
import { getOwnedSessionId, getRecentMessages } from "@/lib/supabase/queries/chat";

// Full-conversation view — same ownership check and query shape as the
// prompt-building window in POST /api/chat, just a bigger limit.
const MAX_MESSAGES = 200;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { id } = await params;
  const sessionId = await getOwnedSessionId(id, user.id);
  if (!sessionId) {
    return new Response(JSON.stringify({ error: "Conversation not found" }), { status: 404 });
  }

  const messages = await getRecentMessages(sessionId, MAX_MESSAGES);
  return Response.json(messages);
}
