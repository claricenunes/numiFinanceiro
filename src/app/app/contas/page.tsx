import type { Metadata } from "next";
import { formatCurrency } from "@/lib/utils/currency";
import { getAccounts } from "@/lib/supabase/queries/accounts";
import type { AccountWithBalance } from "@/types/app";
import { FadeIn } from "@/components/common/FadeIn";
import { NewAccountButton } from "./NewAccountButton";

export const metadata: Metadata = { title: "Contas" };

const TYPE_LABEL: Record<string, string> = {
  checking:    "Corrente",
  savings:     "Poupança",
  credit_card: "Crédito",
  cash:        "Carteira",
  investment:  "Investimentos",
  joint:       "Conjunta",
};

const TYPE_ICON: Record<string, string> = {
  checking:    "🏦",
  savings:     "💰",
  credit_card: "💳",
  cash:        "👛",
  investment:  "📈",
  joint:       "🤝",
};

export default async function ContasPage() {
  const accounts = await getAccounts();

  const liquidBalance = accounts
    .filter(a => a.type !== "investment" && a.type !== "credit_card")
    .reduce((s, a) => s + a.currentBalance, 0);

  const totalBill = accounts
    .filter(a => a.type === "credit_card")
    .reduce((s, a) => s + (a.currentBillAmount ?? 0), 0);

  const invested = accounts
    .filter(a => a.type === "investment")
    .reduce((s, a) => s + a.currentBalance, 0);

  const netLiquid = liquidBalance - totalBill;
  const netWorth  = netLiquid + invested;

  return (
    <FadeIn className="px-4 py-5 lg:px-8 lg:py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#F1F5F9]">Contas</h1>
        <NewAccountButton />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <SummaryCard
          label="Patrimônio Líquido"
          value={formatCurrency(netWorth)}
          sub="Contas + Investimentos"
          valueColor="#34D399"
          className="col-span-2 lg:col-span-1"
        />
        <SummaryCard
          label="Disponível"
          value={formatCurrency(netLiquid)}
          sub="Excl. investimentos"
        />
        <SummaryCard
          label="Fatura aberta"
          value={formatCurrency(totalBill)}
          sub="Cartões de crédito"
          valueColor="#F87171"
        />
        <SummaryCard
          label="Investido"
          value={formatCurrency(invested)}
          sub="Corretoras"
          valueColor="#38BDF8"
        />
      </div>

      {/* Account list */}
      <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-3">
        Suas contas
      </p>
      {accounts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🏦</p>
          <p className="text-[#94A3B8] font-medium">Nenhuma conta cadastrada</p>
          <p className="text-sm text-[#475569] mt-1">Clique em "+ Nova Conta" para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {accounts.map(a => (
            <AccountCard key={a.id} account={a} />
          ))}
        </div>
      )}
    </FadeIn>
  );
}

/* ── Sub-componentes ─────────────────────────────────── */

function SummaryCard({
  label, value, sub, valueColor, className,
}: {
  label: string; value: string; sub: string;
  valueColor?: string; className?: string;
}) {
  return (
    <div
      className={`rounded-2xl p-4 ${className ?? ""}`}
      style={{ background: "#131929", border: "1px solid #1E2D45" }}
    >
      <p className="text-xs text-[#94A3B8] mb-1">{label}</p>
      <p className="text-xl font-bold" style={{ color: valueColor ?? "#F1F5F9" }}>{value}</p>
      <p className="text-xs text-[#475569] mt-1">{sub}</p>
    </div>
  );
}

function AccountCard({ account }: { account: AccountWithBalance }) {
  const icon        = TYPE_ICON[account.type]  ?? "🏦";
  const label       = TYPE_LABEL[account.type] ?? account.type;
  const color       = account.color ?? "#34D399";
  const isCreditCard = account.type === "credit_card";
  const bill        = account.currentBillAmount ?? 0;
  const available   = isCreditCard && account.creditLimit
    ? account.creditLimit - bill
    : null;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ background: "#131929", border: "1px solid #1E2D45" }}
    >
      {/* Top row: icon + name + badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="flex items-center justify-center text-lg shrink-0"
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: `${color}22`,
              border: `1px solid ${color}44`,
            }}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#F1F5F9] truncate">{account.name}</p>
            <p className="text-xs text-[#475569] truncate">{account.institution ?? "—"}</p>
          </div>
        </div>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
          style={{ background: `${color}22`, color }}
        >
          {label}
        </span>
      </div>

      {/* Balance */}
      <div>
        <p className="text-xs text-[#94A3B8] mb-1">
          {isCreditCard ? "Fatura atual" : "Saldo"}
        </p>
        <p
          className="text-2xl font-bold"
          style={{ color: isCreditCard ? "#F87171" : "#F1F5F9" }}
        >
          {formatCurrency(isCreditCard ? bill : account.currentBalance)}
        </p>

        {isCreditCard && available !== null && (
          <p className="text-xs text-[#475569] mt-1">
            Disponível {formatCurrency(available)} de {formatCurrency(account.creditLimit!)}
          </p>
        )}
        {isCreditCard && account.dueDay && (
          <p className="mt-1 text-xs font-medium" style={{ color: "#FBBF24" }}>
            Vence dia {account.dueDay}
          </p>
        )}
      </div>
    </div>
  );
}
