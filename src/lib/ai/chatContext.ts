/**
 * "Retrieval" half of the chat assistant's RAG loop: classify what the
 * question is about, then fetch only the real data needed to answer it —
 * through the same query functions every other page already uses, never
 * a raw table dump. Add a new kind of question by adding one entry to
 * `INTENT_KEYWORDS` and one `case` in `retrieveFinancialContext`.
 */
import { getPeriodTotals, getAccountBalances, getPreviousPeriodRange } from "@/lib/supabase/queries/dashboard";
import { getBudgetItems } from "@/lib/supabase/queries/budgets";
import { getInvestments } from "@/lib/supabase/queries/investments";
import { getMonthTransactions } from "@/lib/supabase/queries/transactions";
import { getGoals, getActiveGoalsCount } from "@/lib/supabase/queries/goals";
import { getCurrentPeriod } from "@/lib/utils/date";
import { formatCurrency } from "@/lib/utils/currency";
import { GEMINI_ACTIVE, DEEPSEEK_ACTIVE, streamGeminiText, streamDeepSeekText, drainStream } from "@/lib/ai/providers";
import { devLog } from "@/lib/devLog";
import type { ChatIntent, ChatMessage } from "@/types/chat";
import type { TransactionRow } from "@/types/app";

// Applied to every list-producing case below — keeps prompts small and
// bounded regardless of how much history a user has accumulated. Exported
// so the tool-calling path (Phase 3.2) applies the same cap.
export const MAX_ITEMS = 8;
// Conversation turns sent to the model as context — older turns are dropped.
// Exported so `route.ts` can apply the same cap when validating the
// client-supplied history, instead of duplicating the number.
export const HISTORY_LIMIT = 6;

const INTENT_KEYWORDS: Record<ChatIntent, string[]> = {
  spending_by_category: ["categoria", "category", "gastei com", "gasto com", "gastos por", "spent on"],
  top_expenses:         ["maior despesa", "maiores despesas", "principal gasto", "principais gastos", "top expense", "biggest expense", "maiores gastos"],
  income:                ["recebi", "receita", "renda", "income", "salário", "salario", "quanto ganhei"],
  savings:               ["economizei", "economia", "poupei", "savings", "saved", "quanto sobrou"],
  period_comparison:    ["mês passado", "mes passado", "comparado", "comparação", "comparacao", "compare", "last month", " vs "],
  goals:                 ["meta", "metas", "goal", "objetivo"],
  recurring:             ["assinatura", "assinaturas", "recorrente", "recorrentes", "subscription", "pesando no orçamento", "pesando no orcamento"],
  budget:                ["orçamento", "orcamento", "budget", "limite"],
  forecast:              ["projeção", "projecao", "previsão", "previsao", "até o fim", "ate o fim", "forecast", "end of month", "atingir minha meta", "ainda posso gastar"],
  summary:               ["resumo", "summary", "finanças", "financas", "geral"],
};

// "Compared to last month" modifies the whole question (e.g. "how much did I
// save vs. last month") — check it before the metric-specific intents below,
// which would otherwise match first on "saved"/"spent"/etc. and drop the
// comparison entirely.
const INTENT_PRIORITY: ChatIntent[] = [
  "period_comparison",
  "spending_by_category",
  "top_expenses",
  "income",
  "savings",
  "goals",
  "recurring",
  "budget",
  "forecast",
  "summary",
];

/** Returns `null` on no keyword match, instead of defaulting — callers decide the fallback. */
function matchKeywordIntent(question: string): ChatIntent | null {
  const q = question.toLowerCase();
  for (const intent of INTENT_PRIORITY) {
    if (INTENT_KEYWORDS[intent].some((k) => q.includes(k))) return intent;
  }
  return null;
}

/**
 * Only called when no keyword matches — catches phrasing like "Where did my
 * money go?" or "Am I overspending?" that keyword matching can't cover. One
 * short, cheap completion (`maxOutputTokens` ~8); returns `null` on any
 * failure or unrecognized output so the caller can fall back to "summary".
 */
async function classifyIntentLLM(question: string): Promise<ChatIntent | null> {
  const prompt = `Classify the user's personal-finance question into exactly one of these categories. Reply with ONLY the category name, nothing else.

Categories: ${INTENT_PRIORITY.join(", ")}

Question: "${question}"
Category:`;

  try {
    let stream: ReadableStream<Uint8Array>;
    if (GEMINI_ACTIVE) {
      stream = await streamGeminiText(prompt, { temperature: 0, maxOutputTokens: 8 });
    } else if (DEEPSEEK_ACTIVE) {
      stream = await streamDeepSeekText(
        "You classify personal-finance questions into a fixed set of categories. Reply with only the category name.",
        prompt,
        { temperature: 0, maxTokens: 8 }
      );
    } else {
      return null;
    }

    const raw = (await drainStream(stream)).trim().toLowerCase().replace(/[^a-z_]/g, "");
    return (INTENT_PRIORITY as string[]).includes(raw) ? (raw as ChatIntent) : null;
  } catch {
    return null;
  }
}

