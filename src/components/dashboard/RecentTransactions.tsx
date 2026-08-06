"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateRelative } from "@/lib/utils/date";
import type { TransactionRow } from "@/types/app";

interface Props {
  transactions: TransactionRow[];
  /** "en-US" is used only by the landing page's Dashboard Showcase — the
   * real logged-in app never passes this and keeps its pt-BR/BRL default. */
  locale?: "pt-BR" | "en-US";
}

export function RecentTransactions({ transactions, locale = "en-US" }: Props) {
  const currency = locale === "en-US" ? "USD" : "BRL";
  const format = (value: number) => formatCurrency(value, currency, false, locale);
  const t =
    locale === "en-US"
      ? { title: "Recent transactions", viewAll: "View all", empty: "No transactions this period.", create: "+ Add first transaction" }
      : { title: "Últimas transações", viewAll: "Ver todas", empty: "Nenhuma transação neste período.", create: "+ Adicionar primeira transação" };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold" style={{ color: "var(--numi-landing-heading)" }}>{t.title}</p>
        <Link href="/app/transacoes" className="text-xs hover:underline" style={{ color: "var(--numi-landing-tagline)" }}>
          {t.viewAll}
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-[var(--numi-text-3)]">{t.empty}</p>
          <button className="text-xs hover:underline mt-1" style={{ color: "var(--numi-landing-tagline)" }}>
            {t.create}
          </button>
        </div>
      ) : (
        <ul className="flex flex-col divide-y" style={{ borderColor: "var(--numi-border)" }}>
          {transactions.map((tx) => (
            <li
              key={tx.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 cursor-pointer hover:bg-[color-mix(in_srgb,var(--numi-text)_4%,transparent)] -mx-2 px-2 rounded-lg transition-colors"
            >
              {/* Icon */}
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                style={{ background: `${tx.categoryColor}18` }}
              >
                {tx.categoryIcon ?? <CreditCard size={16} />}
              </span>

              {/* Descrição + conta */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--numi-text)] truncate">
                  {tx.description ?? tx.categoryName}
                </p>
                <p className="text-xs text-[var(--numi-text-3)] truncate">
                  {formatDateRelative(tx.date, locale)} · {tx.accountName}
                </p>
              </div>

              {/* Valor */}
              <span
                className="text-sm font-semibold flex-shrink-0"
                style={{ color: tx.type === "income" ? "var(--numi-income)" : "var(--numi-text)" }}
              >
                {tx.type === "income" ? "+" : "−"}
                {format(tx.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
