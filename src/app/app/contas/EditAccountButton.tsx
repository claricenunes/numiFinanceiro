"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/stores/useToastStore";
import { createClient } from "@/lib/supabase/client";
import type { AccountWithBalance } from "@/types/app";

type AccountType = "checking" | "savings" | "credit_card" | "cash" | "investment" | "joint";

const TYPE_OPTIONS: { value: AccountType; label: string; icon: string }[] = [
  { value: "checking",    label: "Conta Corrente",   icon: "🏦" },
  { value: "savings",     label: "Poupança",         icon: "💰" },
  { value: "credit_card", label: "Cartão de Crédito",icon: "💳" },
  { value: "cash",        label: "Carteira/Dinheiro",icon: "👛" },
  { value: "investment",  label: "Investimentos",    icon: "📈" },
  { value: "joint",       label: "Conta Conjunta",   icon: "🤝" },
];

const COLORS = ["#10B981","#3B82F6","#F59E0B","#F97316","#8B5CF6","#EC4899","#EF4444","#64748B"];

export function EditAccountButton({ account }: { account: AccountWithBalance }) {
  const [open,       setOpen]       = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [name,       setName]       = useState(account.name);
  const [type,       setType]       = useState<AccountType>(account.type);
  const [institution, setInstitution] = useState(account.institution ?? "");
  const [color,      setColor]      = useState(account.color ?? COLORS[0]);
  const [creditLimit, setCreditLimit] = useState(account.creditLimit ? String(account.creditLimit) : "");
  const [billingDay,  setBillingDay]  = useState(account.billingDay ? String(account.billingDay) : "");
  const [dueDay,      setDueDay]      = useState(account.dueDay ? String(account.dueDay) : "");
  const router = useRouter();
  const { show } = useToastStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { show("Nome obrigatório", "error"); return; }

    setLoading(true);
    const supabase = createClient();

    const row: Record<string, unknown> = {
      name: name.trim(),
      type,
      institution: institution.trim() || null,
      color,
      updated_at: new Date().toISOString(),
    };
    if (type === "credit_card") {
      row.credit_limit = creditLimit ? parseFloat(creditLimit.replace(",", ".")) : null;
      row.billing_day  = billingDay  ? parseInt(billingDay)  : null;
      row.due_day      = dueDay      ? parseInt(dueDay)      : null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("accounts") as any).update(row).eq("id", account.id);
    setLoading(false);
    if (error) { show("Erro: " + error.message, "error"); return; }

    show("Conta atualizada!", "success");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Editar conta"
        className="w-7 h-7 flex items-center justify-center rounded-lg text-xs shrink-0 transition-colors"
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
              <h2 className="text-base font-semibold text-[var(--numi-text)]">Editar Conta</h2>
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--numi-text-4)] hover:text-[var(--numi-text)] hover:bg-[color-mix(in_srgb,var(--numi-text)_6%,transparent)]">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Tipo */}
              <div>
                <label className="text-xs font-medium text-[var(--numi-text-4)] mb-1.5 block">Tipo</label>
                <div className="grid grid-cols-3 gap-2">
                  {TYPE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setType(opt.value)}
                      className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-medium transition-colors"
                      style={{
                        background: type === opt.value ? "rgba(52,211,153,0.15)" : "var(--numi-input-bg)",
                        border: `1px solid ${type === opt.value ? "var(--numi-income)" : "var(--numi-border)"}`,
                        color: type === opt.value ? "var(--numi-income)" : "var(--numi-text-2)",
                      }}
                    >
                      <span className="text-lg">{opt.icon}</span>
                      <span className="text-center leading-tight">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nome */}
              <Field label="Nome da conta">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Nubank, Bradesco..." required
                  className="w-full px-3 py-2.5 rounded-lg text-[var(--numi-text)] text-sm outline-none"
                  style={{ border: "1px solid var(--numi-border)", background: "var(--numi-input-bg)" }} />
              </Field>

              {/* Instituição */}
              <Field label="Banco/Instituição (opcional)">
                <input value={institution} onChange={e => setInstitution(e.target.value)} placeholder="Ex: Nubank"
                  className="w-full px-3 py-2.5 rounded-lg text-[var(--numi-text)] text-sm outline-none"
                  style={{ border: "1px solid var(--numi-border)", background: "var(--numi-input-bg)" }} />
              </Field>

              {/* Campos extras para cartão */}
              {type === "credit_card" && (
                <>
                  <Field label="Limite do cartão (R$)">
                    <input value={creditLimit} onChange={e => setCreditLimit(e.target.value)}
                      type="text" inputMode="decimal" placeholder="0,00"
                      className="w-full px-3 py-2.5 rounded-lg text-[var(--numi-text)] text-sm outline-none"
                      style={{ border: "1px solid var(--numi-border)", background: "var(--numi-input-bg)" }} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Dia de fechamento">
                      <input value={billingDay} onChange={e => setBillingDay(e.target.value)}
                        type="number" min={1} max={31} placeholder="Ex: 25"
                        className="w-full px-3 py-2.5 rounded-lg text-[var(--numi-text)] text-sm outline-none"
                        style={{ border: "1px solid var(--numi-border)", background: "var(--numi-input-bg)" }} />
                    </Field>
                    <Field label="Dia de vencimento">
                      <input value={dueDay} onChange={e => setDueDay(e.target.value)}
                        type="number" min={1} max={31} placeholder="Ex: 5"
                        className="w-full px-3 py-2.5 rounded-lg text-[var(--numi-text)] text-sm outline-none"
                        style={{ border: "1px solid var(--numi-border)", background: "var(--numi-input-bg)" }} />
                    </Field>
                  </div>
                </>
              )}

              {/* Cor */}
              <div>
                <label className="text-xs font-medium text-[var(--numi-text-4)] mb-2 block">Cor</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setColor(c)}
                      className="w-7 h-7 rounded-full transition-transform"
                      style={{
                        background: c,
                        outline: color === c ? `2px solid ${c}` : "2px solid transparent",
                        outlineOffset: 2,
                        transform: color === c ? "scale(1.15)" : "scale(1)",
                      }} />
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-[var(--numi-text-4)] mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
