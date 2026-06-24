"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/stores/useToastStore";
import { createClient } from "@/lib/supabase/client";

type AccountType = "checking" | "savings" | "credit_card" | "cash" | "investment" | "joint";

const TYPE_OPTIONS: { value: AccountType; label: string; icon: string }[] = [
  { value: "checking",    label: "Conta Corrente",   icon: "🏦" },
  { value: "savings",     label: "Poupança",         icon: "💰" },
  { value: "credit_card", label: "Cartão de Crédito",icon: "💳" },
  { value: "cash",        label: "Carteira/Dinheiro",icon: "👛" },
  { value: "investment",  label: "Investimentos",    icon: "📈" },
  { value: "joint",       label: "Conta Conjunta",   icon: "🤝" },
];

const COLORS = ["#34D399","#38BDF8","#FBBF24","#F97316","#8B5CF6","#EC4899","#EF4444","#64748B"];

export function NewAccountButton() {
  const [open,       setOpen]       = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [name,       setName]       = useState("");
  const [type,       setType]       = useState<AccountType>("checking");
  const [institution, setInstitution] = useState("");
  const [balance,    setBalance]    = useState("0");
  const [color,      setColor]      = useState(COLORS[0]);
  const [creditLimit, setCreditLimit] = useState("");
  const [billingDay,  setBillingDay]  = useState("");
  const [dueDay,      setDueDay]      = useState("");
  const router = useRouter();
  const { show } = useToastStore();

  function reset() {
    setName(""); setType("checking"); setInstitution(""); setBalance("0");
    setColor(COLORS[0]); setCreditLimit(""); setBillingDay(""); setDueDay("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { show("Nome obrigatório", "error"); return; }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { show("Sessão expirada", "error"); setLoading(false); return; }

    const row: Record<string, unknown> = {
      user_id:         user.id,
      name:            name.trim(),
      type,
      institution:     institution.trim() || null,
      initial_balance: parseFloat(balance.replace(",", ".")) || 0,
      currency_code:   "BRL",
      color,
    };
    if (type === "credit_card") {
      if (creditLimit) row.credit_limit = parseFloat(creditLimit.replace(",", "."));
      if (billingDay)  row.billing_day  = parseInt(billingDay);
      if (dueDay)      row.due_day      = parseInt(dueDay);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("accounts") as any).insert(row);
    setLoading(false);
    if (error) { show("Erro: " + error.message, "error"); return; }

    show("Conta criada!", "success");
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
        + Nova Conta
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => { setOpen(false); reset(); }} />

          <div
            className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: "#0F1B2D", border: "1px solid #1E2D45", maxHeight: "92dvh", overflowY: "auto" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#F1F5F9]">Nova Conta</h2>
              <button onClick={() => { setOpen(false); reset(); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1E2D45]">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Tipo */}
              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Tipo</label>
                <div className="grid grid-cols-3 gap-2">
                  {TYPE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setType(opt.value)}
                      className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-medium transition-colors"
                      style={{
                        background: type === opt.value ? "rgba(52,211,153,0.15)" : "#131929",
                        border: `1px solid ${type === opt.value ? "#34D399" : "#1E2D45"}`,
                        color: type === opt.value ? "#34D399" : "#94A3B8",
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
                  className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
                  style={{ border: "1px solid #1E2D45", background: "#131929" }} />
              </Field>

              {/* Instituição */}
              <Field label="Banco/Instituição (opcional)">
                <input value={institution} onChange={e => setInstitution(e.target.value)} placeholder="Ex: Nubank"
                  className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
                  style={{ border: "1px solid #1E2D45", background: "#131929" }} />
              </Field>

              {/* Saldo inicial */}
              <Field label={type === "credit_card" ? "Fatura atual (R$)" : "Saldo inicial (R$)"}>
                <input value={balance} onChange={e => setBalance(e.target.value)}
                  type="text" inputMode="decimal" placeholder="0,00"
                  className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
                  style={{ border: "1px solid #1E2D45", background: "#131929" }} />
              </Field>

              {/* Campos extras para cartão */}
              {type === "credit_card" && (
                <>
                  <Field label="Limite do cartão (R$)">
                    <input value={creditLimit} onChange={e => setCreditLimit(e.target.value)}
                      type="text" inputMode="decimal" placeholder="0,00"
                      className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
                      style={{ border: "1px solid #1E2D45", background: "#131929" }} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Dia de fechamento">
                      <input value={billingDay} onChange={e => setBillingDay(e.target.value)}
                        type="number" min={1} max={31} placeholder="Ex: 25"
                        className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
                        style={{ border: "1px solid #1E2D45", background: "#131929" }} />
                    </Field>
                    <Field label="Dia de vencimento">
                      <input value={dueDay} onChange={e => setDueDay(e.target.value)}
                        type="number" min={1} max={31} placeholder="Ex: 5"
                        className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
                        style={{ border: "1px solid #1E2D45", background: "#131929" }} />
                    </Field>
                  </div>
                </>
              )}

              {/* Cor */}
              <div>
                <label className="text-xs font-medium text-[#64748B] mb-2 block">Cor</label>
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
                style={{ background: "#34D399", color: "#0B1020", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Salvando..." : "Criar conta"}
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
      <label className="text-xs font-medium text-[#64748B] mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
