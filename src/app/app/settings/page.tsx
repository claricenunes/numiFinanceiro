"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/stores/useToastStore";
import { useUserStore } from "@/stores/useUserStore";
import { createClient } from "@/lib/supabase/client";
import { FadeIn } from "@/components/common/FadeIn";
import type { UserProfile } from "@/types/database";

/* ── Export helpers ─────────────────────────────── */

async function exportTransactionsCSV(): Promise<number | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("transactions")
    .select("date,description,type,amount,status,currency_code,user_categories(name),accounts(name)")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("date", { ascending: false })
    .limit(2000);

  if (!data || data.length === 0) return 0;

  type Row = {
    date: string; description: string | null; type: string; amount: number;
    status: string; currency_code: string;
    user_categories: { name: string } | null;
    accounts: { name: string } | null;
  };

  const rows = [
    ["Data", "Descrição", "Tipo", "Valor", "Categoria", "Conta", "Status"],
    ...(data as unknown as Row[]).map((t) => [
      t.date,
      `"${(t.description ?? "").replace(/"/g, '""')}"`,
      t.type === "income" ? "Receita" : t.type === "expense" ? "Despesa" : "Transferência",
      (+t.amount).toFixed(2).replace(".", ","),
      t.user_categories?.name ?? "",
      t.accounts?.name ?? "",
      t.status === "confirmed" ? "Confirmado" : "Pendente",
    ]),
  ];

  const csv = rows.map((r) => r.join(";")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `numi-transacoes-${new Date().toISOString().slice(0, 7)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  return data.length;
}

async function exportFullReport(): Promise<number | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const endDate = now.toISOString().slice(0, 10);

  type TxRow = {
    date: string; description: string | null; type: string; amount: number; status: string;
    user_categories: { name: string } | null; accounts: { name: string } | null;
  };
  type AccRow = { name: string; type: string; initial_balance: number };
  type GoalRow = { name: string; target_amount: number; status: string; deadline: string | null };

  const [txRes, accRes, goalsRes] = await Promise.all([
    supabase
      .from("transactions")
      .select("date,description,type,amount,status,user_categories(name),accounts(name)")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false })
      .limit(2000),
    supabase
      .from("accounts")
      .select("name,type,initial_balance")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .eq("is_active", true),
    supabase
      .from("goals")
      .select("name,target_amount,status,deadline")
      .eq("user_id", user.id)
      .is("deleted_at", null),
  ]);

  const lines: string[] = [];
  lines.push(`RELATÓRIO NUMI — ${startDate} até ${endDate}`);
  lines.push("");
  lines.push("=== CONTAS ===");
  lines.push("Nome;Tipo;Saldo inicial");
  for (const a of (accRes.data ?? []) as AccRow[]) {
    lines.push(`"${a.name}";${a.type};${a.initial_balance.toFixed(2).replace(".", ",")}`);
  }
  lines.push("");
  lines.push("=== METAS ===");
  lines.push("Nome;Meta (R$);Status;Prazo");
  for (const g of (goalsRes.data ?? []) as GoalRow[]) {
    lines.push(`"${g.name}";${g.target_amount.toFixed(2).replace(".", ",")};${g.status};${g.deadline ?? ""}`);
  }
  lines.push("");
  lines.push("=== TRANSAÇÕES DO MÊS ===");
  lines.push("Data;Descrição;Tipo;Valor;Categoria;Conta;Status");
  for (const t of (txRes.data ?? []) as unknown as TxRow[]) {
    lines.push([
      t.date,
      `"${(t.description ?? "").replace(/"/g, '""')}"`,
      t.type === "income" ? "Receita" : t.type === "expense" ? "Despesa" : "Transferência",
      t.amount.toFixed(2).replace(".", ","),
      t.user_categories?.name ?? "",
      t.accounts?.name ?? "",
      t.status === "confirmed" ? "Confirmado" : "Pendente",
    ].join(";"));
  }

  const csv = lines.join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `numi-relatorio-completo-${now.toISOString().slice(0, 7)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  return (txRes.data?.length ?? 0) + (accRes.data?.length ?? 0) + (goalsRes.data?.length ?? 0);
}

/* ── Page ───────────────────────────────────────── */

export default function SettingsPage() {
  const { show } = useToastStore();
  const router = useRouter();
  const { profile, setProfile } = useUserStore();

  const displayName = profile?.full_name || "Usuário";
  const initial = displayName.charAt(0).toUpperCase();

  /* ── Logout ─────────────────────────── */
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  /* ── Export ─────────────────────────── */
  async function handleExport() {
    show("Exportando...", "info");
    const count = await exportTransactionsCSV();
    if (count === null) { show("Faça login para exportar.", "error"); return; }
    if (count === 0)    { show("Nenhuma transação para exportar.", "warning"); return; }
    show(`${count} transações exportadas!`, "success");
  }

  async function handleFullReport() {
    show("Gerando relatório completo...", "info");
    const count = await exportFullReport();
    if (count === null) { show("Faça login para exportar.", "error"); return; }
    if (count === 0)    { show("Nenhum dado encontrado.", "warning"); return; }
    show("Relatório completo exportado!", "success");
  }

  /* ── Theme ──────────────────────────── */
  async function handleTheme(theme: "dark" | "light" | "system") {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !profile) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("user_profiles") as any).update({ theme }).eq("id", user.id);
    setProfile({ ...profile, theme });
    show(theme === "light" ? "Modo claro ativado" : theme === "dark" ? "Modo escuro ativado" : "Seguindo sistema", "success");
  }

  const currentTheme = profile?.theme ?? "dark";

  return (
    <FadeIn className="px-4 py-5 lg:px-8 lg:py-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-[#F1F5F9] mb-8">Configurações</h1>

      {/* ── Perfil ─────────────────────────── */}
      <Section title="Perfil">
        <div className="flex items-center gap-4 mb-5 pb-5" style={{ borderBottom: "1px solid var(--numi-border)" }}>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-[#0B1020] shrink-0"
            style={{ background: "#34D399" }}
          >
            {initial}
          </div>
          <div>
            <p className="text-base font-semibold text-[#F1F5F9]">{displayName}</p>
            <p className="text-sm text-[#475569]">{profile ? "Conta ativa" : "Carregando…"}</p>
          </div>
        </div>

        <div className="space-y-4">
          <EditRow
            label="Nome"
            currentValue={profile?.full_name ?? ""}
            placeholder="Seu nome completo"
            onSave={async (val) => {
              if (!val.trim() || !profile) return;
              const supabase = createClient();
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const { error } = await (supabase.from("user_profiles") as any)
                .update({ full_name: val.trim() })
                .eq("id", user.id);
              if (error) throw error;
              setProfile({ ...profile, full_name: val.trim() });
              show("Nome atualizado!", "success");
            }}
          />
          <EditRow
            label="Email"
            currentValue={profile ? "••••@••••.com" : ""}
            placeholder="novo@email.com"
            type="email"
            hint="Um link de confirmação será enviado para o novo email"
            onSave={async (val) => {
              if (!val.trim()) return;
              const supabase = createClient();
              const { error } = await supabase.auth.updateUser({ email: val.trim() });
              if (error) throw error;
              show("Confirme o novo email para concluir a alteração", "info");
            }}
          />
          <EditRow
            label="Senha"
            currentValue="••••••••"
            placeholder="Nova senha (mín. 8 caracteres)"
            type="password"
            hint="Mínimo de 8 caracteres"
            onSave={async (val) => {
              if (val.length < 8) throw new Error("Senha precisa ter pelo menos 8 caracteres");
              const supabase = createClient();
              const { error } = await supabase.auth.updateUser({ password: val });
              if (error) throw error;
              show("Senha alterada com sucesso!", "success");
            }}
          />
        </div>
      </Section>

      {/* ── Aparência ──────────────────────── */}
      <Section title="Aparência">
        <p className="text-xs text-[#64748B] mb-3">Tema</p>
        <div className="grid grid-cols-3 gap-2">
          {(["dark", "light", "system"] as const).map((t) => {
            const meta = {
              dark:   { label: "Escuro", icon: "🌙" },
              light:  { label: "Claro",  icon: "☀️" },
              system: { label: "Sistema", icon: "💻" },
            }[t];
            const active = currentTheme === t;
            return (
              <button
                key={t}
                onClick={() => handleTheme(t)}
                className="py-3 px-2 rounded-xl text-sm font-medium flex flex-col items-center gap-2 transition-colors"
                style={{
                  background: active ? "rgba(52,211,153,0.1)" : "var(--numi-elevated)",
                  border: `1px solid ${active ? "#34D39966" : "var(--numi-border)"}`,
                  color: active ? "#34D399" : "var(--numi-text-2)",
                }}
              >
                <span className="text-xl">{meta.icon}</span>
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Preferências ───────────────────── */}
      <Section title="Preferências">
        <div className="space-y-4">
          <Row label="Moeda">
            <span className="text-sm text-[#94A3B8]">{profile?.currency_code ?? "BRL"}</span>
          </Row>
          <Row label="Idioma">
            <span className="text-sm text-[#94A3B8]">Português (Brasil)</span>
          </Row>
        </div>
      </Section>

      {/* ── Dados ──────────────────────────── */}
      <Section title="Dados">
        <div className="space-y-3">
          <ActionRow
            label="Exportar transações"
            sub="CSV com todas as transações"
            right="↓ CSV"
            rightColor="#34D399"
            onClick={handleExport}
          />
          <ActionRow
            label="Relatório completo"
            sub="Contas + Metas + Transações do mês"
            right="↓ CSV"
            rightColor="#38BDF8"
            onClick={handleFullReport}
          />
        </div>
      </Section>

      {/* ── Sobre ──────────────────────────── */}
      <Section title="Sobre">
        <div className="space-y-3">
          <Row label="Versão">
            <span className="text-sm text-[#94A3B8]">1.0.0-beta</span>
          </Row>
          <Row label="Banco de dados">
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: "rgba(52,211,153,0.15)", color: "#34D399" }}
            >
              Supabase conectado
            </span>
          </Row>
        </div>
      </Section>

      {/* ── Conta ──────────────────────────── */}
      <Section title="Conta">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left"
          style={{
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.2)",
            color: "#F87171",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.14)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.08)")
          }
        >
          <LogoutIcon />
          <span className="text-sm font-semibold">Sair da conta</span>
        </button>
      </Section>
    </FadeIn>
  );
}

/* ── Sub-componentes ────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-3">{title}</p>
      <div className="rounded-2xl p-4" style={{ background: "var(--numi-surface)", border: "1px solid var(--numi-border)" }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-[#94A3B8]">{label}</p>
      {children}
    </div>
  );
}

function EditRow({
  label, currentValue, placeholder, type = "text", hint, onSave,
}: {
  label: string;
  currentValue: string;
  placeholder: string;
  type?: string;
  hint?: string;
  onSave: (val: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const { show } = useToastStore();

  function startEdit() {
    setDraft(type === "password" ? "" : currentValue);
    setEditing(true);
  }

  async function save() {
    if (!draft.trim()) { setEditing(false); return; }
    setLoading(true);
    try {
      await onSave(draft);
    } catch (e) {
      show((e as Error).message || "Erro ao salvar", "error");
    } finally {
      setLoading(false);
      setEditing(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-[#94A3B8] shrink-0">{label}</p>
        {editing ? (
          <div className="flex items-center gap-2 flex-1 justify-end">
            <input
              type={type}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
              placeholder={placeholder}
              autoFocus
              className="px-3 py-1.5 rounded-lg text-sm outline-none max-w-[180px]"
              style={{
                background: "var(--numi-input-bg)",
                border: "1px solid var(--numi-border)",
                color: "var(--numi-text)",
              }}
            />
            <button
              onClick={save}
              disabled={loading}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity"
              style={{ background: "#34D399", color: "#0B1020", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "…" : "Salvar"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-xs text-[#475569] hover:text-[#94A3B8] transition-colors"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#94A3B8] truncate max-w-[160px]">{currentValue}</span>
            <button
              onClick={startEdit}
              className="text-xs font-medium text-[#34D399] hover:text-[#6EE7B7] transition-colors shrink-0"
            >
              Editar
            </button>
          </div>
        )}
      </div>
      {editing && hint && (
        <p className="text-xs text-[#475569] mt-1 text-right">{hint}</p>
      )}
    </div>
  );
}

function ActionRow({
  label, sub, right, rightColor, onClick, disabled,
}: {
  label: string; sub: string; right: string; rightColor: string;
  onClick?: () => void; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ background: "var(--numi-elevated)", border: "1px solid var(--numi-border)" }}
      onMouseEnter={(e) => { if (!disabled) (e.currentTarget as HTMLElement).style.borderColor = "#34D39944"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--numi-border)"; }}
    >
      <div>
        <p className="text-sm font-semibold text-[#F1F5F9]">{label}</p>
        <p className="text-xs text-[#475569] mt-0.5">{sub}</p>
      </div>
      <span className="text-sm font-medium shrink-0 ml-3" style={{ color: rightColor }}>{right}</span>
    </button>
  );
}

function LogoutIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
