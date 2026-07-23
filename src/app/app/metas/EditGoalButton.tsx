"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/stores/useToastStore";
import { createClient } from "@/lib/supabase/client";
import type { GoalWithProgress } from "@/types/app";

const GOAL_ICONS = ["🎯","🏠","✈️","🚗","📚","💻","💍","👶","🏖️","💰","🛡️","🎓","🏋️","🎸","🌍"];

type GoalStatus = "active" | "completed" | "cancelled" | "paused";

const STATUS_OPTIONS: { value: GoalStatus; label: string }[] = [
  { value: "active",    label: "Ativa" },
  { value: "paused",    label: "Pausada" },
  { value: "completed", label: "Concluída" },
  { value: "cancelled", label: "Cancelada" },
];

export function EditGoalButton({ goal }: { goal: GoalWithProgress }) {
  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [name,     setName]     = useState(goal.name);
  const [icon,     setIcon]     = useState(goal.icon ?? "🎯");
  const [target,   setTarget]   = useState(String(goal.targetAmount));
  const [deadline, setDeadline] = useState(goal.deadline ?? "");
  const [status,   setStatus]   = useState<GoalStatus>(goal.status);
  const router = useRouter();
  const { show } = useToastStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(target.replace(",", "."));
    if (!name.trim() || !amount) { show("Nome e valor são obrigatórios", "error"); return; }

    setLoading(true);
    const supabase = createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("goals") as any)
      .update({
        name: name.trim(),
        icon,
        target_amount: amount,
        deadline: deadline || null,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", goal.id);

    setLoading(false);
    if (error) { show("Erro: " + error.message, "error"); return; }

    show("Meta atualizada!", "success");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Editar meta"
        className="w-6 h-6 flex items-center justify-center rounded-lg text-xs shrink-0 transition-colors"
        style={{ color: "var(--numi-text-3)" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "color-mix(in srgb, var(--numi-text) 6%, transparent)"; (e.currentTarget as HTMLElement).style.color = "var(--numi-text)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--numi-text-3)"; }}
      >
        ✏️
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div
            className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: "var(--numi-modal)", border: "1px solid var(--numi-border)", maxHeight: "92dvh", overflowY: "auto" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[var(--numi-text)]">Editar Meta</h2>
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--numi-text-4)] hover:text-[var(--numi-text)] hover:bg-[color-mix(in_srgb,var(--numi-text)_6%,transparent)]">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Ícone */}
              <div>
                <label className="text-xs font-medium text-[var(--numi-text-4)] mb-2 block">Ícone</label>
                <div className="flex flex-wrap gap-2">
                  {GOAL_ICONS.map(i => (
                    <button key={i} type="button" onClick={() => setIcon(i)}
                      className="w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-colors"
                      style={{
                        background: icon === i ? "rgba(52,211,153,0.15)" : "var(--numi-input-bg)",
                        border: `1px solid ${icon === i ? "var(--numi-income)" : "var(--numi-border)"}`,
                      }}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="text-xs font-medium text-[var(--numi-text-4)] mb-1.5 block">Nome da meta</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="Ex: Reserva de emergência, Viagem..." required
                  className="w-full px-3 py-2.5 rounded-lg text-[var(--numi-text)] text-sm outline-none"
                  style={{ border: "1px solid var(--numi-border)", background: "var(--numi-input-bg)" }} />
              </div>

              {/* Valor alvo */}
              <div>
                <label className="text-xs font-medium text-[var(--numi-text-4)] mb-1.5 block">Valor alvo (R$)</label>
                <input value={target} onChange={e => setTarget(e.target.value)}
                  type="text" inputMode="decimal" placeholder="0,00" required
                  className="w-full px-3 py-2.5 rounded-lg text-[var(--numi-text)] text-sm outline-none"
                  style={{ border: "1px solid var(--numi-border)", background: "var(--numi-input-bg)" }} />
              </div>

              {/* Prazo */}
              <div>
                <label className="text-xs font-medium text-[var(--numi-text-4)] mb-1.5 block">Prazo (opcional)</label>
                <input value={deadline} onChange={e => setDeadline(e.target.value)}
                  type="date"
                  className="w-full px-3 py-2.5 rounded-lg text-[var(--numi-text)] text-sm outline-none"
                  style={{ border: "1px solid var(--numi-border)", background: "var(--numi-input-bg)", colorScheme: "light" }} />
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-medium text-[var(--numi-text-4)] mb-1.5 block">Status</label>
                <div className="grid grid-cols-4 gap-2">
                  {STATUS_OPTIONS.map(s => (
                    <button key={s.value} type="button" onClick={() => setStatus(s.value)}
                      className="py-2 px-1 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        background: status === s.value ? "rgba(52,211,153,0.15)" : "var(--numi-input-bg)",
                        border: `1px solid ${status === s.value ? "var(--numi-income)" : "var(--numi-border)"}`,
                        color: status === s.value ? "var(--numi-income)" : "var(--numi-text-2)",
                      }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold mt-1"
                style={{ background: "var(--numi-income)", color: "#0B1020", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Salvando..." : "Salvar alterações"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
