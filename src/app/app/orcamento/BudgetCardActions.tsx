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
        style={{ borderTop: "1px solid var(--numi-border)" }}
      >
        <span className="text-xs text-[var(--numi-text-4)] shrink-0">Novo limite:</span>
        <input
          value={newAmount}
          onChange={e => setNewAmount(e.target.value)}
          type="text"
          inputMode="decimal"
          autoFocus
          className="flex-1 px-2.5 py-1.5 rounded-lg text-[var(--numi-text)] text-sm outline-none"
          style={{ border: "1px solid rgba(16,185,129,0.4)", background: "var(--numi-input-bg)" }}
        />
        <button
          type="submit"
          disabled={loading}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: "var(--numi-income)", color: "#0B1020", opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => { setEditing(false); setNewAmount(budgeted.toFixed(2).replace(".", ",")); }}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: "var(--numi-border)", color: "var(--numi-text-2)" }}
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
        style={{ borderTop: "1px solid var(--numi-border)" }}
      >
        <span className="text-xs flex-1" style={{ color: "var(--numi-expense)" }}>
          Remover "{categoryName}"?
        </span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: "rgba(239,68,68,0.14)", color: "var(--numi-expense)", opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "..." : "Remover"}
        </button>
        <button
          onClick={() => setConfirmDel(false)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: "var(--numi-border)", color: "var(--numi-text-2)" }}
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 flex gap-2" style={{ borderTop: "1px solid var(--numi-border)" }}>
      <button
        onClick={() => setEditing(true)}
        className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        style={{ background: "var(--numi-border)", color: "var(--numi-text-2)" }}
      >
        ✏️ Editar limite
      </button>
      <button
        onClick={() => setConfirmDel(true)}
        className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        style={{ background: "rgba(239,68,68,0.07)", color: "var(--numi-expense)" }}
      >
        🗑 Remover
      </button>
    </div>
  );
}
