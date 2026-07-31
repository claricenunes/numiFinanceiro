"use client";

import { Reveal } from "@/components/common/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/common/motion/Stagger";
import { AnimatedNumber } from "@/components/common/motion/AnimatedNumber";
import { TrendAreaChart } from "./charts/TrendAreaChart";
import { MOCK_SPENDING_TREND, MOCK_SAVINGS_GROWTH, MOCK_HEALTH_SCORE, MOCK_SUMMARY, MOCK_INSIGHTS } from "./mockData";

const formatUSD = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

const formatPoints = (v: number) => Math.round(v).toString();

const STATS = [
  { label: "Net worth", value: MOCK_SUMMARY.netWorth, format: formatUSD },
  { label: "Savings rate", value: MOCK_SUMMARY.savingsRate, format: (v: number) => `${Math.round(v)}%` },
  { label: "Invested", value: MOCK_SUMMARY.invested, format: formatUSD },
];

export function AnalyticsSection() {
  return (
    <section className="px-4 py-24 lg:py-32 max-w-6xl mx-auto">
      <Reveal className="text-center mb-16">
        <p className="text-sm font-semibold mb-3" style={{ color: "#98BB8A" }}>Analytics</p>
        <h2 className="text-3xl lg:text-4xl font-bold text-[var(--numi-text)] max-w-2xl mx-auto leading-tight">
          Numbers that actually tell you something
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <Reveal className="glass-card p-6 lg:col-span-1 flex flex-col items-center justify-center text-center gap-2">
          <p className="text-sm font-medium text-[var(--numi-text-2)]">Financial health score</p>
          <AnimatedNumber
            value={MOCK_HEALTH_SCORE}
            format={formatPoints}
            className="text-5xl font-bold text-[#98BB8A]"
          />
          <p className="text-xs text-[var(--numi-text-3)]">out of 100 — calculated from savings rate, spending stability, and goal progress</p>
        </Reveal>

        <Reveal delay={0.05} className="glass-card p-6 lg:col-span-2">
          <p className="text-sm font-medium text-[var(--numi-text-2)] mb-4">Monthly spending trend</p>
          <TrendAreaChart data={MOCK_SPENDING_TREND} color="#E3A6AE" formatValue={formatUSD} />
        </Reveal>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-16">
        <Reveal className="glass-card p-6 lg:col-span-2">
          <p className="text-sm font-medium text-[var(--numi-text-2)] mb-4">Savings growth</p>
          <TrendAreaChart data={MOCK_SAVINGS_GROWTH} color="#8FAE7C" formatValue={formatUSD} />
        </Reveal>

        <StaggerGroup className="lg:col-span-1 flex flex-col gap-4">
          {STATS.map((stat) => (
            <StaggerItem key={stat.label} className="glass-card p-5 flex flex-col gap-1">
              <p className="text-xs font-medium text-[var(--numi-text-3)]">{stat.label}</p>
              <AnimatedNumber value={stat.value} format={stat.format} className="text-2xl font-bold text-[var(--numi-text)]" />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>

      <StaggerGroup className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {MOCK_INSIGHTS.map((insight) => (
          <StaggerItem key={insight.text} className="glass-card p-5 flex items-start gap-3">
            <span className="text-xl shrink-0" aria-hidden="true">{insight.icon}</span>
            <p className="text-sm text-[var(--numi-text-2)] leading-relaxed">{insight.text}</p>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
