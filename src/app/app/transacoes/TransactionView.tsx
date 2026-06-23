"use client";

import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils/currency";
import { CSVImport } from "./CSVImport";
import type { TransactionRow } from "@/types/app";

/* ── Helpers ─────────────────────────────────────────── */

function formatGroupHeader(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date  = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - date.getTime()) / 86_400_000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short", day: "numeric", month: "short",
  }).format(date).replace(/\.$/, "");
}

function groupByDate(rows: TransactionRow[]): [string, TransactionRow[]][] {
  const map: Record<string, TransactionRow[]> = {};
  for (const t of rows) {
    (map[t.date] ??= []).push(t);
  }
  return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
}

type TypeFilter = "all" | "income" | "expense" | "transfer";

/* ── Component ───────────────────────────────────────── */

export function TransactionView({ transactions }: { transactions: TransactionRow[] }) {
  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [category,   setCategory]   = useState("all");
  const [showImport, setShowImport] = useState(false);

  const categories = useMemo(() => {
    const names = new Set(transactions.map(t => t.categoryName).filter(Boolean) as string[]);
    return ["all", ...Array.from(names).sort()];
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (category   !== "all" && t.categoryName !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!t.description?.toLowerCase().includes(q) &&
            !t.categoryName?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [transactions, typeFilter, category, search]);

  const totalIncome   = filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense  = filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance       = totalIncome - totalExpense;
  const groups        = groupByDate(filtered);

  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-[#F1F5F9]">Transações</h1>
        <button
          onClick={() => setShowImport(true)}
          className="text-sm font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
          style={{ background: "#131929", border: "1px solid #1E2D45", color: "#94A3B8" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "#34D39944";
            (e.currentTarget as HTMLElement).style.color = "#F1F5F9";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "#1E2D45";
            (e.currentTarget as HTMLElement).style.color = "#94A3B8";
          }}
        >
          <span>↑</span> Importar CSV
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-2xl p-3 text-center" style={{ background: "#131929", border: "1px solid #1E2D45" }}>
          <p className="text-xs text-[#94A3B8] mb-0.5">Receitas</p>
          <p className="text-base font-bold" style={{ color: "#34D399" }}>{formatCurrency(totalIncome)}</p>
        </div>
        <div className="rounded-2xl p-3 text-center" style={{ background: "#131929", border: "1px solid #1E2D45" }}>
          <p className="text-xs text-[#94A3B8] mb-0.5">Despesas</p>
          <p className="text-base font-bold" style={{ color: "#F87171" }}>{formatCurrency(totalExpense)}</p>
        </div>
        <div className="rounded-2xl p-3 text-center" style={{ background: "#131929", border: "1px solid #1E2D45" }}>
          <p className="text-xs text-[#94A3B8] mb-0.5">Saldo</p>
          <p className="text-base font-bold" style={{ color: balance >= 0 ? "#38BDF8" : "#F87171" }}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-5">
        {/* Search */}
        <input
          type="search"
          placeholder="Buscar transações..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-base"
        />

        {/* Type pills */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          {(["all", "income", "expense", "transfer"] as const).map(f => {
            const labels = { all: "Todos", income: "Receitas", expense: "Despesas", transfer: "Transferências" };
            const active = typeFilter === f;
            return (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className="text-xs font-medium px-3 py-1.5 rounded-full shrink-0 transition-colors"
                style={{
                  background: active ? "#34D399" : "#131929",
                  color:      active ? "#0B1020" : "#94A3B8",
                  border:     active ? "none" : "1px solid #1E2D45",
                }}
              >
                {labels[f]}
              </button>
            );
          })}
        </div>

        {/* Category filter */}
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="input-base"
          style={{ appearance: "none" }}
        >
          <option value="all">Todas as categorias</option>
          {categories.slice(1).map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* CSV Import modal */}
      <AnimatePresence>
        {showImport && <CSVImport onClose={() => setShowImport(false)} />}
      </AnimatePresence>

      {/* Transaction groups */}
      {groups.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-[#94A3B8] font-medium">Nenhuma transação encontrada</p>
          <p className="text-sm text-[#475569] mt-1">Tente ajustar os filtros</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(([date, rows]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-2">
                <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
                  {formatGroupHeader(date)}
                </p>
                <div className="flex-1 h-px" style={{ background: "#1E2D45" }} />
                <p className="text-xs text-[#475569]">
                  {rows.length} {rows.length === 1 ? "item" : "itens"}
                </p>
              </div>

              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "#131929", border: "1px solid #1E2D45" }}
              >
                {rows.map((t, idx) => (
                  <TransactionRow key={t.id} tx={t} last={idx === rows.length - 1} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TransactionRow({ tx, last }: { tx: TransactionRow; last: boolean }) {
  const isIncome   = tx.type === "income";
  const isTransfer = tx.type === "transfer";
  const icon       = tx.categoryIcon  ?? (isIncome ? "💰" : isTransfer ? "↔️" : "💳");
  const iconColor  = tx.categoryColor ?? "#64748B";

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
      style={{ borderBottom: last ? "none" : "1px solid #1E2D45" }}
    >
      {/* Icon */}
      <span
        className="flex items-center justify-center text-base shrink-0"
        style={{
          width: 38, height: 38, borderRadius: 10,
          background: `${iconColor}22`,
          border: `1px solid ${iconColor}33`,
        }}
      >
        {icon}
      </span>

      {/* Description + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-[#F1F5F9] truncate">
            {tx.description ?? "—"}
          </p>
          {tx.status === "pending" && (
            <span className="text-xs px-1.5 py-0.5 rounded-full shrink-0"
              style={{ background: "#FBBF2422", color: "#FBBF24", border: "1px solid #FBBF2444" }}>
              Pendente
            </span>
          )}
        </div>
        <p className="text-xs text-[#475569] truncate">
          {tx.categoryName ?? (isTransfer ? "Transferência" : "—")}
          {" · "}
          <span style={{ color: tx.accountColor ?? "#94A3B8" }}>{tx.accountName}</span>
        </p>
      </div>

      {/* Amount */}
      <p
        className="text-sm font-semibold shrink-0"
        style={{
          color: isIncome ? "#34D399" : isTransfer ? "#94A3B8" : "#F1F5F9",
        }}
      >
        {isIncome ? "+" : isTransfer ? "" : "−"}{formatCurrency(tx.amount)}
      </p>
    </div>
  );
}
