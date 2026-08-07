/**
 * Shared low-level callers for the two AI providers this project talks to
 * directly over HTTP (no SDK — see `fia/analyze/route.ts`, the original
 * implementation this module was extracted from). Both the FIA feature
 * (JSON mode) and the chat assistant (streaming plain text) go through
 * these so the fetch/timeout/key-check plumbing exists in exactly one
 * place.
 */

const GEMINI_KEY   = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "";
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY ?? "";

// "gemini-2.5-flash" (this project's original choice) returns 404 for newer
// API keys — Google's error is literally "no longer available to new
// users." The "-latest" alias tracks whatever Google currently recommends,
// which avoids repeating this breakage on their next model rotation.
const GEMINI_MODEL = "gemini-flash-latest";

export const GEMINI_ACTIVE   = !!GEMINI_KEY   && !GEMINI_KEY.includes("your-");
export const DEEPSEEK_ACTIVE = !!DEEPSEEK_KEY && !DEEPSEEK_KEY.includes("your-");

export async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

/** Reads a text stream to completion — used both for the short LLM
 * intent-classification call and for persisting a streamed chat answer
 * once it's done, so this plumbing exists in exactly one place. */
export async function drainStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
  }
  return text;
}

/* ── Non-streaming (used by FIA's structured-JSON analysis) ─────────── */

export async function callGeminiJSON(
  prompt: string,
  opts: { temperature?: number; maxOutputTokens?: number; timeoutMs?: number } = {}
): Promise<string> {
  if (!GEMINI_ACTIVE) throw new Error("Gemini not configured");
  const { temperature = 0.4, maxOutputTokens = 2048, timeoutMs = 14000 } = opts;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;
  const res = await withTimeout(
    fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature, maxOutputTokens },
      }),
    }),
    timeoutMs
  );

  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const data = await res.json() as { candidates?: Array<{ content: { parts: Array<{ text: string }> } }> };
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export async function callDeepSeekJSON(
  systemPrompt: string,
  userPrompt: string,
  opts: { temperature?: number; maxTokens?: number; timeoutMs?: number } = {}
): Promise<string> {
  if (!DEEPSEEK_ACTIVE) throw new Error("DeepSeek not configured");
  const { temperature = 0.3, maxTokens = 2048, timeoutMs = 16000 } = opts;

  const res = await withTimeout(
    fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${DEEPSEEK_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature,
        max_tokens: maxTokens,
      }),
    }),
    timeoutMs
  );

  if (!res.ok) throw new Error(`DeepSeek HTTP ${res.status}`);
  const data = await res.json() as { choices?: Array<{ message: { content: string } }> };
  return data.choices?.[0]?.message?.content ?? "";
}

/* ── Streaming plain text (used by the chat assistant) ───────────────── */

/**
 * Turns a Server-Sent-Events byte stream into a plain-text byte stream —
 * buffers across chunk boundaries (network chunks never align with SSE
 * `data:` line boundaries) and calls `extract` on each parsed JSON payload
 * to pull out just the incremental text delta.
 */
function sseToTextStream(
  body: ReadableStream<Uint8Array>,
  extract: (data: unknown) => string | null
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            try {
              const text = extract(JSON.parse(payload));
              if (text) controller.enqueue(encoder.encode(text));
            } catch {
              // Partial/malformed chunk — skip it, next chunk will resync.
            }
          }
        }
      } catch (err) {
        controller.error(err);
        return;
      }
      controller.close();
    },
  });
}

// Bounds the whole request lifetime, not just time-to-first-byte: the same
// AbortSignal stays wired to the connection while the body streams, so a
// provider that stalls mid-response gets cut off too, not just one that
// never answers at all.
const STREAM_TIMEOUT_MS = 20000;

export async function streamGeminiText(
  prompt: string,
  opts: { temperature?: number; maxOutputTokens?: number; timeoutMs?: number } = {}
): Promise<ReadableStream<Uint8Array>> {
  if (!GEMINI_ACTIVE) throw new Error("Gemini not configured");
  const { temperature = 0.5, maxOutputTokens = 600, timeoutMs = STREAM_TIMEOUT_MS } = opts;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${GEMINI_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature, maxOutputTokens },
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok || !res.body) throw new Error(`Gemini HTTP ${res.status}`);

  return sseToTextStream(res.body, (data) => {
    const d = data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    return d.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  });
}

