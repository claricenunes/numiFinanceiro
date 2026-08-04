import type { DashboardSummary, GoalWithProgress, BudgetItem } from "@/types/app";

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

/**
 * Score 0–100 combinando três dimensões, cada uma normalizada para [0,1]
 * antes de aplicar o peso. Quando uma dimensão não tem dado suficiente
 * (sem orçamentos, sem metas ativas) ela é excluída do cálculo em vez de
 * puxar a nota pra baixo artificialmente — os pesos restantes são
 * renormalizados para somar 100%.
 */
export function computeHealthScore(
  summary: Pick<DashboardSummary, "savingsRate">,
  goals: GoalWithProgress[],
  budgetItems: BudgetItem[],
): number {
  const dims: { weight: number; score: number }[] = [];

  // Taxa de poupança: 20%+ é a meta (mesmo threshold usado em generateInsights).
  dims.push({ weight: 0.4, score: clamp01(summary.savingsRate / 20) });

  const withBudget = budgetItems.filter((b) => b.budgeted > 0);
  if (withBudget.length > 0) {
    const withinBudget = withBudget.filter((b) => b.spent <= b.budgeted).length;
    dims.push({ weight: 0.3, score: withinBudget / withBudget.length });
  }

  const activeGoals = goals.filter((g) => g.status === "active");
  if (activeGoals.length > 0) {
    const onTrack = activeGoals.filter((g) => g.isOnTrack).length;
    dims.push({ weight: 0.3, score: onTrack / activeGoals.length });
  }

  const totalWeight = dims.reduce((s, d) => s + d.weight, 0);
  if (totalWeight === 0) return 0;

  const weighted = dims.reduce((s, d) => s + d.score * d.weight, 0);
  return Math.round((weighted / totalWeight) * 100);
}
