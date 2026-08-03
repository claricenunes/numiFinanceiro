"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToastStore } from "@/stores/useToastStore";
import { ACCOUNT_TYPE_ICON } from "@/lib/icons";

interface Props {
  initialStep: number;
  userName: string;
}

const ACCOUNT_TYPES = [
  { value: "checking",    label: "Checking" },
  { value: "savings",     label: "Savings" },
  { value: "cash",        label: "Cash" },
  { value: "credit_card", label: "Card" },
  { value: "investment",  label: "Investment" },
];

export function OnboardingWizard({ initialStep, userName }: Props) {
  // UI steps: 0=name, 1=first account, 2=done
  const [step, setStep] = useState(Math.min(initialStep, 1));
  const [name, setName] = useState(userName);
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("checking");
  const [balance, setBalance] = useState("0");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { show } = useToastStore();

  async function goToStep1() {
    if (!name.trim()) { show("Please enter your name", "error"); return; }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("user_profiles") as any)
        .update({ full_name: name.trim(), onboarding_step: 1 })
        .eq("id", user.id);
    }
    setLoading(false);
    setStep(1);
  }

  async function goToStep2() {
    if (!accountName.trim()) { show("Please enter an account name", "error"); return; }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const parsed = parseFloat(balance.replace(",", ".")) || 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("accounts") as any).insert({
        user_id: user.id,
        name: accountName.trim(),
        type: accountType,
        initial_balance: parsed,
        currency_code: "BRL",
        is_active: true,
        display_order: 0,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("user_profiles") as any)
        .update({ onboarding_step: 4 })
        .eq("id", user.id);
    }
    setLoading(false);
    setStep(2);
  }

  function finish() {
    router.push("/app/dashboard");
    router.refresh();
  }

  const firstName = name.split(" ")[0] || "there";

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8 leading-none">
          <span
            className="text-4xl"
            style={{ color: "var(--numi-landing-heading)", fontFamily: "var(--font-logo)" }}
          >
            numi
          </span>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 24 : 8,
                height: 8,
                background: i <= step ? "var(--numi-landing-accent)" : "rgba(22, 50, 31, 0.15)",
              }}
            />
          ))}
        </div>

        {/* Card */}
        <div className="numi-landing-auth-card p-8">
          {/* ── Step 0: Welcome + name ── */}
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--numi-landing-heading)" }}>
                  Welcome to Numi
                </p>
                <p className="text-sm text-[var(--numi-text-2)] leading-relaxed">
                  Your financial journey starts here. Let&apos;s set up your account in 2 quick steps.
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--numi-landing-heading)" }}>
                  What&apos;s your name?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && goToStep1()}
                  placeholder="Your name"
                  autoFocus
                  className="numi-landing-input"
                />
              </div>
              <button
                onClick={goToStep1}
                disabled={loading}
                className="numi-pill-btn numi-pill-btn-accent numi-cta-bounce w-full py-3 text-base disabled:opacity-60 disabled:pointer-events-none"
              >
                {loading ? "Saving..." : "Continue →"}
              </button>
            </div>
          )}

          {/* ── Step 1: First account ── */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--numi-landing-heading)" }}>
                  Add your first account
                </p>
                <p className="text-sm text-[var(--numi-text-2)]">It can be a bank account, wallet, or card.</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--numi-landing-heading)" }}>
                  Account name
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Chase, Wallet, Main account…"
                  autoFocus
                  className="numi-landing-input"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--numi-landing-heading)" }}>
                  Type
                </label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {ACCOUNT_TYPES.map((t) => {
                    const Icon = ACCOUNT_TYPE_ICON[t.value];
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setAccountType(t.value)}
                        className="py-2.5 px-2 rounded-2xl text-xs font-medium flex flex-col items-center gap-1.5 transition-colors"
                        style={{
                          background: accountType === t.value
                            ? "color-mix(in srgb, var(--numi-landing-accent) 14%, transparent)"
                            : "#FFFFFF",
                          border: `1.5px solid ${accountType === t.value ? "var(--numi-landing-accent)" : "rgba(22, 50, 31, 0.12)"}`,
                          color: accountType === t.value ? "var(--numi-landing-heading)" : "var(--numi-text-2)",
                        }}
                      >
                        <Icon size={18} />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--numi-landing-heading)" }}>
                  Current balance (R$)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0.00"
                  className="numi-landing-input"
                />
              </div>

              <button
                onClick={goToStep2}
                disabled={loading}
                className="numi-pill-btn numi-pill-btn-accent numi-cta-bounce w-full py-3 text-base disabled:opacity-60 disabled:pointer-events-none"
              >
                {loading ? "Saving..." : "Create account →"}
              </button>
            </div>
          )}

          {/* ── Step 2: Done ── */}
          {step === 2 && (
            <div className="flex flex-col items-center gap-5 py-4 text-center">
              <div>
                <p className="text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--numi-landing-heading)" }}>
                  All set, {firstName}!
                </p>
                <p className="text-sm text-[var(--numi-text-2)] leading-relaxed">
                  Your account is set up. Explore the dashboard to get a complete view of your finances.
                </p>
              </div>
              <button
                onClick={finish}
                className="numi-pill-btn numi-pill-btn-accent numi-cta-bounce w-full py-3 text-base"
              >
                Go to Dashboard →
              </button>
            </div>
          )}
        </div>

        {/* Step label */}
        <p className="text-center text-xs mt-4" style={{ color: "var(--numi-landing-tagline)" }}>
          {step === 0 && "Step 1 of 2 — Your profile"}
          {step === 1 && "Step 2 of 2 — First account"}
          {step === 2 && "Setup complete!"}
        </p>
      </div>
    </div>
  );
}
