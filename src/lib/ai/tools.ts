/**
 * Read-only tools the model can call instead of a fixed intent. Each tool
 * wraps a query function that already exists — same discipline as
 * `retrieveFinancialContext`: compact, capped results, never a raw table
 * dump. Add a new tool by adding one entry to `TOOLS` below; nothing else
 * needs to change to make it callable.
 */
import { getPeriodTotals, getPreviousPeriodRange } from "@/lib/supabase/queries/dashboard";
import { getMonthTransactions } from "@/lib/supabase/queries/transactions";
import { getCurrentPeriod } from "@/lib/utils/date";
import { summarizeCategoriesFromTx, MAX_ITEMS } from "@/lib/ai/chatContext";
import { devLog } from "@/lib/devLog";
import type { Period } from "@/types/app";

const MAX_TRANSACTIONS = 20;

/** Deliberately minimal — just the primitive shapes these tools need, not a
 * full JSON Schema implementation. `validateArgs` below is written against
 * exactly this shape. */
export interface ToolParamSchema {
  type: "object";
  properties: Record<string, {
    type: "string" | "number" | "boolean";
    description: string;
    enum?: readonly string[];
    format?: "date";
    // Standard JSON Schema / OpenAPI field names — both Gemini and
    // DeepSeek reject "min"/"max" outright (confirmed against the real
    // Gemini API: "Unknown name \"min\"... Cannot find field").
    minimum?: number;
    maximum?: number;
  }>;
  required?: readonly string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParamSchema;
  /** `userId` always comes from the authenticated request in `route.ts` —
   * never from `args`, which is untrusted model output. No tool's
   * `parameters` schema defines a user/account-identifying field, so the
   * model has no field to fill in even if it tried. */
  handler: (args: Record<string, unknown>, userId: string) => Promise<unknown>;
}

function defaultPeriod(args: Record<string, unknown>): { startDate: string; endDate: string } {
  const period = getCurrentPeriod();
  return {
    startDate: typeof args.startDate === "string" ? args.startDate : period.startDate,
    endDate: typeof args.endDate === "string" ? args.endDate : period.endDate,
  };
}

export const TOOLS: ToolDefinition[] = [
  {
    name: "get_period_summary",
    description: "Total income, expenses, and savings for a period. Defaults to the current month if no dates are given. Set compareToPrevious to also get the same totals for the immediately preceding period of equal length — use this for any 'compared to last month' style question.",
    parameters: {
      type: "object",
      properties: {
        startDate: { type: "string", format: "date", description: "Period start, YYYY-MM-DD. Defaults to the start of the current month." },
        endDate: { type: "string", format: "date", description: "Period end, YYYY-MM-DD. Defaults to the end of the current month." },
        compareToPrevious: { type: "boolean", description: "If true, also return totals for the previous period of the same length." },
      },
    },
    handler: async (args) => {
      const { startDate, endDate } = defaultPeriod(args);
      const current = await getPeriodTotals(startDate, endDate);
      if (!args.compareToPrevious) return current;

      const dummyPeriod: Period = { type: "custom", startDate, endDate, label: "" };
      const prevRange = getPreviousPeriodRange(dummyPeriod);
      const previous = await getPeriodTotals(prevRange.startDate, prevRange.endDate);
      return { ...current, previous };
    },
  },

  {
    name: "get_spending_by_category",
    description: "Expense totals grouped by category for a period, sorted highest first — use this to answer where money went or which category is the biggest.",
    parameters: {
      type: "object",
      properties: {
        startDate: { type: "string", format: "date", description: "Period start, YYYY-MM-DD. Defaults to the start of the current month." },
        endDate: { type: "string", format: "date", description: "Period end, YYYY-MM-DD. Defaults to the end of the current month." },
      },
    },
    handler: async (args) => {
      const { startDate, endDate } = defaultPeriod(args);
      const txs = await getMonthTransactions(startDate, endDate);
      return summarizeCategoriesFromTx(txs).slice(0, MAX_ITEMS);
    },
  },

  {
    name: "get_month_transactions",
    description: "Individual transactions for a period, optionally filtered by type, category, or recurring status. For 'biggest expenses' questions, set BOTH type='expense' AND sortBy='amount' — sortBy alone sorts income and expenses together, so the top result could be a paycheck, not a purchase. Defaults to most-recent-first, all types.",
    parameters: {
      type: "object",
      properties: {
        startDate: { type: "string", format: "date", description: "Period start, YYYY-MM-DD. Defaults to the start of the current month." },
        endDate: { type: "string", format: "date", description: "Period end, YYYY-MM-DD. Defaults to the end of the current month." },
        type: { type: "string", enum: ["income", "expense"], description: "Only return transactions of this type." },
        categoryName: { type: "string", description: "Only return transactions in this category (exact name)." },
        isRecurring: { type: "boolean", description: "Only return recurring (true) or non-recurring (false) transactions." },
        sortBy: { type: "string", enum: ["date", "amount"], description: "Sort order — 'amount' for largest-first, 'date' (default) for most-recent-first." },
        limit: { type: "number", description: "Max transactions to return.", minimum: 1, maximum: MAX_TRANSACTIONS },
      },
    },
    handler: async (args) => {
      const { startDate, endDate } = defaultPeriod(args);
      let txs = await getMonthTransactions(startDate, endDate);

      if (args.type) txs = txs.filter((t) => t.type === args.type);
      if (args.categoryName) {
        const wanted = String(args.categoryName).toLowerCase();
        txs = txs.filter((t) => (t.categoryName ?? "").toLowerCase() === wanted);
      }
      if (typeof args.isRecurring === "boolean") txs = txs.filter((t) => !!t.isRecurring === args.isRecurring);
      if (args.sortBy === "amount") txs = [...txs].sort((a, b) => b.amount - a.amount);

      const limit = typeof args.limit === "number" ? Math.min(args.limit, MAX_TRANSACTIONS) : MAX_TRANSACTIONS;
      return txs.slice(0, limit).map((t) => ({
        date: t.date, description: t.description, category: t.categoryName, amount: t.amount, type: t.type,
      }));
    },
  },
];

