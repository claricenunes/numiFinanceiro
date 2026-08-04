"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/useUIStore";
import { useToastStore } from "@/stores/useToastStore";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils/currency";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

type TxType = "income" | "expense" | "transfer";

interface Category { id: string; name: string; icon: string | null }
interface Account  { id: string; name: string; type: string }
interface SysCategory {
  id: string; name: string; icon: string | null; color: string | null; type: string; sort_order: number;
}

const TYPE_LABELS: Record<TxType, string> = {
  income:   "Income",
  expense:  "Expense",
  transfer: "Transfer",
};

export function QuickAddModal() {
  const { quickAddOpen, quickAddType, closeQuickAdd } = useUIStore();
  const { show } = useToastStore();
  const router = useRouter();

  const [type, setType] = useState<TxType>(quickAddType);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [installment, setInstallment] = useState(false);
  const [numParcelas, setNumParcelas] = useState("2");

  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const amountRef = useRef<HTMLInputElement>(null);

  // Sync type when store changes (e.g. BottomNav opens as "expense")
  useEffect(() => {
    if (quickAddOpen) {
      setType(quickAddType);
      setTimeout(() => amountRef.current?.focus(), 80);
    }
  }, [quickAddOpen, quickAddType]);

  // Fetch categories + accounts once on open
  useEffect(() => {
    if (!quickAddOpen) return;
    const supabase = createClient();

    (async () => {
      const [userCatRes, accRes] = await Promise.all([
        supabase.from("user_categories").select("id,name,icon").order("name"),
        supabase.from("accounts").select("id,name,type").is("deleted_at", null).order("name"),
      ]);
      let userCats = (userCatRes.data ?? []) as Category[];

      // No categories of their own yet — copy the system ones over for the
      // user, since transactions.category_id only accepts user_categories ids.
      if (userCats.length === 0) {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: sysCatsRaw } = await supabase
          .from("system_categories")
          .select("id,name,icon,color,type,sort_order")
          .eq("is_active", true);
        const sysCats = sysCatsRaw as SysCategory[] | null;

        if (user && sysCats && sysCats.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from("user_categories") as any).upsert(
            sysCats.map((c) => ({
              user_id: user.id,
              name: c.name,
              icon: c.icon,
              color: c.color,
              type: c.type,
              system_category_id: c.id,
              sort_order: c.sort_order,
            })),
            { onConflict: "user_id,system_category_id", ignoreDuplicates: true }
          );
          const refetched = await supabase.from("user_categories").select("id,name,icon").order("name");
          userCats = (refetched.data ?? []) as Category[];
        }
      }

      setCategories(userCats);
      setAccounts((accRes.data ?? []) as Account[]);
    })();
  }, [quickAddOpen]);

  function addMonths(isoDate: string, n: number): string {
    const [y, m, d] = isoDate.split("-").map(Number);
    const dt = new Date(y, m - 1 + n, d);
    return dt.toISOString().slice(0, 10);
  }

  function reset() {
    setAmount("");
    setDescription("");
    setCategoryId("");
    setAccountId("");
    setToAccountId("");
    setDate(new Date().toISOString().slice(0, 10));
    setInstallment(false);
    setNumParcelas("2");
  }

  function handleClose() {
    reset();
    closeQuickAdd();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = parseFloat(amount.replace(",", "."));
    if (!parsed || parsed <= 0) {
      show("Enter a valid amount", "error");
      return;
    }
    if (!accountId) {
      show("Select an account", "error");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      show("Session expired. Please log in again.", "error");
      setLoading(false);
      return;
    }

    // Installments: creates N transactions sharing the same installment_group_id
    if (installment && type === "expense") {
      const n = Math.max(2, Math.min(48, parseInt(numParcelas, 10) || 2));
      const groupId = crypto.randomUUID();
      const baseDesc = description.trim() || "Installment purchase";
      const parcel = Math.floor((parsed / n) * 100) / 100;
      const lastParcel = Math.round((parsed - parcel * (n - 1)) * 100) / 100;

      const rows = Array.from({ length: n }, (_, i) => ({
        user_id: user.id,
        type: "expense",
        amount: i === n - 1 ? lastParcel : parcel,
        description: `${baseDesc} (${i + 1}/${n})`,
        date: addMonths(date, i),
        account_id: accountId,
        category_id: categoryId || null,
        status: "confirmed",
        currency_code: "BRL",
        installment_group_id: groupId,
        installment_number: i + 1,
        installment_total: n,
        idempotency_key: `${groupId}-${i + 1}`,
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("transactions") as any).insert(rows);
      setLoading(false);
      if (error) { show("Error saving installments: " + error.message, "error"); return; }
      show(`${n} installments of ${formatCurrency(parcel)} added!`, "success");
      handleClose();
      router.refresh();
      return;
    }

    const row: Record<string, unknown> = {
      user_id: user.id,
      type,
      amount: parsed,
      description: description.trim() || null,
      date,
      account_id: accountId,
      category_id: categoryId || null,
      status: "confirmed",
      currency_code: "BRL",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("transactions") as any).insert(row);
    setLoading(false);

    if (error) {
      show("Error saving transaction: " + error.message, "error");
      return;
    }

    show("Transaction added!", "success");
    handleClose();
    router.refresh();
  }

  const types: TxType[] = ["expense", "income", "transfer"];
  const submitColor = installment
    ? "#6366F1"
    : type === "income" ? "var(--numi-income)" : type === "expense" ? "var(--numi-expense)" : "var(--numi-info)";

  return (
    <Modal open={quickAddOpen} onClose={handleClose} title="New transaction" titleId="quick-add-title">
      {/* Type toggle */}
      <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--numi-border)" }}>
        {types.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className="flex-1 py-2 text-xs font-medium transition-colors"
            style={{
              background: type === t
                ? t === "income" ? "rgba(52,211,153,0.18)" : t === "expense" ? "rgba(248,113,113,0.18)" : "rgba(56,189,248,0.18)"
                : "transparent",
              color: type === t
                ? t === "income" ? "var(--numi-income)" : t === "expense" ? "var(--numi-expense)" : "var(--numi-info)"
                : "var(--numi-text-4)",
            }}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          ref={amountRef}
          label="Amount ($)"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />

        <Input
          label="Description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Groceries, Paycheck..."
        />

        <Input
          label={installment ? "Date of 1st installment" : "Date"}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={{ colorScheme: "light" }}
        />

        {/* Installment toggle (expenses only) */}
        {type === "expense" && (
          <div
            className="rounded-xl p-3 flex flex-col gap-3 transition-colors"
            style={{
              background: installment ? "rgba(99,102,241,0.08)" : "var(--numi-elevated)",
              border: `1px solid ${installment ? "#6366F144" : "var(--numi-border)"}`,
            }}
          >
            <button type="button" onClick={() => setInstallment((v) => !v)} className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-base">💳</span>
                <span className="text-sm font-medium" style={{ color: "var(--numi-landing-heading)" }}>Installments</span>
              </div>
              <span
                className="relative inline-flex items-center w-9 h-5 rounded-full transition-colors shrink-0"
                style={{ background: installment ? "#6366F1" : "color-mix(in srgb, var(--numi-landing-heading) 15%, transparent)" }}
              >
                <span
                  className="absolute w-3.5 h-3.5 rounded-full bg-white transition-transform"
                  style={{ transform: installment ? "translateX(18px)" : "translateX(3px)" }}
                />
              </span>
            </button>

            {installment && (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs font-medium text-[var(--numi-text-3)] mb-1.5 block">Number of installments</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNumParcelas((v) => String(Math.max(2, parseInt(v, 10) - 1)))}
                      className="w-8 h-8 rounded-lg font-bold flex items-center justify-center shrink-0"
                      style={{ background: "color-mix(in srgb, var(--numi-landing-heading) 8%, transparent)", color: "var(--numi-landing-heading)" }}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={2}
                      max={48}
                      value={numParcelas}
                      onChange={(e) => setNumParcelas(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg text-sm text-center outline-none"
                      style={{ border: "1px solid #6366F144", background: "var(--numi-elevated)", color: "var(--numi-landing-heading)" }}
                    />
                    <button
                      type="button"
                      onClick={() => setNumParcelas((v) => String(Math.min(48, parseInt(v, 10) + 1)))}
                      className="w-8 h-8 rounded-lg font-bold flex items-center justify-center shrink-0"
                      style={{ background: "color-mix(in srgb, var(--numi-landing-heading) 8%, transparent)", color: "var(--numi-landing-heading)" }}
                    >
                      +
                    </button>
                  </div>
                </div>
                {amount && parseFloat(amount.replace(",", ".")) > 0 && (
                  <div className="text-right shrink-0">
                    <p className="text-xs text-[var(--numi-text-3)]">per installment</p>
                    <p className="text-sm font-bold" style={{ color: "#818CF8" }}>
                      {formatCurrency(parseFloat(amount.replace(",", ".")) / (parseInt(numParcelas, 10) || 2))}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <Select label={type === "transfer" ? "From account" : "Account"} value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
          <option value="">Select account</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </Select>

        {type === "transfer" && (
          <Select label="To account" value={toAccountId} onChange={(e) => setToAccountId(e.target.value)}>
            <option value="">Select account</option>
            {accounts.filter((a) => a.id !== accountId).map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </Select>
        )}

        {type !== "transfer" && (
          <Select label="Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon ? c.icon + " " : ""}{c.name}
              </option>
            ))}
          </Select>
        )}

        <Button type="submit" loading={loading} className="w-full mt-1" style={{ background: submitColor, color: "#fff" }}>
          {installment ? `Split into ${numParcelas}x` : "Add"}
        </Button>
      </form>
    </Modal>
  );
}
