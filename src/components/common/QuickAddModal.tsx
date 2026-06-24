"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/useUIStore";
import { useToastStore } from "@/stores/useToastStore";
import { createClient } from "@/lib/supabase/client";

type TxType = "income" | "expense" | "transfer";

interface Category { id: string; name: string; icon: string | null }
interface Account  { id: string; name: string; type: string }

const TYPE_LABELS: Record<TxType, string> = {
  income:   "Receita",
  expense:  "Despesa",
  transfer: "Transferência",
};

export function QuickAddModal() {
  const { quickAddOpen, quickAddType, closeQuickAdd, openQuickAdd } = useUIStore();
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

  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const amountRef = useRef<HTMLInputElement>(null);
  const panelRef  = useRef<HTMLDivElement>(null);

  // Sync type when store changes (e.g. BottomNav opens as "expense")
  useEffect(() => {
    if (quickAddOpen) {
      setType(quickAddType);
      setTimeout(() => amountRef.current?.focus(), 80);
    }
  }, [quickAddOpen, quickAddType]);

  // Focus trap
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") { e.preventDefault(); handleClose(); return; }
    if (e.key !== "Tab" || !panelRef.current) return;
    const SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const els   = Array.from(panelRef.current.querySelectorAll<HTMLElement>(SELECTOR));
    const first = els[0];
    const last  = els[els.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first?.focus(); }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickAddOpen]);

  // Fetch categories + accounts once on open
  useEffect(() => {
    if (!quickAddOpen) return;
    const supabase = createClient();

    (async () => {
      const [userCatRes, sysCatRes, accRes] = await Promise.all([
        supabase.from("user_categories").select("id,name,icon").order("name"),
        supabase.from("system_categories").select("id,name,icon").order("sort_order"),
        supabase.from("accounts").select("id,name,type").is("deleted_at", null).order("name"),
      ]);
      const userCats = (userCatRes.data ?? []) as Category[];
      const sysCats  = (sysCatRes.data  ?? []) as Category[];
      // Usa categorias do usuário; se vazias, usa as do sistema como fallback
      setCategories(userCats.length > 0 ? userCats : sysCats);
      setAccounts((accRes.data ?? []) as Account[]);
    })();
  }, [quickAddOpen]);

  function reset() {
    setAmount("");
    setDescription("");
    setCategoryId("");
    setAccountId("");
    setToAccountId("");
    setDate(new Date().toISOString().slice(0, 10));
  }

  function handleClose() {
    reset();
    closeQuickAdd();
  }

  useEffect(() => {
    if (!quickAddOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [quickAddOpen, handleKeyDown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = parseFloat(amount.replace(",", "."));
    if (!parsed || parsed <= 0) {
      show("Informe um valor válido", "error");
      return;
    }
    if (!accountId) {
      show("Selecione uma conta", "error");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      show("Sessão expirada. Faça login novamente.", "error");
      setLoading(false);
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
    const { error } = await supabase.from("transactions").insert(row as any);
    setLoading(false);

    if (error) {
      show("Erro ao salvar transação: " + error.message, "error");
      return;
    }

    show("Transação adicionada!", "success");
    handleClose();
    router.refresh();
  }

  if (!quickAddOpen) return null;

  const types: TxType[] = ["expense", "income", "transfer"];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-add-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        ref={panelRef}
        className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4"
        style={{ background: "#0F1B2D", border: "1px solid #1E2D45", maxHeight: "92dvh", overflowY: "auto" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 id="quick-add-title" className="text-base font-semibold text-[#F1F5F9]">Nova transação</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1E2D45] transition-colors"
            aria-label="Fechar"
          >
            <XIcon />
          </button>
        </div>

        {/* Type toggle */}
        <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid #1E2D45" }}>
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
                  ? t === "income" ? "#34D399" : t === "expense" ? "#F87171" : "#38BDF8"
                  : "#64748B",
              }}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Amount */}
          <div>
            <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Valor (R$)</label>
            <input
              ref={amountRef}
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              required
              className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm bg-transparent outline-none"
              style={{ border: "1px solid #1E2D45", background: "#131929" }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Descrição</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Mercado, Salário..."
              className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
              style={{ border: "1px solid #1E2D45", background: "#131929" }}
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
              style={{ border: "1px solid #1E2D45", background: "#131929", colorScheme: "dark" }}
            />
          </div>

          {/* Account */}
          <div>
            <label className="text-xs font-medium text-[#64748B] mb-1.5 block">
              {type === "transfer" ? "Conta de origem" : "Conta"}
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
              style={{ border: "1px solid #1E2D45", background: "#131929" }}
            >
              <option value="">Selecionar conta</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Destination account (transfer only) */}
          {type === "transfer" && (
            <div>
              <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Conta de destino</label>
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
                style={{ border: "1px solid #1E2D45", background: "#131929" }}
              >
                <option value="">Selecionar conta</option>
                {accounts.filter((a) => a.id !== accountId).map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Category (not for transfers) */}
          {type !== "transfer" && (
            <div>
              <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Categoria</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-[#F1F5F9] text-sm outline-none"
                style={{ border: "1px solid #1E2D45", background: "#131929" }}
              >
                <option value="">Sem categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon ? c.icon + " " : ""}{c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity mt-1"
            style={{
              background: type === "income" ? "#34D399" : type === "expense" ? "#F87171" : "#38BDF8",
              color: "#0B1020",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Salvando..." : "Adicionar"}
          </button>
        </form>
      </div>
    </div>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
