import { getCurrentPeriod } from "./utils/date";
import type { DashboardSummary, CategorySpending, GoalWithProgress, TransactionRow } from "@/types/app";

export const mockSummary: DashboardSummary = {
  period: getCurrentPeriod(),
  netWorth: 38420.0,
  income: 5400.0,
  expense: 2847.6,
  savings: 2552.4,
  savingsRate: 47.27,
  availableCash: 4180.0,
  invested: 22500.0,
};

export const mockCategories: CategorySpending[] = [
  { categoryId: "1", categoryName: "Moradia",       icon: "🏠", color: "#8B5CF6", amount: 800,  percentage: 28.1 },
  { categoryId: "2", categoryName: "Alimentação",   icon: "🍔", color: "#F97316", amount: 620,  percentage: 21.8 },
  { categoryId: "3", categoryName: "Outros",        icon: "📦", color: "#64748B", amount: 490,  percentage: 17.2 },
  { categoryId: "4", categoryName: "Lazer",         icon: "🎉", color: "#EC4899", amount: 340,  percentage: 11.9 },
  { categoryId: "5", categoryName: "Transporte",    icon: "🚗", color: "#3B82F6", amount: 220,  percentage: 7.7  },
  { categoryId: "6", categoryName: "Saúde",         icon: "❤️", color: "#EF4444", amount: 178,  percentage: 6.3  },
  { categoryId: "7", categoryName: "Assinaturas",   icon: "🔁", color: "#6366F1", amount: 200,  percentage: 7.0  },
];

export const mockWeeklyFlow = [
  { label: "Sem 1", income: 5400, expense: 420 },
  { label: "Sem 2", income: 0,    expense: 890 },
  { label: "Sem 3", income: 0,    expense: 1140 },
  { label: "Sem 4", income: 0,    expense: 397 },
];

export const mockGoals: GoalWithProgress[] = [
  {
    id: "1",
    name: "Reserva de Emergência",
    icon: "🛡️",
    targetAmount: 18000,
    currentAmount: 4200,
    progressPercent: 23.3,
    deadline: "2027-12-31",
    daysRemaining: 557,
    monthlyNeeded: 766,
    status: "active",
    isOnTrack: false,
  },
  {
    id: "2",
    name: "Viagem Europa",
    icon: "✈️",
    targetAmount: 8000,
    currentAmount: 2800,
    progressPercent: 35.0,
    deadline: "2027-07-01",
    daysRemaining: 374,
    monthlyNeeded: 578,
    status: "active",
    isOnTrack: true,
  },
  {
    id: "3",
    name: "Notebook novo",
    icon: "💻",
    targetAmount: 4500,
    currentAmount: 1350,
    progressPercent: 30.0,
    deadline: null,
    daysRemaining: null,
    monthlyNeeded: null,
    status: "active",
    isOnTrack: true,
  },
];

export const mockTransactions: TransactionRow[] = [
  { id: "1", date: "2026-06-22", description: "Restaurante Xis",   type: "expense",  amount: 45.0,    status: "confirmed", categoryName: "Alimentação", categoryIcon: "🍔", categoryColor: "#F97316", accountName: "Nubank Crédito",  accountColor: "#8B5CF6", currencyCode: "BRL" },
  { id: "2", date: "2026-06-22", description: "Uber",              type: "expense",  amount: 18.5,    status: "confirmed", categoryName: "Transporte",  categoryIcon: "🚗", categoryColor: "#3B82F6", accountName: "Nubank Conta",    accountColor: "#34D399", currencyCode: "BRL" },
  { id: "3", date: "2026-06-21", description: "Salário",           type: "income",   amount: 5400.0,  status: "confirmed", categoryName: "Salário",     categoryIcon: "💰", categoryColor: "#34D399", accountName: "Nubank Conta",    accountColor: "#34D399", currencyCode: "BRL" },
  { id: "4", date: "2026-06-20", description: "Amazon",            type: "expense",  amount: 702.0,   status: "confirmed", categoryName: "Compras",     categoryIcon: "📦", categoryColor: "#64748B", accountName: "Nubank Crédito",  accountColor: "#8B5CF6", currencyCode: "BRL" },
  { id: "5", date: "2026-06-19", description: "Netflix",           type: "expense",  amount: 55.9,    status: "confirmed", categoryName: "Assinaturas", categoryIcon: "🔁", categoryColor: "#6366F1", accountName: "Nubank Crédito",  accountColor: "#8B5CF6", currencyCode: "BRL" },
  { id: "6", date: "2026-06-18", description: "Farmácia",          type: "expense",  amount: 89.5,    status: "confirmed", categoryName: "Saúde",       categoryIcon: "❤️", categoryColor: "#EF4444", accountName: "Nubank Conta",    accountColor: "#34D399", currencyCode: "BRL" },
];

export const mockInsights = [
  {
    id: "1",
    type: "budget_exceeded" as const,
    severity: "alert" as const,
    title: "Lazer acima do orçamento",
    description: "Você gastou R$ 90 acima do limite de R$ 400 em Lazer este mês.",
    icon: "⛔",
  },
  {
    id: "2",
    type: "bill_due" as const,
    severity: "warning" as const,
    title: "Conta de luz vence em 3 dias",
    description: "Estimativa: R$ 180,00. Vencimento: 25/06.",
    icon: "⚠️",
  },
  {
    id: "3",
    type: "goal_forecast_changed" as const,
    severity: "info" as const,
    title: "Reserva de emergência",
    description: "No ritmo atual, sua reserva estará completa em Set 2028. Aumentar para R$ 766/mês adianta 14 meses.",
    icon: "💡",
  },
];
