"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateRelative } from "@/lib/utils/date";
import type { TransactionRow } from "@/types/app";

interface Props {
  transactions: TransactionRow[];
}

export function RecentTransactions({ transactions }: Props) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-[var(--numi-text)]">Últimas transações</p>
        <Link href="/app/transactions" className="text-xs text-[var(--numi-income)] hover:underline">
          Ver todas
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-[var(--numi-text-3)]">Nenhuma transação neste período.</p>
          <button className="text-xs text-[var(--numi-income)] hover:underline mt-1">
            + Adicionar primeira transação
          </button>
        </div>
      ) : (
        <ul className="flex flex-col divide-y" style={{ borderColor: "var(--numi-border)" }}>
          {transactions.map((tx) => (
            <li
              key={tx.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 cursor-pointer hover:bg-[color-mix(in_srgb,var(--numi-text)_4%,transparent)] -mx-2 px-2 rounded-lg transition-colors"
            >
              {/* Ícone */}
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                style={{ background: `${tx.categoryColor}18` }}
              >
                {tx.categoryIcon ?? "💳"}
              </span>

              {/* Descrição + conta */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--numi-text)] truncate">
                  {tx.description ?? tx.categoryName}
                </p>
                <p className="text-xs text-[var(--numi-text-3)] truncate">
                  {formatDateRelative(tx.date)} · {tx.accountName}
                </p>
              </div>

              {/* Valor */}
              <span
                className="text-sm font-semibold flex-shrink-0"
                style={{ color: tx.type === "income" ? "var(--numi-income)" : "var(--numi-text)" }}
              >
                {tx.type === "income" ? "+" : "−"}
                {formatCurrency(tx.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
