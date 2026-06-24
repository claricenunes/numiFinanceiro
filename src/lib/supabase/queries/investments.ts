import { createClient } from "@/lib/supabase/server";
import type { PositionRow, PortfolioSummary, AllocationEntry } from "@/types/app";
import type { UserPosition } from "@/types/database";

const ASSET_META: Record<string, { label: string; color: string }> = {
  stock:        { label: "Ações",      color: "#34D399" },
  etf:          { label: "ETFs",       color: "#38BDF8" },
  fii:          { label: "FIIs",       color: "#FBBF24" },
  fixed_income: { label: "Renda Fixa", color: "#6366F1" },
  crypto:       { label: "Cripto",     color: "#F97316" },
  cash:         { label: "Caixa",      color: "#94A3B8" },
};

export async function getInvestments(): Promise<{
  positions: PositionRow[];
  summary: PortfolioSummary;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { positions: [], summary: emptySummary() };

  const { data } = await supabase
    .from("user_positions")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at");

  const rows = (data as UserPosition[] | null) ?? [];

  const positions: PositionRow[] = rows.map((p) => {
    const qty      = +p.quantity;
    const avgPrice = +p.average_price;
    const curPrice = p.current_price ? +p.current_price : null;
    const invested = qty * avgPrice;
    const curValue = curPrice !== null ? qty * curPrice : null;
    const pl       = curValue !== null ? curValue - invested : null;
    const plPct    = pl !== null && invested > 0 ? (pl / invested) * 100 : null;

    return {
      id: p.id,
      name: p.name ?? "—",
      ticker: null,
      type: p.type ?? "other",
      quantity: qty,
      averagePrice: avgPrice,
      currentPrice: curPrice,
      investedAmount: invested,
      currentValue: curValue,
      profitLoss: pl,
      profitLossPercent: plPct,
      currencyCode: p.currency_code,
    };
  });

  const totalInvested     = positions.reduce((s, p) => s + p.investedAmount, 0);
  const totalCurrentValue = positions.reduce((s, p) => s + (p.currentValue ?? p.investedAmount), 0);
  const profitLoss        = totalCurrentValue - totalInvested;
  const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

  const byType = new Map<string, number>();
  for (const p of positions) {
    byType.set(p.type, (byType.get(p.type) ?? 0) + (p.currentValue ?? p.investedAmount));
  }
  const allocation: AllocationEntry[] = Array.from(byType.entries())
    .map(([type, value]) => ({
      type,
      label: ASSET_META[type]?.label ?? type,
      color: ASSET_META[type]?.color ?? "#94A3B8",
      percent: totalCurrentValue > 0 ? (value / totalCurrentValue) * 100 : 0,
      totalValue: value,
    }))
    .sort((a, b) => b.percent - a.percent);

  return {
    positions,
    summary: { totalInvested, totalCurrentValue, profitLoss, profitLossPercent, monthlyReturn: 0, allocation },
  };
}

function emptySummary(): PortfolioSummary {
  return { totalInvested: 0, totalCurrentValue: 0, profitLoss: 0, profitLossPercent: 0, monthlyReturn: 0, allocation: [] };
}
