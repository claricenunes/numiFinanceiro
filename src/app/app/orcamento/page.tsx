import type { Metadata } from "next";
import { PieChart } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { getBudgetItems } from "@/lib/supabase/queries/budgets";
import { parsePeriodFromParams } from "@/lib/utils/date";
import type { BudgetItem } from "@/types/app";
import { ProgressBar } from "@/components/common/ProgressBar";
import { FadeIn } from "@/components/common/FadeIn";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Budget" };

export default async function OrcamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; pt?: string }>;
}) {
  const { from, to, pt } = await searchParams;
  const period = parsePeriodFromParams(from, to, pt);
  const items  = await getBudgetItems(period.startDate, period.endDate);

  const monthName = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(period.startDate + "T12:00:00"),
  );
  const today      = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeft    = daysInMonth - today.getDate();

  const totalBudgeted = items.reduce((s, i) => s + i.budgeted, 0);
  const totalSpent    = items.reduce((s, i) => s + i.spent,    0);
  const totalPct      = totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0;
  const overBudget    = items.filter(i => i.spent > i.budgeted).length;
  const sorted        = [...items].sort((a, b) => (b.spent / b.budgeted) - (a.spent / a.budgeted));

  return (
    <FadeIn className="px-4 py-5 lg:px-8 lg:py-6 max-w-4xl mx-auto">
      <PageHeader title="Budget" actions={<NewBudgetButton />} />

      <div className="mb-6">
        <p className="text-sm text-[var(--numi-text-3)] capitalize">{monthName}</p>
      </div>

      {items.length === 0 ? (
        <Card>
          <EmptyState icon={PieChart} title="No budgets yet" description={'Click "+ Category" to set spending limits'} />
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-xs text-[var(--numi-text-2)] mb-1">Total spent</p>
                <p className="text-2xl font-bold" style={{ color: "var(--numi-landing-heading)" }}>{formatCurrency(totalSpent)}</p>
                <p className="text-xs text-[var(--numi-text-3)] mt-0.5">of {formatCurrency(totalBudgeted)} budgeted</p>
              </div>
              <div className="text-right">
                {overBudget > 0 && (
                  <Badge tone="expense">{overBudget} {overBudget === 1 ? "category over" : "categories over"}</Badge>
                )}
                <p className="text-xs text-[var(--numi-text-3)] mt-2">{daysLeft} days left</p>
              </div>
            </div>
            <ProgressBar
              percent={totalPct}
              color={totalPct > 100 ? "var(--numi-expense)" : totalPct > 85 ? "var(--numi-warning)" : "var(--numi-income)"}
              height={8}
              delay={0.15}
            />
            <div className="flex justify-between mt-1.5">
              <p className="text-xs text-[var(--numi-text-3)]">{totalPct.toFixed(0)}% used</p>
              <p className="text-xs" style={{ color: totalSpent > totalBudgeted ? "var(--numi-expense)" : "var(--numi-text-3)" }}>
                {totalSpent > totalBudgeted
                  ? `${formatCurrency(totalSpent - totalBudgeted)} over`
                  : `${formatCurrency(totalBudgeted - totalSpent)} remaining`}
              </p>
            </div>
          </Card>

          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--numi-landing-tagline)" }}>
            By category
          </p>
          <div className="flex flex-col gap-2">
            {sorted.map(item => <BudgetCard key={item.id} item={item} />)}
          </div>
        </>
      )}
    </FadeIn>
  );
}

// ── Client components ───────────────────────────────────
import { NewBudgetButton } from "./NewBudgetButton";
import { BudgetCardActions } from "./BudgetCardActions";

function BudgetCard({ item }: { item: BudgetItem }) {
  const pct      = item.budgeted > 0 ? (item.spent / item.budgeted) * 100 : 0;
  const over     = item.spent > item.budgeted;
  const barColor = over ? "var(--numi-expense)" : pct > 85 ? "var(--numi-warning)" : "var(--numi-income)";

  return (
    <Card
      padding="sm"
      style={over ? { borderColor: "rgba(239,68,68,0.28)" } : undefined}
    >
      <div className="flex items-center gap-3 mb-3">
        <span
          className="flex items-center justify-center text-base shrink-0 rounded-[10px]"
          style={{ width: 36, height: 36, background: `color-mix(in srgb, ${item.categoryColor} 14%, transparent)`, border: `1px solid color-mix(in srgb, ${item.categoryColor} 26%, transparent)` }}
        >
          {item.categoryIcon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold" style={{ color: "var(--numi-landing-heading)" }}>{item.categoryName}</p>
            <p className="text-sm font-bold shrink-0" style={{ color: barColor }}>
              {over ? "+" : ""}{formatCurrency(item.spent - item.budgeted)}
            </p>
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xs text-[var(--numi-text-3)]">{formatCurrency(item.spent)} of {formatCurrency(item.budgeted)}</p>
            <p className="text-xs font-semibold" style={{ color: barColor }}>{pct.toFixed(0)}%</p>
          </div>
        </div>
      </div>
      <ProgressBar percent={Math.min(pct, 100)} color={barColor} />
      <BudgetCardActions
        budgetId={item.id}
        budgeted={item.budgeted}
        categoryName={item.categoryName}
      />
    </Card>
  );
}
