"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useToastStore } from "@/stores/useToastStore";
import { createClient } from "@/lib/supabase/client";

/* ── Types ───────────────────────────────────────────── */

interface ParsedRow {
  data:      string;
  descricao: string;
  tipo:      string;
  valor:     string;
  categoria: string;
  conta:     string;
}

interface Account {
  id:   string;
  name: string;
  type: string;
}

/* ── CSV parsing ─────────────────────────────────────── */

function normalizeKey(s: string): string {
  return s
    .trim().toLowerCase()
    .replace(/[áàãâ]/g, "a").replace(/[éêè]/g, "e")
    .replace(/[íîì]/g, "i").replace(/[óôõ]/g, "o")
    .replace(/[úû]/g, "u").replace(/ç/g, "c")
    .replace(/[^a-z]/g, "");
}

function parseCSV(text: string): ParsedRow[] {
  const sep   = text.includes(";") ? ";" : ",";
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  const header = lines[0].split(sep).map(normalizeKey);
  return lines.slice(1).map(line => {
    const vals = line.split(sep).map(v => v.trim().replace(/^"|"$/g, ""));
    const obj: Record<string, string> = {};
    header.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
    return {
      data:      obj["data"]      ?? obj["date"]        ?? "",
      descricao: obj["descricao"] ?? obj["historico"]   ?? obj["description"] ?? "",
      tipo:      obj["tipo"]      ?? obj["type"]        ?? "",
      valor:     obj["valor"]     ?? obj["amount"]      ?? obj["value"]       ?? "",
      categoria: obj["categoria"] ?? obj["category"]    ?? "",
      conta:     obj["conta"]     ?? obj["account"]     ?? "",
    };
  }).filter(r => r.valor || r.descricao);
}

/* ── Data helpers ────────────────────────────────────── */

function parseDate(raw: string): string | null {
  if (!raw) return null;
  // ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  // DD/MM/YYYY or DD-MM-YYYY
  const m = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    const year = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${year}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  return null;
}

function parseAmount(raw: string): number | null {
  if (!raw) return null;
  // Remove currency symbols and spaces
  const cleaned = raw.replace(/[R$\s]/g, "");
  // Handle Brazilian format: 1.234,56 → 1234.56
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned;
  const n = parseFloat(normalized);
  return isNaN(n) || n <= 0 ? null : Math.abs(n);
}

function parseType(raw: string): "income" | "expense" {
  const lower = raw.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (/receita|entrada|credito|credit|income|c$/.test(lower)) return "income";
  return "expense";
}

/* ── Component ───────────────────────────────────────── */