const TOOL_MAP: Record<string, ToolDefinition> = Object.fromEntries(TOOLS.map((t) => [t.name, t]));

/** Type-checks `raw` against `schema`, clamps numeric min/max, and — this
 * is the important part — copies over ONLY the keys the schema declares.
 * Anything else in `raw` (including, hypothetically, a user/account id the
 * model tried to add) is silently dropped before the handler ever sees it. */
function validateArgs(schema: ToolParamSchema, raw: unknown): { ok: true; value: Record<string, unknown> } | { ok: false; error: string } {
  if (raw !== undefined && (typeof raw !== "object" || raw === null || Array.isArray(raw))) {
    return { ok: false, error: "Arguments must be an object" };
  }
  const input = (raw as Record<string, unknown> | undefined) ?? {};

  for (const key of schema.required ?? []) {
    if (!(key in input)) return { ok: false, error: `Missing required argument: ${key}` };
  }

  const value: Record<string, unknown> = {};
  for (const [key, spec] of Object.entries(schema.properties)) {
    if (!(key in input) || input[key] === undefined || input[key] === null) continue;
    const argVal = input[key];

    if (spec.type === "string" && typeof argVal !== "string") return { ok: false, error: `${key} must be a string` };
    if (spec.type === "number" && typeof argVal !== "number") return { ok: false, error: `${key} must be a number` };
    if (spec.type === "boolean" && typeof argVal !== "boolean") return { ok: false, error: `${key} must be a boolean` };
    if (spec.enum && typeof argVal === "string" && !spec.enum.includes(argVal)) {
      return { ok: false, error: `${key} must be one of: ${spec.enum.join(", ")}` };
    }
    if (spec.format === "date" && typeof argVal === "string" && !/^\d{4}-\d{2}-\d{2}$/.test(argVal)) {
      return { ok: false, error: `${key} must be an ISO date (YYYY-MM-DD)` };
    }

    value[key] = spec.type === "number" && typeof argVal === "number"
      ? Math.min(Math.max(argVal, spec.minimum ?? argVal), spec.maximum ?? argVal)
      : argVal;
  }

  return { ok: true, value };
}

export type ToolExecutionResult = { ok: true; result: unknown } | { ok: false; error: string };

/**
 * The only way a tool ever runs. Looks the name up against a strict
 * allow-list (`TOOL_MAP`'s keys — never dynamic dispatch by string alone),
 * validates and sanitizes `rawArgs` against that tool's schema, then calls
 * its handler with `userId` from the authenticated caller. Never throws —
 * every failure mode (unknown tool, bad args, handler error) becomes an
 * `{ ok: false }` result the model can be told about, not a crash.
 */
export async function executeTool(name: string, rawArgs: unknown, userId: string): Promise<ToolExecutionResult> {
  const tool = TOOL_MAP[name];
  if (!tool) {
    devLog("tool_error", { tool: name, reason: "unknown_tool" });
    return { ok: false, error: `Unknown tool: ${name}` };
  }

  const validated = validateArgs(tool.parameters, rawArgs);
  if (!validated.ok) {
    devLog("tool_error", { tool: name, reason: validated.error });
    return { ok: false, error: validated.error };
  }

  const t0 = Date.now();
  devLog("tool_call", { tool: name, args: JSON.stringify(validated.value) });
  try {
    const result = await tool.handler(validated.value, userId);
    devLog("tool_result", { tool: name, ms: Date.now() - t0, resultSize: JSON.stringify(result ?? null).length });
    return { ok: true, result };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown error";
    devLog("tool_error", { tool: name, reason, ms: Date.now() - t0 });
    return { ok: false, error: "Tool execution failed" };
  }
}
