import type { FIAAnalysis, AIProvider } from "@/types/fia";
import { getDashboardData } from "@/lib/supabase/queries/dashboard";
import { getInvestments }   from "@/lib/supabase/queries/investments";
import { getBudgetItems }   from "@/lib/supabase/queries/budgets";

/* ── Rate limiting ────────────────────────────────────── */
// In-memory store: resets on cold start (acceptable for serverless MVP)
const RL_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RL_LIMIT     = 5;               // max 5 req/user/hour
const rlStore      = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now   = Date.now();
  const entry = rlStore.get(userId);

  if (!entry || now > entry.resetAt) {
    rlStore.set(userId, { count: 1, resetAt: now + RL_WINDOW_MS });
    return { allowed: true, remaining: RL_LIMIT - 1, resetAt: now + RL_WINDOW_MS };
  }
  if (entry.count >= RL_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count++;
  return { allowed: true, remaining: RL_LIMIT - entry.count, resetAt: entry.resetAt };
}

/* ── Env ──────────────────────────────────────────────── */
const GEMINI_KEY   = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "";
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY ?? "";

const GEMINI_ACTIVE   = !!GEMINI_KEY   && !GEMINI_KEY.includes("your-");
const DEEPSEEK_ACTIVE = !!DEEPSEEK_KEY && !DEEPSEEK_KEY.includes("your-");

/* ── Real-data context ────────────────────────────────── */

type UserCtx = {
  periodLabel:    string;
  income:         number;
  expense:        number;
  savingsRate:    number;
  availableCash:  number;
  invested:       number;
  netWorth:       number;
  goals:          Array<{ name: string; pct: number; onTrack: boolean; monthlyNeeded: number | null; deadline: string | null }>;
  budgetOverages: Array<{ name: string; overPct: number }>;
  allocation:     Array<{ label: string; pct: number }>;
};

