import type { Metadata } from "next";
import { TrendingUp, type LucideIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { getInvestments } from "@/lib/supabase/queries/investments";
import { ASSET_TYPE_ICON, DEFAULT_ICON } from "@/lib/icons";
import type { PositionRow } from "@/types/app";
import { AllocationChart } from "./AllocationChart";
import { FadeIn } from "@/components/common/FadeIn";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { NewPositionButton } from "./NewPositionButton";
import { UpdatePricesButton } from "./UpdatePricesButton";

export const metadata: Metadata = { title: "Investments" };

const ASSET_META: Record<string, { label: string; color: string }> = {
  stock:        { label: "Stock",        color: "#34D399" },
  etf:          { label: "ETF",          color: "#38BDF8" },
  fii:          { label: "REIT",         color: "#FBBF24" },
  fixed_income: { label: "Fixed Income", color: "#6366F1" },
  crypto:       { label: "Crypto",       color: "#F97316" },
  cash:         { label: "Cash",         color: "#94A3B8" },
};

const monthLabel = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date());

export default async function InvestimentosPage() {
  const { positions, summary } = await getInvestments();
  const plPositive = summary.profitLoss >= 0;

  return (
    <FadeIn className="px-4 py-5 lg:px-8 lg:py-6 max-w-6xl mx-auto">
      <PageHeader
        title="Investments"
        actions={
          <div className="flex items-center gap-2">
            <UpdatePricesButton positions={positions.map((p) => ({ id: p.id, name: p.name, ticker: p.ticker }))} />
            <NewPositionButton />
          </div>
        }
      />

      <Card className="mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="col-span-2 lg:col-span-1">
            <p className="text-xs text-[var(--numi-text-2)] mb-1">Current value</p>
            <p className="text-3xl font-bold" style={{ color: "var(--numi-landing-heading)" }}>
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
            <p className="text-xs text-[var(--numi-text-2)] mb-1">Total invested</p>
            <p className="text-xl font-bold" style={{ color: "var(--numi-landing-heading)" }}>{formatCurrency(summary.totalInvested)}</p>
            <p className="text-xs text-[var(--numi-text-3)] mt-1">Total cost</p>
          </div>
          <div>
            <p className="text-xs text-[var(--numi-text-2)] mb-1">Monthly return</p>
            <p className="text-xl font-bold" style={{ color: summary.monthlyReturn >= 0 ? "var(--numi-income)" : "var(--numi-expense)" }}>
              {summary.monthlyReturn >= 0 ? "+" : ""}{summary.monthlyReturn.toFixed(2)}%
            </p>
            <p className="text-xs text-[var(--numi-text-3)] mt-1 capitalize">{monthLabel}</p>
          </div>
        </div>
      </Card>

      {positions.length === 0 ? (
        <Card>
          <EmptyState icon={TrendingUp} title="No positions yet" description="Add your investments to track your portfolio" />
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <p className="text-sm font-semibold mb-4" style={{ color: "var(--numi-landing-heading)" }}>Allocation</p>
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="w-full lg:w-56 shrink-0">
                <AllocationChart data={summary.allocation} />
              </div>
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
                {summary.allocation.map(a => (
                  <div key={a.type} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="shrink-0 rounded-full" style={{ width: 10, height: 10, background: a.color }} />
                      <p className="text-sm truncate" style={{ color: "var(--numi-landing-heading)" }}>{a.label}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold" style={{ color: "var(--numi-landing-heading)" }}>{a.percent.toFixed(1)}%</p>
                      <p className="text-xs text-[var(--numi-text-3)]">{formatCurrency(a.totalValue, "USD", true)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--numi-landing-tagline)" }}>Positions</p>
          <div className="flex flex-col gap-2">
            {positions.map(p => <PositionCard key={p.id} pos={p} />)}
          </div>
        </>
      )}
    </FadeIn>
  );
}

function PositionCard({ pos }: { pos: PositionRow }) {
  const meta       = ASSET_META[pos.type] ?? { label: pos.type, color: "#94A3B8" };
  const Icon: LucideIcon = ASSET_TYPE_ICON[pos.type] ?? DEFAULT_ICON;
  const plPositive = (pos.profitLoss ?? 0) >= 0;
  const plColor    = plPositive ? "var(--numi-income)" : "var(--numi-expense)";

  return (
    <Card variant="interactive" padding="sm">
      <div className="flex items-start gap-3">
        <span
          className="flex items-center justify-center shrink-0 rounded-xl"
          style={{ width: 40, height: 40, background: `color-mix(in srgb, ${meta.color} 14%, transparent)`, border: `1px solid color-mix(in srgb, ${meta.color} 28%, transparent)`, color: meta.color }}
        >
          <Icon size={18} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {pos.ticker && <p className="text-sm font-bold" style={{ color: "var(--numi-landing-heading)" }}>{pos.ticker}</p>}
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: `color-mix(in srgb, ${meta.color} 14%, transparent)`, color: meta.color }}>
                  {meta.label}
                </span>
              </div>
              <p className="text-xs text-[var(--numi-text-3)] truncate">{pos.name}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-base font-bold" style={{ color: "var(--numi-landing-heading)" }}>
                {formatCurrency(pos.currentValue ?? pos.investedAmount)}
              </p>
              {pos.profitLoss !== null && (
                <p className="text-xs font-semibold" style={{ color: plColor }}>
                  {plPositive ? "+" : ""}{formatCurrency(pos.profitLoss)} ({plPositive ? "+" : ""}{pos.profitLossPercent?.toFixed(2) ?? "—"}%)
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 pt-2 border-t" style={{ borderColor: "var(--numi-border)" }}>
            <p className="text-xs text-[var(--numi-text-3)]">Qty: <span className="text-[var(--numi-text-2)]">{pos.quantity}</span></p>
            <p className="text-xs text-[var(--numi-text-3)]">Avg: <span className="text-[var(--numi-text-2)]">{formatCurrency(pos.averagePrice)}</span></p>
            {pos.currentPrice && (
              <p className="text-xs text-[var(--numi-text-3)]">Current: <span className="text-[var(--numi-text-2)]">{formatCurrency(pos.currentPrice)}</span></p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
