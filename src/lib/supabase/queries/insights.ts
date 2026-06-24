import type { DashboardData } from "./dashboard";
import type { BudgetItem } from "@/types/app";

export interface Insight {
  id:          string;
  type:        string;
  severity:    "info" | "warning" | "alert";
  category:    "alert" | "trend" | "win" | "forecast";
  title:       string;
  description: string;
  icon:        string;
}

function fmt(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function generateInsights(data: DashboardData, budgets: BudgetItem[]): Insight[] {
  const { summary, goals, categories } = data;
  const insights: Insight[] = [];

  /* ── 1. Budget overages (max 2) ─────────────────────── */
  const overBudget = budgets
    .filter(b => b.spent > b.budgeted && b.budgeted > 0)
    .sort((a, b) => (b.spent / b.budgeted) - (a.spent / a.budgeted));

  for (const b of overBudget.slice(0, 2)) {
    const overPct = Math.round((b.spent / b.budgeted - 1) * 100);
    insights.push({
      id:       `budget-${b.id}`,
      type:     "budget_exceeded",
      severity: overPct > 30 ? "alert" : "warning",
      category: "alert",
      icon:     overPct > 30 ? "🚨" : "⚠️",
      title:    `${b.categoryIcon} ${b.categoryName} acima do limite`,
      description: `Você gastou ${fmt(b.spent)} de ${fmt(b.budgeted)} (${overPct}% além do orçado).`,
    });
  }

  /* ── 2. Savings rate ────────────────────────────────── */
  if (summary.income > 0) {
    const rate = summary.savingsRate;
    if (rate < 10) {
      insights.push({
        id: "savings-critical", type: "savings_low", severity: "alert", category: "alert", icon: "🔴",
        title: "Taxa de poupança crítica",
        description: `Você poupou apenas ${rate.toFixed(0)}% da renda este mês. O mínimo recomendado é 20%.`,
      });
    } else if (rate < 20) {
      insights.push({
        id: "savings-low", type: "savings_low", severity: "warning", category: "trend", icon: "⚠️",
        title: "Taxa de poupança abaixo do ideal",
        description: `Poupança de ${rate.toFixed(0)}% este mês. Meta recomendada: 20% ou mais.`,
      });
    } else {
      insights.push({
        id: "savings-ok", type: "savings_good", severity: "info", category: "win", icon: "✅",
        title: "Poupança saudável",
        description: `${rate.toFixed(0)}% da renda poupada — acima da meta de 20%. Continue assim!`,
      });
    }
  }

  /* ── 3. Goals off-track ─────────────────────────────── */
  const offTrack = goals.filter(g => g.status === "active" && !g.isOnTrack && g.deadline);
  for (const g of offTrack.slice(0, 1)) {
    insights.push({
      id: `goal-${g.id}`, type: "goal_forecast_changed", severity: "warning", category: "forecast", icon: "🎯",
      title: `Meta "${g.name}" fora do ritmo`,
      description: g.monthlyNeeded
        ? `Precisaria de ${fmt(g.monthlyNeeded)}/mês para atingir no prazo definido.`
        : "Ajuste os aportes para manter o prazo da meta.",
    });
  }

  /* ── 4. Low available cash ──────────────────────────── */
  if (summary.expense > 0 && summary.availableCash < summary.expense * 0.5 && summary.availableCash >= 0) {
    insights.push({
      id: "low-cash", type: "low_balance", severity: "alert", category: "alert", icon: "💸",
      title: "Saldo disponível baixo",
      description: `${fmt(summary.availableCash)} disponível — menos de 50% das suas despesas do período.`,
    });
  }

  /* ── 5. Top expense category concentration ──────────── */
  if (categories.length > 0 && summary.expense > 0) {
    const top = categories[0];
    if (top.percentage > 40) {
      insights.push({
        id: `top-cat-${top.categoryId}`, type: "high_category_spend", severity: "info", category: "trend", icon: "📊",
        title: `${top.icon} ${top.categoryName} concentra ${top.percentage.toFixed(0)}% das despesas`,
        description: `${fmt(top.amount)} no período. Considere revisar ou diversificar este gasto.`,
      });
    }
  }

  return insights.slice(0, 4);
}
