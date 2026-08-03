"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils/currency";
import { createClient } from "@/lib/supabase/client";
import { useToastStore } from "@/stores/useToastStore";
import { CSVImport } from "./CSVImport";
import type { TransactionRow } from "@/types/app";

/* ── Helpers ─────────────────────────────────────────── */

function formatGroupHeader(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date  = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - date.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return new Intl.DateTimeFormat("en-US", {
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

type EditForm = {
  description: string;
  amount: string;
  date: string;
  type: "income" | "expense";
  categoryId: string;
};

type CategoryOpt = { id: string; name: string; icon: string | null; type: string };

/* ── Edit modal ──────────────────────────────────────── */

function EditTxModal({ tx, onClose }: { tx: TransactionRow; onClose: () => void }) {
  const [form,       setForm]       = useState<EditForm>({
    description: tx.description ?? "",
    amount:      tx.amount.toString(),
    date:        tx.date,
    type:        tx.type === "transfer" ? "expense" : tx.type as "income" | "expense",
    categoryId:  "",
  });
  const [categories, setCategories] = useState<CategoryOpt[]>([]);
  const [loading,    setLoading]    = useState(false);
  const router  = useRouter();
  const { show } = useToastStore();

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("transactions").select("category_id").eq("id", tx.id).single(),
      supabase.from("user_categories").select("id,name,icon,type").order("sort_order"),
      supabase.from("system_categories").select("id,name,icon,type").order("sort_order"),
    ]).then(([txRes, ucRes, scRes]) => {
      const catId = (txRes.data as { category_id: string | null } | null)?.category_id ?? "";
      const uc = (ucRes.data ?? []) as CategoryOpt[];
      const sc = (scRes.data ?? []) as CategoryOpt[];
      const cats = uc.length > 0 ? uc : sc;
      setCategories(cats);
      setForm(f => ({ ...f, categoryId: catId }));
    });
  }, [tx.id]);

  const filtered = useMemo(
    () => categories.filter(c => c.type === form.type),
    [categories, form.type],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(form.amount.replace(",", "."));
    if (!amount || amount <= 0) { show("Invalid amount", "error"); return; }

    setLoading(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("transactions") as any).update({
      description: form.description.trim() || null,
      amount,
      date:        form.date,
      type:        form.type,
      category_id: form.categoryId || null,
      updated_at:  new Date().toISOString(),
    }).eq("id", tx.id);

    setLoading(false);
    if (error) { show("Error: " + error.message, "error"); return; }
    show("Transaction updated!", "success");
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4"
        style={{ background: "#FFFDF9", border: "1px solid rgba(22, 50, 31, 0.08)", maxHeight: "92dvh", overflowY: "auto" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: "var(--numi-landing-heading)" }}>Edit transaction</h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--numi-text-4)] hover:text-[var(--numi-landing-heading)] hover:bg-[color-mix(in_srgb,var(--numi-landing-heading)_6%,transparent)]">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Type */}
          {tx.type !== "transfer" && (
            <div className="flex gap-2">
              {(["income", "expense"] as const).map(t => (
                <button key={t} type="button"
                  onClick={() => setForm(f => ({ ...f, type: t, categoryId: "" }))}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold"
                  style={{
                    background: form.type === t ? (t === "income" ? "rgba(16,185,129,0.14)" : "rgba(239,68,68,0.14)") : "#FFFFFF",
                    border: `1px solid ${form.type === t ? (t === "income" ? "var(--numi-income)" : "var(--numi-expense)") : "rgba(22, 50, 31, 0.12)"}`,
                    color: form.type === t ? (t === "income" ? "var(--numi-income)" : "var(--numi-expense)") : "var(--numi-text-3)",
                  }}>
                  {t === "income" ? "Income" : "Expense"}
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--numi-landing-heading)" }}>Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Groceries, Paycheck..."
              className="numi-landing-input" />
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--numi-landing-heading)" }}>Amount ($)</label>
            <input value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              type="text" inputMode="decimal" placeholder="0.00" required
              className="numi-landing-input" />
          </div>

          {/* Date */}
          <div>
            <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--numi-landing-heading)" }}>Date</label>
            <input value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              type="date" required
              className="numi-landing-input"
              style={{ colorScheme: "light" }} />
          </div>

          {/* Category */}
          {filtered.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--numi-landing-heading)" }}>Category</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="numi-landing-input">
                <option value="">— No category —</option>
                {filtered.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="numi-pill-btn numi-pill-btn-accent numi-cta-bounce w-full py-3 text-base mt-1 disabled:opacity-60 disabled:pointer-events-none">
            {loading ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Delete confirm modal ─────────────────────────────── */

function DeleteModal({ txId, description, onClose }: { txId: string; description: string | null; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const router  = useRouter();
  const { show } = useToastStore();

  async function handleDelete() {
    setLoading(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("transactions") as any)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", txId);
    setLoading(false);
    if (error) { show("Error: " + error.message, "error"); return; }
    show("Transaction deleted", "success");
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-sm mx-4 rounded-2xl p-5 flex flex-col gap-4"
        style={{ background: "#FFFDF9", border: "1px solid rgba(239,68,68,0.2)" }}
      >
        <p className="text-base font-semibold" style={{ color: "var(--numi-landing-heading)" }}>Delete transaction?</p>
        <p className="text-sm text-[var(--numi-text-3)]">
          {description ? `"${description}"` : "This transaction"} will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "rgba(22, 50, 31, 0.08)", color: "var(--numi-landing-heading)" }}>
            Cancel
          </button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--numi-expense)", color: "#fff", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────── */

export function TransactionView({ transactions }: { transactions: TransactionRow[] }) {
  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [category,   setCategory]   = useState("all");
  const [showImport, setShowImport] = useState(false);
  const [editTx,     setEditTx]     = useState<TransactionRow | null>(null);
  const [deleteTxId, setDeleteTxId] = useState<{ id: string; description: string | null } | null>(null);

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

  const handleEdit   = useCallback((tx: TransactionRow) => setEditTx(tx), []);
  const handleDelete = useCallback((id: string, desc: string | null) => setDeleteTxId({ id, description: desc }), []);

  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--numi-landing-heading)" }}>Transactions</h1>
        <button
          onClick={() => setShowImport(true)}
          className="numi-pill-btn numi-pill-btn-outline-dark text-sm px-3 py-1.5 gap-1.5"
        >
          <span>↑</span> Import CSV
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-2xl p-3 text-center" style={{ background: "#FFFFFF", border: "1px solid rgba(22, 50, 31, 0.08)", boxShadow: "0 8px 20px -12px rgba(22, 50, 31, 0.15)" }}>
          <p className="text-xs text-[var(--numi-text-2)] mb-0.5">Income</p>
          <p className="text-base font-bold" style={{ color: "var(--numi-income)" }}>{formatCurrency(totalIncome)}</p>
        </div>
        <div className="rounded-2xl p-3 text-center" style={{ background: "#FFFFFF", border: "1px solid rgba(22, 50, 31, 0.08)", boxShadow: "0 8px 20px -12px rgba(22, 50, 31, 0.15)" }}>
          <p className="text-xs text-[var(--numi-text-2)] mb-0.5">Expenses</p>
          <p className="text-base font-bold" style={{ color: "var(--numi-expense)" }}>{formatCurrency(totalExpense)}</p>
        </div>
        <div className="rounded-2xl p-3 text-center" style={{ background: "#FFFFFF", border: "1px solid rgba(22, 50, 31, 0.08)", boxShadow: "0 8px 20px -12px rgba(22, 50, 31, 0.15)" }}>
          <p className="text-xs text-[var(--numi-text-2)] mb-0.5">Balance</p>
          <p className="text-base font-bold" style={{ color: balance >= 0 ? "var(--numi-info)" : "var(--numi-expense)" }}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-5">
        <input
          type="search"
          placeholder="Search transactions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="numi-landing-input"
        />
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          {(["all", "income", "expense", "transfer"] as const).map(f => {
            const labels = { all: "All", income: "Income", expense: "Expenses", transfer: "Transfers" };
            const active = typeFilter === f;
            return (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className="text-xs font-medium px-3 py-1.5 rounded-full shrink-0 transition-colors"
                style={{
                  background: active ? "var(--numi-landing-accent)" : "#FFFFFF",
                  color:      active ? "var(--numi-landing-accent-text)" : "var(--numi-text-2)",
                  border:     active ? "none" : "1px solid rgba(22, 50, 31, 0.12)",
                }}
              >
                {labels[f]}
              </button>
            );
          })}
        </div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="numi-landing-input"
          style={{ appearance: "none" }}
        >
          <option value="all">All categories</option>
          {categories.slice(1).map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showImport && <CSVImport onClose={() => setShowImport(false)} />}
      </AnimatePresence>

      {editTx && (
        <EditTxModal tx={editTx} onClose={() => setEditTx(null)} />
      )}

      {deleteTxId && (
        <DeleteModal
          txId={deleteTxId.id}
          description={deleteTxId.description}
          onClose={() => setDeleteTxId(null)}
        />
      )}

      {/* Transaction groups */}
      {groups.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-[var(--numi-text-2)] font-medium">No transactions found</p>
          <p className="text-sm text-[var(--numi-text-3)] mt-1">Try adjusting the filters</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(([date, rows]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--numi-landing-tagline)" }}>
                  {formatGroupHeader(date)}
                </p>
                <div className="flex-1 h-px" style={{ background: "rgba(22, 50, 31, 0.08)" }} />
                <p className="text-xs text-[var(--numi-text-3)]">
                  {rows.length} {rows.length === 1 ? "item" : "items"}
                </p>
              </div>
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "#FFFFFF", border: "1px solid rgba(22, 50, 31, 0.08)", boxShadow: "0 8px 20px -12px rgba(22, 50, 31, 0.15)" }}
              >
                {rows.map((t, idx) => (
                  <TxRow
                    key={t.id}
                    tx={t}
                    last={idx === rows.length - 1}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Transaction row ─────────────────────────────────── */

function TxRow({
  tx, last, onEdit, onDelete,
}: {
  tx: TransactionRow;
  last: boolean;
  onEdit: (tx: TransactionRow) => void;
  onDelete: (id: string, desc: string | null) => void;
}) {
  const isIncome   = tx.type === "income";
  const isTransfer = tx.type === "transfer";
  const icon       = tx.categoryIcon  ?? (isIncome ? "💰" : isTransfer ? "↔️" : "💳");
  const iconColor  = tx.categoryColor ?? "#94A3B8";

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 hover:bg-[color-mix(in_srgb,var(--numi-landing-heading)_4%,transparent)] transition-colors group"
      style={{ borderBottom: last ? "none" : "1px solid rgba(22, 50, 31, 0.08)" }}
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
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: "var(--numi-landing-heading)" }}>
            {tx.description ?? "—"}
          </p>
          {tx.installmentNumber && tx.installmentTotal && (
            <span className="text-xs px-1.5 py-0.5 rounded-full shrink-0 font-semibold"
              style={{ background: "rgba(99,102,241,0.12)", color: "#6366F1", border: "1px solid rgba(99,102,241,0.3)" }}>
              {tx.installmentNumber}/{tx.installmentTotal}
            </span>
          )}
          {tx.status === "pending" && (
            <span className="text-xs px-1.5 py-0.5 rounded-full shrink-0"
              style={{ background: "rgba(245,158,11,0.14)", color: "var(--numi-warning)", border: "1px solid rgba(245,158,11,0.28)" }}>
              Pending
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--numi-text-3)] truncate">
          {tx.categoryName ?? (isTransfer ? "Transfer" : "—")}
          {" · "}
          <span style={{ color: tx.accountColor ?? "var(--numi-text-2)" }}>{tx.accountName}</span>
        </p>
      </div>

      {/* Amount */}
      <p
        className="text-sm font-semibold shrink-0"
        style={{
          color: isIncome ? "var(--numi-income)" : isTransfer ? "var(--numi-text-2)" : "var(--numi-landing-heading)",
        }}
      >
        {isIncome ? "+" : isTransfer ? "" : "−"}{formatCurrency(tx.amount)}
      </p>

      {/* Actions — visible on hover (desktop) and always visible (mobile) */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 opacity-100">
        <button
          onClick={() => onEdit(tx)}
          title="Edit"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-colors"
          style={{ color: "var(--numi-text-3)", background: "transparent" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "color-mix(in srgb, var(--numi-landing-heading) 8%, transparent)"; (e.currentTarget as HTMLElement).style.color = "var(--numi-landing-heading)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--numi-text-3)"; }}
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(tx.id, tx.description)}
          title="Delete"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-colors"
          style={{ color: "var(--numi-text-3)", background: "transparent" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.14)"; (e.currentTarget as HTMLElement).style.color = "var(--numi-expense)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--numi-text-3)"; }}
        >
          🗑
        </button>
      </div>
    </div>
  );
}
