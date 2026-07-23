import type { Metadata } from "next";
import { formatCurrency } from "@/lib/utils/currency";
import { getInvestments } from "@/lib/supabase/queries/investments";
import type { PositionRow } from "@/types/app";
import { AllocationChart } from "./AllocationChart";
import { FadeIn } from "@/components/common/FadeIn";
import { NewPositionButton } from "./NewPositionButton";
import { UpdatePricesButton } from "./UpdatePricesButton";

export const metadata: Metadata = { title: "Investimentos" };

const ASSET_META: Record<string, { label: string; color: string; icon: string }> = {
  stock:        { label: "Ação",       color: "#34D399", icon: "📈" },
  etf:          { label: "ETF",        color: "#38BDF8", icon: "📊" },
  fii:          { label: "FII",        color: "#FBBF24", icon: "🏢" },
  fixed_income: { label: "Renda Fixa", color: "#6366F1", icon: "🏛️" },
  crypto:       { label: "Cripto",     color: "#F97316", icon: "₿" },
  cash:         { label: "Caixa",      color: "#94A3B8", icon: "💵" },
};

const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" }).format(new Date());

export default async function InvestimentosPage() {
  const { positions, summary } = await getInvestments();
  const plPositive = summary.profitLoss >= 0;

  return (
    <FadeIn className="px-4 py-5 lg:px-8 lg:py-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-[var(--numi-text)]">Investimentos</h1>
        <div className="flex items-center gap-2">
          <UpdatePricesButton
            positions={positions.map((p) => ({ id: p.id, name: p.name, ticker: p.ticker }))}
          />
          <NewPositionButton />
        </div>
      </div>

      <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--numi-elevated)", border: "1px solid var(--numi-border)" }}>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="col-span-2 lg:col-span-1">
            <p className="text-xs text-[var(--numi-text-2)] mb-1">Valor atual</p>
            <p className="text-3xl font-bold text-[var(--numi-text)]">
              {formatCurrency(summary.totalCurrentValue)}
            </p>
            {summary.totalInvested > 0 && (
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className="text-sm font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: plPositive ? "rgba(16,185,129,0.14)" : "rgba(239,68,68,0.14)", color: plPositive ? "var(--numi-income)" : "var(--numi-expense)" }}
                >
                  {plPositive ? "+" : ""}{formatCurrency(summary.profitLoss)}
                </span>
                <span className="text-sm font-semibold" style={{ color: plPositive ? "var(--numi-income)" : "var(--numi-expense)" }}>
                  ({plPositive ? "+" : ""}{summary.profitLossPercent.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-[var(--numi-text-2)] mb-1">Total investido</p>
            <p className="text-xl font-bold text-[var(--numi-text)]">{formatCurrency(summary.totalInvested)}</p>
            <p className="text-xs text-[var(--numi-text-3)] mt-1">Custo total</p>
          </div>
          <div>
            <p className="text-xs text-[var(--numi-text-2)] mb-1">Rentabilidade mês</p>
            <p className="text-xl font-bold" style={{ color: summary.monthlyReturn >= 0 ? "var(--numi-income)" : "var(--numi-expense)" }}>
              {summary.monthlyReturn >= 0 ? "+" : ""}{summary.monthlyReturn.toFixed(2)}%
            </p>
            <p className="text-xs text-[var(--numi-text-3)] mt-1 capitalize">{monthLabel}</p>
          </div>
        </div>
      </div>

      {positions.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📈</p>
          <p className="text-[var(--numi-text-2)] font-medium">Nenhuma posição cadastrada</p>
          <p className="text-sm text-[var(--numi-text-3)] mt-1">Adicione seus investimentos para acompanhar a carteira</p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--numi-elevated)", border: "1px solid var(--numi-border)" }}>
            <p className="text-sm font-semibold text-[var(--numi-text)] mb-4">Alocação</p>
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="w-full lg:w-56 shrink-0">
                <AllocationChart data={summary.allocation} />
              </div>
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
                {summary.allocation.map(a => (
                  <div key={a.type} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="shrink-0 rounded-full" style={{ width: 10, height: 10, background: a.color }} />
                      <p className="text-sm text-[var(--numi-text)] truncate">{a.label}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-[var(--numi-text)]">{a.percent.toFixed(1)}%</p>
                      <p className="text-xs text-[var(--numi-text-3)]">{formatCurrency(a.totalValue, "BRL", true)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs font-semibold text-[var(--numi-text-3)] uppercase tracking-wider mb-3">Posições</p>
          <div className="flex flex-col gap-2">
            {positions.map(p => <PositionCard key={p.id} pos={p} />)}
          </div>
        </>
      )}
    </FadeIn>
  );
}

function PositionCard({ pos }: { pos: PositionRow }) {
  const meta       = ASSET_META[pos.type] ?? { label: pos.type, color: "#94A3B8", icon: "📦" };
  const plPositive = (pos.profitLoss ?? 0) >= 0;
  const plColor    = plPositive ? "var(--numi-income)" : "var(--numi-expense)";

  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--numi-elevated)", border: "1px solid var(--numi-border)" }}>
      <div className="flex items-start gap-3">
        <span
          className="flex items-center justify-center text-base shrink-0"
          style={{ width: 40, height: 40, borderRadius: 12, background: `${meta.color}22`, border: `1px solid ${meta.color}44` }}
        >
          {meta.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {pos.ticker && <p className="text-sm font-bold text-[var(--numi-text)]">{pos.ticker}</p>}
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: `${meta.color}22`, color: meta.color }}>
                  {meta.label}
                </span>
              </div>
              <p className="text-xs text-[var(--numi-text-3)] truncate">{pos.name}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-base font-bold text-[var(--numi-text)]">
                {formatCurrency(pos.currentValue ?? pos.investedAmount)}
              </p>
              {pos.profitLoss !== null && (
                <p className="text-xs font-semibold" style={{ color: plColor }}>
                  {plPositive ? "+" : ""}{formatCurrency(pos.profitLoss)} ({plPositive ? "+" : ""}{pos.profitLossPercent?.toFixed(2) ?? "—"}%)
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 pt-2" style={{ borderTop: "1px solid var(--numi-border)" }}>
            <p className="text-xs text-[var(--numi-text-3)]">Qtd: <span className="text-[var(--numi-text-2)]">{pos.quantity}</span></p>
            <p className="text-xs text-[var(--numi-text-3)]">PM: <span className="text-[var(--numi-text-2)]">{formatCurrency(pos.averagePrice)}</span></p>
            {pos.currentPrice && (
              <p className="text-xs text-[var(--numi-text-3)]">Atual: <span className="text-[var(--numi-text-2)]">{formatCurrency(pos.currentPrice)}</span></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
