"use client";

import { formatCurrency, formatPercent } from "@/lib/utils/currency";
import type { DashboardSummary } from "@/types/app";

interface Props {
  summary: DashboardSummary;
}

export function SummaryCards({ summary }: Props) {
  const cards = [
    {
      label: "Patrimônio Total",
      value: summary.netWorth,
      sub: `${formatPercent(3.2)} vs mês anterior`,
      subColor: "#34D399",
      accent: "#34D399",
      span: true,
    },
    {
      label: "Receita",
      value: summary.income,
      sub: "este período",
      subColor: "#94A3B8",
      accent: "#34D399",
    },
    {
      label: "Despesas",
      value: summary.expense,
      sub: `${((summary.expense / summary.income) * 100).toFixed(0)}% da receita`,
      subColor: "#F87171",
      accent: "#F87171",
    },
    {
      label: "Disponível",
      value: summary.availableCash,
      sub: "em contas",
      subColor: "#94A3B8",
      accent: "#38BDF8",
    },
    {
      label: "Economia",
      value: summary.savings,
      sub: `${summary.savingsRate.toFixed(0)}% da renda`,
      subColor: "#94A3B8",
      accent: "#34D399",
    },
    {
      label: "Investido",
      value: summary.invested,
      sub: `${formatPercent(1.8)} no período`,
      subColor: "#34D399",
      accent: "#FBBF24",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="glass-card p-5 flex flex-col gap-1.5 relative overflow-hidden"
          style={card.span ? { gridColumn: "1 / -1" } : {}}
        >
          {/* Accent dot */}
          <span
            className="absolute top-4 right-4 w-2 h-2 rounded-full"
            style={{ background: card.accent, boxShadow: `0 0 8px ${card.accent}88` }}
          />

          <p className="text-xs font-medium text-[#94A3B8]">{card.label}</p>
          <p
            className={`font-bold text-[#F1F5F9] ${card.span ? "text-3xl" : "text-xl"}`}
          >
            {formatCurrency(card.value)}
          </p>
          <p className="text-xs" style={{ color: card.subColor }}>
            {card.sub}
          </p>
        </div>
      ))}
    </div>
  );
}
