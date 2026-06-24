"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/stores/useToastStore";
import { createClient } from "@/lib/supabase/client";

interface Category { id: string; name: string; icon: string | null }

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
    const { data } = await supabase.from("user_categories").select("id,name,icon").eq("type","expense").order("name");
    if (data) setCats(data as Category[]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount.replace(",", "."));
    if (!categoryId || !parsed) { show("Preencha categoria e valor", "error"); return; }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { show("Sessão expirada", "error"); setLoading(false); return; }

    const { error } = await (supabase.from("budgets") as any).insert({
      user_id: user.id, category_id: categoryId, amount: parsed, currency_code: "BRL",
    });
    setLoading(false);
    if (error) { show("Erro: " + error.message, "error"); return; }

    show("Orçamento criado!", "success");
    setOpen(false);
    setAmount(""); setCategoryId("");
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={openModal}
        className="text-sm font-semibold px-4 py-2 rounded-xl"
        style={{ background: "#131929", border: "1px solid #1E2D45", color: "#F1F5F9" }}
      >
        + Categoria
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4"
           style={{ background: "#0F1B2D", border: "1px solid #1E2D45" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#F1F5F9]">Novo Orçamento</h2>
          <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1E2D45]">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Categoria</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
              style={{ border: "1px solid #1E2D45", background: "#131929" }}>
              <option value="">Selecionar categoria</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Limite mensal (R$)</label>
            <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0,00" required
              className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
              style={{ border: "1px solid #1E2D45", background: "#131929" }} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold mt-1"
            style={{ background: "#34D399", color: "#0B1020", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Salvando..." : "Criar orçamento"}
          </button>
        </form>
      </div>
    </div>
  );
}
