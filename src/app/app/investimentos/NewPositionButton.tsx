"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/stores/useToastStore";
import { createClient } from "@/lib/supabase/client";

type AssetType = "stock" | "etf" | "fii" | "fixed_income" | "crypto" | "cash";

const TYPE_OPTIONS: { value: AssetType; label: string; icon: string }[] = [
  { value: "stock",        label: "Ação",       icon: "📈" },
  { value: "etf",          label: "ETF",        icon: "📊" },
  { value: "fii",          label: "FII",        icon: "🏢" },
  { value: "fixed_income", label: "Renda Fixa", icon: "🏛️" },
  { value: "crypto",       label: "Cripto",     icon: "₿"  },
  { value: "cash",         label: "Caixa",      icon: "💵" },
];

type Account = { id: string; name: string };

export function NewPositionButton() {
  const [open,         setOpen]         = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [name,         setName]         = useState("");
  const [type,         setType]         = useState<AssetType>("stock");
  const [quantity,     setQuantity]     = useState("");
  const [avgPrice,     setAvgPrice]     = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [accountId,    setAccountId]    = useState("");
  const [accounts,     setAccounts]     = useState<Account[]>([]);

  const router  = useRouter();
  const { show } = useToastStore();

  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    supabase
      .from("accounts")
      .select("id,name")
      .eq("type", "investment")
      .is("deleted_at", null)
      .order("name")
      .then(({ data }) => {
        const accs = (data ?? []) as Account[];
        setAccounts(accs);
        if (accs.length > 0) setAccountId(prev => prev || accs[0].id);
      });
  }, [open]);

  function reset() {
    setName(""); setType("stock"); setQuantity(""); setAvgPrice("");
    setCurrentPrice(""); setAccountId("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseFloat(quantity.replace(",", "."));
    const avg = parseFloat(avgPrice.replace(",", "."));
    if (!name.trim() || !qty || !avg) {
      show("Nome, quantidade e preço médio são obrigatórios", "error");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { show("Sessão expirada", "error"); setLoading(false); return; }

    const row: Record<string, unknown> = {
      user_id:       user.id,
      name:          name.trim(),
      type,
      quantity:      qty,
      average_price: avg,
      currency_code: "BRL",
    };
    if (accountId) row.account_id = accountId;
    const cur = parseFloat(currentPrice.replace(",", "."));
    if (cur > 0) row.current_price = cur;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("user_positions") as any).insert(row);
    setLoading(false);
    if (error) { show("Erro: " + error.message, "error"); return; }

    show("Posição adicionada!", "success");
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
        + Nova Posição
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => { setOpen(false); reset(); }} />

          <div
            className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: "#0F1B2D", border: "1px solid #1E2D45", maxHeight: "92dvh", overflowY: "auto" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#F1F5F9]">Nova Posição</h2>
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
                    <button key={opt.value} type="button" onClick={() => setType(opt.value)}
                      className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-medium"
                      style={{
                        background: type === opt.value ? "rgba(52,211,153,0.15)" : "#131929",
                        border: `1px solid ${type === opt.value ? "#34D399" : "#1E2D45"}`,
                        color: type === opt.value ? "#34D399" : "#94A3B8",
                      }}>
                      <span className="text-lg">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nome */}
              <Field label="Nome / Ticker">
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="Ex: PETR4, BOVA11, Tesouro Selic..." required autoFocus
                  className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
                  style={{ border: "1px solid #1E2D45", background: "#131929" }} />
              </Field>

              {/* Conta */}
              {accounts.length > 0 && (
                <Field label="Conta de investimento">
                  <select value={accountId} onChange={e => setAccountId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
                    style={{ border: "1px solid #1E2D45", background: "#131929" }}>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </Field>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Field label="Quantidade">
                  <input value={quantity} onChange={e => setQuantity(e.target.value)}
                    type="text" inputMode="decimal" placeholder="0" required
                    className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
                    style={{ border: "1px solid #1E2D45", background: "#131929" }} />
                </Field>
                <Field label="Preço médio (R$)">
                  <input value={avgPrice} onChange={e => setAvgPrice(e.target.value)}
                    type="text" inputMode="decimal" placeholder="0,00" required
                    className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
                    style={{ border: "1px solid #1E2D45", background: "#131929" }} />
                </Field>
              </div>

              <Field label="Cotação atual (R$) — opcional">
                <input value={currentPrice} onChange={e => setCurrentPrice(e.target.value)}
                  type="text" inputMode="decimal" placeholder="0,00"
                  className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
                  style={{ border: "1px solid #1E2D45", background: "#131929" }} />
              </Field>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold mt-1"
                style={{ background: "#34D399", color: "#0B1020", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Salvando..." : "Adicionar posição"}
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