function fmt(n: number) { return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`; }

async function fetchUserContext(): Promise<UserCtx | null> {
  try {
    const now       = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const endDate   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    const periodLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(now);

    const [dash, inv, budgets] = await Promise.all([
      getDashboardData({ type: "current_month", startDate, endDate, label: periodLabel }),
      getInvestments(),
      getBudgetItems(startDate, endDate),
    ]);

    const { summary, goals } = dash;

    return {
      periodLabel,
      income:        summary.income,
      expense:       summary.expense,
      savingsRate:   summary.savingsRate,
      availableCash: summary.availableCash,
      invested:      summary.invested,
      netWorth:      summary.netWorth,
      goals: goals.map(g => ({
        name:          g.name,
        pct:           Math.round(g.progressPercent),
        onTrack:       g.isOnTrack,
        monthlyNeeded: g.monthlyNeeded,
        deadline:      g.deadline,
      })),
      budgetOverages: budgets
        .filter(b => b.spent > b.budgeted && b.budgeted > 0)
        .map(b => ({ name: b.categoryName, overPct: Math.round((b.spent / b.budgeted - 1) * 100) })),
      allocation: inv.summary.allocation.map(a => ({ label: a.label, pct: Math.round(a.percent) })),
    };
  } catch {
    return null;
  }
}

/* ── Prompt ───────────────────────────────────────────── */
function buildPrompt(ctx: UserCtx | null): string {
  const data = ctx
    ? `USER DATA (${ctx.periodLabel}):
- Monthly income: ${fmt(ctx.income)}
- Monthly expenses: ${fmt(ctx.expense)}
- Available cash: ${fmt(ctx.availableCash)}
- Net worth: ${fmt(ctx.netWorth)} | Investments: ${fmt(ctx.invested)}
- Savings rate: ${ctx.savingsRate.toFixed(0)}%
${ctx.allocation.length > 0 ? `- Portfolio: ${ctx.allocation.map(a => `${a.label} ${a.pct}%`).join(" | ")}` : ""}

GOALS:
${ctx.goals.length > 0
      ? ctx.goals.map(g => `- ${g.name}: ${g.pct}% ${g.onTrack ? "(on track)" : g.monthlyNeeded ? `(off track, would need ${fmt(g.monthlyNeeded)}/month)` : "(no deadline)"}${g.deadline ? ` — deadline: ${g.deadline}` : ""}`).join("\n")
      : "- No goals set"}

BUDGET: ${ctx.budgetOverages.length > 0
      ? ctx.budgetOverages.map(b => `${b.name} +${b.overPct}% over limit`).join(", ")
      : "within budget"}`
    : `USER DATA: Not available. Provide a good-quality generic analysis for a US investor.`;

  return `You are an expert financial analyst.

Analyze the user data and return ONLY valid JSON, no markdown, no extra text.

${data}

Required format (only this JSON, exactly 5 assets in allocation, percentages summing to 100):
{
  "financialScore": <number 0-100>,
  "profile": <"conservative"|"moderate"|"aggressive">,
  "monthlyContribution": {
    "min": <minimum amount in USD>,
    "max": <maximum amount in USD>,
    "reason": <string in English, max 200 chars>
  },
  "allocation": [
    {
      "asset": <full asset name>,
      "category": <"stock"|"etf"|"fii"|"fixed_income"|"crypto">,
      "allocation": <percentage 0-100>,
      "risk": <number 0-100: fixed income ~15, REIT ~45, stock ~65, crypto ~85>,
      "expectedReturn": <string with expected return>,
      "timeframe": <string with ideal timeframe>,
      "rationale": <string in English, max 180 chars>
    }
  ],
  "insights": [<3-4 strings in English specific to this user>],
  "nextSteps": [<3 concrete actions in English for this week>],
  "confidence": <0-100>
}`;
}

/* ── Helpers ──────────────────────────────────────────── */
type RawAnalysis = Omit<FIAAnalysis, "generatedAt" | "aiProvider">;

function parseJSON(text: string): RawAnalysis {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in response");
  const parsed = JSON.parse(match[0]) as Record<string, unknown>;
  if (
    typeof parsed.financialScore !== "number" ||
    !parsed.profile ||
    !Array.isArray(parsed.allocation) ||
    parsed.allocation.length < 3
  ) {
    throw new Error("Invalid FIA schema from provider");
  }
  return parsed as unknown as RawAnalysis;
}

function stamp(raw: RawAnalysis, provider: AIProvider): FIAAnalysis {
  return { ...raw, generatedAt: new Date().toISOString(), aiProvider: provider };
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

/* ── Providers ────────────────────────────────────────── */

async function tryGemini(prompt: string): Promise<FIAAnalysis | null> {
  if (!GEMINI_ACTIVE) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
  const res = await withTimeout(
    fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.4,
          maxOutputTokens: 2048,
        },
      }),
    }),
    14000
  );

  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const data = await res.json() as {
    candidates?: Array<{ content: { parts: Array<{ text: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return stamp(parseJSON(text), "gemini");
}

async function tryDeepSeek(prompt: string): Promise<FIAAnalysis | null> {
  if (!DEEPSEEK_ACTIVE) return null;

  const res = await withTimeout(
    fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${DEEPSEEK_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "You are an expert financial analyst. Respond ONLY with valid JSON.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 2048,
      }),
    }),
    16000
  );

  if (!res.ok) throw new Error(`DeepSeek HTTP ${res.status}`);
  const data = await res.json() as {
    choices?: Array<{ message: { content: string } }>;
  };
  const text = data.choices?.[0]?.message?.content ?? "";
  return stamp(parseJSON(text), "deepseek");
}

/* ── Rule-based fallback (uses the user's real data) ─── */
function generateRuleBased(ctx: UserCtx | null): FIAAnalysis {
  // If no real data is available, use neutral defaults
  const income  = ctx?.income  ?? 0;
  const expense = ctx?.expense ?? 0;
  const savings = Math.max(0, income - expense);
  const savingsRate = ctx?.savingsRate ?? 0;
  const goals   = ctx?.goals   ?? [];
  const overages = ctx?.budgetOverages ?? [];

  // ── Score (0-100) ─────────────────────────────────────
  // Savings (0-40 pts): 20% = 20 pts, 40% = 40 pts
  const savingsScore = Math.min(40, savingsRate * 0.8);
  // Budget (0-30 pts): -10 per overspent category
  const budgetScore  = Math.max(0, 30 - overages.length * 10);
  // Goals (0-30 pts): proportion of goals on track
  const goalScore    = goals.length > 0
    ? (goals.filter(g => g.onTrack).length / goals.length) * 30
    : 15;
  const financialScore = Math.min(100, Math.round(savingsScore + budgetScore + goalScore));

  // ── Risk profile ───────────────────────────────────
  const profile: "conservative" | "moderate" | "aggressive" =
    savingsRate < 10 ? "conservative" :
    savingsRate < 25 ? "moderate"    : "aggressive";

  // ── Recommended monthly contribution ─────────────────────
  const minContrib = income > 0 ? Math.round(savings * 0.2 / 10) * 10 : 0;
  const maxContrib = income > 0 ? Math.round(savings * 0.35 / 10) * 10 : 0;
  const fmtR = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const contribReason = income > 0
    ? `Your income is ${fmtR(income)} and your expenses are ${fmtR(expense)}. The surplus of ${fmtR(savings)} allows for contributions between 20-35% (${fmtR(minContrib)}–${fmtR(maxContrib)}).`
    : "Log your income and expenses to get a personalized recommendation.";

  // ── Suggested allocation by profile ─────────────────────
  const allocations: FIAAnalysis["allocation"] =
    profile === "conservative"
      ? [
          { asset: "US Treasury Bills",      category: "fixed_income", allocation: 50, risk: 12, expectedReturn: "~5% p.a.",   timeframe: "Immediate", rationale: "Maximum liquidity while you build your emergency fund." },
          { asset: "High-Yield Savings / CD", category: "fixed_income", allocation: 30, risk: 15, expectedReturn: "~4.5% p.a.", timeframe: "1-2 years", rationale: "FDIC-insured yield tied to the current rate environment." },
          { asset: "TIPS (Treasury Inflation-Protected)", category: "fixed_income", allocation: 15, risk: 18, expectedReturn: "CPI + 2% p.a.", timeframe: "2-3 years", rationale: "Inflation protection with a suitable time horizon." },
          { asset: "VTI — Total Market ETF", category: "etf",         allocation:  4, risk: 55, expectedReturn: "8-10% p.a.", timeframe: "5+ years", rationale: "Small exposure to equities to start diversifying." },
          { asset: "VNQ — REIT ETF",         category: "fii",         allocation:  1, risk: 40, expectedReturn: "~7% p.a.",   timeframe: "1-2 years", rationale: "Initial experience with REITs and monthly dividends." },
        ]
      : profile === "aggressive"
      ? [
          { asset: "VTI — Total Market ETF", category: "etf",          allocation: 35, risk: 55, expectedReturn: "8-10% p.a.", timeframe: "5+ years", rationale: "Broad market exposure at minimal cost (~0.03% expense ratio)." },
          { asset: "US Treasury Bills",       category: "fixed_income", allocation: 20, risk: 12, expectedReturn: "~5% p.a.",  timeframe: "Immediate", rationale: "Opportunity reserve and liquidity for rebalancing." },
          { asset: "VNQ — REIT ETF",          category: "fii",          allocation: 20, risk: 45, expectedReturn: "~7% p.a.", timeframe: "1-2 years", rationale: "Monthly dividends complement the portfolio." },
          { asset: "Blue-chip stocks (AAPL/MSFT)", category: "stock",   allocation: 15, risk: 70, expectedReturn: "Variable",  timeframe: "3+ years", rationale: "Solid large-cap names for returns above the index." },
          { asset: "TIPS (Treasury Inflation-Protected)", category: "fixed_income", allocation: 10, risk: 18, expectedReturn: "CPI + 2% p.a.", timeframe: "2-3 years", rationale: "Inflation anchor for the portfolio." },
        ]
      : [ // moderate
          { asset: "US Treasury Bills",       category: "fixed_income", allocation: 30, risk: 12, expectedReturn: "~5% p.a.",  timeframe: "Immediate", rationale: "Liquidity and safety for the emergency fund." },
          { asset: "VTI — Total Market ETF",  category: "etf",          allocation: 25, risk: 55, expectedReturn: "8-10% p.a.", timeframe: "3+ years", rationale: "Low-cost diversification with daily liquidity." },
          { asset: "TIPS (Treasury Inflation-Protected)", category: "fixed_income", allocation: 20, risk: 18, expectedReturn: "CPI + 2% p.a.", timeframe: "2-3 years", rationale: "Inflation protection with a suitable time horizon." },
          { asset: "VNQ — REIT ETF",          category: "fii",          allocation: 15, risk: 45, expectedReturn: "~7% p.a.", timeframe: "1-2 years", rationale: "Monthly dividend income." },
          { asset: "Dividend stock (e.g. JNJ)", category: "stock",      allocation: 10, risk: 68, expectedReturn: "Variable + dividends", timeframe: "1-2 years", rationale: "Exposure to a defensive sector with a dividend track record." },
        ];

  // ── Insights based on real data ────────────────
  const insights: string[] = [];
  if (income === 0) {
    insights.push("📋 Start by logging your income and expenses to get personalized analysis.");
  } else {
    if (savingsRate >= 20) insights.push(`✅ Congrats! Your savings rate of ${savingsRate.toFixed(0)}% is excellent. Keep it up to accelerate your net worth.`);
    else if (savingsRate > 0) insights.push(`📊 Your current savings rate is ${savingsRate.toFixed(0)}%. Try increasing it to 20% by cutting non-essential expenses.`);
    else insights.push(`⚠️ Your expenses exceed your income this period. Identify costs to cut before investing.`);

    if (overages.length > 0)
      insights.push(`🚨 ${overages.length} categor${overages.length > 1 ? "ies" : "y"} went over budget (${overages.map(o => o.name).join(", ")}). Review these expenses.`);
    else
      insights.push("✅ You're within budget this month. Great financial discipline!");

    if (goals.length > 0) {
      const onTrack = goals.filter(g => g.onTrack).length;
      insights.push(`🎯 ${onTrack}/${goals.length} goal${goals.length > 1 ? "s" : ""} ${onTrack === 1 ? "is" : "are"} on track. ${onTrack < goals.length ? "Consider increasing contributions to the goals that are behind." : "Keep up the monthly contributions."}`);
    }

    insights.push(`💰 With ${fmtR(savings)} of monthly surplus, you can contribute between ${fmtR(minContrib)} and ${fmtR(maxContrib)} every month to build net worth.`);
  }

  // ── Next steps ───────────────────────────────────
  const nextSteps: string[] = [];
  if (income === 0) {
    nextSteps.push("Log your income and expenses for the current month");
    nextSteps.push("Set up a monthly budget by category");
    nextSteps.push("Define at least one financial goal");
  } else {
    if (overages.length > 0)
      nextSteps.push(`Cut spending on: ${overages.slice(0, 2).map(o => o.name).join(" and ")}`);
    else
      nextSteps.push("Keep up the budget discipline this month");
    nextSteps.push(`Start a ${fmtR(minContrib)}/month contribution to Treasury Bills as an emergency fund`);
    nextSteps.push("After 6 months of reserve, diversify with equities (ETFs)");
  }

  return {
    financialScore,
    profile,
    monthlyContribution: { min: minContrib, max: maxContrib, reason: contribReason },
    allocation: allocations,
    insights,
    nextSteps,
    confidence: income > 0 ? 82 : 40,
    generatedAt: new Date().toISOString(),
    aiProvider: "mock",
  };
}

/* ── Route handler ────────────────────────────────────── */
export async function POST(req: Request): Promise<Response> {
  const { createClient: createServerClient } = await import("@/lib/supabase/server");
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Per-user rate limiting
  const rl = checkRateLimit(user.id);
  if (!rl.allowed) {
    const retryAfter = Math.ceil((rl.resetAt - Date.now()) / 1000);
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again in a few minutes.", retryAfter }),
      {
        status: 429,
        headers: {
          "Retry-After":       String(retryAfter),
          "X-RateLimit-Limit": String(RL_LIMIT),
          "X-RateLimit-Reset": String(Math.floor(rl.resetAt / 1000)),
        },
      }
    );
  }

  // Fetch the user's real context for the prompt
  const ctx    = await fetchUserContext();
  const prompt = buildPrompt(ctx);

  const providers = [
    () => tryGemini(prompt),
    () => tryDeepSeek(prompt),
  ] as const;

  for (const provider of providers) {
    try {
      const result = await provider();
      if (result) return Response.json(result);
    } catch (err) {
      console.warn(`[FIA] Provider failed:`, err);
    }
  }

  // No AI provider configured → rule-based analysis using real data
  return Response.json(generateRuleBased(ctx));
}
