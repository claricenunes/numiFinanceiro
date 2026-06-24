"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/stores/useToastStore";
import { createClient } from "@/lib/supabase/client";

const GOAL_ICONS = ["🎯","🏠","✈️","🚗","📚","💻","💍","👶","🏖️","💰","🛡️","🎓","🏋️","🎸","🌍"];

export function NewGoalButton() {
  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [name,     setName]     = useState("");
  const [icon,     setIcon]     = useState("🎯");
  const [target,   setTarget]   = useState("");
  const [deadline, setDeadline] = useState("");
  const router = useRouter();
  const { show } = useToastStore();

  function reset() { setName(""); setIcon("🎯"); setTarget(""); setDeadline(""); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(target.replace(",", "."));
    if (!name.trim() || !amount) { show("Nome e valor são obrigatórios", "error"); return; }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { show("Sessão expirada", "error"); setLoading(false); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("goals") as any).insert({
      user_id:       user.id,
      name:          name.trim(),
      icon,
      target_amount: amount,
      currency_code: "BRL",
      deadline:      deadline || null,
      status:        "active",
    });
    setLoading(false);
    if (error) { show("Erro: " + error.message, "error"); return; }

    show("Meta criada!", "success");
    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-semibold px-4 py-2 rounded-xl"
        style={{ background: "#34D399", color: "#0B1020" }}
      >
        + Nova Meta
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => { setOpen(false); reset(); }} />

          <div
            className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: "#0F1B2D", border: "1px solid #1E2D45", maxHeight: "92dvh", overflowY: "auto" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#F1F5F9]">Nova Meta</h2>
              <button onClick={() => { setOpen(false); reset(); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1E2D45]">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Ícone */}
              <div>
                <label className="text-xs font-medium text-[#64748B] mb-2 block">Ícone</label>
                <div className="flex flex-wrap gap-2">
                  {GOAL_ICONS.map(i => (
                    <button key={i} type="button" onClick={() => setIcon(i)}
                      className="w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-colors"
                      style={{
                        background: icon === i ? "rgba(52,211,153,0.15)" : "#131929",
                        border: `1px solid ${icon === i ? "#34D399" : "#1E2D45"}`,
                      }}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Nome da meta</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="Ex: Reserva de emergência, Viagem..." required
                  className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
                  style={{ border: "1px solid #1E2D45", background: "#131929" }} />
              </div>

              {/* Valor alvo */}
              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Valor alvo (R$)</label>
                <input value={target} onChange={e => setTarget(e.target.value)}
                  type="text" inputMode="decimal" placeholder="0,00" required
                  className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
                  style={{ border: "1px solid #1E2D45", background: "#131929" }} />
              </div>

              {/* Prazo */}
              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Prazo (opcional)</label>
                <input value={deadline} onChange={e => setDeadline(e.target.value)}
                  type="date" min={new Date().toISOString().slice(0, 10)}
                  className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
                  style={{ border: "1px solid #1E2D45", background: "#131929", colorScheme: "dark" }} />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold mt-1"
                style={{ background: "#34D399", color: "#0B1020", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Salvando..." : "Criar meta"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