export function CSVImport({ onClose }: { onClose: () => void }) {
  const { show } = useToastStore();
  const router   = useRouter();

  const [rows,      setRows]      = useState<ParsedRow[]>([]);
  const [fileName,  setFileName]  = useState("");
  const [dragging,  setDragging]  = useState(false);
  const [accounts,  setAccounts]  = useState<Account[]>([]);
  const [accountId, setAccountId] = useState("");
  const [importing, setImporting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("accounts")
      .select("id,name,type")
      .neq("type", "credit_card")
      .is("deleted_at", null)
      .order("name")
      .then(({ data }) => {
        const accs = (data ?? []) as Account[];
        setAccounts(accs);
        if (accs.length > 0) setAccountId(accs[0].id);
      });
  }, []);

  function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      show("Please select a .csv file", "error");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      const text   = (e.target?.result as string) ?? "";
      const parsed = parseCSV(text);
      setRows(parsed);
      if (parsed.length === 0) {
        show("No transactions found. Check the file format.", "warning");
      }
    };
    reader.readAsText(file, "UTF-8");
  }

  async function handleImport() {
    if (!accountId) { show("Select a destination account", "error"); return; }

    setImporting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { show("Session expired", "error"); setImporting(false); return; }

    let success = 0;
    let errors  = 0;

    // Build batch — skip rows with invalid date or amount
    const batch: Record<string, unknown>[] = [];
    for (const row of rows) {
      const date   = parseDate(row.data);
      const amount = parseAmount(row.valor);
      if (!date || !amount) { errors++; continue; }

      batch.push({
        user_id:       user.id,
        account_id:    accountId,
        type:          parseType(row.tipo),
        amount,
        date,
        description:   row.descricao.trim() || null,
        currency_code: "BRL",
        status:        "confirmed",
      });
    }

    // Insert in chunks of 50
    for (let i = 0; i < batch.length; i += 50) {
      const chunk = batch.slice(i, i + 50);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("transactions") as any).insert(chunk);
      if (error) {
        errors += chunk.length;
        console.error("[CSV] Insert error:", error.message);
      } else {
        success += chunk.length;
      }
    }

    setImporting(false);

    if (success > 0) {
      show(`${success} transaction${success === 1 ? "" : "s"} imported${errors > 0 ? ` (${errors} skipped)` : ""}!`, "success");
      router.refresh();
      onClose();
    } else {
      show(`No transactions imported. ${errors} rows had an invalid format.`, "error");
    }
  }

  const preview = rows.slice(0, 8);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Import CSV"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: "#FFFDF9", border: "1px solid rgba(22, 50, 31, 0.08)", maxHeight: "90dvh", overflowY: "auto" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 sticky top-0"
          style={{ background: "#FFFDF9", borderBottom: "1px solid rgba(22, 50, 31, 0.08)" }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--numi-landing-heading)" }}>Import CSV</h2>
            <p className="text-xs text-[var(--numi-text-3)] mt-0.5">Format: Date · Description · Type · Amount · Category · Account</p>
          </div>
          <button onClick={onClose} aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--numi-text-3)] hover:text-[var(--numi-landing-heading)] hover:bg-[color-mix(in_srgb,var(--numi-landing-heading)_6%,transparent)] transition-colors text-lg leading-none">
            ×
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Drop zone */}
          <div
            className="rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center py-10 px-4 text-center"
            style={{ borderColor: dragging ? "var(--numi-landing-accent)" : "rgba(22, 50, 31, 0.15)", background: dragging ? "color-mix(in srgb, var(--numi-landing-accent) 6%, transparent)" : "#FFFFFF" }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => inputRef.current?.click()}
          >
            <span className="text-3xl mb-2">📂</span>
            {fileName ? (
              <>
                <p className="text-sm font-semibold" style={{ color: "var(--numi-landing-heading)" }}>{fileName}</p>
                <p className="text-xs mt-1" style={{ color: "var(--numi-income)" }}>
                  {rows.length} row{rows.length !== 1 ? "s" : ""} found
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-[var(--numi-text-2)]">Drag a CSV file here or click to select</p>
                <p className="text-xs text-[var(--numi-text-3)] mt-1">.csv only · max 5 MB</p>
              </>
            )}
          </div>

          <input ref={inputRef} type="file" accept=".csv" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

          {/* Account selector */}
          {accounts.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--numi-landing-heading)" }}>Destination account</label>
              <select value={accountId} onChange={e => setAccountId(e.target.value)}
                className="numi-landing-input">
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          )}

          {/* Preview table */}
          {rows.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--numi-landing-tagline)" }}>
                Preview{rows.length > 8 ? ` (8 of ${rows.length})` : ""}
              </p>
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(22, 50, 31, 0.08)" }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "#FFFFFF" }}>
                      <th className="px-3 py-2 text-left text-[var(--numi-text-3)] font-medium">Date</th>
                      <th className="px-3 py-2 text-left text-[var(--numi-text-3)] font-medium">Description</th>
                      <th className="px-3 py-2 text-left text-[var(--numi-text-3)] font-medium">Type</th>
                      <th className="px-3 py-2 text-right text-[var(--numi-text-3)] font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => {
                      const type = parseType(row.tipo);
                      return (
                        <tr key={i} style={{ borderTop: "1px solid rgba(22, 50, 31, 0.08)" }}>
                          <td className="px-3 py-2 text-[var(--numi-text-2)] whitespace-nowrap">{row.data}</td>
                          <td className="px-3 py-2 max-w-[120px] truncate" style={{ color: "var(--numi-landing-heading)" }}>{row.descricao}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs font-medium"
                            style={{ color: type === "income" ? "var(--numi-income)" : "var(--numi-expense)" }}>
                            {type === "income" ? "Income" : "Expense"}
                          </td>
                          <td className="px-3 py-2 text-right font-medium whitespace-nowrap" style={{ color: "var(--numi-landing-heading)" }}>
                            ${row.valor}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "rgba(22, 50, 31, 0.08)", color: "var(--numi-landing-heading)" }}>
              Cancel
            </button>
            <button onClick={handleImport} disabled={rows.length === 0 || importing}
              className="numi-pill-btn numi-pill-btn-accent flex-1 py-2.5 text-sm disabled:opacity-40 disabled:pointer-events-none">
              {importing ? "Importing..." : rows.length > 0 ? `Import (${rows.length})` : "Import"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
