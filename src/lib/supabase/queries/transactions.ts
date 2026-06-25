import { createClient } from "@/lib/supabase/server";
import type { TransactionRow } from "@/types/app";

type RawTx = {
  id: string; date: string; description: string | null;
  type: string; amount: number; status: string; currency_code: string;
  installment_number: number | null; installment_total: number | null;
  user_categories: { name: string; icon: string | null; color: string | null } | null;
  accounts: { name: string; color: string | null } | null;
};

function mapTx(t: RawTx): TransactionRow {
  return {
    id: t.id,
    date: t.date,
    description: t.description,
    type: t.type as TransactionRow["type"],
    amount: +t.amount,
    status: t.status as TransactionRow["status"],
    currencyCode: t.currency_code,
    categoryName:  t.user_categories?.name  ?? null,
    categoryIcon:  t.user_categories?.icon  ?? null,
    categoryColor: t.user_categories?.color ?? null,
    accountName:   t.accounts?.name  ?? "—",
    accountColor:  t.accounts?.color ?? null,
    installmentNumber: t.installment_number ?? null,
    installmentTotal:  t.installment_total  ?? null,
  };
}

export async function getTransactions(
  limit = 100,
  period?: { startDate: string; endDate: string },
): Promise<TransactionRow[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("transactions")
    .select("id,date,description,type,amount,status,currency_code,installment_number,installment_total,user_categories(name,icon,color),accounts(name,color)")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (period) {
    query = query.gte("date", period.startDate).lte("date", period.endDate);
  }

  const { data } = await query.limit(limit);
  return (data as unknown as RawTx[] ?? []).map(mapTx);
}

export async function getRecentTransactions(limit = 6): Promise<TransactionRow[]> {
  return getTransactions(limit);
}

export async function getMonthTransactions(
  startDate: string,
  endDate: string,
): Promise<TransactionRow[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("transactions")
    .select("id,date,description,type,amount,status,currency_code,installment_number,installment_total,user_categories(name,icon,color),accounts(name,color)")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .neq("status", "cancelled")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  return (data as unknown as RawTx[] ?? []).map(mapTx);
}
