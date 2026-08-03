"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
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
    if (!parsed || parsed <= 0) { show("Enter a valid amount", "error"); return; }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { show("Session expired", "error"); setLoading(false); return; }

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
    if (error) { show("Error: " + error.message, "error"); return; }

    show("Contribution recorded!", "success");
    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-semibold px-4 py-1.5 rounded-xl"
        style={{ background: "rgba(22, 50, 31, 0.08)", color: "var(--numi-landing-heading)" }}
      >
        + Add contribution
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => { setOpen(false); reset(); }} />

          <div
            className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: "#FFFDF9", border: "1px solid rgba(22, 50, 31, 0.08)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold" style={{ color: "var(--numi-landing-heading)" }}>Add Contribution</h2>
                <p className="text-xs text-[var(--numi-text-3)] mt-0.5">{goalName}</p>
              </div>
              <button onClick={() => { setOpen(false); reset(); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--numi-text-4)] hover:text-[var(--numi-landing-heading)] hover:bg-[color-mix(in_srgb,var(--numi-landing-heading)_6%,transparent)]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--numi-landing-heading)" }}>Amount ($)</label>
                <input
                  value={amount} onChange={e => setAmount(e.target.value)}
                  type="text" inputMode="decimal" placeholder="0.00" required autoFocus
                  className="numi-landing-input" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--numi-landing-heading)" }}>Date</label>
                <input value={date} onChange={e => setDate(e.target.value)} type="date" required
                  className="numi-landing-input"
                  style={{ colorScheme: "light" }} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--numi-landing-heading)" }}>Note (optional)</label>
                <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. December contribution"
                  className="numi-landing-input" />
              </div>
              <button type="submit" disabled={loading}
                className="numi-pill-btn numi-pill-btn-accent numi-cta-bounce w-full py-3 text-base mt-1 disabled:opacity-60 disabled:pointer-events-none">
                {loading ? "Saving..." : "Add"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
