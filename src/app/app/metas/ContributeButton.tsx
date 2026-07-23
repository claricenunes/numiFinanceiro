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
        style={{ background: "var(--numi-border)", color: "var(--numi-text)" }}
      >
        + Registrar aporte
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => { setOpen(false); reset(); }} />

          <div
            className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: "var(--numi-modal)", border: "1px solid var(--numi-border)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[var(--numi-text)]">Registrar Aporte</h2>
                <p className="text-xs text-[var(--numi-text-3)] mt-0.5">{goalName}</p>
              </div>
              <button onClick={() => { setOpen(false); reset(); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--numi-text-4)] hover:text-[var(--numi-text)] hover:bg-[color-mix(in_srgb,var(--numi-text)_6%,transparent)]">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--numi-text-4)] mb-1.5 block">Valor (R$)</label>
                <input
                  value={amount} onChange={e => setAmount(e.target.value)}
                  type="text" inputMode="decimal" placeholder="0,00" required autoFocus
                  className="w-full px-3 py-2.5 rounded-lg text-[var(--numi-text)] text-sm outline-none"
                  style={{ border: "1px solid var(--numi-border)", background: "var(--numi-input-bg)" }} />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--numi-text-4)] mb-1.5 block">Data</label>
                <input value={date} onChange={e => setDate(e.target.value)} type="date" required
                  className="w-full px-3 py-2.5 rounded-lg text-[var(--numi-text)] text-sm outline-none"
                  style={{ border: "1px solid var(--numi-border)", background: "var(--numi-input-bg)", colorScheme: "light" }} />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--numi-text-4)] mb-1.5 block">Observação (opcional)</label>
                <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ex: Aporte de dezembro"
                  className="w-full px-3 py-2.5 rounded-lg text-[var(--numi-text)] text-sm outline-none"
                  style={{ border: "1px solid var(--numi-border)", background: "var(--numi-input-bg)" }} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold mt-1"
                style={{ background: "var(--numi-income)", color: "#0B1020", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Salvando..." : "Registrar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
