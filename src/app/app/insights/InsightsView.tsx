"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Insight } from "@/lib/supabase/queries/insights";

type TabValue = "all" | "alert" | "trend" | "win" | "forecast";

const TABS: { value: TabValue; label: string }[] = [
  { value: "all",      label: "All" },
  { value: "alert",    label: "Alerts" },
  { value: "trend",    label: "Trends" },
  { value: "win",      label: "Wins" },
  { value: "forecast", label: "Forecasts" },
];

const CAT_STYLE: Record<string, { badge: string; color: string; label: string }> = {
  alert:    { badge: "rgba(239,68,68,0.15)",  color: "var(--numi-expense)", label: "Alert" },
  trend:    { badge: "rgba(59,130,246,0.15)", color: "var(--numi-info)",    label: "Trend" },
  win:      { badge: "rgba(16,185,129,0.15)", color: "var(--numi-income)",  label: "Win" },
  forecast: { badge: "rgba(245,158,11,0.15)", color: "var(--numi-warning)", label: "Forecast" },
};

interface Props {
  insights: Insight[];
  periodLabel: string;
}

export function InsightsView({ insights, periodLabel }: Props) {
  const [tab, setTab] = useState<TabValue>("all");

  const filtered = tab === "all" ? insights : insights.filter((i) => i.category === tab);

  const counts = {
    alert:    insights.filter((i) => i.category === "alert").length,
    trend:    insights.filter((i) => i.category === "trend").length,
    win:      insights.filter((i) => i.category === "win").length,
    forecast: insights.filter((i) => i.category === "forecast").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--numi-landing-heading)" }}>Insights</h1>
        <p className="text-sm text-[var(--numi-text-3)] mt-0.5">
          {periodLabel} · {insights.length} insight{insights.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard count={counts.alert}    label="Alerts"    color="var(--numi-expense)" emoji="⛔" />
        <StatCard count={counts.trend}    label="Trends"    color="var(--numi-info)" emoji="📊" />
        <StatCard count={counts.win}      label="Wins"      color="var(--numi-income)" emoji="🏆" />
        <StatCard count={counts.forecast} label="Forecasts" color="var(--numi-warning)" emoji="🔮" />
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto"
        style={{ background: "#FFFFFF", border: "1px solid rgba(22, 50, 31, 0.08)" }}
      >
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className="relative px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors flex-shrink-0"
            style={{ color: tab === t.value ? "var(--numi-landing-heading)" : "var(--numi-text-3)" }}
          >
            {tab === t.value && (
              <motion.span
                layoutId="insight-tab-bg"
                className="absolute inset-0 rounded-lg"
                style={{ background: "color-mix(in srgb, var(--numi-landing-accent) 14%, transparent)" }}
              />
            )}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">✨</p>
          <p className="text-[var(--numi-text-2)] font-medium">No insights in this category</p>
          <p className="text-xs text-[var(--numi-text-3)] mt-1">
            Keep tracking your finances to generate more insights
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((insight, i) => (
              <motion.div
                key={insight.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.035 }}
              >
                <InsightCard insight={insight} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function StatCard({
  count, label, color, emoji,
}: {
  count: number; label: string; color: string; emoji: string;
}) {
  return (
    <div
      className="rounded-xl p-3 flex items-center gap-3"
      style={{ background: "#FFFFFF", border: "1px solid rgba(22, 50, 31, 0.08)" }}
    >
      <span
        className="flex items-center justify-center text-base w-9 h-9 rounded-lg shrink-0"
        style={{ background: `color-mix(in srgb, ${color} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 19%, transparent)` }}
      >
        {emoji}
      </span>
      <div>
        <p className="text-xl font-bold" style={{ color: "var(--numi-landing-heading)" }}>{count}</p>
        <p className="text-xs text-[var(--numi-text-3)]">{label}</p>
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const style = CAT_STYLE[insight.category] ?? CAT_STYLE.trend;
  const borderColor =
    insight.severity === "alert"   ? "rgba(239,68,68,0.22)" :
    insight.severity === "warning" ? "rgba(245,158,11,0.18)"  :
    "rgba(22, 50, 31, 0.08)";

  return (
    <div
      className="rounded-2xl p-4 flex gap-4 h-full"
      style={{ background: "#FFFFFF", border: `1px solid ${borderColor}`, boxShadow: "0 8px 20px -12px rgba(22, 50, 31, 0.15)" }}
    >
      <span
        className="flex items-center justify-center text-xl w-10 h-10 rounded-xl shrink-0"
        style={{ background: style.badge, border: `1px solid color-mix(in srgb, ${style.color} 19%, transparent)` }}
      >
        {insight.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <p className="text-sm font-semibold leading-snug" style={{ color: "var(--numi-landing-heading)" }}>{insight.title}</p>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
            style={{ background: style.badge, color: style.color }}
          >
            {style.label}
          </span>
        </div>
        <p className="text-xs text-[var(--numi-text-2)] leading-relaxed">{insight.description}</p>
      </div>
    </div>
  );
}