/**
 * Hybrid entry point: free keyword match first, LLM classification only as
 * a fallback when nothing matched — keeps the common case at zero AI cost.
 */
export async function classifyIntentHybrid(question: string): Promise<ChatIntent> {
  const t0 = Date.now();
  const keywordIntent = matchKeywordIntent(question);
  if (keywordIntent) {
    devLog("classify", { intent: keywordIntent, method: "keyword", ms: Date.now() - t0 });
    return keywordIntent;
  }

  const llmIntent = await classifyIntentLLM(question);
  const intent = llmIntent ?? "summary";
  devLog("classify", {
    intent,
    method: llmIntent ? "llm" : "llm_unavailable_or_unrecognized",
    ms: Date.now() - t0,
  });
  return intent;
}

function fmt(n: number): string {
  return formatCurrency(n, "USD", false, "en-US");
}

/** Groups already-fetched transactions by category — used instead of
 * `getDashboardData().categories`, which would pull 10 unrelated tables just
 * for this one field. Exported so the `get_spending_by_category` tool
 * (Phase 3.2) reuses the same grouping logic instead of duplicating it. */
export function summarizeCategoriesFromTx(txs: TransactionRow[]): { categoryName: string; amount: number; percentage: number }[] {
  const totals = new Map<string, number>();
  for (const t of txs) {
    if (t.type !== "expense") continue;
    const key = t.categoryName ?? "Other";
    totals.set(key, (totals.get(key) ?? 0) + t.amount);
  }
  const total = Array.from(totals.values()).reduce((s, v) => s + v, 0);
  return Array.from(totals.entries())
    .map(([categoryName, amount]) => ({ categoryName, amount, percentage: total > 0 ? (amount / total) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Single entry point for the assistant's data retrieval, independent of how
 * `intent` was determined (keyword or LLM). Still intent-driven under the
 * hood — true dynamic multi-source retrieval arrives with tool-calling; this
 * signature is the staging point for that, `question` isn't used yet.
 */
export async function retrieveFinancialContext(_question: string, intent: ChatIntent): Promise<string> {
  const period = getCurrentPeriod();

  switch (intent) {
    case "spending_by_category": {
      const txs = await getMonthTransactions(period.startDate, period.endDate);
      const categories = summarizeCategoriesFromTx(txs);
      if (categories.length === 0) return `No expenses recorded yet for ${period.label}.`;
      const total = categories.reduce((s, c) => s + c.amount, 0);
      return `Spending by category, ${period.label}:\n${categories
        .slice(0, MAX_ITEMS)
        .map((c) => `- ${c.categoryName}: ${fmt(c.amount)} (${c.percentage.toFixed(0)}%)`)
        .join("\n")}\nTotal spent: ${fmt(total)}`;
    }

    case "top_expenses": {
      const txs = await getMonthTransactions(period.startDate, period.endDate);
      const expenses = txs.filter((t) => t.type === "expense").sort((a, b) => b.amount - a.amount).slice(0, MAX_ITEMS);
      if (expenses.length === 0) return `No expenses recorded yet for ${period.label}.`;
      return `Largest expenses, ${period.label}:\n${expenses
        .map((t) => `- ${t.description ?? t.categoryName ?? "Expense"}: ${fmt(t.amount)} (${t.date})`)
        .join("\n")}`;
    }

    case "income": {
      const { income, expense } = await getPeriodTotals(period.startDate, period.endDate);
      return `Income, ${period.label}: ${fmt(income)}.\nExpenses: ${fmt(expense)}.\nNet: ${fmt(income - expense)}.`;
    }

    case "savings": {
      const [totals, balances] = await Promise.all([
        getPeriodTotals(period.startDate, period.endDate),
        getAccountBalances(),
      ]);
      return `Savings, ${period.label}: ${fmt(totals.savings)} (${totals.savingsRate.toFixed(0)}% of income).\nAvailable cash: ${fmt(balances.availableCash)}.`;
    }

    case "period_comparison": {
      const prevRange = getPreviousPeriodRange(period);
      const [current, previous] = await Promise.all([
        getPeriodTotals(period.startDate, period.endDate),
        getPeriodTotals(prevRange.startDate, prevRange.endDate),
      ]);
      return `${period.label} vs previous period:\n- Income: ${fmt(current.income)} vs ${fmt(previous.income)}\n- Expenses: ${fmt(current.expense)} vs ${fmt(previous.expense)}\n- Savings: ${fmt(current.savings)} vs ${fmt(previous.savings)}`;
    }

    case "goals": {
      const goals = await getGoals();
      const active = goals.filter((g) => g.status === "active").slice(0, MAX_ITEMS);
      if (active.length === 0) return "No active goals.";
      return `Active goals:\n${active
        .map((g) => {
          const status = g.isOnTrack ? "on track" : g.monthlyNeeded ? `off track — needs ${fmt(g.monthlyNeeded)}/month to hit the deadline` : "no deadline set";
          return `- ${g.name}: ${fmt(g.currentAmount)} of ${fmt(g.targetAmount)} (${g.progressPercent.toFixed(0)}%), ${status}`;
        })
        .join("\n")}`;
    }

    case "recurring": {
      const txs = await getMonthTransactions(period.startDate, period.endDate);
      const recurring = txs.filter((t) => t.type === "expense" && t.isRecurring).slice(0, MAX_ITEMS);
      if (recurring.length === 0) return "No recurring expenses logged this period.";
      const total = recurring.reduce((s, t) => s + t.amount, 0);
      return `Recurring expenses, ${period.label} (total ${fmt(total)}):\n${recurring
        .map((t) => `- ${t.description ?? t.categoryName ?? "Subscription"}: ${fmt(t.amount)}`)
        .join("\n")}`;
    }

    case "budget": {
      const items = (await getBudgetItems(period.startDate, period.endDate)).slice(0, MAX_ITEMS);
      if (items.length === 0) return "No budgets set up.";
      return `Budget, ${period.label}:\n${items
        .map((b) => `- ${b.categoryName}: ${fmt(b.spent)} of ${fmt(b.budgeted)}${b.spent > b.budgeted ? " — OVER budget" : ""}`)
        .join("\n")}`;
    }

    case "forecast": {
      const totals = await getPeriodTotals(period.startDate, period.endDate);
      const today = new Date();
      const daysInPeriod = Math.round(
        (new Date(period.endDate + "T12:00:00").getTime() - new Date(period.startDate + "T12:00:00").getTime()) / 86400000
      ) + 1;
      const rawElapsed = Math.round(
        (today.getTime() - new Date(period.startDate + "T12:00:00").getTime()) / 86400000
      ) + 1;
      const daysElapsed = Math.min(Math.max(rawElapsed, 1), daysInPeriod);
      const avgDaily = totals.expense / daysElapsed;
      const projectedExpense = totals.expense + avgDaily * (daysInPeriod - daysElapsed);
      const projectedSavings = totals.income - projectedExpense;
      return `Forecast for the rest of ${period.label} (linear projection from the current pace):\n- Spent so far: ${fmt(totals.expense)} in ${daysElapsed} of ${daysInPeriod} days\n- Projected total expenses: ${fmt(projectedExpense)}\n- Projected savings: ${fmt(projectedSavings)}`;
    }

    case "summary":
    default: {
      const [totals, balances, txs, investments, activeGoals] = await Promise.all([
        getPeriodTotals(period.startDate, period.endDate),
        getAccountBalances(),
        getMonthTransactions(period.startDate, period.endDate),
        getInvestments(),
        getActiveGoalsCount(),
      ]);
      const topCategory = summarizeCategoriesFromTx(txs)[0];
      return `Financial summary, ${period.label}:
- Income: ${fmt(totals.income)}
- Expenses: ${fmt(totals.expense)}
- Savings: ${fmt(totals.savings)} (${totals.savingsRate.toFixed(0)}% of income)
- Net worth: ${fmt(balances.netWorth)}
- Invested: ${fmt(balances.invested)} (portfolio value ${fmt(investments.summary.totalCurrentValue)})
- Top spending category: ${topCategory ? `${topCategory.categoryName} (${fmt(topCategory.amount)})` : "none yet"}
- Active goals: ${activeGoals}`;
    }
  }
}

/* ── Prompt ───────────────────────────────────────────── */

export function buildChatPrompt(question: string, context: string, history: ChatMessage[]): { system: string; user: string } {
  const historyText = history
    .slice(-HISTORY_LIMIT)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const system =
    "You are Numi's financial assistant. Answer the user's question about their personal finances using ONLY the data provided below — never invent numbers that aren't there. Be concise and natural, like a knowledgeable friend, not a report. Use markdown (bold, bullet lists) where it helps readability. If the data doesn't cover what's being asked, say so plainly instead of guessing.";

  const user = `${historyText ? `Conversation so far:\n${historyText}\n\n` : ""}DATA:\n${context}\n\nQuestion: ${question}`;

  return { system, user };
}

/* ── Deterministic fallback (no AI provider configured/available) ───── */

export function formatFallbackAnswer(context: string): string {
  return `Here's what I found in your data:\n\n${context}`;
}
