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
  const [newAmount,  setNewAmount]  = useState(budgeted.toFixed(2));
  const [loading,    setLoading]    = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const router  = useRouter();
  const { show } = useToastStore();

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(newAmount.replace(",", "."));
    if (!amount || amount <= 0) { show("Invalid amount", "error"); return; }
    setLoading(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("budgets") as any)
      .update({ amount, updated_at: new Date().toISOString() })
      .eq("id", budgetId);
    setLoading(false);
    if (error) { show("Error: " + error.message, "error"); return; }
    show("Limit updated!", "success");
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
    if (error) { show("Error: " + error.message, "error"); return; }
    show("Budget removed", "success");
    router.refresh();
  }

  if (editing) {
    return (
      <form
        onSubmit={handleEdit}
        className="mt-3 pt-3 flex gap-2 items-center"
        style={{ borderTop: "1px solid rgba(22, 50, 31, 0.08)" }}
      >
        <span className="text-xs text-[var(--numi-text-3)] shrink-0">New limit:</span>
        <input
          value={newAmount}
          onChange={e => setNewAmount(e.target.value)}
          type="text"
          inputMode="decimal"
          autoFocus
          className="flex-1 numi-landing-input py-1.5"
        />
        <button
          type="submit"
          disabled={loading}
          className="numi-pill-btn numi-pill-btn-accent text-xs px-3 py-1.5 disabled:opacity-60 disabled:pointer-events-none"
        >
          {loading ? "..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => { setEditing(false); setNewAmount(budgeted.toFixed(2)); }}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: "rgba(22, 50, 31, 0.08)", color: "var(--numi-landing-heading)" }}
        >
          Cancel
        </button>
      </form>
    );
  }

  if (confirmDel) {
    return (
      <div
        className="mt-3 pt-3 flex gap-2 items-center"
        style={{ borderTop: "1px solid rgba(22, 50, 31, 0.08)" }}
      >
        <span className="text-xs flex-1" style={{ color: "var(--numi-expense)" }}>
          Remove &quot;{categoryName}&quot;?
        </span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: "rgba(239,68,68,0.14)", color: "var(--numi-expense)", opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "..." : "Remove"}
        </button>
        <button
          onClick={() => setConfirmDel(false)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: "rgba(22, 50, 31, 0.08)", color: "var(--numi-landing-heading)" }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 flex gap-2" style={{ borderTop: "1px solid rgba(22, 50, 31, 0.08)" }}>
      <button
        onClick={() => setEditing(true)}
        className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        style={{ background: "rgba(22, 50, 31, 0.08)", color: "var(--numi-landing-heading)" }}
      >
        ✏️ Edit limit
      </button>
      <button
        onClick={() => setConfirmDel(true)}
        className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        style={{ background: "rgba(239,68,68,0.07)", color: "var(--numi-expense)" }}
      >
        🗑 Remove
      </button>
    </div>
  );
}
