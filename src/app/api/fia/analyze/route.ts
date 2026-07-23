import type { FIAAnalysis, AIProvider } from "@/types/fia";
import { getDashboardData } from "@/lib/supabase/queries/dashboard";
import { getInvestments }   from "@/lib/supabase/queries/investments";
import { getBudgetItems }   from "@/lib/supabase/queries/budgets";

/* ── Rate limiting ────────────────────────────────────── */
// In-memory store: resets on cold start (acceptable for serverless MVP)
const RL_WINDOW_MS = 60 * 60 * 1000; // 1 hora
const RL_LIMIT     = 5;               // max 5 req/user/hora
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

function fmt(n: number) { return `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`; }

async function fetchUserContext(): Promise<UserCtx | null> {
  try {
    const now       = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const endDate   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    const periodLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(now);

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
    ? `DADOS DO USUÁRIO (${ctx.periodLabel}):
- Renda mensal: ${fmt(ctx.income)}
- Despesas mensais: ${fmt(ctx.expense)}
- Saldo disponível: ${fmt(ctx.availableCash)}
- Patrimônio total: ${fmt(ctx.netWorth)} | Investimentos: ${fmt(ctx.invested)}
- Taxa de poupança: ${ctx.savingsRate.toFixed(0)}%
${ctx.allocation.length > 0 ? `- Carteira: ${ctx.allocation.map(a => `${a.label} ${a.pct}%`).join(" | ")}` : ""}

METAS:
${ctx.goals.length > 0
      ? ctx.goals.map(g => `- ${g.name}: ${g.pct}% ${g.onTrack ? "(no ritmo)" : g.monthlyNeeded ? `(fora do ritmo, precisaria ${fmt(g.monthlyNeeded)}/mês)` : "(sem prazo)"}${g.deadline ? ` — prazo: ${g.deadline}` : ""}`).join("\n")
      : "- Nenhuma meta cadastrada"}

ORÇAMENTO: ${ctx.budgetOverages.length > 0
      ? ctx.budgetOverages.map(b => `${b.name} +${b.overPct}% acima do limite`).join(", ")
      : "dentro do orçamento"}`
    : `DADOS DO USUÁRIO: Dados não disponíveis. Forneça análise genérica de qualidade para investidor brasileiro.`;

  return `Você é um analista financeiro especialista no Brasil.

Analise os dados do usuário e retorne APENAS JSON válido, sem markdown, sem texto extra.

${data}

Formato obrigatório (apenas este JSON, exatamente 5 ativos no allocation, percentuais somando 100):
{
  "financialScore": <número 0-100>,
  "profile": <"conservador"|"moderado"|"arrojado">,
  "monthlyContribution": {
    "min": <valor mínimo em R$>,
    "max": <valor máximo em R$>,
    "reason": <string pt-BR, máx 200 chars>
  },
  "allocation": [
    {
      "asset": <nome completo do ativo>,
      "category": <"stock"|"etf"|"fii"|"fixed_income"|"crypto">,
      "allocation": <percentual 0-100>,
      "risk": <número 0-100: renda fixa ~15, FII ~45, ação ~65, cripto ~85>,
      "expectedReturn": <string com retorno esperado>,
      "timeframe": <string com prazo ideal>,
      "rationale": <string pt-BR máx 180 chars>
    }
  ],
  "insights": [<3-4 strings pt-BR específicas para este usuário>],
  "nextSteps": [<3 ações concretas em pt-BR para esta semana>],
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
              "Você é um analista financeiro especialista no Brasil. Responda APENAS com JSON válido.",
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

/* ── Rule-based fallback (usa dados reais do usuário) ─── */
function generateRuleBased(ctx: UserCtx | null): FIAAnalysis {
  // Se não há dados reais, usa valores neutros
  const income  = ctx?.income  ?? 0;
  const expense = ctx?.expense ?? 0;
  const savings = Math.max(0, income - expense);
  const savingsRate = ctx?.savingsRate ?? 0;
  const goals   = ctx?.goals   ?? [];
  const overages = ctx?.budgetOverages ?? [];

  // ── Score (0-100) ─────────────────────────────────────
  // Poupança (0-40 pts): 20% = 20 pts, 40% = 40 pts
  const savingsScore = Math.min(40, savingsRate * 0.8);
  // Orçamento (0-30 pts): -10 por categoria estourada
  const budgetScore  = Math.max(0, 30 - overages.length * 10);
  // Metas (0-30 pts): proporção de metas no ritmo
  const goalScore    = goals.length > 0
    ? (goals.filter(g => g.onTrack).length / goals.length) * 30
    : 15;
  const financialScore = Math.min(100, Math.round(savingsScore + budgetScore + goalScore));

  // ── Perfil de risco ───────────────────────────────────
  const profile: "conservador" | "moderado" | "arrojado" =
    savingsRate < 10 ? "conservador" :
    savingsRate < 25 ? "moderado"    : "arrojado";

  // ── Aporte mensal recomendado ─────────────────────────
  const minContrib = income > 0 ? Math.round(savings * 0.2 / 10) * 10 : 0;
  const maxContrib = income > 0 ? Math.round(savings * 0.35 / 10) * 10 : 0;
  const fmtR = (n: number) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const contribReason = income > 0
    ? `Sua renda é ${fmtR(income)} e suas despesas são ${fmtR(expense)}. O excedente de ${fmtR(savings)} permite aportes entre 20-35% (${fmtR(minContrib)}–${fmtR(maxContrib)}).`
    : "Registre suas receitas e despesas para receber uma recomendação personalizada.";

  // ── Alocação sugerida por perfil ─────────────────────
  const allocations: FIAAnalysis["allocation"] =
    profile === "conservador"
      ? [
          { asset: "Tesouro Selic 2026", category: "fixed_income", allocation: 50, risk: 12, expectedReturn: "~13,25% a.a.", timeframe: "Imediato", rationale: "Liquidez máxima enquanto você constrói sua reserva de emergência." },
          { asset: "CDB 100% CDI",       category: "fixed_income", allocation: 30, risk: 15, expectedReturn: "~13% a.a.",    timeframe: "1-2 anos", rationale: "Rendimento ligado ao CDI com proteção do FGC até R$250k." },
          { asset: "Tesouro IPCA+ 2029", category: "fixed_income", allocation: 15, risk: 18, expectedReturn: "IPCA + 6,2% a.a.", timeframe: "2-3 anos", rationale: "Proteção contra inflação com prazo adequado." },
          { asset: "BOVA11 — ETF Ibovespa", category: "etf",       allocation:  4, risk: 55, expectedReturn: "12-18% a.a.", timeframe: "5+ anos", rationale: "Pequena exposição à renda variável para começar a diversificar." },
          { asset: "MXRF11 — FII de Papel", category: "fii",       allocation:  1, risk: 40, expectedReturn: "~11% a.a.",   timeframe: "1-2 anos", rationale: "Experiência inicial com FIIs e dividendos mensais." },
        ]
      : profile === "arrojado"
      ? [
          { asset: "BOVA11 — ETF Ibovespa",  category: "etf",          allocation: 35, risk: 55, expectedReturn: "12-18% a.a.", timeframe: "5+ anos", rationale: "Exposição ampla ao Ibovespa com custo mínimo de 0,10% a.a." },
          { asset: "Tesouro Selic 2026",      category: "fixed_income", allocation: 20, risk: 12, expectedReturn: "~13,25% a.a.", timeframe: "Imediato", rationale: "Reserva de oportunidade e liquidez para rebalanceamento." },
          { asset: "MXRF11 — FII de Papel",   category: "fii",          allocation: 20, risk: 45, expectedReturn: "~11% a.a.", timeframe: "1-2 anos", rationale: "Dividendos mensais isentos de IR complementam a carteira." },
          { asset: "Ações BR (VALE3/ITUB4)",  category: "stock",        allocation: 15, risk: 70, expectedReturn: "Variável",  timeframe: "3+ anos", rationale: "Empresas sólidas do Ibovespa para retorno acima do índice." },
          { asset: "Tesouro IPCA+ 2029",      category: "fixed_income", allocation: 10, risk: 18, expectedReturn: "IPCA + 6,2% a.a.", timeframe: "2-3 anos", rationale: "Âncora de inflação na carteira." },
        ]
      : [ // moderado
          { asset: "Tesouro Selic 2026",      category: "fixed_income", allocation: 30, risk: 12, expectedReturn: "~13,25% a.a.", timeframe: "Imediato", rationale: "Liquidez e segurança para reserva de emergência." },
          { asset: "BOVA11 — ETF Ibovespa",   category: "etf",          allocation: 25, risk: 55, expectedReturn: "12-18% a.a.", timeframe: "3+ anos", rationale: "Diversificação de baixo custo com liquidez diária." },
          { asset: "Tesouro IPCA+ 2029",      category: "fixed_income", allocation: 20, risk: 18, expectedReturn: "IPCA + 6,2% a.a.", timeframe: "2-3 anos", rationale: "Proteção contra inflação com prazo adequado." },
          { asset: "MXRF11 — FII de Papel",   category: "fii",          allocation: 15, risk: 45, expectedReturn: "~11% a.a.", timeframe: "1-2 anos", rationale: "Dividendos mensais isentos de IR." },
          { asset: "PETR4 — Petrobras PN",    category: "stock",        allocation: 10, risk: 68, expectedReturn: "Variável + dividendos", timeframe: "1-2 anos", rationale: "Exposição ao setor de energia com histórico de dividendos." },
        ];

  // ── Insights baseados nos dados reais ────────────────
  const insights: string[] = [];
  if (income === 0) {
    insights.push("📋 Comece registrando suas receitas e despesas para análises personalizadas.");
  } else {
    if (savingsRate >= 20) insights.push(`✅ Parabéns! Sua taxa de poupança de ${savingsRate.toFixed(0)}% é excelente. Continue assim para acelerar seu patrimônio.`);
    else if (savingsRate > 0) insights.push(`📊 Sua taxa de poupança atual é ${savingsRate.toFixed(0)}%. Tente aumentar para 20% cortando despesas não essenciais.`);
    else insights.push(`⚠️ Suas despesas superam sua renda neste período. Identifique gastos para cortar antes de investir.`);

    if (overages.length > 0)
      insights.push(`🚨 ${overages.length} categoria${overages.length > 1 ? "s" : ""} estourou o orçamento (${overages.map(o => o.name).join(", ")}). Revise esses gastos.`);
    else
      insights.push("✅ Você está dentro do orçamento neste mês. Ótima disciplina financeira!");

    if (goals.length > 0) {
      const onTrack = goals.filter(g => g.onTrack).length;
      insights.push(`🎯 ${onTrack}/${goals.length} meta${goals.length > 1 ? "s" : ""} ${onTrack === 1 ? "está" : "estão"} no ritmo. ${onTrack < goals.length ? "Considere aumentar o aporte nas metas atrasadas." : "Continue com os aportes mensais."}`);
    }

    insights.push(`💰 Com ${fmtR(savings)} de excedente mensal, você pode aportar entre ${fmtR(minContrib)} e ${fmtR(maxContrib)} todo mês para construir patrimônio.`);
  }

  // ── Próximos passos ───────────────────────────────────
  const nextSteps: string[] = [];
  if (income === 0) {
    nextSteps.push("Registre suas receitas e despesas do mês atual");
    nextSteps.push("Configure um orçamento mensal por categoria");
    nextSteps.push("Defina pelo menos uma meta financeira");
  } else {
    if (overages.length > 0)
      nextSteps.push(`Corte gastos em: ${overages.slice(0, 2).map(o => o.name).join(" e ")}`);
    else
      nextSteps.push("Mantenha a disciplina orçamentária do mês atual");
    nextSteps.push(`Inicie um aporte de ${fmtR(minContrib)}/mês no Tesouro Selic como reserva de emergência`);
    nextSteps.push("Após 6 meses de reserva, diversifique com renda variável (ETFs)");
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

  // Rate limiting por usuário
  const rl = checkRateLimit(user.id);
  if (!rl.allowed) {
    const retryAfter = Math.ceil((rl.resetAt - Date.now()) / 1000);
    return new Response(
      JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns minutos.", retryAfter }),
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

  // Busca contexto real do usuário para o prompt
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

  // Nenhum provedor de IA configurado → análise baseada em regras com dados reais
  return Response.json(generateRuleBased(ctx));
}
