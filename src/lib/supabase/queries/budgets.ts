import { createClient } from "@/lib/supabase/server";
import type { BudgetItem } from "@/types/app";

type RawBudget = {
  id: string; category_id: string; amount: number;
  user_categories: { name: string; icon: string | null; color: string | null } | null;
};

type TxAmount = { category_id: string | null; amount: number };

export async function getBudgetItems(
  startDate: string,
  endDate: string,
): Promise<BudgetItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const results = await Promise.all([
    supabase.from("budgets").select("id,category_id,amount,user_categories(name,icon,color)").eq("user_id", user.id).is("deleted_at", null),
    supabase.from("transactions").select("category_id,amount").eq("user_id", user.id).eq("type", "expense").neq("status", "cancelled").is("deleted_at", null).gte("date", startDate).lte("date", endDate),
  ]);

  const budgets = (results[0].data ?? []) as unknown as RawBudget[];
  const txs     = (results[1].data ?? []) as unknown as TxAmount[];

  const spentByCategory = new Map<string, number>();
  for (const tx of txs) {
    if (tx.category_id) {
      spentByCategory.set(tx.category_id, (spentByCategory.get(tx.category_id) ?? 0) + +tx.amount);
    }
  }

  return budgets.map((b) => ({
    id: b.id,
    categoryId:    b.category_id,
    categoryName:  b.user_categories?.name  ?? "—",
    categoryIcon:  b.user_categories?.icon  ?? "📦",
    categoryColor: b.user_categories?.color ?? "#64748B",
    budgeted: +b.amount,
    spent: spentByCategory.get(b.category_id) ?? 0,
  }));
}
