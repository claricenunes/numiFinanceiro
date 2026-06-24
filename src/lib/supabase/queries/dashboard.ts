import { createClient } from "@/lib/supabase/server";
import { getCurrentPeriod } from "@/lib/utils/date";
import type { DashboardSummary, CategorySpending, GoalWithProgress, TransactionRow, Period } from "@/types/app";
import type { Account, LedgerEntry, CreditCardBill, Goal, GoalContribution, UserProfile } from "@/types/database";

type RawTx = {
  id: string; date: string; description: string | null;
  type: string; amount: number; status: string; currency_code: string;
  user_categories: { name: string; icon: string | null; color: string | null } | null;
  accounts: { name: string; color: string | null } | null;
};

export type DashboardData = {
  summary: DashboardSummary;
  categories: CategorySpending[];
  weeklyFlow: { label: string; income: number; expense: number }[];
  goals: GoalWithProgress[];
  transactions: TransactionRow[];
  firstName: string;
};

export async function getDashboardData(inputPeriod?: Period): Promise<DashboardData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return emptyDashboard(inputPeriod);

  const period = inputPeriod ?? getCurrentPeriod();

  const results = await Promise.all([
    supabase.from("user_profiles").select("full_name").eq("id", user.id).single(),
    supabase.from("accounts").select("*").eq("user_id", user.id).eq("is_active", true).is("deleted_at", null),
    supabase.from("ledger_entries").select("*").eq("user_id", user.id),
    supabase.from("credit_card_bills").select("*").eq("user_id", user.id).eq("status", "open"),
    supabase
      .from("transactions")
      .select("id,date,description,type,amount,status,currency_code,user_categories(name,icon,color),accounts(name,color)")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .neq("status", "cancelled")
      .gte("date", period.startDate)
      .lte("date", period.endDate)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("goals").select("*").eq("user_id", user.id).is("deleted_at", null).order("created_at"),
    supabase.from("goal_contributions").select("*").eq("user_id", user.id).is("deleted_at", null),
  ]);

  const profile    = results[0].data as (UserProfile | null);
  const accounts   = (results[1].data as Account[]  | null) ?? [];
  const entries    = (results[2].data as LedgerEntry[]  | null) ?? [];
  const bills      = (results[3].data as CreditCardBill[] | null) ?? [];
  const txRaw      = (results[4].data ?? []) as unknown as RawTx[];
  const goals      = (results[5].data as Goal[] | null) ?? [];
  const contribs   = (results[6].data as GoalContribution[] | null) ?? [];

  // ── Account balances ────────────────────────────────────
  const ledgerDelta = new Map<string, number>();
  for (const e of entries) {
    ledgerDelta.set(e.account_id, (ledgerDelta.get(e.account_id) ?? 0) + (e.direction === "credit" ? +e.amount : -+e.amount));
  }
  const billMap = new Map<string, number>();
  for (const b of bills) billMap.set(b.account_id, +b.total_amount);

  const accs = accounts.map((a) => ({
    type: a.type,
    balance: +a.initial_balance + (ledgerDelta.get(a.id) ?? 0),
    bill: billMap.get(a.id) ?? 0,
  }));

  const availableCash = accs.filter(a => ["checking","savings","cash","joint"].includes(a.type)).reduce((s, a) => s + a.balance, 0);
  const invested      = accs.filter(a => a.type === "investment").reduce((s, a) => s + a.balance, 0);
  const totalBills    = accs.filter(a => a.type === "credit_card").reduce((s, a) => s + a.bill, 0);

  // ── Income / expense ────────────────────────────────────
  const income  = txRaw.filter(t => t.type === "income").reduce((s, t) => s + +t.amount, 0);
  const expense = txRaw.filter(t => t.type === "expense").reduce((s, t) => s + +t.amount, 0);
  const savings = income - expense;

  // ── Categories ──────────────────────────────────────────
  const catMap = new Map<string, CategorySpending>();
  for (const t of txRaw.filter(t => t.type === "expense")) {
    const cat = t.user_categories;
    const key = cat?.name ?? "Outros";
    const prev = catMap.get(key);
    catMap.set(key, {
      categoryId: key, categoryName: key,
      icon: cat?.icon ?? "📦", color: cat?.color ?? "#64748B",
      amount: (prev?.amount ?? 0) + +t.amount, percentage: 0,
    });
  }
  const totalExp = Array.from(catMap.values()).reduce((s, c) => s + c.amount, 0);
  const categories = Array.from(catMap.values())
    .map(c => ({ ...c, percentage: totalExp > 0 ? (c.amount / totalExp) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount);

  // ── Weekly flow ─────────────────────────────────────────
  const weeks = [
    { label: "Sem 1", income: 0, expense: 0 },
    { label: "Sem 2", income: 0, expense: 0 },
    { label: "Sem 3", income: 0, expense: 0 },
    { label: "Sem 4", income: 0, expense: 0 },
  ];
  for (const t of txRaw) {
    const wi = Math.min(Math.floor((new Date(t.date + "T12:00:00").getDate() - 1) / 7), 3);
    if (t.type === "income")  weeks[wi].income  += +t.amount;
    if (t.type === "expense") weeks[wi].expense += +t.amount;
  }

  // ── Goals ───────────────────────────────────────────────
  const sumByGoal = new Map<string, number>();
  for (const c of contribs) sumByGoal.set(c.goal_id, (sumByGoal.get(c.goal_id) ?? 0) + +c.amount);

  const today = new Date();
  const goalsData: GoalWithProgress[] = goals.map((g) => {
    const current  = sumByGoal.get(g.id) ?? 0;
    const target   = +g.target_amount;
    const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    const deadline = g.deadline ? new Date(g.deadline + "T12:00:00") : null;
    const daysRemaining = deadline ? Math.max(0, Math.ceil((deadline.getTime() - today.getTime()) / 86400000)) : null;
    const monthsLeft    = daysRemaining ? daysRemaining / 30 : null;
    const remaining     = Math.max(target - current, 0);
    const monthlyNeeded = monthsLeft && monthsLeft > 0 && remaining > 0 ? Math.ceil(remaining / monthsLeft) : null;
    return {
      id: g.id, name: g.name, icon: g.icon,
      targetAmount: target, currentAmount: current, progressPercent: progress,
      deadline: g.deadline, daysRemaining, monthlyNeeded,
      status: g.status, isOnTrack: monthlyNeeded === null || monthlyNeeded <= 0,
    };
  });

  // ── Recent transactions ─────────────────────────────────
  const transactions: TransactionRow[] = txRaw.slice(0, 6).map(t => ({
    id: t.id, date: t.date, description: t.description,
    type: t.type as TransactionRow["type"], amount: +t.amount,
    status: t.status as TransactionRow["status"], currencyCode: t.currency_code,
    categoryName: t.user_categories?.name ?? null, categoryIcon: t.user_categories?.icon ?? null,
    categoryColor: t.user_categories?.color ?? null,
    accountName: t.accounts?.name ?? "—", accountColor: t.accounts?.color ?? null,
  }));

  return {
    firstName: profile?.full_name?.split(" ")[0] ?? "",
    summary: {
      period, netWorth: availableCash + invested - totalBills,
      income, expense, savings,
      savingsRate: income > 0 ? (savings / income) * 100 : 0,
      availableCash, invested,
    },
    categories, weeklyFlow: weeks, goals: goalsData, transactions,
  };
}

function emptyDashboard(period?: Period): DashboardData {
  return {
    firstName: "",
    summary: {
      period: period ?? getCurrentPeriod(),
      netWorth: 0, income: 0, expense: 0, savings: 0,
      savingsRate: 0, availableCash: 0, invested: 0,
    },
    categories: [],
    weeklyFlow: [
      { label: "Sem 1", income: 0, expense: 0 },
      { label: "Sem 2", income: 0, expense: 0 },
      { label: "Sem 3", income: 0, expense: 0 },
      { label: "Sem 4", income: 0, expense: 0 },
    ],
    goals: [], transactions: [],
  };
}
