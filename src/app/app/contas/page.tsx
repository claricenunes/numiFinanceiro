import type { Metadata } from "next";
import { Landmark } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { getAccounts } from "@/lib/supabase/queries/accounts";
import { ACCOUNT_TYPE_ICON } from "@/lib/icons";
import type { AccountWithBalance } from "@/types/app";
import { FadeIn } from "@/components/common/FadeIn";
import { NewAccountButton } from "./NewAccountButton";
import { EditAccountButton } from "./EditAccountButton";

export const metadata: Metadata = { title: "Accounts" };

const TYPE_LABEL: Record<string, string> = {
  checking:    "Checking",
  savings:     "Savings",
  credit_card: "Credit",
  cash:        "Cash",
  investment:  "Investments",
  joint:       "Joint",
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
        <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--numi-landing-heading)" }}>Accounts</h1>
        <NewAccountButton />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <SummaryCard
          label="Net Worth"
          value={formatCurrency(netWorth)}
          sub="Accounts + Investments"
          valueColor="var(--numi-income)"
          className="col-span-2 lg:col-span-1"
        />
        <SummaryCard
          label="Available"
          value={formatCurrency(netLiquid)}
          sub="Excl. investments"
        />
        <SummaryCard
          label="Open balance"
          value={formatCurrency(totalBill)}
          sub="Credit cards"
          valueColor="var(--numi-expense)"
        />
        <SummaryCard
          label="Invested"
          value={formatCurrency(invested)}
          sub="Brokerages"
          valueColor="var(--numi-info)"
        />
      </div>

      {/* Account list */}
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--numi-landing-tagline)" }}>
        Your accounts
      </p>
      {accounts.length === 0 ? (
        <div className="text-center py-20">
          <Landmark size={40} className="mx-auto mb-3" style={{ color: "var(--numi-text-3)" }} />
          <p className="text-[var(--numi-text-2)] font-medium">No accounts yet</p>
          <p className="text-sm text-[var(--numi-text-3)] mt-1">Click &quot;+ New Account&quot; to get started</p>
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

/* ── Sub-components ─────────────────────────────────── */

function SummaryCard({
  label, value, sub, valueColor, className,
}: {
  label: string; value: string; sub: string;
  valueColor?: string; className?: string;
}) {
  return (
    <div
      className={`rounded-2xl p-4 ${className ?? ""}`}
      style={{ background: "#FFFFFF", border: "1px solid rgba(22, 50, 31, 0.08)", boxShadow: "0 8px 20px -12px rgba(22, 50, 31, 0.15)" }}
    >
      <p className="text-xs text-[var(--numi-text-2)] mb-1">{label}</p>
      <p className="text-xl font-bold" style={{ color: valueColor ?? "var(--numi-landing-heading)" }}>{value}</p>
      <p className="text-xs text-[var(--numi-text-3)] mt-1">{sub}</p>
    </div>
  );
}

function AccountCard({ account }: { account: AccountWithBalance }) {
  const Icon        = ACCOUNT_TYPE_ICON[account.type] ?? Landmark;
  const label       = TYPE_LABEL[account.type] ?? account.type;
  const color       = account.color ?? "#10B981";
  const isCreditCard = account.type === "credit_card";
  const bill        = account.currentBillAmount ?? 0;
  const available   = isCreditCard && account.creditLimit
    ? account.creditLimit - bill
    : null;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ background: "#FFFFFF", border: "1px solid rgba(22, 50, 31, 0.08)", boxShadow: "0 8px 20px -12px rgba(22, 50, 31, 0.15)" }}
    >
      {/* Top row: icon + name + badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="flex items-center justify-center shrink-0"
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: `${color}22`,
              border: `1px solid ${color}44`,
              color,
            }}
          >
            <Icon size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "var(--numi-landing-heading)" }}>{account.name}</p>
            <p className="text-xs text-[var(--numi-text-3)] truncate">{account.institution ?? "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
            style={{ background: `${color}22`, color }}
          >
            {label}
          </span>
          <EditAccountButton account={account} />
        </div>
      </div>

      {/* Balance */}
      <div>
        <p className="text-xs text-[var(--numi-text-2)] mb-1">
          {isCreditCard ? "Current bill" : "Balance"}
        </p>
        <p
          className="text-2xl font-bold"
          style={{ color: isCreditCard ? "var(--numi-expense)" : "var(--numi-landing-heading)" }}
        >
          {formatCurrency(isCreditCard ? bill : account.currentBalance)}
        </p>

        {isCreditCard && available !== null && (
          <p className="text-xs text-[var(--numi-text-3)] mt-1">
            {formatCurrency(available)} available of {formatCurrency(account.creditLimit!)}
          </p>
        )}
        {isCreditCard && account.dueDay && (
          <p className="mt-1 text-xs font-medium" style={{ color: "var(--numi-warning)" }}>
            Due on day {account.dueDay}
          </p>
        )}
      </div>
    </div>
  );
}
