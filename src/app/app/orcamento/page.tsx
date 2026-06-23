import type { Metadata } from "next";
import { formatCurrency } from "@/lib/utils/currency";
import { mockBudgetItems } from "@/lib/mock-data";
import type { BudgetItem } from "@/types/app";
import { ProgressBar } from "@/components/common/ProgressBar";
import { FadeIn } from "@/components/common/FadeIn";

export const metadata: Metadata = { title: "Orçamento" };

const MONTH_NAME = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" })
  .format(new Date(2026, 5, 1));

export default function OrcamentoPage() {
  const items = mockBudgetItems;

  const totalBudgeted = items.reduce((s, i) => s + i.budgeted, 0);
  const totalSpent    = items.reduce((s, i) => s + i.spent,    0);
  const totalPct      = Math.min((totalSpent / totalBudgeted) * 100, 100);
  const overBudget    = items.filter(i => i.spent > i.budgeted).length;

  const daysInMonth  = 30;
  const dayOfMonth   = 23;
  const daysLeft     = daysInMonth - dayOfMonth;

  const sorted = [...items].sort((a, b) => (b.spent / b.budgeted) - (a.spent / a.budgeted));

  return (
    <FadeIn className="px-4 py-5 lg:px-8 lg:py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#F1F5F9]">Orçamento</h1>
          <p className="text-sm text-[#475569] mt-0.5 capitalize">{MONTH_NAME}</p>
        </div>
        <button
          className="text-sm font-semibold px-4 py-2 rounded-xl"
          style={{ background: "#131929", border: "1px solid #1E2D45", color: "#F1F5F9" }}
        >
          + Categoria
        </button>
      </div>

      {/* Overall summary */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{ background: "#131929", border: "1px solid #1E2D45" }}
      >
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-xs text-[#94A3B8] mb-1">Total gasto</p>
            <p className="text-2xl font-bold text-[#F1F5F9]">{formatCurrency(totalSpent)}</p>
            <p className="text-xs text-[#475569] mt-0.5">
              de {formatCurrency(totalBudgeted)} orçados
            </p>
          </div>
          <div className="text-right">
            {overBudget > 0 && (
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "#F8717122", color: "#F87171" }}
              >
                {overBudget} {overBudget === 1 ? "categoria acima" : "categorias acima"}
              </span>
            )}
            <p className="text-xs text-[#475569] mt-2">{daysLeft} dias restantes</p>
          </div>
        </div>

        {/* Overall progress bar */}
        <ProgressBar
          percent={totalPct}
          color={totalPct > 100 ? "#F87171" : totalPct > 85 ? "#FBBF24" : "#34D399"}
          height={8}
          delay={0.15}
        />
        <div className="flex justify-between mt-1.5">
          <p className="text-xs text-[#475569]">{totalPct.toFixed(0)}% utilizado</p>
          <p className="text-xs" style={{ color: totalSpent > totalBudgeted ? "#F87171" : "#475569" }}>
            {totalSpent > totalBudgeted
              ? `R$ ${formatCurrency(totalSpent - totalBudgeted)} acima`
              : `R$ ${formatCurrency(totalBudgeted - totalSpent)} restante`}
          </p>
        </div>
      </div>

      {/* Category list */}
      <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-3">
        Por categoria
      </p>
      <div className="flex flex-col gap-2">
        {sorted.map(item => (
          <BudgetCard key={item.id} item={item} />
        ))}
      </div>
    </FadeIn>
  );
}

function BudgetCard({ item }: { item: BudgetItem }) {
  const pct      = (item.spent / item.budgeted) * 100;
  const over     = item.spent > item.budgeted;
  const barColor = over ? "#F87171" : pct > 85 ? "#FBBF24" : "#34D399";
  const barWidth = Math.min(pct, 100);

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "#131929", border: `1px solid ${over ? "#F8717133" : "#1E2D45"}` }}
    >
      <div className="flex items-center gap-3 mb-3">
        {/* Icon */}
        <span
          className="flex items-center justify-center text-base shrink-0"
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: `${item.categoryColor}22`,
            border: `1px solid ${item.categoryColor}44`,
          }}
        >
          {item.categoryIcon}
        </span>

        {/* Name + amounts */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[#F1F5F9]">{item.categoryName}</p>
            <p className="text-sm font-bold shrink-0" style={{ color: barColor }}>
              {over ? "+" : ""}{formatCurrency(item.spent - item.budgeted)}
            </p>
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xs text-[#475569]">
              {formatCurrency(item.spent)} de {formatCurrency(item.budgeted)}
            </p>
            <p className="text-xs font-semibold" style={{ color: barColor }}>
              {pct.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar percent={barWidth} color={barColor} />
    </div>
  );
}
