"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToastStore } from "@/stores/useToastStore";

interface Props {
  initialStep: number;
  userName: string;
}

const ACCOUNT_TYPES = [
  { value: "checking",    label: "Corrente",     icon: "🏦" },
  { value: "savings",     label: "Poupança",     icon: "🏛️" },
  { value: "cash",        label: "Dinheiro",     icon: "💵" },
  { value: "credit_card", label: "Cartão",       icon: "💳" },
  { value: "investment",  label: "Investimento", icon: "📈" },
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
    if (!name.trim()) { show("Informe seu nome", "error"); return; }
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
    if (!accountName.trim()) { show("Informe o nome da conta", "error"); return; }
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

  const firstName = name.split(" ")[0] || "você";

  return (
    <div className="min-h-dvh flex items-center justify-center p-4" style={{ background: "#0B1020" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)" }}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-[#34D399] block" />
          </span>
          <span className="text-xl font-bold text-[#F1F5F9]">Numi</span>
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
                background: i <= step ? "#34D399" : "#1E2D45",
              }}
            />
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6" style={{ background: "#131929", border: "1px solid #1E2D45" }}>
          {/* ── Step 0: Welcome + name ── */}
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-2xl font-bold text-[#F1F5F9] mb-2">Bem-vindo ao Numi 👋</p>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Sua jornada financeira começa aqui. Vamos configurar sua conta em 2 passos rápidos.
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Como você se chama?</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && goToStep1()}
                  placeholder="Seu nome"
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
                  style={{ border: "1px solid #1E2D45", background: "#0D1526" }}
                />
              </div>
              <button
                onClick={goToStep1}
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity"
                style={{ background: "#34D399", color: "#0B1020", opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "Salvando..." : "Continuar →"}
              </button>
            </div>
          )}

          {/* ── Step 1: First account ── */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-2xl font-bold text-[#F1F5F9] mb-2">Adicione sua primeira conta</p>
                <p className="text-sm text-[#94A3B8]">Pode ser conta bancária, carteira ou cartão.</p>
              </div>

              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Nome da conta</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Ex: Nubank, Itaú, Carteira…"
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
                  style={{ border: "1px solid #1E2D45", background: "#0D1526" }}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Tipo</label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {ACCOUNT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setAccountType(t.value)}
                      className="py-2.5 px-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1.5 transition-colors"
                      style={{
                        background: accountType === t.value ? "rgba(52,211,153,0.1)" : "#0D1526",
                        border: `1px solid ${accountType === t.value ? "#34D39966" : "#1E2D45"}`,
                        color: accountType === t.value ? "#34D399" : "#64748B",
                      }}
                    >
                      <span className="text-base">{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Saldo atual (R$)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
                  style={{ border: "1px solid #1E2D45", background: "#0D1526" }}
                />
              </div>

              <button
                onClick={goToStep2}
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity"
                style={{ background: "#34D399", color: "#0B1020", opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "Salvando..." : "Criar conta →"}
              </button>
            </div>
          )}

          {/* ── Step 2: Done ── */}
          {step === 2 && (
            <div className="flex flex-col items-center gap-5 py-4 text-center">
              <div className="text-5xl">🎉</div>
              <div>
                <p className="text-2xl font-bold text-[#F1F5F9] mb-2">Tudo pronto, {firstName}!</p>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Sua conta está configurada. Explore o dashboard para ter uma visão completa das suas finanças.
                </p>
              </div>
              <button
                onClick={finish}
                className="w-full py-3 rounded-xl text-sm font-semibold"
                style={{ background: "#34D399", color: "#0B1020" }}
              >
                Ir para o Dashboard →
              </button>
            </div>
          )}
        </div>

        {/* Step label */}
        <p className="text-center text-xs text-[#475569] mt-4">
          {step === 0 && "Passo 1 de 2 — Seu perfil"}
          {step === 1 && "Passo 2 de 2 — Primeira conta"}
          {step === 2 && "Configuração concluída!"}
        </p>
      </div>
    </div>
  );
}
