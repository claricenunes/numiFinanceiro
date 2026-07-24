import type { DashboardSummary, CategorySpending, GoalWithProgress } from "@/types/app";

// Dado fictício só para a landing — mesmos componentes reais do app,
// compartilhado entre o preview de dentro do iPhone e a seção seguinte
// (mesmo gráfico, mesmo conteúdo, em vez de inventar outro).
export const MOCK_SUMMARY: DashboardSummary = {
  period: { type: "current_month", startDate: "2026-07-01", endDate: "2026-07-31", label: "Julho 2026" },
  netWorth: 24380,
  income: 6200,
  expense: 3140,
  savings: 3060,
  savingsRate: 49,
  availableCash: 8420,
  invested: 12500,
};

export const MOCK_CATEGORIES: CategorySpending[] = [
  { categoryId: "1", categoryName: "Moradia",      icon: "🏠", color: "#8B5CF6", amount: 1200, percentage: 38 },
  { categoryId: "2", categoryName: "Alimentação",  icon: "🍔", color: "#F97316", amount: 780,  percentage: 25 },
  { categoryId: "3", categoryName: "Transporte",   icon: "🚗", color: "#3B82F6", amount: 560,  percentage: 18 },
  { categoryId: "4", categoryName: "Lazer",        icon: "🎉", color: "#EC4899", amount: 600,  percentage: 19 },
];

export const MOCK_FLOW = [
  { label: "Sem 1", income: 1500, expense: 800 },
  { label: "Sem 2", income: 1600, expense: 700 },
  { label: "Sem 3", income: 1550, expense: 900 },
  { label: "Sem 4", income: 1550, expense: 740 },
];

export const MOCK_GOALS: GoalWithProgress[] = [
  {
    id: "1", name: "Viagem", icon: "✈️", targetAmount: 5000, currentAmount: 3200,
    progressPercent: 64, deadline: "2026-12-01", daysRemaining: 120, monthlyNeeded: 450,
    status: "active", isOnTrack: true,
  },
  {
    id: "2", name: "Reserva de emergência", icon: "🛡️", targetAmount: 15000, currentAmount: 9000,
    progressPercent: 60, deadline: null, daysRemaining: null, monthlyNeeded: null,
    status: "active", isOnTrack: true,
  },
];
