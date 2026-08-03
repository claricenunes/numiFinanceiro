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
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
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
      title:    `${b.categoryIcon} ${b.categoryName} over budget`,
      description: `You spent ${fmt(b.spent)} of ${fmt(b.budgeted)} (${overPct}% over budget).`,
    });
  }

  /* ── 2. Savings rate ────────────────────────────────── */
  if (summary.income > 0) {
    const rate = summary.savingsRate;
    if (rate < 10) {
      insights.push({
        id: "savings-critical", type: "savings_low", severity: "alert", category: "alert", icon: "🔴",
        title: "Critical savings rate",
        description: `You saved only ${rate.toFixed(0)}% of your income this month. The recommended minimum is 20%.`,
      });
    } else if (rate < 20) {
      insights.push({
        id: "savings-low", type: "savings_low", severity: "warning", category: "trend", icon: "⚠️",
        title: "Savings rate below target",
        description: `${rate.toFixed(0)}% saved this month. Recommended target: 20% or more.`,
      });
    } else {
      insights.push({
        id: "savings-ok", type: "savings_good", severity: "info", category: "win", icon: "✅",
        title: "Healthy savings rate",
        description: `${rate.toFixed(0)}% of income saved — above the 20% target. Keep it up!`,
      });
    }
  }

  /* ── 3. Goals off-track ─────────────────────────────── */
  const offTrack = goals.filter(g => g.status === "active" && !g.isOnTrack && g.deadline);
  for (const g of offTrack.slice(0, 1)) {
    insights.push({
      id: `goal-${g.id}`, type: "goal_forecast_changed", severity: "warning", category: "forecast", icon: "🎯",
      title: `"${g.name}" goal is off track`,
      description: g.monthlyNeeded
        ? `You'd need ${fmt(g.monthlyNeeded)}/month to reach it by the target date.`
        : "Adjust your contributions to stay on track for this goal's deadline.",
    });
  }

  /* ── 4. Low available cash ──────────────────────────── */
  if (summary.expense > 0 && summary.availableCash < summary.expense * 0.5 && summary.availableCash >= 0) {
    insights.push({
      id: "low-cash", type: "low_balance", severity: "alert", category: "alert", icon: "💸",
      title: "Low available balance",
      description: `${fmt(summary.availableCash)} available — less than 50% of your expenses this period.`,
    });
  }

  /* ── 5. Top expense category concentration ──────────── */
  if (categories.length > 0 && summary.expense > 0) {
    const top = categories[0];
    if (top.percentage > 40) {
      insights.push({
        id: `top-cat-${top.categoryId}`, type: "high_category_spend", severity: "info", category: "trend", icon: "📊",
        title: `${top.icon} ${top.categoryName} makes up ${top.percentage.toFixed(0)}% of expenses`,
        description: `${fmt(top.amount)} this period. Consider reviewing or diversifying this spending.`,
      });
    }
  }

  return insights.slice(0, 4);
}
