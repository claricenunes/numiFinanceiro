import type { Metadata } from "next";
import { formatCurrency } from "@/lib/utils/currency";
import { mockPositions, mockPortfolioSummary } from "@/lib/mock-data";
import type { PositionRow } from "@/types/app";
import { AllocationChart } from "./AllocationChart";

export const metadata: Metadata = { title: "Investimentos" };

const ASSET_META: Record<string, { label: string; color: string; icon: string }> = {
  stock:        { label: "Ação",       color: "#34D399", icon: "📈" },
  etf:          { label: "ETF",        color: "#38BDF8", icon: "📊" },
  fii:          { label: "FII",        color: "#FBBF24", icon: "🏢" },
  fixed_income: { label: "Renda Fixa", color: "#6366F1", icon: "🏛️" },
  crypto:       { label: "Cripto",     color: "#F97316", icon: "₿" },
  cash:         { label: "Caixa",      color: "#94A3B8", icon: "💵" },
};

export default function InvestimentosPage() {
  const summary   = mockPortfolioSummary;
  const positions = mockPositions;
  const plPositive = summary.profitLoss >= 0;

  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6 max-w-6xl mx-auto">
      {/* Header */}
      <h1 className="text-xl font-bold text-[#F1F5F9] mb-5">Investimentos</h1>

      {/* Portfolio summary */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{ background: "#131929", border: "1px solid #1E2D45" }}
      >
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="col-span-2 lg:col-span-1">
            <p className="text-xs text-[#94A3B8] mb-1">Valor atual</p>
            <p className="text-3xl font-bold text-[#F1F5F9]">
              {formatCurrency(summary.totalCurrentValue)}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className="text-sm font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: plPositive ? "#34D39922" : "#F8717122",
                  color:      plPositive ? "#34D399"   : "#F87171",
                }}
              >
                {plPositive ? "+" : ""}{formatCurrency(summary.profitLoss)}
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: plPositive ? "#34D399" : "#F87171" }}
              >
                ({plPositive ? "+" : ""}{summary.profitLossPercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs text-[#94A3B8] mb-1">Total investido</p>
            <p className="text-xl font-bold text-[#F1F5F9]">
              {formatCurrency(summary.totalInvested)}
            </p>
            <p className="text-xs text-[#475569] mt-1">Custo total</p>
          </div>

          <div>
            <p className="text-xs text-[#94A3B8] mb-1">Rentabilidade mês</p>
            <p
              className="text-xl font-bold"
              style={{ color: summary.monthlyReturn >= 0 ? "#34D399" : "#F87171" }}
            >
              {summary.monthlyReturn >= 0 ? "+" : ""}{summary.monthlyReturn.toFixed(2)}%
            </p>
            <p className="text-xs text-[#475569] mt-1">Jun 2026</p>
          </div>
        </div>
      </div>

      {/* Allocation */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{ background: "#131929", border: "1px solid #1E2D45" }}
      >
        <p className="text-sm font-semibold text-[#F1F5F9] mb-4">Alocação</p>
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="w-full lg:w-56 shrink-0">
            <AllocationChart data={summary.allocation} />
          </div>
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
            {summary.allocation.map(a => (
              <div key={a.type} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="shrink-0 rounded-full"
                    style={{ width: 10, height: 10, background: a.color }}
                  />
                  <p className="text-sm text-[#F1F5F9] truncate">{a.label}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-[#F1F5F9]">{a.percent.toFixed(1)}%</p>
                  <p className="text-xs text-[#475569]">{formatCurrency(a.totalValue, "BRL", true)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Positions */}
      <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-3">
        Posições
      </p>
      <div className="flex flex-col gap-2">
        {positions.map(p => (
          <PositionCard key={p.id} pos={p} />
        ))}
      </div>
    </div>
  );
}

function PositionCard({ pos }: { pos: PositionRow }) {
  const meta       = ASSET_META[pos.type] ?? { label: pos.type, color: "#94A3B8", icon: "📦" };
  const plPositive = (pos.profitLoss ?? 0) >= 0;
  const plColor    = plPositive ? "#34D399" : "#F87171";

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "#131929", border: "1px solid #1E2D45" }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <span
          className="flex items-center justify-center text-base shrink-0"
          style={{
            width: 40, height: 40, borderRadius: 12,
            background: `${meta.color}22`,
            border: `1px solid ${meta.color}44`,
          }}
        >
          {meta.icon}
        </span>

        {/* Name + ticker + badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {pos.ticker && (
                  <p className="text-sm font-bold text-[#F1F5F9]">{pos.ticker}</p>
                )}
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: `${meta.color}22`, color: meta.color }}
                >
                  {meta.label}
                </span>
              </div>
              <p className="text-xs text-[#475569] truncate">{pos.name}</p>
            </div>

            {/* Current value */}
            <div className="text-right shrink-0">
              <p className="text-base font-bold text-[#F1F5F9]">
                {formatCurrency(pos.currentValue ?? pos.investedAmount)}
              </p>
              <p className="text-xs font-semibold" style={{ color: plColor }}>
                {plPositive ? "+" : ""}{formatCurrency(pos.profitLoss ?? 0)}
                {" "}
                ({plPositive ? "+" : ""}{pos.profitLossPercent?.toFixed(2) ?? "—"}%)
              </p>
            </div>
          </div>

          {/* Details row */}
          <div
            className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 pt-2"
            style={{ borderTop: "1px solid #1E2D45" }}
          >
            <p className="text-xs text-[#475569]">
              Qtd: <span className="text-[#94A3B8]">{pos.quantity}</span>
            </p>
            <p className="text-xs text-[#475569]">
              PM: <span className="text-[#94A3B8]">{formatCurrency(pos.averagePrice)}</span>
            </p>
            {pos.currentPrice && (
              <p className="text-xs text-[#475569]">
                Atual: <span className="text-[#94A3B8]">{formatCurrency(pos.currentPrice)}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
