import { createClient } from "@/lib/supabase/server";
import { getCurrentPeriod, getPeriod } from "@/lib/utils/date";
import type { DashboardSummary, CategorySpending, GoalWithProgress, TransactionRow, Period } from "@/types/app";
import type { Account, LedgerEntry, CreditCardBill, Goal, GoalContribution, UserProfile } from "@/types/database";

type RawTx = {
  id: string; date: string; description: string | null;
  type: string; amount: number; status: string; currency_code: string; is_recurring: boolean;
  user_categories: { name: string; icon: string | null; color: string | null } | null;
  accounts: { name: string; color: string | null } | null;
};

type RawTxLite = {
  type: string; amount: number; is_recurring: boolean;
  user_categories: { name: string } | null;
};

export interface PreviousPeriodSummary {
  income: number;
  expense: number;
  savings: number;
  savingsRate: number;
  recurringTotal: number;
}

/** Vem de `monthly_snapshots` — só existe se essa tabela já tiver sido
 * populada para o mês anterior. `null` quando não há snapshot (usuário
 * novo, ou o job que grava snapshots ainda não rodou) — a UI deve tratar
 * isso como "sem comparação disponível", nunca inventar um valor. */
export interface PreviousSnapshot {
  netWorth: number;
  invested: number;
}

export interface DailyExpense {
  date: string;
  amount: number;
}

export interface UpcomingBill {
  id: string;
  accountName: string;
  amount: number;
  dueDate: string;
}

export interface NetWorthPoint {
  label: string;
  netWorth: number;
}

export interface BiggestExpense {
  description: string;
  amount: number;
  date: string;
}

export type DashboardData = {
  summary: DashboardSummary;
  previousSummary: PreviousPeriodSummary;
  previousSnapshot: PreviousSnapshot | null;
  previousCategories: CategorySpending[];
  dailyExpenses: DailyExpense[];
  recurringTotal: number;
  upcomingBills: UpcomingBill[];
  yearToDateSavings: number;
  netWorthHistory: NetWorthPoint[];
  biggestExpense: BiggestExpense | null;
  loggingStreak: number;
  categories: CategorySpending[];
  weeklyFlow: { label: string; income: number; expense: number }[];
  goals: GoalWithProgress[];
  transactions: TransactionRow[];
  firstName: string;
};

function toISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

/** Período anterior de mesma duração, imediatamente antes de `period`. */
function getPreviousPeriodRange(period: Period): { startDate: string; endDate: string } {
  const start = new Date(period.startDate + "T12:00:00");
  const end = new Date(period.endDate + "T12:00:00");
  const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - days + 1);

  return { startDate: toISO(prevStart), endDate: toISO(prevEnd) };
}

