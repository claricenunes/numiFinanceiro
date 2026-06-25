/**
 * Tipos de domínio da aplicação (UI, computed, derivados).
 * Distintos dos tipos do banco — aqui vivem tipos que a UI consome diretamente.
 */

import type { AccountType, TransactionType, TransactionStatus } from "./database";

/* ── Período ──────────────────────────────────────────── */

export type PeriodType =
  | "current_month"
  | "last_30_days"
  | "last_90_days"
  | "this_year"
  | "custom";

export interface Period {
  type: PeriodType;
  startDate: string; // ISO 8601
  endDate: string;   // ISO 8601
  label: string;     // "Outubro 2026"
}

/* ── Dashboard ────────────────────────────────────────── */

export interface DashboardSummary {
  period: Period;
  netWorth: number;
  income: number;
  expense: number;
  savings: number;
  savingsRate: number;
  availableCash: number;
  invested: number;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
}

/* ── Contas (computado) ───────────────────────────────── */

export interface AccountWithBalance {
  id: string;
  name: string;
  type: AccountType;
  institution: string | null;
  color: string | null;
  icon: string | null;
  currentBalance: number;   // initial_balance + ledger sum
  currencyCode: string;
  // Apenas credit_card:
  creditLimit?: number;
  billingDay?: number;
  dueDay?: number;
  currentBillAmount?: number;
}

/* ── Transações (para UI) ─────────────────────────────── */

export interface TransactionRow {
  id: string;
  date: string;
  description: string | null;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
  accountName: string;
  accountColor: string | null;
  currencyCode: string;
  installmentNumber?: number | null;
  installmentTotal?: number | null;
}

/* ── Metas (computado) ───────────────────────────────── */

export interface GoalWithProgress {
  id: string;
  name: string;
  icon: string | null;
  targetAmount: number;
  currentAmount: number;
  progressPercent: number;
  deadline: string | null;
  daysRemaining: number | null;
  monthlyNeeded: number | null;   // para bater prazo
  status: "active" | "completed" | "cancelled" | "paused";
  isOnTrack: boolean;
}

/* ── Investimentos (computado) ───────────────────────── */

export interface PositionRow {
  id: string;
  name: string;
  ticker: string | null;
  type: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number | null;
  investedAmount: number;        // quantity × averagePrice
  currentValue: number | null;   // quantity × currentPrice
  profitLoss: number | null;
  profitLossPercent: number | null;
  currencyCode: string;
}

/* ── Navegação ─────────────────────────────────────────── */

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

/* ── Formulários ────────────────────────────────────────── */

export interface TransactionFormValues {
  type: TransactionType;
  amount: string;
  categoryId: string;
  accountId: string;
  date: string;
  description?: string;
  notes?: string;
  isRecurring: boolean;
}

export interface AccountFormValues {
  name: string;
  type: AccountType;
  institution?: string;
  initialBalance: string;
  currencyCode: string;
  color?: string;
  icon?: string;
  creditLimit?: string;
  billingDay?: number;
  dueDay?: number;
}

/* ── Orçamento (UI) ──────────────────────────────────── */

export interface BudgetItem {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  budgeted: number;
  spent: number;
}

/* ── Insights ────────────────────────────────────────── */

export interface InsightItem {
  id: string;
  type: string;
  severity: "alert" | "warning" | "info";
  category: "alert" | "trend" | "win" | "forecast";
  title: string;
  description: string;
  icon: string;
}

/* ── Investimentos — portfólio ────────────────────────── */

export interface AllocationEntry {
  type: string;
  label: string;
  color: string;
  percent: number;
  totalValue: number;
}

export interface PortfolioSummary {
  totalInvested: number;
  totalCurrentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  monthlyReturn: number;
  allocation: AllocationEntry[];
}
