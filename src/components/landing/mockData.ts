import type { DashboardSummary, CategorySpending, GoalWithProgress, TransactionRow } from "@/types/app";

// Fictional data used only across the landing page — same real components
// (SummaryCards, ExpenseChart, FlowChart, GoalsPreview, RecentTransactions)
// as the real dashboard, just fed with mock content for the showcase.

export const MOCK_SUMMARY: DashboardSummary = {
  period: { type: "current_month", startDate: "2026-07-01", endDate: "2026-07-31", label: "July 2026" },
  netWorth: 24380,
  income: 6200,
  expense: 3140,
  savings: 3060,
  savingsRate: 49,
  availableCash: 8420,
  invested: 12500,
};

// Same pastel/earthy palette used across the landing (sage, sand, dusty
// rose, mint, slate) — keeps every chart on the page reading as one system.
export const MOCK_CATEGORIES: CategorySpending[] = [
  { categoryId: "1", categoryName: "Housing",   icon: "🏠", color: "#8FAE7C", amount: 1200, percentage: 38 },
  { categoryId: "2", categoryName: "Food",      icon: "🍔", color: "#E3BE87", amount: 780,  percentage: 25 },
  { categoryId: "3", categoryName: "Transport", icon: "🚗", color: "#93A8B5", amount: 560,  percentage: 18 },
  { categoryId: "4", categoryName: "Leisure",   icon: "🎉", color: "#E3A6AE", amount: 600,  percentage: 19 },
];

export const MOCK_FLOW = [
  { label: "Week 1", income: 1500, expense: 800 },
  { label: "Week 2", income: 1600, expense: 700 },
  { label: "Week 3", income: 1550, expense: 900 },
  { label: "Week 4", income: 1550, expense: 740 },
];

export const MOCK_GOALS: GoalWithProgress[] = [
  {
    id: "1", name: "Trip to Japan", icon: "✈️", targetAmount: 5000, currentAmount: 3200,
    progressPercent: 64, deadline: "2026-12-01", daysRemaining: 120, monthlyNeeded: 450,
    status: "active", isOnTrack: true,
  },
  {
    id: "2", name: "Emergency Fund", icon: "🛡️", targetAmount: 15000, currentAmount: 9000,
    progressPercent: 60, deadline: null, daysRemaining: null, monthlyNeeded: null,
    status: "active", isOnTrack: true,
  },
];

export const MOCK_TRANSACTIONS: TransactionRow[] = [
  { id: "1", date: "2026-07-28", description: "Whole Foods Market", type: "expense", amount: 84.32, status: "confirmed", categoryName: "Food", categoryIcon: "🍔", categoryColor: "#E3BE87", accountName: "Checking", accountColor: "#93A8B5", currencyCode: "USD" },
  { id: "2", date: "2026-07-27", description: "Monthly salary", type: "income", amount: 6200, status: "confirmed", categoryName: "Salary", categoryIcon: "💼", categoryColor: "#8FAE7C", accountName: "Checking", accountColor: "#93A8B5", currencyCode: "USD" },
  { id: "3", date: "2026-07-26", description: "Netflix", type: "expense", amount: 15.99, status: "confirmed", categoryName: "Subscriptions", categoryIcon: "📺", categoryColor: "#E3A6AE", accountName: "Credit Card", accountColor: "#6E76A8", currencyCode: "USD" },
  { id: "4", date: "2026-07-25", description: "Uber", type: "expense", amount: 22.50, status: "confirmed", categoryName: "Transport", categoryIcon: "🚗", categoryColor: "#93A8B5", accountName: "Credit Card", accountColor: "#6E76A8", currencyCode: "USD" },
  { id: "5", date: "2026-07-24", description: "Transfer to savings", type: "transfer", amount: 500, status: "confirmed", categoryName: null, categoryIcon: null, categoryColor: null, accountName: "Checking", accountColor: "#93A8B5", currencyCode: "USD" },
];

/** Monthly spending — feeds the Analytics section's spending-trend chart. */
export const MOCK_SPENDING_TREND = [
  { label: "Feb", value: 2980 },
  { label: "Mar", value: 3210 },
  { label: "Apr", value: 2870 },
  { label: "May", value: 3340 },
  { label: "Jun", value: 3050 },
  { label: "Jul", value: 3140 },
];

/** Cumulative savings — feeds the Analytics section's savings-growth chart. */
export const MOCK_SAVINGS_GROWTH = [
  { label: "Feb", value: 14200 },
  { label: "Mar", value: 16800 },
  { label: "Apr", value: 18500 },
  { label: "May", value: 20100 },
  { label: "Jun", value: 22400 },
  { label: "Jul", value: 24380 },
];

/** Weekly productivity score — feeds the small chart in the Productivity section. */
export const MOCK_WEEKLY_PRODUCTIVITY = [
  { label: "W1", value: 62 },
  { label: "W2", value: 74 },
  { label: "W3", value: 68 },
  { label: "W4", value: 85 },
];

export const MOCK_HEALTH_SCORE = 82;

export const MOCK_INSIGHTS = [
  { icon: "🍔", text: "You spent 18% more on restaurants this month" },
  { icon: "📈", text: "Your savings have grown for 3 straight months" },
  { icon: "🎯", text: "$320 left to hit your Japan trip goal" },
];
