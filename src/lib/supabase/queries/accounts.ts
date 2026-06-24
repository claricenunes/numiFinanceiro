import { createClient } from "@/lib/supabase/server";
import type { AccountWithBalance } from "@/types/app";
import type { Account, LedgerEntry, CreditCardBill } from "@/types/database";

export async function getAccounts(): Promise<AccountWithBalance[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const [res1, res2, res3] = await Promise.all([
    supabase.from("accounts").select("*").eq("user_id", user.id).eq("is_active", true).is("deleted_at", null).order("display_order"),
    supabase.from("ledger_entries").select("*").eq("user_id", user.id),
    supabase.from("credit_card_bills").select("*").eq("user_id", user.id).eq("status", "open"),
  ]);

  const accounts: Account[] = res1.data ?? [];
  const entries: LedgerEntry[] = res2.data ?? [];
  const bills: CreditCardBill[] = res3.data ?? [];

  const ledgerDelta = new Map<string, number>();
  for (const e of entries) {
    const prev = ledgerDelta.get(e.account_id) ?? 0;
    ledgerDelta.set(e.account_id, prev + (e.direction === "credit" ? +e.amount : -+e.amount));
  }

  const billMap = new Map<string, number>();
  for (const b of bills) billMap.set(b.account_id, +b.total_amount);

  return accounts.map((acc) => ({
    id: acc.id,
    name: acc.name,
    type: acc.type,
    institution: acc.institution,
    color: acc.color,
    icon: acc.icon,
    currentBalance: +acc.initial_balance + (ledgerDelta.get(acc.id) ?? 0),
    currencyCode: acc.currency_code,
    creditLimit:  acc.credit_limit  ? +acc.credit_limit  : undefined,
    billingDay:   acc.billing_day  ?? undefined,
    dueDay:       acc.due_day      ?? undefined,
    currentBillAmount: billMap.get(acc.id) ?? 0,
  }));
}
