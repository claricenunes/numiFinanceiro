const isDev = process.env.NODE_ENV !== "production";

/**
 * Structured dev-only logging — timings, labels, counts only. Never pass
 * financial data, prompts, or other user content through this; it's meant
 * to stay safe to leave on by accident, not just safe when used correctly.
 */
export function devLog(event: string, data: Record<string, string | number | boolean | null>): void {
  if (!isDev) return;
  console.log(`[chat] ${event}`, data);
}
