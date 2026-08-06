"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/stores/useToastStore";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface Category { id: string; name: string; icon: string | null }
interface SysCategory {
  id: string; name: string; icon: string | null; color: string | null; type: string; sort_order: number;
}

export function NewBudgetButton() {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [cats, setCats]       = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount]   = useState("");
  const router = useRouter();
  const { show } = useToastStore();

  async function openModal() {
    setOpen(true);
    const supabase = createClient();
    let { data } = await supabase.from("user_categories").select("id,name,icon").eq("type", "expense").order("name");

    // User has no categories of their own yet (e.g. account created before
    // the automatic seed) — copy the system's default categories over,
    // since budgets.category_id only accepts user_categories ids.
    if (!data || data.length === 0) {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: sysCatsRaw } = await supabase
        .from("system_categories")
        .select("id,name,icon,color,type,sort_order")
        .eq("type", "expense")
        .eq("is_active", true);
      const sysCats = sysCatsRaw as SysCategory[] | null;

      if (user && sysCats && sysCats.length > 0) {
        // upsert (not insert) + ignoreDuplicates: if the category already
        // exists for this user (same system_category_id), don't duplicate.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("user_categories") as any).upsert(
          sysCats.map((c) => ({
            user_id: user.id,
            name: c.name,
            icon: c.icon,
            color: c.color,
            type: c.type,
            system_category_id: c.id,
            sort_order: c.sort_order,
          })),
          { onConflict: "user_id,system_category_id", ignoreDuplicates: true }
        );
        const refetched = await supabase.from("user_categories").select("id,name,icon").eq("type", "expense").order("name");
        data = refetched.data;
      }
    }

    setCats((data ?? []) as Category[]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount.replace(",", "."));
    if (!categoryId || !parsed) { show("Fill in category and amount", "error"); return; }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { show("Session expired", "error"); setLoading(false); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("budgets") as any).insert({
      user_id: user.id, category_id: categoryId, amount: parsed, currency_code: "BRL",
    });
    setLoading(false);
    if (error) { show("Error: " + error.message, "error"); return; }

    show("Budget created!", "success");
    setOpen(false);
    setAmount(""); setCategoryId("");
    router.refresh();
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={openModal}>+ Category</Button>

      <Modal open={open} onClose={() => setOpen(false)} title="New Budget">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Select label="Category" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
            <option value="">Select category</option>
            {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </Select>
          <Input label="Monthly limit ($)" type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
          <Button type="submit" variant="accent" loading={loading} className="w-full mt-1">
            Create budget
          </Button>
        </form>
      </Modal>
    </>
  );
}