function summarizeCategories(rows: { type: string; amount: number; user_categories: { name: string } | null }[]): CategorySpending[] {
  const catMap = new Map<string, number>();
  for (const t of rows) {
    if (t.type !== "expense") continue;
    const key = t.user_categories?.name ?? "Outros";
    catMap.set(key, (catMap.get(key) ?? 0) + +t.amount);
  }
  const total = Array.from(catMap.values()).reduce((s, v) => s + v, 0);
  return Array.from(catMap.entries())
    .map(([name, amount]) => ({
      categoryId: name, categoryName: name, icon: "📦", color: "#64748B",
      amount, percentage: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export async function getDashboardData(inputPeriod?: Period): Promise<DashboardData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return emptyDashboard(inputPeriod);

  const period = inputPeriod ?? getCurrentPeriod();
  const prevRange = getPreviousPeriodRange(period);
  const ytdPeriod = getPeriod("this_year");

  const prevMonthDate = new Date(period.startDate + "T12:00:00");
  prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
  const prevMonthYear = prevMonthDate.getFullYear();
  const prevMonthMonth = prevMonthDate.getMonth() + 1;

  const results = await Promise.all([
    supabase.from("user_profiles").select("full_name").eq("id", user.id).single(),
    supabase.from("accounts").select("*").eq("user_id", user.id).eq("is_active", true).is("deleted_at", null),
    supabase.from("ledger_entries").select("*").eq("user_id", user.id),
    supabase.from("credit_card_bills").select("*").eq("user_id", user.id).eq("status", "open"),
    supabase
      .from("transactions")
      .select("id,date,description,type,amount,status,currency_code,is_recurring,user_categories(name,icon,color),accounts(name,color)")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .neq("status", "cancelled")
      .gte("date", period.startDate)
      .lte("date", period.endDate)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("goals").select("*").eq("user_id", user.id).is("deleted_at", null).order("created_at"),
    supabase.from("goal_contributions").select("*").eq("user_id", user.id).is("deleted_at", null),
    supabase
      .from("transactions")
      .select("type,amount,is_recurring,user_categories(name)")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .neq("status", "cancelled")
      .gte("date", prevRange.startDate)
      .lte("date", prevRange.endDate),
    supabase
      .from("monthly_snapshots")
      .select("net_worth,invested_amount")
      .eq("user_id", user.id)
      .eq("year", prevMonthYear)
      .eq("month", prevMonthMonth)
      .maybeSingle(),
    supabase
      .from("transactions")
      .select("type,amount")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .neq("status", "cancelled")
      .gte("date", ytdPeriod.startDate)
      .lte("date", ytdPeriod.endDate),
    supabase
      .from("monthly_snapshots")
      .select("year,month,net_worth")
      .eq("user_id", user.id)
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .limit(6),
  ]);

  const profile    = results[0].data as (UserProfile | null);
  const accounts   = (results[1].data as Account[]  | null) ?? [];
  const entries    = (results[2].data as LedgerEntry[]  | null) ?? [];
  const bills      = (results[3].data as CreditCardBill[] | null) ?? [];
  const txRaw      = (results[4].data ?? []) as unknown as RawTx[];
  const goals      = (results[5].data as Goal[] | null) ?? [];
  const contribs   = (results[6].data as GoalContribution[] | null) ?? [];
  const prevTxRaw  = (results[7].data ?? []) as unknown as RawTxLite[];
  const prevSnap   = results[8].data as { net_worth: number; invested_amount: number } | null;
  const ytdTxRaw   = (results[9].data ?? []) as unknown as { type: string; amount: number }[];
  const snapshotRows = (results[10].data as { year: number; month: number; net_worth: number }[] | null) ?? [];

  // ── Account balances ────────────────────────────────────
  const ledgerDelta = new Map<string, number>();
  for (const e of entries) {
    ledgerDelta.set(e.account_id, (ledgerDelta.get(e.account_id) ?? 0) + (e.direction === "credit" ? +e.amount : -+e.amount));
  }
  const billMap = new Map<string, number>();
  for (const b of bills) billMap.set(b.account_id, +b.total_amount);

  const accs = accounts.map((a) => ({
    id: a.id,
    type: a.type,
    balance: +a.initial_balance + (ledgerDelta.get(a.id) ?? 0),
    bill: billMap.get(a.id) ?? 0,
  }));

  const availableCash = accs.filter(a => ["checking","savings","cash","joint"].includes(a.type)).reduce((s, a) => s + a.balance, 0);
  const invested      = accs.filter(a => a.type === "investment").reduce((s, a) => s + a.balance, 0);
  const totalBills    = accs.filter(a => a.type === "credit_card").reduce((s, a) => s + a.bill, 0);
  const netWorth       = availableCash + invested - totalBills;

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

  // ── Previous period (real MoM comparison) ────────────────
  const prevIncome  = prevTxRaw.filter(t => t.type === "income").reduce((s, t) => s + +t.amount, 0);
  const prevExpense = prevTxRaw.filter(t => t.type === "expense").reduce((s, t) => s + +t.amount, 0);
  const prevSavings = prevIncome - prevExpense;
  const prevRecurringTotal = prevTxRaw
    .filter(t => t.type === "expense" && t.is_recurring)
    .reduce((s, t) => s + +t.amount, 0);
  const previousSummary: PreviousPeriodSummary = {
    income: prevIncome, expense: prevExpense, savings: prevSavings,
    savingsRate: prevIncome > 0 ? (prevSavings / prevIncome) * 100 : 0,
    recurringTotal: prevRecurringTotal,
  };
  const previousCategories = summarizeCategories(prevTxRaw);
  const previousSnapshot: PreviousSnapshot | null = prevSnap
    ? { netWorth: +prevSnap.net_worth, invested: +prevSnap.invested_amount }
    : null;

  // ── Daily expenses (heatmap) ─────────────────────────────
  const dailyMap = new Map<string, number>();
  for (const t of txRaw) {
    if (t.type !== "expense") continue;
    dailyMap.set(t.date, (dailyMap.get(t.date) ?? 0) + +t.amount);
  }
  const dailyExpenses: DailyExpense[] = Array.from(dailyMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // ── Recurring spend ───────────────────────────────────────
  const recurringTotal = txRaw
    .filter(t => t.type === "expense" && t.is_recurring)
    .reduce((s, t) => s + +t.amount, 0);

  // ── Biggest single expense this period ───────────────────
  const expenseTxs = txRaw.filter(t => t.type === "expense");
  const biggestExpense: BiggestExpense | null = expenseTxs.length > 0
    ? (() => {
        const top = expenseTxs.reduce((max, t) => (+t.amount > +max.amount ? t : max));
        return { description: top.description ?? top.user_categories?.name ?? "Expense", amount: +top.amount, date: top.date };
      })()
    : null;

  // ── Logging streak (consecutive days with an expense, ending today) ──
  const expenseDateSet = new Set(dailyExpenses.map(d => d.date));
  let loggingStreak = 0;
  {
    const cursor = new Date();
    while (expenseDateSet.has(toISO(cursor))) {
      loggingStreak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  // ── Upcoming bills ────────────────────────────────────────
  const accountNameById = new Map(accounts.map(a => [a.id, a.name]));
  const upcomingBills: UpcomingBill[] = bills
    .map(b => ({
      id: b.id,
      accountName: accountNameById.get(b.account_id) ?? "Card",
      amount: +b.total_amount,
      dueDate: b.due_date,
    }))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  // ── Year to date savings ─────────────────────────────────
  const ytdIncome  = ytdTxRaw.filter(t => t.type === "income").reduce((s, t) => s + +t.amount, 0);
  const ytdExpense = ytdTxRaw.filter(t => t.type === "expense").reduce((s, t) => s + +t.amount, 0);
  const yearToDateSavings = ytdIncome - ytdExpense;

  // ── Net worth history (real snapshots, may be sparse/empty) ──
  const MONTH_LABEL = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const netWorthHistory: NetWorthPoint[] = [...snapshotRows]
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .map(s => ({ label: `${MONTH_LABEL[s.month - 1]} ${String(s.year).slice(2)}`, netWorth: +s.net_worth }));
  netWorthHistory.push({ label: "Now", netWorth });

  return {
    firstName: profile?.full_name?.split(" ")[0] ?? "",
    summary: {
      period, netWorth,
      income, expense, savings,
      savingsRate: income > 0 ? (savings / income) * 100 : 0,
      availableCash, invested,
    },
    previousSummary, previousSnapshot, previousCategories,
    dailyExpenses, recurringTotal, upcomingBills, yearToDateSavings, netWorthHistory,
    biggestExpense, loggingStreak,
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
    previousSummary: { income: 0, expense: 0, savings: 0, savingsRate: 0, recurringTotal: 0 },
    previousSnapshot: null,
    previousCategories: [],
    dailyExpenses: [],
    recurringTotal: 0,
    upcomingBills: [],
    yearToDateSavings: 0,
    netWorthHistory: [{ label: "Now", netWorth: 0 }],
    biggestExpense: null,
    loggingStreak: 0,
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
