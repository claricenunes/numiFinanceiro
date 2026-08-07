import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRateLimiter } from "@/lib/rateLimit";
import { classifyIntentHybrid, retrieveFinancialContext, buildChatPrompt, formatFallbackAnswer, HISTORY_LIMIT } from "@/lib/ai/chatContext";
import { GEMINI_ACTIVE, DEEPSEEK_ACTIVE, streamGeminiText, streamDeepSeekText, drainStream } from "@/lib/ai/providers";
import { answerWithTools } from "@/lib/ai/toolLoop";
import { getOwnedSessionId, createSession, getRecentMessages, saveMessage, maybeSetTitle } from "@/lib/supabase/queries/chat";
import { devLog } from "@/lib/devLog";

// Lighter-weight than FIA's 5/hour (a full portfolio analysis) since chat
// questions are cheap, frequent, single-answer lookups.
const checkRateLimit = createRateLimiter(60 * 60 * 1000, 30);

// Off by default — tool calling is additive and dormant until this is
// explicitly set. Everything below it (classifyIntentHybrid onward) is
// Phase 1/2/3.1's already-verified path, untouched either way.
const TOOL_CALLING_ENABLED = process.env.CHAT_TOOL_CALLING === "true";

function textStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
}

/** Persists the assistant's full answer once the stream finishes, without
 * blocking the response the client is already reading — see the Phase 2
 * plan's "Streaming vs. persisting" section for why `after()` + `tee()`. */
function persistAssistantReply(stream: ReadableStream<Uint8Array>, sessionId: string, userId: string): ReadableStream<Uint8Array> {
  const [clientStream, persistStream] = stream.tee();
  after(async () => {
    try {
      const fullText = await drainStream(persistStream);
      if (fullText.trim()) await saveMessage(sessionId, userId, "assistant", fullText);
    } catch (err) {
      devLog("persist_failed", { role: "assistant", reason: err instanceof Error ? err.message : "unknown error" });
    }
  });
  return clientStream;
}

export async function POST(req: Request): Promise<Response> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const rl = checkRateLimit(user.id);
  if (!rl.allowed) {
    const retryAfter = Math.ceil((rl.resetAt - Date.now()) / 1000);
    return new Response(
      JSON.stringify({ error: "Too many questions. Please try again in a few minutes.", retryAfter }),
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  let body: { sessionId?: string | null; message?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 });
  }

  // The client only ever tells us which conversation it's in — it is never
  // trusted to reconstruct history; that's loaded from the DB below.
  let sessionId: string;
  if (body.sessionId) {
    const owned = await getOwnedSessionId(body.sessionId, user.id);
    if (!owned) {
      return new Response(JSON.stringify({ error: "Conversation not found" }), { status: 404 });
    }
    sessionId = owned;
  } else {
    const created = await createSession(user.id);
    if (!created) {
      return new Response(JSON.stringify({ error: "Could not start a new conversation" }), { status: 500 });
    }
    sessionId = created;
  }

  // Load history *before* saving the current question — otherwise it would
  // show up twice (once in history, once as the question itself below).
  const history = await getRecentMessages(sessionId, HISTORY_LIMIT);

  // Saved immediately, before the AI is even called: if generation fails or
  // the request is interrupted, the question still survives.
  await saveMessage(sessionId, user.id, "user", message);
  await maybeSetTitle(sessionId, message);

  if (TOOL_CALLING_ENABLED && (GEMINI_ACTIVE || DEEPSEEK_ACTIVE)) {
    try {
      const toolAnswer = await answerWithTools(message, history, user.id);
      if (toolAnswer) {
        await saveMessage(sessionId, user.id, "assistant", toolAnswer.text);
        return new Response(textStream(toolAnswer.text), {
          headers: {
            "X-Chat-Session-Id": sessionId,
            "X-Chat-Provider": toolAnswer.provider,
            "X-Chat-Path": "tools",
            "content-type": "text/plain; charset=utf-8",
          },
        });
      }
      // null = no provider produced a usable answer (unsupported, empty
      // reply, round cap hit) — fall through to the classic path below,
      // same as every other "try the better path, degrade gracefully" spot.
      devLog("tool_path_fallback", { reason: "no_tool_answer" });
    } catch (err) {
      devLog("tool_path_fallback", { reason: err instanceof Error ? err.message : "unknown error" });
      console.warn("[chat] Tool-calling path failed, falling back:", err);
    }
  }

  const intent = await classifyIntentHybrid(message);

  const tRetrieval = Date.now();
  const context = await retrieveFinancialContext(message, intent);
  devLog("retrieval", { intent, ms: Date.now() - tRetrieval });

  const { system, user: userPrompt } = buildChatPrompt(message, context, history);
  // Gemini has no separate system-message slot in this call shape — fold it in.
  const geminiPrompt = `${system}\n\n${userPrompt}`;

  const commonHeaders = { "X-Chat-Intent": intent, "X-Chat-Session-Id": sessionId };

  if (GEMINI_ACTIVE) {
    const tAI = Date.now();
    try {
      const stream = await streamGeminiText(geminiPrompt, { maxOutputTokens: 600 });
      devLog("ai_response", { provider: "gemini", ms: Date.now() - tAI });
      const clientStream = persistAssistantReply(stream, sessionId, user.id);
      return new Response(clientStream, { headers: { ...commonHeaders, "X-Chat-Provider": "gemini", "content-type": "text/plain; charset=utf-8" } });
    } catch (err) {
      const reason = err instanceof Error ? err.message : "unknown error";
      devLog("ai_fallback", { provider: "gemini", reason, ms: Date.now() - tAI });
      console.warn("[chat] Gemini failed:", err);
    }
  }

  if (DEEPSEEK_ACTIVE) {
    const tAI = Date.now();
    try {
      const stream = await streamDeepSeekText(system, userPrompt, { maxTokens: 600 });
      devLog("ai_response", { provider: "deepseek", ms: Date.now() - tAI });
      const clientStream = persistAssistantReply(stream, sessionId, user.id);
      return new Response(clientStream, { headers: { ...commonHeaders, "X-Chat-Provider": "deepseek", "content-type": "text/plain; charset=utf-8" } });
    } catch (err) {
      const reason = err instanceof Error ? err.message : "unknown error";
      devLog("ai_fallback", { provider: "deepseek", reason, ms: Date.now() - tAI });
      console.warn("[chat] DeepSeek failed:", err);
    }
  }

  // No provider configured, or both failed — real data, formatted plainly.
  // The full text is already known here, so it's persisted directly instead
  // of via the tee()/after() dance the streaming paths need.
  devLog("ai_fallback", {
    provider: "none",
    reason: GEMINI_ACTIVE || DEEPSEEK_ACTIVE ? "all_providers_failed" : "no_provider_configured",
    ms: 0,
  });
  const fallbackText = formatFallbackAnswer(context);
  await saveMessage(sessionId, user.id, "assistant", fallbackText);
  return new Response(textStream(fallbackText), {
    headers: { ...commonHeaders, "X-Chat-Provider": "fallback", "content-type": "text/plain; charset=utf-8" },
  });
}
