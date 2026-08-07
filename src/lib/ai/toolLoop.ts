/**
 * Ties the model to the tools in `tools.ts`: ask the model, execute
 * whatever it calls, feed the result back, repeat until it answers in
 * plain text or the round cap is hit. This is the new path `route.ts`
 * tries first (behind `CHAT_TOOL_CALLING`) — `classifyIntentHybrid` +
 * `retrieveFinancialContext` remain the fallback for everything this
 * returns `null` for, including "no provider configured" and "loop
 * exhausted without an answer."
 */
import { GEMINI_ACTIVE, DEEPSEEK_ACTIVE, callGeminiWithTools, callDeepSeekWithTools } from "@/lib/ai/providers";
import { TOOLS, executeTool } from "@/lib/ai/tools";
import { HISTORY_LIMIT } from "@/lib/ai/chatContext";
import { devLog } from "@/lib/devLog";
import type { ChatMessage } from "@/types/chat";

const MAX_ROUNDS = 4;

const SYSTEM_PROMPT =
  "You are Numi's financial assistant. Use the available tools to fetch the real data you need before answering — never guess or invent numbers. Call one tool at a time and use its result to decide what to do next. Once you have enough information, answer the user's question directly and concisely, using markdown where it helps readability.";

export type ToolAnswer = { text: string; provider: "gemini" | "deepseek" };

export async function answerWithTools(question: string, history: ChatMessage[], userId: string): Promise<ToolAnswer | null> {
  if (GEMINI_ACTIVE) {
    const text = await runGeminiLoop(question, history, userId);
    if (text) return { text, provider: "gemini" };
  }
  if (DEEPSEEK_ACTIVE) {
    const text = await runDeepSeekLoop(question, history, userId);
    if (text) return { text, provider: "deepseek" };
  }
  return null;
}

async function runGeminiLoop(question: string, history: ChatMessage[], userId: string): Promise<string | null> {
  const contents: Array<{ role: string; parts: unknown[] }> = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    { role: "model", parts: [{ text: "Understood — I'll use the tools to check real data before answering." }] },
    ...history.slice(-HISTORY_LIMIT).map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] })),
    { role: "user", parts: [{ text: question }] },
  ];

  let totalCalls = 0;
  for (let round = 0; round < MAX_ROUNDS; round++) {
    let result;
    try {
      result = await callGeminiWithTools(contents, TOOLS);
    } catch (err) {
      devLog("tool_loop_summary", { provider: "gemini", totalCalls, rounds: round, resolvedVia: "error" });
      console.warn("[chat] Gemini tool loop failed:", err);
      return null;
    }

    if (result.type === "text") {
      devLog("tool_loop_summary", { provider: "gemini", totalCalls, rounds: round + 1, resolvedVia: "tools" });
      return result.text.trim() || null;
    }

    totalCalls++;
    contents.push({ role: "model", parts: [{ functionCall: { name: result.name, args: result.args } }] });
    const tTool = Date.now();
    const exec = await executeTool(result.name, result.args, userId);
    devLog("tool_call", { provider: "gemini", tool: result.name, round: round + 1, duration_ms: Date.now() - tTool, ok: exec.ok });
    contents.push({
      role: "function",
      parts: [{ functionResponse: { name: result.name, response: exec.ok ? { result: exec.result } : { error: exec.error } } }],
    });
  }

  devLog("tool_loop_summary", { provider: "gemini", totalCalls, rounds: MAX_ROUNDS, resolvedVia: "round_cap" });
  return null;
}

async function runDeepSeekLoop(question: string, history: ChatMessage[], userId: string): Promise<string | null> {
  const messages: Array<Record<string, unknown>> = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-HISTORY_LIMIT).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: question },
  ];

  let totalCalls = 0;
  for (let round = 0; round < MAX_ROUNDS; round++) {
    let result;
    try {
      result = await callDeepSeekWithTools(messages, TOOLS);
    } catch (err) {
      devLog("tool_loop_summary", { provider: "deepseek", totalCalls, rounds: round, resolvedVia: "error" });
      console.warn("[chat] DeepSeek tool loop failed:", err);
      return null;
    }

    if (result.type === "text") {
      devLog("tool_loop_summary", { provider: "deepseek", totalCalls, rounds: round + 1, resolvedVia: "tools" });
      return result.text.trim() || null;
    }

    totalCalls++;
    const callId = `call_${round}`;
    messages.push({
      role: "assistant",
      content: null,
      tool_calls: [{ id: callId, type: "function", function: { name: result.name, arguments: JSON.stringify(result.args) } }],
    });
    const tTool = Date.now();
    const exec = await executeTool(result.name, result.args, userId);
    devLog("tool_call", { provider: "deepseek", tool: result.name, round: round + 1, duration_ms: Date.now() - tTool, ok: exec.ok });
    messages.push({ role: "tool", tool_call_id: callId, content: JSON.stringify(exec.ok ? exec.result : { error: exec.error }) });
  }

  devLog("tool_loop_summary", { provider: "deepseek", totalCalls, rounds: MAX_ROUNDS, resolvedVia: "round_cap" });
  return null;
}
