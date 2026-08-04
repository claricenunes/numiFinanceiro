"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, Briefcase } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils/currency";
import { AnimatedNumber } from "@/components/common/motion/AnimatedNumber";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { PositionRow, PortfolioSummary } from "@/types/app";

interface Props {
  positions: PositionRow[];
  summary: PortfolioSummary;
}

export function InvestmentsPanel({ positions, summary }: Props) {
  const format = (v: number) => formatCurrency(v, "USD", false, "en-US");
  const isPositive = summary.profitLoss >= 0;
  const topPositions = [...positions]
    .sort((a, b) => (b.currentValue ?? b.investedAmount) - (a.currentValue ?? a.investedAmount))
    .slice(0, 3);

  if (positions.length === 0) {
    return (
      <Card>
        <p className="text-sm font-semibold text-[var(--numi-text)] mb-1">Investments</p>
        <EmptyState icon={Briefcase} title="No investments tracked yet" />
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-[var(--numi-text)]">Investments</p>
        <span
          className="flex items-center gap-1 text-xs font-medium"
          style={{ color: isPositive ? "var(--numi-income)" : "var(--numi-expense)" }}
        >
          {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {formatPercent(summary.profitLossPercent)}
        </span>
      </div>

      <p className="text-2xl font-bold text-[var(--numi-text)]">
        <AnimatedNumber value={summary.totalCurrentValue} format={format} />
      </p>
      <p className="text-xs text-[var(--numi-text-3)] mb-4">
        {isPositive ? "+" : ""}{format(summary.profitLoss)} all-time
      </p>

      <div className="flex items-center gap-4">
        <PieChart width={96} height={96}>
          <Pie
            data={summary.allocation}
            dataKey="percent"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={28}
            outerRadius={44}
            paddingAngle={2}
            strokeWidth={0}
            isAnimationActive
            animationDuration={800}
          >
            {summary.allocation.map((a) => (
              <Cell key={a.type} fill={a.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${Number(value).toFixed(0)}%`, ""]}
            contentStyle={{
              background: "var(--numi-elevated)",
              border: "1px solid var(--numi-border)",
              borderRadius: "10px",
              fontSize: "12px",
              color: "var(--numi-text)",
            }}
          />
        </PieChart>

        <ul className="flex-1 flex flex-col gap-2 min-w-0">
          {topPositions.map((p) => {
            const value = p.currentValue ?? p.investedAmount;
            const positive = (p.profitLossPercent ?? 0) >= 0;
            return (
              <li key={p.id} className="flex items-center justify-between gap-2">
                <span className="text-xs text-[var(--numi-text-2)] truncate">{p.name}</span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-medium text-[var(--numi-text)]">{format(value)}</span>
                  {p.profitLossPercent !== null && (
                    <span className="text-[10px]" style={{ color: positive ? "var(--numi-income)" : "var(--numi-expense)" }}>
                      {formatPercent(p.profitLossPercent, 0)}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}
