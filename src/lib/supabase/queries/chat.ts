import { createClient } from "@/lib/supabase/server";
import type { ChatMessage, ChatRole, ChatSession } from "@/types/chat";

// How much of the first user message becomes the session's auto-title.
const TITLE_MAX_CHARS = 50;

type RawMessage = { id: string; role: string; content: string; created_at: string };
type RawSession = { id: string; title: string | null; updated_at: string };

/** Ownership lookup — never distinguishes "doesn't exist" from "belongs to
 * someone else": both resolve to `null`, so callers can't leak either way. */
export async function getOwnedSessionId(sessionId: string, userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

export async function createSession(userId: string): Promise<string | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("chat_sessions") as any)
    .insert({ user_id: userId })
    .select("id")
    .single();
  if (error || !data) return null;
  return data.id as string;
}

/** Last `limit` messages for a session, chronological (oldest first) —
 * used both for the prompt-building window and the full-conversation view,
 * just called with a different `limit`. */
export async function getRecentMessages(sessionId: string, limit: number): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("chat_messages")
    .select("id,role,content,created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(limit);

  const rows = (data as RawMessage[] | null) ?? [];
  return rows
    .reverse()
    .map((m) => ({ id: m.id, role: m.role as ChatRole, content: m.content, createdAt: m.created_at }));
}

export async function saveMessage(sessionId: string, userId: string, role: ChatRole, content: string): Promise<void> {
  const supabase = await createClient();
  await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("chat_messages") as any).insert({ session_id: sessionId, user_id: userId, role, content }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("chat_sessions") as any).update({ updated_at: new Date().toISOString() }).eq("id", sessionId),
  ]);
}

/** Only sets the title once — if it's already set, this is a no-op. Called
 * right after the first user message of a session is saved. */
export async function maybeSetTitle(sessionId: string, firstMessage: string): Promise<void> {
  const supabase = await createClient();
  const title = firstMessage.length > TITLE_MAX_CHARS
    ? `${firstMessage.slice(0, TITLE_MAX_CHARS).trimEnd()}…`
    : firstMessage;
  await (supabase.from("chat_sessions") as
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any).update({ title }).eq("id", sessionId).is("title", null);
}

export async function listSessions(userId: string): Promise<ChatSession[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("chat_sessions")
    .select("id,title,updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  return ((data as RawSession[] | null) ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    updatedAt: s.updated_at,
  }));
}
