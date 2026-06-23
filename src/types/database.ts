/**
 * Tipos do banco de dados Supabase.
 *
 * Para regenerar automaticamente após migrations:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
 *
 * Os tipos abaixo são o stub inicial — substitua pelo output do CLI após aplicar as migrations.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, "created_at" | "updated_at">;
        Update: Partial<Omit<UserProfile, "id">>;
      };
      accounts: {
        Row: Account;
        Insert: Omit<Account, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Account, "id" | "user_id">>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Transaction, "id" | "user_id">>;
      };
      user_categories: {
        Row: UserCategory;
        Insert: Omit<UserCategory, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<UserCategory, "id" | "user_id">>;
      };
      system_categories: {
        Row: SystemCategory;
        Insert: Omit<SystemCategory, "id">;
        Update: Partial<SystemCategory>;
      };
      budgets: {
        Row: Budget;
        Insert: Omit<Budget, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Budget, "id" | "user_id">>;
      };
      goals: {
        Row: Goal;
        Insert: Omit<Goal, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Goal, "id" | "user_id">>;
      };
      goal_contributions: {
        Row: GoalContribution;
        Insert: Omit<GoalContribution, "id" | "created_at">;
        Update: never;
      };
      transfers: {
        Row: Transfer;
        Insert: Omit<Transfer, "id" | "created_at">;
        Update: never;
      };
      ledger_entries: {
        Row: LedgerEntry;
        Insert: never;
        Update: never;
      };
      credit_card_bills: {
        Row: CreditCardBill;
        Insert: Omit<CreditCardBill, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<CreditCardBill, "id" | "user_id" | "account_id">>;
      };
      user_positions: {
        Row: UserPosition;
        Insert: Omit<UserPosition, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<UserPosition, "id" | "user_id">>;
      };
      asset_master: {
        Row: AssetMaster;
        Insert: Omit<AssetMaster, "id" | "created_at" | "updated_at">;
        Update: Partial<AssetMaster>;
      };
      monthly_snapshots: {
        Row: MonthlySnapshot;
        Insert: never;
        Update: never;
      };
      financial_events: {
        Row: FinancialEvent;
        Insert: never;
        Update: Pick<FinancialEvent, "is_read">;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

/* ── Tipos de linha ──────────────────────────────────────────── */

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  currency_code: string;
  timezone: string;
  theme: "dark" | "light" | "system";
  onboarding_step: number;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  institution: string | null;
  initial_balance: number;
  currency_code: string;
  color: string | null;
  icon: string | null;
  credit_limit: number | null;
  billing_day: number | null;
  due_day: number | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export type AccountType =
  | "checking"
  | "savings"
  | "credit_card"
  | "cash"
  | "investment"
  | "joint";

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  bill_id: string | null;
  recurrence_rule_id: string | null;
  installment_group_id: string | null;
  installment_number: number | null;
  installment_total: number | null;
  type: TransactionType;
  amount: number;
  currency_code: string;
  date: string;
  description: string | null;
  notes: string | null;
  status: TransactionStatus;
  is_recurring: boolean;
  attachment_urls: string[] | null;
  idempotency_key: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export type TransactionType = "income" | "expense" | "transfer";
export type TransactionStatus = "pending" | "confirmed" | "cancelled";

export interface UserCategory {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  type: "income" | "expense" | "transfer";
  parent_id: string | null;
  system_category_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SystemCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense" | "transfer";
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  currency_code: string;
  period_type: "monthly" | "custom";
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  target_amount: number;
  currency_code: string;
  deadline: string | null;
  account_id: string | null;
  status: "active" | "completed" | "cancelled" | "paused";
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface GoalContribution {
  id: string;
  user_id: string;
  goal_id: string;
  transaction_id: string | null;
  amount: number;
  currency_code: string;
  date: string;
  notes: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface Transfer {
  id: string;
  user_id: string;
  from_account_id: string;
  to_account_id: string;
  amount: number;
  currency_code: string;
  date: string;
  description: string | null;
  from_ledger_id: string | null;
  to_ledger_id: string | null;
  idempotency_key: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface LedgerEntry {
  id: string;
  user_id: string;
  account_id: string;
  transaction_id: string | null;
  transfer_id: string | null;
  direction: "credit" | "debit";
  amount: number;
  currency_code: string;
  created_at: string;
}

export interface CreditCardBill {
  id: string;
  user_id: string;
  account_id: string;
  reference_month: string;
  closing_date: string;
  due_date: string;
  total_amount: number;
  status: "open" | "closed" | "paid" | "overdue";
  paid_at: string | null;
  payment_transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPosition {
  id: string;
  user_id: string;
  asset_master_id: string | null;
  account_id: string;
  name: string | null;
  type: string | null;
  quantity: number;
  average_price: number;
  current_price: number | null;
  current_price_updated_at: string | null;
  currency_code: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface AssetMaster {
  id: string;
  ticker: string | null;
  name: string;
  type: "fixed_income" | "stock" | "etf" | "fii" | "crypto" | "cash";
  exchange: string | null;
  currency_code: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlySnapshot {
  id: string;
  user_id: string;
  year: number;
  month: number;
  income: number;
  expense: number;
  savings: number;
  savings_rate: number | null;
  net_worth: number;
  invested_amount: number;
  currency_code: string;
  computed_at: string;
}

export interface FinancialEvent {
  id: string;
  user_id: string;
  type:
    | "budget_exceeded"
    | "goal_reached"
    | "goal_forecast_changed"
    | "salary_detected"
    | "bill_due"
    | "large_expense"
    | "savings_milestone";
  severity: "info" | "warning" | "alert";
  title: string;
  description: string | null;
  metadata: Json | null;
  related_entity_type: "budget" | "goal" | "transaction" | "bill" | null;
  related_entity_id: string | null;
  is_read: boolean;
  created_at: string;
  expires_at: string | null;
}
