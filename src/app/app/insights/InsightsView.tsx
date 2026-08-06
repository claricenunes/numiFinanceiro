"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertOctagon, TrendingUp, Trophy, Telescope, Sparkles, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Insight } from "@/lib/supabase/queries/insights";

type TabValue = "all" | "alert" | "trend" | "win" | "forecast";

const TABS: { value: TabValue; label: string }[] = [
  { value: "all",      label: "All" },
  { value: "alert",    label: "Alerts" },
  { value: "trend",    label: "Trends" },
  { value: "win",      label: "Wins" },
  { value: "forecast", label: "Forecasts" },
];

const CAT_STYLE: Record<string, { badge: string; color: string; label: string; icon: LucideIcon }> = {
  alert:    { badge: "rgba(239,68,68,0.15)",  color: "var(--numi-expense)", label: "Alert",    icon: AlertOctagon },
  trend:    { badge: "rgba(59,130,246,0.15)", color: "var(--numi-info)",    label: "Trend",    icon: TrendingUp },
  win:      { badge: "rgba(16,185,129,0.15)", color: "var(--numi-income)",  label: "Win",      icon: Trophy },
  forecast: { badge: "rgba(245,158,11,0.15)", color: "var(--numi-warning)", label: "Forecast", icon: Telescope },
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
      <PageHeader title="Insights" />

      <div className="mb-6">
        <p className="text-sm text-[var(--numi-text-3)]">
          {periodLabel} · {insights.length} insight{insights.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard count={counts.alert}    label="Alerts"    color="var(--numi-expense)" icon={AlertOctagon} />
        <StatCard count={counts.trend}    label="Trends"    color="var(--numi-info)" icon={TrendingUp} />
        <StatCard count={counts.win}      label="Wins"      color="var(--numi-income)" icon={Trophy} />
        <StatCard count={counts.forecast} label="Forecasts" color="var(--numi-warning)" icon={Telescope} />
      </div>

      <Tabs tabs={TABS} value={tab} onChange={setTab} layoutId="insight-tab-bg" className="mb-6" />

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={Sparkles} title="No insights in this category" description="Keep tracking your finances to generate more insights" />
        </Card>
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
  count, label, color, icon: Icon,
}: {
  count: number; label: string; color: string; icon: LucideIcon;
}) {
  return (
    <Card padding="sm" className="flex items-center gap-3">
      <span
        className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
        style={{ background: `color-mix(in srgb, ${color} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 19%, transparent)`, color }}
      >
        <Icon size={16} />
      </span>
      <div>
        <p className="text-xl font-bold" style={{ color: "var(--numi-landing-heading)" }}>{count}</p>
        <p className="text-xs text-[var(--numi-text-3)]">{label}</p>
      </div>
    </Card>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const style = CAT_STYLE[insight.category] ?? CAT_STYLE.trend;
  const Icon  = style.icon;
  const borderColor =
    insight.severity === "alert"   ? "rgba(239,68,68,0.22)" :
    insight.severity === "warning" ? "rgba(245,158,11,0.18)"  :
    "var(--numi-border)";

  return (
    <Card padding="sm" className="flex gap-4 h-full" style={{ borderColor }}>
      <span
        className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
        style={{ background: style.badge, border: `1px solid color-mix(in srgb, ${style.color} 19%, transparent)`, color: style.color }}
      >
        <Icon size={18} />
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
    </Card>
  );
}
