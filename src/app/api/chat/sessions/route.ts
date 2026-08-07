import { createClient } from "@/lib/supabase/server";
import { listSessions } from "@/lib/supabase/queries/chat";

export async function GET(): Promise<Response> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const sessions = await listSessions(user.id);
  return Response.json(sessions);
}
