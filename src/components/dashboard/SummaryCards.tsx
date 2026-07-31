"use client";

import { formatCurrency, formatPercent } from "@/lib/utils/currency";
import { AnimatedNumber } from "@/components/common/motion/AnimatedNumber";
import { StaggerGroup, StaggerItem } from "@/components/common/motion/Stagger";
import type { DashboardSummary } from "@/types/app";

interface Props {
  summary: DashboardSummary;
  /** "en-US" is used only by the landing page's Dashboard Showcase — the
   * real logged-in app never passes this and keeps its pt-BR/BRL default. */
  locale?: "pt-BR" | "en-US";
}

export function SummaryCards({ summary, locale = "pt-BR" }: Props) {
  const currency = locale === "en-US" ? "USD" : "BRL";
  const format = (value: number) => formatCurrency(value, currency, false, locale);

  const cards =
    locale === "en-US"
      ? [
          {
            label: "Net worth",
            value: summary.netWorth,
            sub: `${formatPercent(3.2)} vs last month`,
            subColor: "var(--numi-income)",
            accent: "var(--numi-income)",
            span: true,
          },
          {
            label: "Income",
            value: summary.income,
            sub: "this period",
            subColor: "var(--numi-text-2)",
            accent: "var(--numi-income)",
          },
          {
            label: "Expenses",
            value: summary.expense,
            sub: `${((summary.expense / summary.income) * 100).toFixed(0)}% of income`,
            subColor: "var(--numi-expense)",
            accent: "var(--numi-expense)",
          },
          {
            label: "Available",
            value: summary.availableCash,
            sub: "in accounts",
            subColor: "var(--numi-text-2)",
            accent: "var(--numi-info)",
          },
          {
            label: "Savings",
            value: summary.savings,
            sub: `${summary.savingsRate.toFixed(0)}% of income`,
            subColor: "var(--numi-text-2)",
            accent: "var(--numi-income)",
          },
          {
            label: "Invested",
            value: summary.invested,
            sub: `${formatPercent(1.8)} this period`,
            subColor: "var(--numi-income)",
            accent: "var(--numi-warning)",
          },
        ]
      : [
          {
            label: "Patrimônio Total",
            value: summary.netWorth,
            sub: `${formatPercent(3.2)} vs mês anterior`,
            subColor: "var(--numi-income)",
            accent: "var(--numi-income)",
            span: true,
          },
          {
            label: "Receita",
            value: summary.income,
            sub: "este período",
            subColor: "var(--numi-text-2)",
            accent: "var(--numi-income)",
          },
          {
            label: "Despesas",
            value: summary.expense,
            sub: `${((summary.expense / summary.income) * 100).toFixed(0)}% da receita`,
            subColor: "var(--numi-expense)",
            accent: "var(--numi-expense)",
          },
          {
            label: "Disponível",
            value: summary.availableCash,
            sub: "em contas",
            subColor: "var(--numi-text-2)",
            accent: "var(--numi-info)",
          },
          {
            label: "Economia",
            value: summary.savings,
            sub: `${summary.savingsRate.toFixed(0)}% da renda`,
            subColor: "var(--numi-text-2)",
            accent: "var(--numi-income)",
          },
          {
            label: "Investido",
            value: summary.invested,
            sub: `${formatPercent(1.8)} no período`,
            subColor: "var(--numi-income)",
            accent: "var(--numi-warning)",
          },
        ];

  return (
    <StaggerGroup className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {cards.map((card) => (
        <StaggerItem
          key={card.label}
          className="glass-card p-5 flex flex-col gap-1.5 relative overflow-hidden"
          style={card.span ? { gridColumn: "1 / -1" } : {}}
        >
          {/* Accent dot */}
          <span
            className="absolute top-4 right-4 w-2 h-2 rounded-full"
            style={{ background: card.accent, boxShadow: `0 0 8px color-mix(in srgb, ${card.accent} 55%, transparent)` }}
          />

          <p className="text-xs font-medium text-[var(--numi-text-2)]">{card.label}</p>
          <p
            className={`font-bold text-[var(--numi-text)] ${card.span ? "text-3xl" : "text-xl"}`}
          >
            <AnimatedNumber value={card.value} format={format} />
          </p>
          <p className="text-xs" style={{ color: card.subColor }}>
            {card.sub}
          </p>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
