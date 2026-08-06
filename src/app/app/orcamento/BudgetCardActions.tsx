"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { useToastStore } from "@/stores/useToastStore";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
      <form onSubmit={handleEdit} className="mt-3 pt-3 flex gap-2 items-end border-t" style={{ borderColor: "var(--numi-border)" }}>
        <div className="flex-1">
          <Input value={newAmount} onChange={e => setNewAmount(e.target.value)} type="text" inputMode="decimal" autoFocus className="py-1.5" />
        </div>
        <Button type="submit" variant="accent" size="sm" loading={loading}>Save</Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => { setEditing(false); setNewAmount(budgeted.toFixed(2)); }}>Cancel</Button>
      </form>
    );
  }

  if (confirmDel) {
    return (
      <div className="mt-3 pt-3 flex gap-2 items-center border-t" style={{ borderColor: "var(--numi-border)" }}>
        <span className="text-xs flex-1" style={{ color: "var(--numi-expense)" }}>
          Remove &quot;{categoryName}&quot;?
        </span>
        <Button variant="danger" size="sm" onClick={handleDelete} loading={loading}>Remove</Button>
        <Button variant="secondary" size="sm" onClick={() => setConfirmDel(false)}>Cancel</Button>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 flex gap-2 border-t" style={{ borderColor: "var(--numi-border)" }}>
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        style={{ background: "color-mix(in srgb, var(--numi-landing-heading) 8%, transparent)", color: "var(--numi-landing-heading)" }}
      >
        <Pencil size={12} /> Edit limit
      </button>
      <button
        onClick={() => setConfirmDel(true)}
        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        style={{ background: "rgba(239,68,68,0.08)", color: "var(--numi-expense)" }}
      >
        <Trash2 size={12} /> Remove
      </button>
    </div>
  );
}
