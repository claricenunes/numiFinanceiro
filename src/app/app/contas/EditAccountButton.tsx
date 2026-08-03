"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { useToastStore } from "@/stores/useToastStore";
import { createClient } from "@/lib/supabase/client";
import { ACCOUNT_TYPE_ICON } from "@/lib/icons";
import type { AccountWithBalance } from "@/types/app";

type AccountType = "checking" | "savings" | "credit_card" | "cash" | "investment" | "joint";

const TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: "checking",    label: "Checking" },
  { value: "savings",     label: "Savings" },
  { value: "credit_card", label: "Credit Card" },
  { value: "cash",        label: "Cash" },
  { value: "investment",  label: "Investments" },
  { value: "joint",       label: "Joint Account" },
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
    if (!name.trim()) { show("Name is required", "error"); return; }

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
    if (error) { show("Error: " + error.message, "error"); return; }

    show("Account updated!", "success");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Edit account"
        className="w-7 h-7 flex items-center justify-center rounded-lg text-xs shrink-0 transition-colors"
        style={{ color: "var(--numi-text-3)" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "color-mix(in srgb, var(--numi-landing-heading) 6%, transparent)"; (e.currentTarget as HTMLElement).style.color = "var(--numi-landing-heading)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--numi-text-3)"; }}
      >
        <Pencil size={14} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div
            className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: "#FFFDF9", border: "1px solid rgba(22, 50, 31, 0.08)", maxHeight: "92dvh", overflowY: "auto" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold" style={{ color: "var(--numi-landing-heading)" }}>Edit Account</h2>
              <button onClick={() => setOpen(false)}
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
                    const Icon = ACCOUNT_TYPE_ICON[opt.value];
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setType(opt.value)}
                        className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-medium transition-colors"
                        style={{
                          background: type === opt.value
                            ? "color-mix(in srgb, var(--numi-landing-accent) 14%, transparent)"
                            : "#FFFFFF",
                          border: `1.5px solid ${type === opt.value ? "var(--numi-landing-accent)" : "rgba(22, 50, 31, 0.12)"}`,
                          color: type === opt.value ? "var(--numi-landing-heading)" : "var(--numi-text-2)",
                        }}
                      >
                        <Icon size={18} />
                        <span className="text-center leading-tight">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name */}
              <Field label="Account name">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Chase, Wells Fargo..." required
                  className="numi-landing-input" />
              </Field>

              {/* Institution */}
              <Field label="Bank / Institution (optional)">
                <input value={institution} onChange={e => setInstitution(e.target.value)} placeholder="e.g. Chase"
                  className="numi-landing-input" />
              </Field>

              {/* Extra fields for credit card */}
              {type === "credit_card" && (
                <>
                  <Field label="Credit limit ($)">
                    <input value={creditLimit} onChange={e => setCreditLimit(e.target.value)}
                      type="text" inputMode="decimal" placeholder="0.00"
                      className="numi-landing-input" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Statement closing day">
                      <input value={billingDay} onChange={e => setBillingDay(e.target.value)}
                        type="number" min={1} max={31} placeholder="e.g. 25"
                        className="numi-landing-input" />
                    </Field>
                    <Field label="Due day">
                      <input value={dueDay} onChange={e => setDueDay(e.target.value)}
                        type="number" min={1} max={31} placeholder="e.g. 5"
                        className="numi-landing-input" />
                    </Field>
                  </div>
                </>
              )}

              {/* Color */}
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: "var(--numi-landing-heading)" }}>Color</label>
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

              <button
                type="submit"
                disabled={loading}
                className="numi-pill-btn numi-pill-btn-accent numi-cta-bounce w-full py-3 text-base mt-1 disabled:opacity-60 disabled:pointer-events-none"
              >
                {loading ? "Saving..." : "Save changes"}
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
