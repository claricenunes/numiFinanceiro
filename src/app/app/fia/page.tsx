"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils/currency";
import type { FIAAnalysis, AllocationItem } from "@/types/fia";

/* ── Paleta ──────────────────────────────────────────── */
const ASSET_COLOR: Record<string, string> = {
  stock:        "#34D399",
  etf:          "#38BDF8",
  fii:          "#FBBF24",
  fixed_income: "#6366F1",
  crypto:       "#F97316",
};

const ASSET_ICON: Record<string, string> = {
  stock: "📈", etf: "📊", fii: "🏢", fixed_income: "🏛️", crypto: "₿",
};

function riskLabel(n: number): string {
  if (n <= 30) return "baixo";
  if (n <= 60) return "médio";
  return "alto";
}

function riskColor(n: number): string {
  if (n <= 30) return "#34D399";
  if (n <= 60) return "#FBBF24";
  return "#F87171";
}

/* ── Componentes auxiliares ──────────────────────────── */

function ScoreRing({ score }: { score: number }) {
  const r = 44;
  const circumference = 2 * Math.PI * r;
  const filled = (score / 100) * circumference;
  const color = score >= 70 ? "#34D399" : score >= 50 ? "#FBBF24" : "#F87171";

  return (
    <svg width={108} height={108} viewBox="0 0 108 108">
      <circle cx={54} cy={54} r={r} fill="none" stroke="#1E2D45" strokeWidth={8} />
      <motion.circle
        cx={54} cy={54} r={r}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circumference}`}
        transform="rotate(-90 54 54)"
        initial={{ strokeDasharray: `0 ${circumference}` }}
        animate={{ strokeDasharray: `${filled} ${circumference}` }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
      />
      <text x={54} y={50} textAnchor="middle" dominantBaseline="central"
        fill="#F1F5F9" fontSize={22} fontWeight={700} fontFamily="inherit">
        {score}
      </text>
      <text x={54} y={68} textAnchor="middle" dominantBaseline="central"
        fill="#475569" fontSize={10} fontFamily="inherit">
        / 100
      </text>
    </svg>
  );
}

function AllocationCard({ rec, amount }: { rec: AllocationItem; amount: number }) {
  const color  = ASSET_COLOR[rec.category] ?? "#94A3B8";
  const rLabel = riskLabel(rec.risk);
  const rCol   = riskColor(rec.risk);

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "#131929", border: "1px solid #1E2D45" }}
    >
      <div className="flex items-start gap-3 mb-3">
        <span
          className="text-lg flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          {ASSET_ICON[rec.category] ?? "💼"}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-[#F1F5F9] leading-snug">{rec.asset}</p>
            <div className="text-right shrink-0">
              <p className="text-base font-bold text-[#F1F5F9]">{rec.allocation}%</p>
              <p className="text-xs text-[#475569]">{formatCurrency(amount)}</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-[#94A3B8] leading-relaxed mb-3">{rec.rationale}</p>

      <div className="flex flex-wrap gap-2">
        <Tag label={`Risco: ${rLabel}`} color={rCol} />
        <Tag label={rec.expectedReturn} color={color} />
        <Tag label={rec.timeframe} color="#475569" />
      </div>
    </div>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ background: `${color}18`, color, border: `1px solid ${color}28` }}
    >
      {label}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-full border-2 border-[#34D399] border-t-transparent animate-spin" />
        <div>
          <p className="text-base font-semibold text-[#F1F5F9]">Analisando seu perfil financeiro…</p>
          <p className="text-sm text-[#475569]">O FIA está processando seus dados</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-[#131929] animate-pulse" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-[#131929] animate-pulse mb-4" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-36 rounded-2xl bg-[#131929] animate-pulse" />
        ))}
      </div>
    </div>
  );
}

/* ── Página principal ────────────────────────────────── */

export default function FIAPage() {
  const [analysis, setAnalysis] = useState<FIAAnalysis | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/fia/analyze", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setAnalysis(await res.json() as FIAAnalysis);
    } catch (e) {
      setError("Não foi possível gerar a análise. Tente novamente.");
      console.error("[FIA]", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnalysis(); }, [fetchAnalysis]);

  if (loading) return <LoadingState />;

  if (error || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-4xl">⚠️</p>
        <p className="text-[#94A3B8] font-medium">{error ?? "Erro desconhecido"}</p>
        <button
          onClick={fetchAnalysis}
          className="px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "#34D399", color: "#0B1020" }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const { profile: prof } = analysis;
  const profileColor =
    prof === "conservador" ? "#38BDF8" :
    prof === "arrojado"    ? "#F87171" :
    "#34D399";

  const isAI = analysis.aiProvider !== "mock";
  const badgeText =
    analysis.aiProvider === "gemini"   ? "⚡ Gemini" :
    analysis.aiProvider === "deepseek" ? "⚡ DeepSeek" :
    "🔶 Demo";
  const badgeColor = isAI ? "#34D399" : "#FBBF24";

  // Aporte de referência para cálculo de valores por ativo
  const aportBase = analysis.monthlyContribution.max;
  const recommended = Math.round(
    (analysis.monthlyContribution.min + analysis.monthlyContribution.max) / 2
  );

  const chartData = analysis.allocation.map((a) => ({
    name:  a.asset,
    value: a.allocation,
    color: ASSET_COLOR[a.category] ?? "#94A3B8",
  }));

  const generatedDate = new Date(analysis.generatedAt).toLocaleString("pt-BR", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });

  return (
    <motion.div
      className="px-4 py-5 lg:px-8 lg:py-6 max-w-5xl mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      {/* ── Header ─────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-[#F1F5F9]">Investimento Inteligente</h1>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: `${badgeColor}22`,
                color: badgeColor,
              }}
            >
              {badgeText}
            </span>
          </div>
          <p className="text-sm text-[#475569]">
            Análise gerada em {generatedDate} · Confiança {analysis.confidence}%
          </p>
        </div>
        <button
          onClick={fetchAnalysis}
          className="text-sm font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0 transition-colors"
          style={{ background: "#131929", border: "1px solid #1E2D45", color: "#94A3B8" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "#34D39944";
            (e.currentTarget as HTMLElement).style.color = "#F1F5F9";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "#1E2D45";
            (e.currentTarget as HTMLElement).style.color = "#94A3B8";
          }}
        >
          ↻ Reanalisar
        </button>
      </div>

      {/* ── Score + Perfil + Capacidade ────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Score */}
        <div
          className="rounded-2xl p-5 flex flex-col items-center gap-2"
          style={{ background: "#131929", border: "1px solid #1E2D45" }}
        >
          <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
            Score Financeiro
          </p>
          <ScoreRing score={analysis.financialScore} />
          <p className="text-xs text-[#475569] text-center">
            {analysis.financialScore >= 70 ? "Boa saúde financeira" :
             analysis.financialScore >= 50 ? "Situação moderada" : "Atenção necessária"}
          </p>
        </div>

        {/* Perfil */}
        <div
          className="rounded-2xl p-5 flex flex-col items-center justify-center gap-3"
          style={{ background: "#131929", border: "1px solid #1E2D45" }}
        >
          <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
            Perfil Detectado
          </p>
          <span
            className="text-2xl font-bold capitalize px-5 py-2 rounded-xl"
            style={{ background: `${profileColor}15`, color: profileColor, border: `1px solid ${profileColor}30` }}
          >
            {analysis.profile}
          </span>
          <div className="flex gap-1">
            {["conservador", "moderado", "arrojado"].map((p) => (
              <span
                key={p}
                className="w-2 h-2 rounded-full transition-colors"
                style={{ background: p === analysis.profile ? profileColor : "#1E2D45" }}
              />
            ))}
          </div>
        </div>

        {/* Capacidade */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "#131929", border: "1px solid #1E2D45" }}
        >
          <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-3">
            Capacidade Mensal
          </p>
          <p className="text-3xl font-bold text-[#34D399] mb-1">
            {formatCurrency(recommended)}
          </p>
          <p className="text-xs text-[#475569] mb-3">
            Faixa: {formatCurrency(analysis.monthlyContribution.min)} — {formatCurrency(analysis.monthlyContribution.max)}
          </p>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            {analysis.monthlyContribution.reason}
          </p>
        </div>
      </div>

      {/* ── Distribuição recomendada ────────────────── */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{ background: "#131929", border: "1px solid #1E2D45" }}
      >
        <p className="text-sm font-semibold text-[#F1F5F9] mb-5">
          Distribuição Recomendada — {formatCurrency(aportBase)}/mês
        </p>
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          {/* Donut chart */}
          <div className="shrink-0">
            <PieChart width={200} height={200}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={88}
                dataKey="value"
                paddingAngle={2}
                strokeWidth={0}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [`${v}%`, ""]}
                contentStyle={{
                  background: "#1A2235",
                  border: "1px solid #1E2D45",
                  borderRadius: "10px",
                  fontSize: "12px",
                  color: "#F1F5F9",
                }}
              />
            </PieChart>
          </div>

          {/* Lista */}
          <div className="flex-1 w-full flex flex-col gap-2">
            {analysis.allocation.map((a, i) => {
              const color  = ASSET_COLOR[a.category] ?? "#94A3B8";
              const amount = Math.round(aportBase * (a.allocation / 100));
              return (
                <motion.div
                  key={i}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                  <p className="text-sm text-[#F1F5F9] flex-1 truncate">{a.asset}</p>
                  <p className="text-sm font-bold text-[#F1F5F9] shrink-0">{a.allocation}%</p>
                  <p className="text-xs text-[#475569] w-16 text-right shrink-0">
                    {formatCurrency(amount)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Carteira detalhada ─────────────────────── */}
      <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-3">
        Carteira detalhada
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
        {analysis.allocation.map((rec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <AllocationCard
              rec={rec}
              amount={Math.round(aportBase * (rec.allocation / 100))}
            />
          </motion.div>
        ))}
      </div>

      {/* ── Insights ──────────────────────────────── */}
      <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-3">
        Insights do FIA
      </p>
      <div className="flex flex-col gap-2 mb-6">
        {analysis.insights.map((insight, i) => (
          <motion.div
            key={i}
            className="rounded-xl px-4 py-3 text-sm text-[#94A3B8] leading-relaxed"
            style={{ background: "#131929", border: "1px solid #1E2D45" }}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.06 }}
          >
            {insight}
          </motion.div>
        ))}
      </div>

      {/* ── Próximos passos ────────────────────────── */}
      <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-3">
        Próximos Passos
      </p>
      <div
        className="rounded-2xl p-4 mb-8"
        style={{ background: "#131929", border: "1px solid #1E2D45" }}
      >
        <ol className="flex flex-col gap-3">
          {analysis.nextSteps.map((step, i) => (
            <motion.li
              key={i}
              className="flex items-start gap-3 text-sm text-[#F1F5F9]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.08 }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                style={{ background: "rgba(52,211,153,0.15)", color: "#34D399" }}
              >
                {i + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </motion.li>
          ))}
        </ol>
      </div>

      {/* ── Rodapé ────────────────────────────────── */}
      <p className="text-xs text-center text-[#475569]">
        {isAI
          ? `Análise gerada por ${analysis.aiProvider === "gemini" ? "Google Gemini" : "DeepSeek"} · Não constitui recomendação de investimento`
          : "Modo demo — configure GOOGLE_GENERATIVE_AI_API_KEY ou DEEPSEEK_API_KEY no .env.local para ativar a IA"}
      </p>
    </motion.div>
  );
}
