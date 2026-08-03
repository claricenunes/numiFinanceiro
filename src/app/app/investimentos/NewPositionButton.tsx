"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useToastStore } from "@/stores/useToastStore";
import { createClient } from "@/lib/supabase/client";
import { ASSET_TYPE_ICON } from "@/lib/icons";

type AssetType = "stock" | "etf" | "fii" | "fixed_income" | "crypto" | "cash";

const TYPE_OPTIONS: { value: AssetType; label: string }[] = [
  { value: "stock",        label: "Stock" },
  { value: "etf",          label: "ETF" },
  { value: "fii",          label: "REIT" },
  { value: "fixed_income", label: "Fixed Income" },
  { value: "crypto",       label: "Crypto" },
  { value: "cash",         label: "Cash" },
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
      show("Name, quantity and average price are required", "error");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { show("Session expired", "error"); setLoading(false); return; }

    const row: Record<string, unknown> = {
      user_id:       user.id,
      name:          name.trim(),
      type,
      quantity:      qty,
      average_price: avg,
      currency_code: "USD",
    };
    if (accountId) row.account_id = accountId;
    const cur = parseFloat(currentPrice.replace(",", "."));
    if (cur > 0) row.current_price = cur;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("user_positions") as any).insert(row);
    setLoading(false);
    if (error) { show("Error: " + error.message, "error"); return; }

    show("Position added!", "success");
    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="numi-pill-btn numi-pill-btn-accent numi-cta-bounce text-sm px-4 py-2"
      >
        + New Position
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => { setOpen(false); reset(); }} />

          <div
            className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: "#FFFDF9", border: "1px solid rgba(22, 50, 31, 0.08)", maxHeight: "92dvh", overflowY: "auto" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold" style={{ color: "var(--numi-landing-heading)" }}>New Position</h2>
              <button onClick={() => { setOpen(false); reset(); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--numi-text-4)] hover:text-[var(--numi-landing-heading)] hover:bg-[color-mix(in_srgb,var(--numi-landing-heading)_6%,transparent)]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Type */}
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--numi-landing-heading)" }}>Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {TYPE_OPTIONS.map(opt => {
                    const Icon = ASSET_TYPE_ICON[opt.value];
                    return (
                      <button key={opt.value} type="button" onClick={() => setType(opt.value)}
                        className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-medium transition-colors"
                        style={{
                          background: type === opt.value ? "color-mix(in srgb, var(--numi-landing-accent) 14%, transparent)" : "#FFFFFF",
                          border: `1px solid ${type === opt.value ? "var(--numi-landing-accent)" : "rgba(22, 50, 31, 0.12)"}`,
                          color: type === opt.value ? "var(--numi-landing-heading)" : "var(--numi-text-2)",
                        }}>
                        <Icon size={18} />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name */}
              <Field label="Name / Ticker">
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. AAPL, VTI, Treasury Bond..." required autoFocus
                  className="numi-landing-input" />
              </Field>

              {/* Account */}
              {accounts.length > 0 && (
                <Field label="Investment account">
                  <select value={accountId} onChange={e => setAccountId(e.target.value)}
                    className="numi-landing-input">
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </Field>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Field label="Quantity">
                  <input value={quantity} onChange={e => setQuantity(e.target.value)}
                    type="text" inputMode="decimal" placeholder="0" required
                    className="numi-landing-input" />
                </Field>
                <Field label="Average price ($)">
                  <input value={avgPrice} onChange={e => setAvgPrice(e.target.value)}
                    type="text" inputMode="decimal" placeholder="0.00" required
                    className="numi-landing-input" />
                </Field>
              </div>

              <Field label="Current price ($) — optional">
                <input value={currentPrice} onChange={e => setCurrentPrice(e.target.value)}
                  type="text" inputMode="decimal" placeholder="0.00"
                  className="numi-landing-input" />
              </Field>

              <button type="submit" disabled={loading}
                className="numi-pill-btn numi-pill-btn-accent numi-cta-bounce w-full py-3 text-base mt-1 disabled:opacity-60 disabled:pointer-events-none">
                {loading ? "Saving..." : "Add position"}
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
      <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--numi-landing-heading)" }}>{label}</label>
      {children}
    </div>
  );
}
