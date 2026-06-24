import type { FIAAnalysis, AIProvider } from "@/types/fia";

/* ── Env ──────────────────────────────────────────────── */
const GEMINI_KEY   = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "";
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY ?? "";

const GEMINI_ACTIVE   = !!GEMINI_KEY   && !GEMINI_KEY.includes("your-");
const DEEPSEEK_ACTIVE = !!DEEPSEEK_KEY && !DEEPSEEK_KEY.includes("your-");

/* ── Prompt ───────────────────────────────────────────── */
function buildPrompt(): string {
  return `Você é um analista financeiro especialista no Brasil.

Analise os dados do usuário e retorne APENAS JSON válido, sem markdown, sem texto extra.

DADOS DO USUÁRIO (Junho 2026):
- Renda mensal: R$ 6.600 (salário R$ 5.400 + freelance R$ 1.200)
- Despesas mensais: R$ 2.848
- Saldo disponível: R$ 4.180
- Reserva de emergência: R$ 8.240 / R$ 18.000 (46% completo)
- Patrimônio: R$ 38.420 | Investimentos: R$ 22.500
- Taxa de poupança: 47%
- Carteira: Ações 44% | ETFs 24% | Renda Fixa 16% | Cripto 11% | FIIs 4%
- Posições: PETR4 +4,6% | MGLU3 -26,2% | BOVA11 +7% | BTC +20%

METAS:
- Reserva de Emergência: 23% (fora do ritmo, precisaria R$ 766/mês)
- Viagem Europa Jul/2027: 35% (no ritmo)
- Notebook: 30% (sem prazo)

ORÇAMENTO: Lazer +70%, Outros +33%, Moradia +3% acima do limite

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

async function tryGemini(): Promise<FIAAnalysis | null> {
  if (!GEMINI_ACTIVE) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
  const res = await withTimeout(
    fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt() }] }],
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

async function tryDeepSeek(): Promise<FIAAnalysis | null> {
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
          { role: "user", content: buildPrompt() },
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

/* ── Mock fallback ────────────────────────────────────── */
function getMock(): FIAAnalysis {
  return {
    financialScore: 74,
    profile: "moderado",
    monthlyContribution: {
      min: 450,
      max: 850,
      reason:
        "Renda R$ 6.600 − despesas R$ 2.848 − reserva operacional R$ 1.500 = R$ 2.252 disponíveis. Recomendamos alocar 20-38% (R$ 450-850) em investimentos.",
    },
    allocation: [
      {
        asset: "Tesouro Selic 2026",
        category: "fixed_income",
        allocation: 30,
        risk: 12,
        expectedReturn: "~13,25% a.a.",
        timeframe: "Imediato",
        rationale:
          "Reserva de emergência em 46% — liquidez é prioridade. Tesouro Selic rende ~CDI com resgate D+1, ideal para completar a reserva.",
      },
      {
        asset: "BOVA11 — ETF Ibovespa",
        category: "etf",
        allocation: 25,
        risk: 55,
        expectedReturn: "12-18% a.a. (longo prazo)",
        timeframe: "3+ anos",
        rationale:
          "Você já tem 24% em ETFs. BOVA11 reforça diversificação com custo mínimo (0,10% a.a.) e liquidez diária.",
      },
      {
        asset: "Tesouro IPCA+ 2029",
        category: "fixed_income",
        allocation: 20,
        risk: 18,
        expectedReturn: "IPCA + 6,2% a.a.",
        timeframe: "2-3 anos",
        rationale:
          "Proteção contra inflação + prazo alinhado à meta Viagem Europa (Jul/2027). Pode resgatar no mercado secundário antes do vencimento.",
      },
      {
        asset: "MXRF11 — FII de Papel",
        category: "fii",
        allocation: 15,
        risk: 45,
        expectedReturn: "~11% a.a. (dividendos)",
        timeframe: "1-2 anos",
        rationale:
          "Dividendos mensais isentos de IR. Sua carteira tem apenas 4% em FIIs — abaixo do ideal (8-12%) para perfil moderado.",
      },
      {
        asset: "PETR4 — Petrobras PN",
        category: "stock",
        allocation: 10,
        risk: 68,
        expectedReturn: "Variável + dividendos",
        timeframe: "1-2 anos",
        rationale:
          "Você tem PETR4 com +4,6%. Reforço moderado com bom histórico de dividendos e exposição ao setor de energia.",
      },
    ],
    insights: [
      "🟡 Reserva de emergência em 46% — direcione parte do freelance (R$ 1.200 este mês) para ela antes de ampliar renda variável.",
      "📈 Taxa de poupança de 47% coloca você no top 10% dos investidores. Mantendo esse ritmo, você atinge R$ 100k investidos em ~18 meses.",
      "⚠️ MGLU3 acumula -26% na sua carteira. Não aporte mais agora. Avalie stop-loss ou aguarde recuperação de fundamentos.",
      "💡 Com renda extra este mês, considere aporte único de R$ 800–1.000 priorizando Tesouro Selic para acelerar a reserva.",
    ],
    nextSteps: [
      "Deposite entre R$ 450–850 distribuídos conforme carteira sugerida ainda esta quinzena",
      "Configure aporte automático de R$ 500/mês via débito programado",
      "Reavalie posição em MGLU3 em 30 dias ou se cair mais 5%",
    ],
    confidence: 82,
    generatedAt: new Date().toISOString(),
    aiProvider: "mock",
  };
}

/* ── Route handler ────────────────────────────────────── */
export async function POST(req: Request): Promise<Response> {
  // Verifica autenticação via cookie de sessão
  const { createClient: createServerClient } = await import("@/lib/supabase/server");
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const providers = [tryGemini, tryDeepSeek] as const;

  for (const provider of providers) {
    try {
      const result = await provider();
      if (result) return Response.json(result);
    } catch (err) {
      console.warn(`[FIA] Provider ${provider.name} failed:`, err);
    }
  }

  // Mock fallback com latência simulada
  await new Promise((r) => setTimeout(r, 700 + Math.random() * 500));
  return Response.json(getMock());
}
