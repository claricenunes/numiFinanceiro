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

    // Usuário sem categorias próprias ainda (ex.: conta criada antes do seed
    // automático) — copia as categorias padrão do sistema para o usuário,
    // já que budgets.category_id só aceita ids de user_categories.
    if (!data || data.length === 0) {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: sysCatsRaw } = await supabase
        .from("system_categories")
        .select("id,name,icon,color,type,sort_order")
        .eq("type", "expense")
        .eq("is_active", true);
      const sysCats = sysCatsRaw as SysCategory[] | null;

      if (user && sysCats && sysCats.length > 0) {
        // upsert (não insert) + ignoreDuplicates: se a categoria já existe
        // para esse usuário (mesmo system_category_id), não duplica.
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
        style={{ background: "var(--numi-elevated)", border: "1px solid var(--numi-border)", color: "var(--numi-text)" }}
      >
        + Categoria
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4"
           style={{ background: "var(--numi-modal)", border: "1px solid var(--numi-border)" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--numi-text)]">Novo Orçamento</h2>
          <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--numi-text-4)] hover:text-[var(--numi-text)] hover:bg-[color-mix(in_srgb,var(--numi-text)_6%,transparent)]">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-[var(--numi-text-4)] mb-1.5 block">Categoria</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-lg text-[var(--numi-text)] text-sm outline-none"
              style={{ border: "1px solid var(--numi-border)", background: "var(--numi-input-bg)" }}>
              <option value="">Selecionar categoria</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--numi-text-4)] mb-1.5 block">Limite mensal (R$)</label>
            <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0,00" required
              className="w-full px-3 py-2.5 rounded-lg text-[var(--numi-text)] text-sm outline-none"
              style={{ border: "1px solid var(--numi-border)", background: "var(--numi-input-bg)" }} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold mt-1"
            style={{ background: "var(--numi-income)", color: "#0B1020", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Salvando..." : "Criar orçamento"}
          </button>
        </form>
      </div>
    </div>
  );
}
