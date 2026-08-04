"use client";

import type { LucideIcon } from "lucide-react";
import { Wallet, TrendingUp, TrendingDown, PiggyBank, LineChart, Landmark, Repeat, Target } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { AnimatedNumber } from "@/components/common/motion/AnimatedNumber";
import { StaggerGroup, StaggerItem } from "@/components/common/motion/Stagger";
import { Card } from "@/components/ui/Card";
import { Sparkline } from "./charts/Sparkline";
import type { DashboardData } from "@/lib/supabase/queries/dashboard";

type Tone = "brand" | "income" | "expense";

const TONE_COLOR: Record<Tone, string> = {
  brand: "var(--numi-landing-heading)",
  income: "var(--numi-income)",
  expense: "var(--numi-expense)",
};

interface KpiDef {
  label: string;
  value: number;
  format: (n: number) => string;
  icon: LucideIcon;
  tone: Tone;
  /** null quando não há período/snapshot anterior real pra comparar. */
  deltaPercent: number | null;
  /** true = valor subindo é uma boa notícia (income, savings...); false = o contrário (expense, recurring). */
  upIsGood: boolean;
  sparkline: number[] | null;
  span?: boolean;
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function KpiGrid({ data }: { data: DashboardData }) {
  const { summary, previousSummary, previousSnapshot, weeklyFlow, goals, recurringTotal } = data;
  const format = (v: number) => formatCurrency(v, "USD", false, "en-US");

  const incomeSpark = weeklyFlow.map((w) => w.income);
  const expenseSpark = weeklyFlow.map((w) => w.expense);
  const savingsSpark = weeklyFlow.map((w) => w.income - w.expense);

  const activeGoals = goals.filter((g) => g.status === "active");
  const goalsProgress = activeGoals.length > 0
    ? activeGoals.reduce((s, g) => s + g.progressPercent, 0) / activeGoals.length
    : 0;

  const kpis: KpiDef[] = [
    {
      label: "Net worth", value: summary.netWorth, format, icon: Landmark, tone: "brand",
      deltaPercent: previousSnapshot ? pctChange(summary.netWorth, previousSnapshot.netWorth) : null,
      upIsGood: true, sparkline: null, span: true,
    },
    {
      label: "Available cash", value: summary.availableCash, format, icon: Wallet, tone: "brand",
      deltaPercent: null, upIsGood: true, sparkline: null,
    },
    {
      label: "Income", value: summary.income, format, icon: TrendingUp, tone: "income",
      deltaPercent: pctChange(summary.income, previousSummary.income),
      upIsGood: true, sparkline: incomeSpark,
    },
    {
      label: "Expenses", value: summary.expense, format, icon: TrendingDown, tone: "expense",
      deltaPercent: pctChange(summary.expense, previousSummary.expense),
      upIsGood: false, sparkline: expenseSpark,
    },
    {
      label: "Savings", value: summary.savings, format, icon: PiggyBank, tone: "income",
      deltaPercent: pctChange(summary.savings, previousSummary.savings),
      upIsGood: true, sparkline: savingsSpark,
    },
    {
      label: "Invested", value: summary.invested, format, icon: LineChart, tone: "brand",
      deltaPercent: previousSnapshot ? pctChange(summary.invested, previousSnapshot.invested) : null,
      upIsGood: true, sparkline: null,
    },
    {
      label: "Recurring spend", value: recurringTotal, format, icon: Repeat, tone: "expense",
      deltaPercent: pctChange(recurringTotal, previousSummary.recurringTotal),
      upIsGood: false, sparkline: null,
    },
    {
      label: "Goals progress", value: goalsProgress,
      format: (v) => `${v.toFixed(0)}%`, icon: Target, tone: "brand",
      deltaPercent: null, upIsGood: true, sparkline: null,
    },
  ];

  return (
    <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isPositive = kpi.deltaPercent !== null && (kpi.deltaPercent >= 0) === kpi.upIsGood;
        const deltaColor = kpi.deltaPercent === null
          ? "var(--numi-text-3)"
          : isPositive ? "var(--numi-income)" : "var(--numi-expense)";
        const toneColor = TONE_COLOR[kpi.tone];

        return (
          <StaggerItem key={kpi.label} style={kpi.span ? { gridColumn: "1 / -1" } : undefined}>
            <Card
              variant="interactive"
              className="flex flex-col gap-2 relative overflow-hidden h-full"
              style={
                kpi.span
                  ? { background: "linear-gradient(135deg, color-mix(in srgb, var(--numi-landing-heading) 6%, var(--numi-surface)) 0%, var(--numi-surface) 100%)", borderColor: "color-mix(in srgb, var(--numi-landing-heading) 14%, var(--numi-border))" }
                  : { background: `color-mix(in srgb, ${toneColor} 5%, var(--numi-surface))` }
              }
            >
              <div className="flex items-center justify-between">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `color-mix(in srgb, ${toneColor} 12%, transparent)`, color: toneColor }}
                >
                  <Icon size={15} />
                </span>
                {kpi.sparkline && kpi.sparkline.length > 1 && (
                  <Sparkline data={kpi.sparkline} color={deltaColor === "var(--numi-text-3)" ? toneColor : deltaColor} />
                )}
              </div>

              <p className="text-xs font-medium text-[var(--numi-text-2)]">{kpi.label}</p>
              <p className={`font-bold text-[var(--numi-text)] ${kpi.span ? "text-3xl" : "text-xl"}`}>
                <AnimatedNumber value={kpi.value} format={kpi.format} />
              </p>

              {kpi.deltaPercent !== null && (
                <p className="text-xs font-medium" style={{ color: deltaColor }}>
                  {kpi.deltaPercent >= 0 ? "+" : ""}
                  {kpi.deltaPercent.toFixed(0)}% vs last period
                </p>
              )}
            </Card>
          </StaggerItem>
        );
      })}
    </StaggerGroup>
  );
}
