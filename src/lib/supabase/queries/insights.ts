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
  const { summary, goals, categories, previousCategories, recurringTotal } = data;
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

  /* ── 6. Category that grew / shrank the most vs previous period ──── */
  const prevAmountByCategory = new Map(previousCategories.map(c => [c.categoryName, c.amount]));
  let topGrowth: { categoryName: string; icon: string; amount: number; pct: number } | null = null;
  let topDecline: { categoryName: string; icon: string; amount: number; pct: number } | null = null;
  for (const cat of categories) {
    const prevAmount = prevAmountByCategory.get(cat.categoryName) ?? 0;
    if (prevAmount <= 0) continue;
    const pct = ((cat.amount - prevAmount) / prevAmount) * 100;
    if (pct > 20 && (!topGrowth || pct > topGrowth.pct)) topGrowth = { ...cat, pct };
    if (pct < -20 && (!topDecline || pct < topDecline.pct)) topDecline = { ...cat, pct };
  }
  if (topGrowth) {
    insights.push({
      id: `growth-${topGrowth.categoryName}`, type: "category_growth", severity: "warning", category: "trend", icon: "📈",
      title: `${topGrowth.icon} ${topGrowth.categoryName} spending is up ${Math.round(topGrowth.pct)}%`,
      description: `${fmt(topGrowth.amount)} this period vs last period — your fastest-growing category.`,
    });
  }
  if (topDecline) {
    insights.push({
      id: `decline-${topDecline.categoryName}`, type: "category_decline", severity: "info", category: "win", icon: "📉",
      title: `${topDecline.icon} ${topDecline.categoryName} spending is down ${Math.round(Math.abs(topDecline.pct))}%`,
      description: `${fmt(topDecline.amount)} this period, down from last period. Nice trend.`,
    });
  }

  /* ── 7. Recurring spend ─────────────────────────────── */
  if (recurringTotal > 0) {
    insights.push({
      id: "recurring-total", type: "recurring_spend", severity: "info", category: "trend", icon: "🔁",
      title: `${fmt(recurringTotal)} in recurring charges this period`,
      description: "Subscriptions and recurring expenses — worth a quick review if any are no longer used.",
    });
  }

  /* ── 8. Projected balance at month end (linear run-rate) ─────── */
  if (summary.period.type === "current_month" && summary.expense > 0) {
    const daysInPeriod = Math.round(
      (new Date(summary.period.endDate + "T12:00:00").getTime() - new Date(summary.period.startDate + "T12:00:00").getTime()) / 86400000
    ) + 1;
    const rawElapsed = Math.round(
      (Date.now() - new Date(summary.period.startDate + "T12:00:00").getTime()) / 86400000
    ) + 1;
    const daysElapsed = Math.min(Math.max(rawElapsed, 1), daysInPeriod);

    if (daysElapsed < daysInPeriod) {
      const avgDailySpend = summary.expense / daysElapsed;
      const projectedExpense = summary.expense + avgDailySpend * (daysInPeriod - daysElapsed);
      const projectedSavings = summary.income - projectedExpense;
      insights.push({
        id: "forecast-eom", type: "forecast_balance",
        severity: projectedSavings >= 0 ? "info" : "warning", category: "forecast", icon: "🔮",
        title: projectedSavings >= 0 ? "On pace to end the month with a surplus" : "On pace to end the month over budget",
        description: projectedSavings >= 0
          ? `At this rate, you'll have about ${fmt(projectedSavings)} left over by the end of the month.`
          : `At this rate, you'll be short about ${fmt(Math.abs(projectedSavings))} by the end of the month.`,
      });
    }
  }

  return insights.slice(0, 8);
}
