import { getCurrentPeriod } from "./utils/date";
import type {
  DashboardSummary, CategorySpending, GoalWithProgress, TransactionRow,
  AccountWithBalance, PositionRow, BudgetItem, PortfolioSummary,
} from "@/types/app";

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

/* ── Contas ─────────────────────────────────────────────── */

export const mockAccounts: AccountWithBalance[] = [
  {
    id: "acc-1", name: "Conta Corrente", type: "checking",
    institution: "Nubank", color: "#34D399", icon: "bank",
    currentBalance: 4180.00, currencyCode: "BRL",
  },
  {
    id: "acc-2", name: "Reserva de Emergência", type: "savings",
    institution: "Nubank", color: "#38BDF8", icon: "piggy",
    currentBalance: 8240.00, currencyCode: "BRL",
  },
  {
    id: "acc-3", name: "Roxinho", type: "credit_card",
    institution: "Nubank", color: "#A855F7", icon: "card",
    currentBalance: 0, currencyCode: "BRL",
    creditLimit: 8000, billingDay: 28, dueDay: 5, currentBillAmount: 1240.60,
  },
  {
    id: "acc-4", name: "Mercado Pago", type: "cash",
    institution: "Mercado Pago", color: "#FBBF24", icon: "wallet",
    currentBalance: 250.00, currencyCode: "BRL",
  },
  {
    id: "acc-5", name: "XP Investimentos", type: "investment",
    institution: "XP Investimentos", color: "#6366F1", icon: "chart",
    currentBalance: 22500.00, currencyCode: "BRL",
  },
];

/* ── Transações (lista completa) ─────────────────────── */

