"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun, Monitor, LogOut, Download, type LucideIcon } from "lucide-react";
import { useToastStore } from "@/stores/useToastStore";
import { useUserStore } from "@/stores/useUserStore";
import { createClient } from "@/lib/supabase/client";
import { FadeIn } from "@/components/common/FadeIn";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

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
    ["Date", "Description", "Type", "Amount", "Category", "Account", "Status"],
    ...(data as unknown as Row[]).map((t) => [
      t.date,
      `"${(t.description ?? "").replace(/"/g, '""')}"`,
      t.type === "income" ? "Income" : t.type === "expense" ? "Expense" : "Transfer",
      (+t.amount).toFixed(2),
      t.user_categories?.name ?? "",
      t.accounts?.name ?? "",
      t.status === "confirmed" ? "Confirmed" : "Pending",
    ]),
  ];

  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `numi-transactions-${new Date().toISOString().slice(0, 7)}.csv`;
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
  lines.push(`NUMI REPORT — ${startDate} to ${endDate}`);
  lines.push("");
  lines.push("=== ACCOUNTS ===");
  lines.push("Name,Type,Initial balance");
  for (const a of (accRes.data ?? []) as AccRow[]) {
    lines.push(`"${a.name}",${a.type},${a.initial_balance.toFixed(2)}`);
  }
  lines.push("");
  lines.push("=== GOALS ===");
  lines.push("Name,Target ($),Status,Deadline");
  for (const g of (goalsRes.data ?? []) as GoalRow[]) {
    lines.push(`"${g.name}",${g.target_amount.toFixed(2)},${g.status},${g.deadline ?? ""}`);
  }
  lines.push("");
  lines.push("=== TRANSACTIONS THIS MONTH ===");
  lines.push("Date,Description,Type,Amount,Category,Account,Status");
  for (const t of (txRes.data ?? []) as unknown as TxRow[]) {
    lines.push([
      t.date,
      `"${(t.description ?? "").replace(/"/g, '""')}"`,
      t.type === "income" ? "Income" : t.type === "expense" ? "Expense" : "Transfer",
      t.amount.toFixed(2),
      t.user_categories?.name ?? "",
      t.accounts?.name ?? "",
      t.status === "confirmed" ? "Confirmed" : "Pending",
    ].join(","));
  }

  const csv = lines.join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `numi-full-report-${now.toISOString().slice(0, 7)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  return (txRes.data?.length ?? 0) + (accRes.data?.length ?? 0) + (goalsRes.data?.length ?? 0);
}

/* ── Page ───────────────────────────────────────── */

export default function SettingsPage() {
  const { show } = useToastStore();
  const router = useRouter();
  const { profile, setProfile } = useUserStore();

  const displayName = profile?.full_name || "User";
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
    show("Exporting...", "info");
    const count = await exportTransactionsCSV();
    if (count === null) { show("Please log in to export.", "error"); return; }
    if (count === 0)    { show("No transactions to export.", "warning"); return; }
    show(`${count} transactions exported!`, "success");
  }

  async function handleFullReport() {
    show("Generating full report...", "info");
    const count = await exportFullReport();
    if (count === null) { show("Please log in to export.", "error"); return; }
    if (count === 0)    { show("No data found.", "warning"); return; }
    show("Full report exported!", "success");
  }

  /* ── Theme ──────────────────────────── */
  async function handleTheme(theme: "dark" | "light" | "system") {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !profile) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("user_profiles") as any).update({ theme }).eq("id", user.id);
    setProfile({ ...profile, theme });
    show(theme === "light" ? "Light mode enabled" : theme === "dark" ? "Dark mode enabled" : "Following system", "success");
  }

  const currentTheme = profile?.theme ?? "light";

  return (
    <FadeIn className="px-4 py-5 lg:px-8 lg:py-6 max-w-2xl mx-auto">
      <PageHeader title="Settings" />

      {/* ── Profile ─────────────────────────── */}
      <Section title="Profile">
        <div className="flex items-center gap-4 mb-5 pb-5 border-b" style={{ borderColor: "var(--numi-border)" }}>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
            style={{ background: "var(--numi-landing-nav-bg)" }}
          >
            {initial}
          </div>
          <div>
            <p className="text-base font-semibold" style={{ color: "var(--numi-landing-heading)" }}>{displayName}</p>
            <p className="text-sm text-[var(--numi-text-3)]">{profile ? "Active account" : "Loading…"}</p>
          </div>
        </div>

        <div className="space-y-4">
          <EditRow
            label="Name"
            currentValue={profile?.full_name ?? ""}
            placeholder="Your full name"
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
              show("Name updated!", "success");
            }}
          />
          <EditRow
            label="Email"
            currentValue={profile ? "••••@••••.com" : ""}
            placeholder="new@email.com"
            type="email"
            hint="A confirmation link will be sent to the new email"
            onSave={async (val) => {
              if (!val.trim()) return;
              const supabase = createClient();
              const { error } = await supabase.auth.updateUser({ email: val.trim() });
              if (error) throw error;
              show("Confirm the new email to complete the change", "info");
            }}
          />
          <EditRow
            label="Password"
            currentValue="••••••••"
            placeholder="New password (min. 8 characters)"
            type="password"
            hint="Minimum 8 characters"
            onSave={async (val) => {
              if (val.length < 8) throw new Error("Password must be at least 8 characters");
              const supabase = createClient();
              const { error } = await supabase.auth.updateUser({ password: val });
              if (error) throw error;
              show("Password changed successfully!", "success");
            }}
          />
        </div>
      </Section>

      {/* ── Appearance ──────────────────────── */}
      <Section title="Appearance">
        <p className="text-xs text-[var(--numi-text-4)] mb-3">Theme</p>
        <div className="grid grid-cols-3 gap-2">
          {(["dark", "light", "system"] as const).map((t) => {
            const meta: Record<string, { label: string; icon: LucideIcon }> = {
              dark:   { label: "Dark",   icon: Moon },
              light:  { label: "Light",  icon: Sun },
              system: { label: "System", icon: Monitor },
            };
            const { label, icon: Icon } = meta[t];
            const active = currentTheme === t;
            return (
              <button
                key={t}
                onClick={() => handleTheme(t)}
                className="py-3 px-2 rounded-xl text-sm font-medium flex flex-col items-center gap-2 transition-colors"
                style={{
                  background: active ? "color-mix(in srgb, var(--numi-landing-accent) 14%, transparent)" : "var(--numi-elevated)",
                  border: `1px solid ${active ? "var(--numi-landing-accent)" : "var(--numi-border)"}`,
                  color: active ? "var(--numi-landing-heading)" : "var(--numi-text-2)",
                }}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Preferences ───────────────────── */}
      <Section title="Preferences">
        <div className="space-y-4">
          <Row label="Currency">
            <span className="text-sm text-[var(--numi-text-2)]">{profile?.currency_code ?? "USD"}</span>
          </Row>
          <Row label="Language">
            <span className="text-sm text-[var(--numi-text-2)]">English (US)</span>
          </Row>
        </div>
      </Section>

      {/* ── Data ──────────────────────────── */}
      <Section title="Data">
        <div className="space-y-3">
          <ActionRow
            label="Export transactions"
            sub="CSV with all transactions"
            right="CSV"
            rightColor="var(--numi-income)"
            onClick={handleExport}
          />
          <ActionRow
            label="Full report"
            sub="Accounts + Goals + Transactions this month"
            right="CSV"
            rightColor="var(--numi-info)"
            onClick={handleFullReport}
          />
        </div>
      </Section>

      {/* ── About ──────────────────────────── */}
      <Section title="About">
        <div className="space-y-3">
          <Row label="Version">
            <span className="text-sm text-[var(--numi-text-2)]">1.0.0-beta</span>
          </Row>
          <Row label="Database">
            <Badge tone="income">Supabase connected</Badge>
          </Row>
        </div>
      </Section>

      {/* ── Account ──────────────────────────── */}
      <Section title="Account">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left hover:bg-[rgba(239,68,68,0.14)]"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "var(--numi-expense)",
          }}
        >
          <LogOut size={16} className="shrink-0" />
          <span className="text-sm font-semibold">Log out</span>
        </button>
      </Section>
    </FadeIn>
  );
}

/* ── Sub-components ────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold text-[var(--numi-text-3)] uppercase tracking-wider mb-3">{title}</p>
      <Card>{children}</Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-[var(--numi-text-2)]">{label}</p>
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
      show((e as Error).message || "Error saving", "error");
    } finally {
      setLoading(false);
      setEditing(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--numi-text-2)] shrink-0">{label}</p>
        {editing ? (
          <div className="flex items-center gap-2 flex-1 justify-end">
            <Input
              type={type}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
              placeholder={placeholder}
              autoFocus
              className="px-3 py-1.5 max-w-[180px]"
            />
            <Button variant="accent" size="sm" loading={loading} onClick={save}>Save</Button>
            <button
              onClick={() => setEditing(false)}
              className="text-xs text-[var(--numi-text-3)] hover:text-[var(--numi-text-2)] transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--numi-text-2)] truncate max-w-[160px]">{currentValue}</span>
            <button
              onClick={startEdit}
              className="text-xs font-medium hover:opacity-80 transition-colors shrink-0"
              style={{ color: "var(--numi-landing-heading)" }}
            >
              Edit
            </button>
          </div>
        )}
      </div>
      {editing && hint && (
        <p className="text-xs text-[var(--numi-text-3)] mt-1 text-right">{hint}</p>
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
      className="glass-card glass-card-interactive p-4 w-full flex items-center justify-between text-left disabled:opacity-40 disabled:pointer-events-none"
    >
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--numi-landing-heading)" }}>{label}</p>
        <p className="text-xs text-[var(--numi-text-3)] mt-0.5">{sub}</p>
      </div>
      <span className="text-sm font-medium shrink-0 ml-3 flex items-center gap-1.5" style={{ color: rightColor }}>
        <Download size={13} /> {right}
      </span>
    </button>
  );
}
