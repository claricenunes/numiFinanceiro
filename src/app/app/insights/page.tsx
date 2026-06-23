"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockAllInsights } from "@/lib/mock-data";
import type { InsightItem } from "@/types/app";

type TabValue = "all" | "alert" | "trend" | "win" | "forecast";

const TABS: { value: TabValue; label: string }[] = [
  { value: "all",      label: "Tudo" },
  { value: "alert",    label: "Alertas" },
  { value: "trend",    label: "Tendências" },
  { value: "win",      label: "Conquistas" },
  { value: "forecast", label: "Previsões" },
];

const CAT_STYLE: Record<string, { badge: string; color: string; label: string }> = {
  alert:    { badge: "rgba(248,113,113,0.15)", color: "#F87171", label: "Alerta" },
  trend:    { badge: "rgba(56,189,248,0.15)",  color: "#38BDF8", label: "Tendência" },
  win:      { badge: "rgba(52,211,153,0.15)",  color: "#34D399", label: "Conquista" },
  forecast: { badge: "rgba(251,191,36,0.15)",  color: "#FBBF24", label: "Previsão" },
};

export default function InsightsPage() {
  const [tab, setTab] = useState<TabValue>("all");

  const filtered =
    tab === "all"
      ? mockAllInsights
      : mockAllInsights.filter((i) => i.category === tab);

  const counts = {
    alert:    mockAllInsights.filter((i) => i.category === "alert").length,
    trend:    mockAllInsights.filter((i) => i.category === "trend").length,
    win:      mockAllInsights.filter((i) => i.category === "win").length,
    forecast: mockAllInsights.filter((i) => i.category === "forecast").length,
  };

  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#F1F5F9]">Insights</h1>
        <p className="text-sm text-[#475569] mt-0.5">
          Junho 2026 · {mockAllInsights.length} análises
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard count={counts.alert}    label="Alertas"     color="#F87171" emoji="⛔" />
        <StatCard count={counts.trend}    label="Tendências"  color="#38BDF8" emoji="📊" />
        <StatCard count={counts.win}      label="Conquistas"  color="#34D399" emoji="🏆" />
        <StatCard count={counts.forecast} label="Previsões"   color="#FBBF24" emoji="🔮" />
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto"
        style={{ background: "#131929" }}
      >
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className="relative px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors flex-shrink-0"
            style={{ color: tab === t.value ? "#F1F5F9" : "#475569" }}
          >
            {tab === t.value && (
              <motion.span
                layoutId="insight-tab-bg"
                className="absolute inset-0 rounded-lg"
                style={{ background: "#1E2D45" }}
              />
            )}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Cards grid */}
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

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">✨</p>
          <p className="text-[#94A3B8] font-medium">Nenhum insight nesta categoria</p>
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
      style={{ background: "#131929", border: "1px solid #1E2D45" }}
    >
      <span
        className="flex items-center justify-center text-base w-9 h-9 rounded-lg shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}
      >
        {emoji}
      </span>
      <div>
        <p className="text-xl font-bold text-[#F1F5F9]">{count}</p>
        <p className="text-xs text-[#475569]">{label}</p>
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: InsightItem }) {
  const style = CAT_STYLE[insight.category];
  const borderColor =
    insight.severity === "alert"   ? "rgba(248,113,113,0.22)" :
    insight.severity === "warning" ? "rgba(251,191,36,0.18)"  :
    "#1E2D45";

  return (
    <div
      className="rounded-2xl p-4 flex gap-4 h-full"
      style={{ background: "#131929", border: `1px solid ${borderColor}` }}
    >
      <span
        className="flex items-center justify-center text-xl w-10 h-10 rounded-xl shrink-0"
        style={{ background: style.badge, border: `1px solid ${style.color}30` }}
      >
        {insight.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <p className="text-sm font-semibold text-[#F1F5F9] leading-snug">
            {insight.title}
          </p>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
            style={{ background: style.badge, color: style.color }}
          >
            {style.label}
          </span>
        </div>
        <p className="text-xs text-[#94A3B8] leading-relaxed">
          {insight.description}
        </p>
      </div>
    </div>
  );
}