export const mockAllTransactions: TransactionRow[] = [
  // 23 jun
  { id: "t01", date: "2026-06-23", description: "Almoço",             type: "expense",  amount: 52.90,   status: "confirmed", categoryName: "Alimentação", categoryIcon: "🍔", categoryColor: "#F97316", accountName: "Roxinho",        accountColor: "#A855F7", currencyCode: "BRL" },
  { id: "t02", date: "2026-06-23", description: "Uber",               type: "expense",  amount: 22.50,   status: "confirmed", categoryName: "Transporte",  categoryIcon: "🚗", categoryColor: "#3B82F6", accountName: "Roxinho",        accountColor: "#A855F7", currencyCode: "BRL" },
  // 22 jun
  { id: "t03", date: "2026-06-22", description: "Salário",            type: "income",   amount: 5400.00, status: "confirmed", categoryName: "Salário",     categoryIcon: "💰", categoryColor: "#34D399", accountName: "Conta Corrente", accountColor: "#34D399", currencyCode: "BRL" },
  { id: "t04", date: "2026-06-22", description: "Conta de Luz",       type: "expense",  amount: 127.40,  status: "pending",   categoryName: "Moradia",     categoryIcon: "🏠", categoryColor: "#8B5CF6", accountName: "Conta Corrente", accountColor: "#34D399", currencyCode: "BRL" },
  { id: "t05", date: "2026-06-22", description: "Restaurante Xis",    type: "expense",  amount: 45.00,   status: "confirmed", categoryName: "Alimentação", categoryIcon: "🍔", categoryColor: "#F97316", accountName: "Roxinho",        accountColor: "#A855F7", currencyCode: "BRL" },
  // 20 jun
  { id: "t06", date: "2026-06-20", description: "Supermercado",       type: "expense",  amount: 312.80,  status: "confirmed", categoryName: "Alimentação", categoryIcon: "🍔", categoryColor: "#F97316", accountName: "Roxinho",        accountColor: "#A855F7", currencyCode: "BRL" },
  { id: "t07", date: "2026-06-20", description: "Netflix",            type: "expense",  amount: 55.90,   status: "confirmed", categoryName: "Assinaturas", categoryIcon: "🔁", categoryColor: "#6366F1", accountName: "Roxinho",        accountColor: "#A855F7", currencyCode: "BRL" },
  // 18 jun
  { id: "t08", date: "2026-06-18", description: "Freelance Design",   type: "income",   amount: 1200.00, status: "confirmed", categoryName: "Freelance",   categoryIcon: "💻", categoryColor: "#34D399", accountName: "Conta Corrente", accountColor: "#34D399", currencyCode: "BRL" },
  { id: "t09", date: "2026-06-18", description: "Academia",           type: "expense",  amount: 99.90,   status: "confirmed", categoryName: "Saúde",       categoryIcon: "❤️", categoryColor: "#EF4444", accountName: "Conta Corrente", accountColor: "#34D399", currencyCode: "BRL" },
  { id: "t10", date: "2026-06-18", description: "Farmácia",           type: "expense",  amount: 89.50,   status: "confirmed", categoryName: "Saúde",       categoryIcon: "❤️", categoryColor: "#EF4444", accountName: "Roxinho",        accountColor: "#A855F7", currencyCode: "BRL" },
  // 15 jun
  { id: "t11", date: "2026-06-15", description: "Aluguel",            type: "expense",  amount: 1450.00, status: "confirmed", categoryName: "Moradia",     categoryIcon: "🏠", categoryColor: "#8B5CF6", accountName: "Conta Corrente", accountColor: "#34D399", currencyCode: "BRL" },
  { id: "t12", date: "2026-06-15", description: "Spotify",            type: "expense",  amount: 21.90,   status: "confirmed", categoryName: "Assinaturas", categoryIcon: "🔁", categoryColor: "#6366F1", accountName: "Roxinho",        accountColor: "#A855F7", currencyCode: "BRL" },
  // 12 jun
  { id: "t13", date: "2026-06-12", description: "Bar com amigos",     type: "expense",  amount: 95.00,   status: "confirmed", categoryName: "Lazer",       categoryIcon: "🎉", categoryColor: "#EC4899", accountName: "Roxinho",        accountColor: "#A855F7", currencyCode: "BRL" },
  { id: "t14", date: "2026-06-12", description: "Amazon",             type: "expense",  amount: 78.50,   status: "confirmed", categoryName: "Outros",      categoryIcon: "📦", categoryColor: "#64748B", accountName: "Roxinho",        accountColor: "#A855F7", currencyCode: "BRL" },
  // 10 jun
  { id: "t15", date: "2026-06-10", description: "Posto Shell",        type: "expense",  amount: 140.00,  status: "confirmed", categoryName: "Transporte",  categoryIcon: "🚗", categoryColor: "#3B82F6", accountName: "Conta Corrente", accountColor: "#34D399", currencyCode: "BRL" },
  { id: "t16", date: "2026-06-10", description: "Cinema",             type: "expense",  amount: 46.00,   status: "confirmed", categoryName: "Lazer",       categoryIcon: "🎉", categoryColor: "#EC4899", accountName: "Roxinho",        accountColor: "#A855F7", currencyCode: "BRL" },
  // 08 jun
  { id: "t17", date: "2026-06-08", description: "iFood",              type: "expense",  amount: 52.40,   status: "confirmed", categoryName: "Alimentação", categoryIcon: "🍔", categoryColor: "#F97316", accountName: "Roxinho",        accountColor: "#A855F7", currencyCode: "BRL" },
  // 05 jun
  { id: "t18", date: "2026-06-05", description: "Condomínio",         type: "expense",  amount: 380.00,  status: "confirmed", categoryName: "Moradia",     categoryIcon: "🏠", categoryColor: "#8B5CF6", accountName: "Conta Corrente", accountColor: "#34D399", currencyCode: "BRL" },
  // 03 jun
  { id: "t19", date: "2026-06-03", description: "Transfer. poupança", type: "transfer", amount: 500.00,  status: "confirmed", categoryName: null,          categoryIcon: "↔️", categoryColor: "#64748B", accountName: "Conta Corrente", accountColor: "#34D399", currencyCode: "BRL" },
  // 01 jun
  { id: "t20", date: "2026-06-01", description: "Reembolso empresa",  type: "income",   amount: 320.00,  status: "confirmed", categoryName: "Outros",      categoryIcon: "📦", categoryColor: "#64748B", accountName: "Conta Corrente", accountColor: "#34D399", currencyCode: "BRL" },
];

/* ── Orçamento ──────────────────────────────────────────── */

