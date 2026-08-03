"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/stores/useToastStore";
import { createClient } from "@/lib/supabase/client";

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

  if (!open) {
    return (
      <button
        onClick={openModal}
        className="numi-pill-btn numi-pill-btn-outline-dark text-sm px-4 py-2"
      >
        + Category
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4"
           style={{ background: "#FFFDF9", border: "1px solid rgba(22, 50, 31, 0.08)" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: "var(--numi-landing-heading)" }}>New Budget</h2>
          <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--numi-text-4)] hover:text-[var(--numi-landing-heading)] hover:bg-[color-mix(in_srgb,var(--numi-landing-heading)_6%,transparent)]">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--numi-landing-heading)" }}>Category</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required
              className="numi-landing-input">
              <option value="">Select category</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--numi-landing-heading)" }}>Monthly limit ($)</label>
            <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0.00" required
              className="numi-landing-input" />
          </div>
          <button type="submit" disabled={loading}
            className="numi-pill-btn numi-pill-btn-accent numi-cta-bounce w-full py-3 text-base mt-1 disabled:opacity-60 disabled:pointer-events-none">
            {loading ? "Saving..." : "Create budget"}
          </button>
        </form>
      </div>
    </div>
  );
}
