"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/stores/useToastStore";
import { createClient } from "@/lib/supabase/client";

export function ContributeButton({ goalId, goalName }: { goalId: string; goalName: string }) {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount,  setAmount]  = useState("");
  const [date,    setDate]    = useState(new Date().toISOString().slice(0, 10));
  const [notes,   setNotes]   = useState("");
  const router = useRouter();
  const { show } = useToastStore();

  function reset() { setAmount(""); setDate(new Date().toISOString().slice(0, 10)); setNotes(""); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount.replace(",", "."));
    if (!parsed || parsed <= 0) { show("Informe um valor válido", "error"); return; }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { show("Sessão expirada", "error"); setLoading(false); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("goal_contributions") as any).insert({
      user_id:       user.id,
      goal_id:       goalId,
      amount:        parsed,
      currency_code: "BRL",
      date,
      notes:         notes.trim() || null,
    });
    setLoading(false);
    if (error) { show("Erro: " + error.message, "error"); return; }

    show("Aporte registrado!", "success");
    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-semibold px-4 py-1.5 rounded-xl"
        style={{ background: "#1E2D45", color: "#F1F5F9" }}
      >
        + Registrar aporte
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => { setOpen(false); reset(); }} />

          <div
            className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: "#0F1B2D", border: "1px solid #1E2D45" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#F1F5F9]">Registrar Aporte</h2>
                <p className="text-xs text-[#475569] mt-0.5">{goalName}</p>
              </div>
              <button onClick={() => { setOpen(false); reset(); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1E2D45]">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Valor (R$)</label>
                <input
                  value={amount} onChange={e => setAmount(e.target.value)}
                  type="text" inputMode="decimal" placeholder="0,00" required autoFocus
                  className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
                  style={{ border: "1px solid #1E2D45", background: "#131929" }} />
              </div>
              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Data</label>
                <input value={date} onChange={e => setDate(e.target.value)} type="date" required
                  className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
                  style={{ border: "1px solid #1E2D45", background: "#131929", colorScheme: "dark" }} />
              </div>
              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Observação (opcional)</label>
                <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ex: Aporte de dezembro"
                  className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
                  style={{ border: "1px solid #1E2D45", background: "#131929" }} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold mt-1"
                style={{ background: "#34D399", color: "#0B1020", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Salvando..." : "Registrar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