export const mockBudgetItems: BudgetItem[] = [
  { id: "b1", categoryId: "1", categoryName: "Moradia",     categoryIcon: "🏠", categoryColor: "#8B5CF6", budgeted: 1900, spent: 1957.40 },
  { id: "b2", categoryId: "2", categoryName: "Alimentação", categoryIcon: "🍔", categoryColor: "#F97316", budgeted: 700,  spent: 620.00  },
  { id: "b3", categoryId: "5", categoryName: "Transporte",  categoryIcon: "🚗", categoryColor: "#3B82F6", budgeted: 300,  spent: 220.00  },
  { id: "b4", categoryId: "4", categoryName: "Lazer",       categoryIcon: "🎉", categoryColor: "#EC4899", budgeted: 200,  spent: 340.00  },
  { id: "b5", categoryId: "6", categoryName: "Saúde",       categoryIcon: "❤️", categoryColor: "#EF4444", budgeted: 200,  spent: 189.40  },
  { id: "b6", categoryId: "7", categoryName: "Assinaturas", categoryIcon: "🔁", categoryColor: "#6366F1", budgeted: 130,  spent: 77.80   },
  { id: "b7", categoryId: "3", categoryName: "Outros",      categoryIcon: "📦", categoryColor: "#64748B", budgeted: 300,  spent: 398.50  },
];

/* ── Investimentos ──────────────────────────────────────── */

export const mockPositions: PositionRow[] = [
  { id: "p1", name: "Maxi Renda FII",      ticker: "MXRF11", type: "fii",          quantity: 100,   averagePrice: 10.20,    currentPrice: 10.85,    investedAmount: 1020.00, currentValue: 1085.00, profitLoss: 65.00,    profitLossPercent: 6.37,   currencyCode: "BRL" },
  { id: "p2", name: "iShares Ibovespa ETF",ticker: "BOVA11", type: "etf",          quantity: 50,    averagePrice: 110.40,   currentPrice: 118.20,   investedAmount: 5520.00, currentValue: 5910.00, profitLoss: 390.00,   profitLossPercent: 7.07,   currencyCode: "BRL" },
  { id: "p3", name: "Petrobras PN",         ticker: "PETR4",  type: "stock",        quantity: 200,   averagePrice: 36.80,    currentPrice: 38.50,    investedAmount: 7360.00, currentValue: 7700.00, profitLoss: 340.00,   profitLossPercent: 4.62,   currencyCode: "BRL" },
  { id: "p4", name: "Magazine Luiza ON",    ticker: "MGLU3",  type: "stock",        quantity: 500,   averagePrice: 8.40,     currentPrice: 6.20,     investedAmount: 4200.00, currentValue: 3100.00, profitLoss: -1100.00, profitLossPercent: -26.19, currencyCode: "BRL" },
  { id: "p5", name: "Tesouro IPCA+ 2029",  ticker: null,     type: "fixed_income", quantity: 1,     averagePrice: 3800.00,  currentPrice: 4015.00,  investedAmount: 3800.00, currentValue: 4015.00, profitLoss: 215.00,   profitLossPercent: 5.66,   currencyCode: "BRL" },
  { id: "p6", name: "Bitcoin",              ticker: "BTC",    type: "crypto",       quantity: 0.008, averagePrice: 285000.00,currentPrice: 342000.00,investedAmount: 2280.00, currentValue: 2736.00, profitLoss: 456.00,   profitLossPercent: 20.00,  currencyCode: "BRL" },
];

export const mockPortfolioSummary: PortfolioSummary = {
  totalInvested:    24180.00,
  totalCurrentValue:24546.00,
  profitLoss:       366.00,
  profitLossPercent:1.51,
  monthlyReturn:    0.82,
  allocation: [
    { type: "stock",        label: "Ações",      color: "#34D399", percent: 44.0, totalValue: 10800 },
    { type: "etf",          label: "ETFs",       color: "#38BDF8", percent: 24.1, totalValue: 5910  },
    { type: "fixed_income", label: "Renda Fixa", color: "#6366F1", percent: 16.4, totalValue: 4015  },
    { type: "crypto",       label: "Cripto",     color: "#F97316", percent: 11.1, totalValue: 2736  },
    { type: "fii",          label: "FIIs",       color: "#FBBF24", percent: 4.4,  totalValue: 1085  },
  ],
};

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
