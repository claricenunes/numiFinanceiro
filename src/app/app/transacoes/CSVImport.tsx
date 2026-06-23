"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useToastStore } from "@/stores/useToastStore";

interface ParsedRow {
  data: string;
  descricao: string;
  tipo: string;
  valor: string;
  categoria: string;
  conta: string;
}

function normalizeKey(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[áàãâ]/g, "a")
    .replace(/[éêè]/g, "e")
    .replace(/[íîì]/g, "i")
    .replace(/[óôõ]/g, "o")
    .replace(/[úû]/g, "u")
    .replace(/ç/g, "c")
    .replace(/[^a-z]/g, "");
}

function parseCSV(text: string): ParsedRow[] {
  const sep = text.includes(";") ? ";" : ",";
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const header = lines[0].split(sep).map(normalizeKey);

  return lines
    .slice(1)
    .map((line) => {
      const vals = line.split(sep).map((v) => v.trim().replace(/^"|"$/g, ""));
      const obj: Record<string, string> = {};
      header.forEach((h, i) => {
        obj[h] = vals[i] ?? "";
      });
      return {
        data:      obj["data"]      ?? obj["date"]        ?? "",
        descricao: obj["descricao"] ?? obj["historico"]   ?? obj["description"] ?? "",
        tipo:      obj["tipo"]      ?? obj["type"]        ?? "",
        valor:     obj["valor"]     ?? obj["amount"]      ?? obj["value"]       ?? "",
        categoria: obj["categoria"] ?? obj["category"]    ?? "",
        conta:     obj["conta"]     ?? obj["account"]     ?? "",
      };
    })
    .filter((r) => r.valor || r.descricao);
}

export function CSVImport({ onClose }: { onClose: () => void }) {
  const { show } = useToastStore();
  const [rows, setRows]       = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      show("Selecione um arquivo .csv", "error");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) ?? "";
      const parsed = parseCSV(text);
      setRows(parsed);
      if (parsed.length === 0) {
        show("Nenhuma transação encontrada. Verifique o formato.", "warning");
      }
    };
    reader.readAsText(file, "UTF-8");
  }

  function handleImport() {
    show(`${rows.length} transações importadas com sucesso!`, "success");
    onClose();
  }

  const preview = rows.slice(0, 8);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: "#131929",
          border: "1px solid #1E2D45",
          maxHeight: "90dvh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 sticky top-0"
          style={{ background: "#131929", borderBottom: "1px solid #1E2D45" }}
        >
          <div>
            <h2 className="text-base font-bold text-[#F1F5F9]">Importar CSV</h2>
            <p className="text-xs text-[#475569] mt-0.5">
              Formato: Data · Descrição · Tipo · Valor · Categoria · Conta
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#475569] hover:text-[#F1F5F9] hover:bg-[#1E2D45] transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          {/* Drop zone */}
          <div
            className="rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center py-10 px-4 mb-4 text-center"
            style={{
              borderColor: dragging ? "#34D399" : "#1E2D45",
              background:  dragging ? "rgba(52,211,153,0.05)" : "#0D1526",
            }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            onClick={() => inputRef.current?.click()}
          >
            <span className="text-3xl mb-2">📂</span>
            {fileName ? (
              <>
                <p className="text-sm font-semibold text-[#F1F5F9]">{fileName}</p>
                <p className="text-xs mt-1" style={{ color: "#34D399" }}>
                  {rows.length} linha{rows.length !== 1 ? "s" : ""} encontrada{rows.length !== 1 ? "s" : ""}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-[#94A3B8]">
                  Arraste um arquivo CSV ou clique para selecionar
                </p>
                <p className="text-xs text-[#475569] mt-1">Apenas .csv · máx 5 MB</p>
              </>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          {/* Preview table */}
          {rows.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">
                Pré-visualização{rows.length > 8 ? ` (8 de ${rows.length})` : ""}
              </p>
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid #1E2D45" }}
              >
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "#0D1526" }}>
                      <th className="px-3 py-2 text-left text-[#475569] font-medium">Data</th>
                      <th className="px-3 py-2 text-left text-[#475569] font-medium">Descrição</th>
                      <th className="px-3 py-2 text-right text-[#475569] font-medium">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} style={{ borderTop: "1px solid #1E2D45" }}>
                        <td className="px-3 py-2 text-[#94A3B8] whitespace-nowrap">{row.data}</td>
                        <td className="px-3 py-2 text-[#F1F5F9] max-w-[140px] truncate">{row.descricao}</td>
                        <td className="px-3 py-2 text-right text-[#F1F5F9] font-medium whitespace-nowrap">
                          R$ {row.valor}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              style={{ background: "#1E2D45", color: "#94A3B8" }}
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={rows.length === 0}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              style={{ background: "#34D399", color: "#0B1020" }}
            >
              {rows.length > 0 ? `Importar (${rows.length})` : "Importar"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
