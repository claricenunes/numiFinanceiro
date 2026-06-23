"use client";

import { useState } from "react";
import { mockAllTransactions } from "@/lib/mock-data";
import { useToastStore } from "@/stores/useToastStore";
import { FadeIn } from "@/components/common/FadeIn";

function exportTransactionsCSV() {
  const rows = [
    ["Data", "Descrição", "Tipo", "Valor", "Categoria", "Conta", "Status"],
    ...mockAllTransactions.map((t) => [
      t.date,
      `"${t.description ?? ""}"`,
      t.type === "income"
        ? "Receita"
        : t.type === "expense"
        ? "Despesa"
        : "Transferência",
      t.amount.toFixed(2).replace(".", ","),
      t.categoryName ?? "",
      t.accountName,
      t.status === "confirmed" ? "Confirmado" : "Pendente",
    ]),
  ];
  const csv = rows.map((r) => r.join(";")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "numi-transacoes-2026-06.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function SettingsPage() {
  const { show } = useToastStore();
  const [currency, setCurrency] = useState("BRL");

  return (
    <FadeIn className="px-4 py-5 lg:px-8 lg:py-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-[#F1F5F9] mb-8">Configurações</h1>

      {/* Perfil */}
      <Section title="Perfil">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-[#0B1020] shrink-0"
            style={{ background: "#34D399" }}
          >
            D
          </div>
          <div>
            <p className="text-base font-semibold text-[#F1F5F9]">Dev Mode</p>
            <p className="text-sm text-[#475569]">
              Conecte o Supabase para ver seu perfil real
            </p>
          </div>
        </div>
      </Section>

      {/* Preferências */}
      <Section title="Preferências">
        <div className="space-y-4">
          <Row label="Moeda">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-[#1E2D45] text-[#F1F5F9] text-sm px-3 py-1.5 rounded-lg border border-[#2A3A52] outline-none cursor-pointer"
            >
              <option value="BRL">BRL — Real Brasileiro</option>
              <option value="USD">USD — Dólar Americano</option>
              <option value="EUR">EUR — Euro</option>
            </select>
          </Row>
          <Row label="Idioma">
            <span className="text-sm text-[#94A3B8]">Português (Brasil)</span>
          </Row>
          <Row label="Tema">
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: "rgba(52,211,153,0.15)", color: "#34D399" }}
            >
              Escuro
            </span>
          </Row>
        </div>
      </Section>

      {/* Dados */}
      <Section title="Dados">
        <div className="space-y-3">
          <ActionRow
            label="Exportar transações"
            sub="CSV com todas as transações de junho 2026"
            right="↓ CSV"
            rightColor="#34D399"
            onClick={() => {
              exportTransactionsCSV();
              show("Exportação concluída! Arquivo salvo.", "success");
            }}
          />
          <ActionRow
            label="Relatório completo"
            sub="Disponível ao conectar o Supabase"
            right="Em breve"
            rightColor="#475569"
            disabled
          />
        </div>
      </Section>

      {/* Sobre */}
      <Section title="Sobre">
        <div className="space-y-3">
          <Row label="Versão">
            <span className="text-sm text-[#94A3B8]">1.0.0-beta</span>
          </Row>
          <Row label="Fase atual">
            <span className="text-sm text-[#94A3B8]">Fase 8 — Polimento</span>
          </Row>
          <Row label="Banco de dados">
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: "rgba(251,191,36,0.15)", color: "#FBBF24" }}
            >
              Mock data
            </span>
          </Row>
        </div>
      </Section>

      {/* Conta */}
      <Section title="Conta">
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left"
          style={{
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.2)",
            color: "#F87171",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background =
              "rgba(248,113,113,0.14)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background =
              "rgba(248,113,113,0.08)")
          }
          onClick={() =>
            show(
              "Configure o Supabase para usar o logout em produção.",
              "warning",
            )
          }
        >
          <LogoutIcon />
          <span className="text-sm font-semibold">Sair da conta</span>
        </button>
      </Section>
    </FadeIn>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-3">
        {title}
      </p>
      <div
        className="rounded-2xl p-4"
        style={{ background: "#131929", border: "1px solid #1E2D45" }}
      >
        {children}
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-[#94A3B8]">{label}</p>
      {children}
    </div>
  );
}

function ActionRow({
  label, sub, right, rightColor, onClick, disabled,
}: {
  label: string;
  sub: string;
  right: string;
  rightColor: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ background: "#0D1526", border: "1px solid #1E2D45" }}
      onMouseEnter={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLElement).style.borderColor = "#34D39944";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "#1E2D45";
      }}
    >
      <div>
        <p className="text-sm font-semibold text-[#F1F5F9]">{label}</p>
        <p className="text-xs text-[#475569] mt-0.5">{sub}</p>
      </div>
      <span
        className="text-sm font-medium shrink-0 ml-3"
        style={{ color: rightColor }}
      >
        {right}
      </span>
    </button>
  );
}

function LogoutIcon() {
  return (
    <svg
      className="w-4 h-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
