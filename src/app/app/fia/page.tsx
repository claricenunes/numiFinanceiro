"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils/currency";
import type { FIAAnalysis, AllocationItem } from "@/types/fia";

/* ── Palette ──────────────────────────────────────────── */
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
  if (n <= 30) return "low";
  if (n <= 60) return "medium";
  return "high";
}

function riskColor(n: number): string {
  if (n <= 30) return "var(--numi-income)";
  if (n <= 60) return "var(--numi-warning)";
  return "var(--numi-expense)";
}

/* ── Helper components ──────────────────────────── */

function ScoreRing({ score }: { score: number }) {
  const r = 44;
  const circumference = 2 * Math.PI * r;
  const filled = (score / 100) * circumference;
  const color = score >= 70 ? "var(--numi-income)" : score >= 50 ? "var(--numi-warning)" : "var(--numi-expense)";

  return (
    <svg width={108} height={108} viewBox="0 0 108 108">
      <circle cx={54} cy={54} r={r} fill="none" stroke="rgba(22, 50, 31, 0.08)" strokeWidth={8} />
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
        fill="var(--numi-landing-heading)" fontSize={22} fontWeight={700} fontFamily="inherit">
        {score}
      </text>
      <text x={54} y={68} textAnchor="middle" dominantBaseline="central"
        fill="var(--numi-text-3)" fontSize={10} fontFamily="inherit">
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
      style={{ background: "#FFFFFF", border: "1px solid rgba(22, 50, 31, 0.08)", boxShadow: "0 8px 20px -12px rgba(22, 50, 31, 0.15)" }}
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
            <p className="text-sm font-semibold leading-snug" style={{ color: "var(--numi-landing-heading)" }}>{rec.asset}</p>
            <div className="text-right shrink-0">
              <p className="text-base font-bold" style={{ color: "var(--numi-landing-heading)" }}>{rec.allocation}%</p>
              <p className="text-xs text-[var(--numi-text-3)]">{formatCurrency(amount)}</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--numi-text-2)] leading-relaxed mb-3">{rec.rationale}</p>

      <div className="flex flex-wrap gap-2">
        <Tag label={`Risk: ${rLabel}`} color={rCol} />
        <Tag label={rec.expectedReturn} color={color} />
        <Tag label={rec.timeframe} color="var(--numi-text-3)" />
      </div>
    </div>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{
        background: `color-mix(in srgb, ${color} 10%, transparent)`,
        color,
        border: `1px solid color-mix(in srgb, ${color} 16%, transparent)`,
      }}
    >
      {label}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--numi-landing-accent)" }} />
        <div>
          <p className="text-base font-semibold" style={{ color: "var(--numi-landing-heading)" }}>Analyzing your financial profile…</p>
          <p className="text-sm text-[var(--numi-text-3)]">FIA is processing your data</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "#FFFFFF", border: "1px solid rgba(22, 50, 31, 0.08)" }} />
        ))}
      </div>
      <div className="h-64 rounded-2xl animate-pulse mb-4" style={{ background: "#FFFFFF", border: "1px solid rgba(22, 50, 31, 0.08)" }} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background: "#FFFFFF", border: "1px solid rgba(22, 50, 31, 0.08)" }} />
        ))}
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────────────── */

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
      setError("Could not generate the analysis. Please try again.");
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
        <p className="text-[var(--numi-text-2)] font-medium">{error ?? "Unknown error"}</p>
        <button
          onClick={fetchAnalysis}
          className="numi-pill-btn numi-pill-btn-accent numi-cta-bounce px-4 py-2 text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  const { profile: prof } = analysis;
  const profileColor =
    prof === "conservative" ? "var(--numi-info)" :
    prof === "aggressive"   ? "var(--numi-expense)" :
    "var(--numi-income)";

  const isAI = analysis.aiProvider !== "mock";
  const badgeText =
    analysis.aiProvider === "gemini"   ? "⚡ Gemini" :
    analysis.aiProvider === "deepseek" ? "⚡ DeepSeek" :
    "📊 Based on your data";
  const badgeColor = isAI ? "var(--numi-income)" : "var(--numi-info)";

  // Reference contribution used to calculate per-asset values
  const aportBase = analysis.monthlyContribution.max;
  const recommended = Math.round(
    (analysis.monthlyContribution.min + analysis.monthlyContribution.max) / 2
  );

  const chartData = analysis.allocation.map((a) => ({
    name:  a.asset,
    value: a.allocation,
    color: ASSET_COLOR[a.category] ?? "#94A3B8",
  }));

  const generatedDate = new Date(analysis.generatedAt).toLocaleString("en-US", {
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
            <h1 className="text-xl font-bold" style={{ color: "var(--numi-landing-heading)" }}>Smart Investing</h1>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: `color-mix(in srgb, ${badgeColor} 14%, transparent)`,
                color: badgeColor,
              }}
            >
              {badgeText}
            </span>
          </div>
          <p className="text-sm text-[var(--numi-text-3)]">
            Analysis generated on {generatedDate} · {analysis.confidence}% confidence
          </p>
        </div>
        <button
          onClick={fetchAnalysis}
          className="text-sm font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0 transition-colors"
          style={{ background: "#FFFFFF", border: "1px solid rgba(22, 50, 31, 0.08)", color: "var(--numi-text-2)" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--numi-landing-accent)";
            (e.currentTarget as HTMLElement).style.color = "var(--numi-landing-heading)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(22, 50, 31, 0.08)";
            (e.currentTarget as HTMLElement).style.color = "var(--numi-text-2)";
          }}
        >
          ↻ Re-analyze
        </button>
      </div>

      {/* ── Notice: rule-based analysis ─────── */}
      {!isAI && (
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3 mb-5 text-sm"
          style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", color: "var(--numi-info)" }}
        >
          <span className="text-base shrink-0 mt-0.5">💡</span>
          <p>
            This analysis was calculated from your real data (income, expenses, goals and budget).
            For generative AI recommendations, set a key in{" "}
            <code className="text-[var(--numi-info)] text-xs bg-[color-mix(in_srgb,var(--numi-text)_8%,transparent)] px-1 rounded">GOOGLE_GENERATIVE_AI_API_KEY</code>{" "}
            or{" "}
            <code className="text-[var(--numi-info)] text-xs bg-[color-mix(in_srgb,var(--numi-text)_8%,transparent)] px-1 rounded">DEEPSEEK_API_KEY</code>.
          </p>
        </div>
      )}

      {/* ── Score + Profile + Capacity ────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Score */}
        <div
          className="rounded-2xl p-5 flex flex-col items-center gap-2"
          style={{ background: "#FFFFFF", border: "1px solid rgba(22, 50, 31, 0.08)", boxShadow: "0 8px 20px -12px rgba(22, 50, 31, 0.15)" }}
        >
          <p className="text-xs font-semibold text-[var(--numi-text-3)] uppercase tracking-wider">
            Financial Score
          </p>
          <ScoreRing score={analysis.financialScore} />
          <p className="text-xs text-[var(--numi-text-3)] text-center">
            {analysis.financialScore >= 70 ? "Good financial health" :
             analysis.financialScore >= 50 ? "Moderate situation" : "Needs attention"}
          </p>
        </div>

        {/* Profile */}
        <div
          className="rounded-2xl p-5 flex flex-col items-center justify-center gap-3"
          style={{ background: "#FFFFFF", border: "1px solid rgba(22, 50, 31, 0.08)", boxShadow: "0 8px 20px -12px rgba(22, 50, 31, 0.15)" }}
        >
          <p className="text-xs font-semibold text-[var(--numi-text-3)] uppercase tracking-wider">
            Detected Profile
          </p>
          <span
            className="text-2xl font-bold capitalize px-5 py-2 rounded-xl"
            style={{ background: `color-mix(in srgb, ${profileColor} 8%, transparent)`, color: profileColor, border: `1px solid color-mix(in srgb, ${profileColor} 19%, transparent)` }}
          >
            {analysis.profile}
          </span>
          <div className="flex gap-1">
            {["conservative", "moderate", "aggressive"].map((p) => (
              <span
                key={p}
                className="w-2 h-2 rounded-full transition-colors"
                style={{ background: p === analysis.profile ? profileColor : "rgba(22, 50, 31, 0.12)" }}
              />
            ))}
          </div>
        </div>

        {/* Capacity */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "#FFFFFF", border: "1px solid rgba(22, 50, 31, 0.08)", boxShadow: "0 8px 20px -12px rgba(22, 50, 31, 0.15)" }}
        >
          <p className="text-xs font-semibold text-[var(--numi-text-3)] uppercase tracking-wider mb-3">
            Monthly Capacity
          </p>
          <p className="text-3xl font-bold mb-1" style={{ color: "var(--numi-income)" }}>
            {formatCurrency(recommended)}
          </p>
          <p className="text-xs text-[var(--numi-text-3)] mb-3">
            Range: {formatCurrency(analysis.monthlyContribution.min)} — {formatCurrency(analysis.monthlyContribution.max)}
          </p>
          <p className="text-xs text-[var(--numi-text-2)] leading-relaxed">
            {analysis.monthlyContribution.reason}
          </p>
        </div>
      </div>

      {/* ── Recommended distribution ────────────────── */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{ background: "#FFFFFF", border: "1px solid rgba(22, 50, 31, 0.08)", boxShadow: "0 8px 20px -12px rgba(22, 50, 31, 0.15)" }}
      >
        <p className="text-sm font-semibold mb-5" style={{ color: "var(--numi-landing-heading)" }}>
          Recommended Distribution — {formatCurrency(aportBase)}/month
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
                  background: "#FFFFFF",
                  border: "1px solid rgba(22, 50, 31, 0.08)",
                  borderRadius: "10px",
                  fontSize: "12px",
                  color: "var(--numi-landing-heading)",
                }}
              />
            </PieChart>
          </div>

          {/* List */}
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
                  <p className="text-sm flex-1 truncate" style={{ color: "var(--numi-landing-heading)" }}>{a.asset}</p>
                  <p className="text-sm font-bold shrink-0" style={{ color: "var(--numi-landing-heading)" }}>{a.allocation}%</p>
                  <p className="text-xs text-[var(--numi-text-3)] w-16 text-right shrink-0">
                    {formatCurrency(amount)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Detailed portfolio ─────────────────────── */}
      <p className="text-xs font-semibold text-[var(--numi-text-3)] uppercase tracking-wider mb-3">
        Detailed Portfolio
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
      <p className="text-xs font-semibold text-[var(--numi-text-3)] uppercase tracking-wider mb-3">
        FIA Insights
      </p>
      <div className="flex flex-col gap-2 mb-6">
        {analysis.insights.map((insight, i) => (
          <motion.div
            key={i}
            className="rounded-xl px-4 py-3 text-sm text-[var(--numi-text-2)] leading-relaxed"
            style={{ background: "#FFFFFF", border: "1px solid rgba(22, 50, 31, 0.08)" }}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.06 }}
          >
            {insight}
          </motion.div>
        ))}
      </div>

      {/* ── Next steps ────────────────────────── */}
      <p className="text-xs font-semibold text-[var(--numi-text-3)] uppercase tracking-wider mb-3">
        Next Steps
      </p>
      <div
        className="rounded-2xl p-4 mb-8"
        style={{ background: "#FFFFFF", border: "1px solid rgba(22, 50, 31, 0.08)" }}
      >
        <ol className="flex flex-col gap-3">
          {analysis.nextSteps.map((step, i) => (
            <motion.li
              key={i}
              className="flex items-start gap-3 text-sm"
              style={{ color: "var(--numi-landing-heading)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.08 }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                style={{ background: "rgba(16,185,129,0.15)", color: "var(--numi-income)" }}
              >
                {i + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </motion.li>
          ))}
        </ol>
      </div>

      {/* ── Footer ────────────────────────────────── */}
      <p className="text-xs text-center text-[var(--numi-text-3)]">
        {isAI
          ? `Analysis generated by ${analysis.aiProvider === "gemini" ? "Google Gemini" : "DeepSeek"} · Not investment advice`
          : "Demo mode — set GOOGLE_GENERATIVE_AI_API_KEY or DEEPSEEK_API_KEY in .env.local to enable AI"}
      </p>
    </motion.div>
  );
}