export async function streamDeepSeekText(
  systemPrompt: string,
  userPrompt: string,
  opts: { temperature?: number; maxTokens?: number; timeoutMs?: number } = {}
): Promise<ReadableStream<Uint8Array>> {
  if (!DEEPSEEK_ACTIVE) throw new Error("DeepSeek not configured");
  const { temperature = 0.4, maxTokens = 600, timeoutMs = STREAM_TIMEOUT_MS } = opts;

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${DEEPSEEK_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      stream: true,
      temperature,
      max_tokens: maxTokens,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok || !res.body) throw new Error(`DeepSeek HTTP ${res.status}`);

  return sseToTextStream(res.body, (data) => {
    const d = data as { choices?: Array<{ delta?: { content?: string } }> };
    return d.choices?.[0]?.delta?.content ?? null;
  });
}

/* ── Tool calling (used by the chat assistant's tool-calling loop) ───── */

export type ToolCallResult =
  | { type: "text"; text: string }
  | { type: "functionCall"; name: string; args: Record<string, unknown> };

interface ToolLike {
  name: string;
  description: string;
  parameters: unknown;
}

function toGeminiFunctionDeclarations(tools: ToolLike[]) {
  return tools.map((t) => ({ name: t.name, description: t.description, parameters: t.parameters }));
}

function toDeepSeekTools(tools: ToolLike[]) {
  return tools.map((t) => ({ type: "function" as const, function: { name: t.name, description: t.description, parameters: t.parameters } }));
}

/** Non-streaming — a `functionCall` response isn't text, so there's nothing
 * to stream until the model is done calling tools. `contents` is Gemini's
 * own conversation-history shape, passed through opaquely. */
export async function callGeminiWithTools(
  contents: unknown[],
  tools: ToolLike[],
  opts: { temperature?: number; timeoutMs?: number } = {}
): Promise<ToolCallResult> {
  if (!GEMINI_ACTIVE) throw new Error("Gemini not configured");
  const { temperature = 0.3, timeoutMs = STREAM_TIMEOUT_MS } = opts;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents,
      tools: [{ function_declarations: toGeminiFunctionDeclarations(tools) }],
      generationConfig: { temperature },
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);

  const data = await res.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string; functionCall?: { name: string; args?: Record<string, unknown> } }> } }>;
  };
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const call = parts.find((p) => p.functionCall)?.functionCall;
  if (call) return { type: "functionCall", name: call.name, args: call.args ?? {} };

  return { type: "text", text: parts.map((p) => p.text ?? "").join("") };
}

/** Non-streaming, same reasoning as `callGeminiWithTools`. `messages` is
 * DeepSeek/OpenAI's own conversation-history shape, passed through opaquely. */
export async function callDeepSeekWithTools(
  messages: unknown[],
  tools: ToolLike[],
  opts: { temperature?: number; timeoutMs?: number } = {}
): Promise<ToolCallResult> {
  if (!DEEPSEEK_ACTIVE) throw new Error("DeepSeek not configured");
  const { temperature = 0.3, timeoutMs = STREAM_TIMEOUT_MS } = opts;

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${DEEPSEEK_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      tools: toDeepSeekTools(tools),
      tool_choice: "auto",
      temperature,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`DeepSeek HTTP ${res.status}`);

  const data = await res.json() as {
    choices?: Array<{ message: { content?: string | null; tool_calls?: Array<{ id: string; function: { name: string; arguments: string } }> } }>;
  };
  const message = data.choices?.[0]?.message;
  const call = message?.tool_calls?.[0];
  if (call) {
    let args: Record<string, unknown> = {};
    try { args = JSON.parse(call.function.arguments); } catch { /* leave empty — the tool's own validator will reject missing required fields */ }
    return { type: "functionCall", name: call.function.name, args };
  }

  return { type: "text", text: message?.content ?? "" };
}
