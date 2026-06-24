"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/stores/useToastStore";
import { createClient } from "@/lib/supabase/client";

export function BudgetCardActions({
  budgetId,
  budgeted,
  categoryName,
}: {
  budgetId:     string;
  budgeted:     number;
  categoryName: string;
}) {
  const [editing,    setEditing]    = useState(false);
  const [newAmount,  setNewAmount]  = useState(budgeted.toFixed(2).replace(".", ","));
  const [loading,    setLoading]    = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const router  = useRouter();
  const { show } = useToastStore();

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(newAmount.replace(",", "."));
    if (!amount || amount <= 0) { show("Valor inválido", "error"); return; }
    setLoading(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("budgets") as any)
      .update({ amount, updated_at: new Date().toISOString() })
      .eq("id", budgetId);
    setLoading(false);
    if (error) { show("Erro: " + error.message, "error"); return; }
    show("Limite atualizado!", "success");
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    setLoading(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("budgets") as any)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", budgetId);
    setLoading(false);
    if (error) { show("Erro: " + error.message, "error"); return; }
    show("Orçamento removido", "success");
    router.refresh();
  }

  if (editing) {
    return (
      <form
        onSubmit={handleEdit}
        className="mt-3 pt-3 flex gap-2 items-center"
        style={{ borderTop: "1px solid #1E2D45" }}
      >
        <span className="text-xs text-[#64748B] shrink-0">Novo limite:</span>
        <input
          value={newAmount}
          onChange={e => setNewAmount(e.target.value)}
          type="text"
          inputMode="decimal"
          autoFocus
          className="flex-1 px-2.5 py-1.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
          style={{ border: "1px solid #34D39966", background: "#131929" }}
        />
        <button
          type="submit"
          disabled={loading}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: "#34D399", color: "#0B1020", opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => { setEditing(false); setNewAmount(budgeted.toFixed(2).replace(".", ",")); }}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: "#1E2D45", color: "#94A3B8" }}
        >
          Cancelar
        </button>
      </form>
    );
  }

  if (confirmDel) {
    return (
      <div
        className="mt-3 pt-3 flex gap-2 items-center"
        style={{ borderTop: "1px solid #1E2D45" }}
      >
        <span className="text-xs flex-1" style={{ color: "#F87171" }}>
          Remover "{categoryName}"?
        </span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: "#F8717122", color: "#F87171", opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "..." : "Remover"}
        </button>
        <button
          onClick={() => setConfirmDel(false)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: "#1E2D45", color: "#94A3B8" }}
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 flex gap-2" style={{ borderTop: "1px solid #1E2D45" }}>
      <button
        onClick={() => setEditing(true)}
        className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        style={{ background: "#1E2D45", color: "#94A3B8" }}
      >
        ✏️ Editar limite
      </button>
      <button
        onClick={() => setConfirmDel(true)}
        className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        style={{ background: "#F8717111", color: "#F87171" }}
      >
        🗑 Remover
      </button>
    </div>
  );
}
