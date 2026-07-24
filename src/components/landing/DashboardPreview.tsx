"use client";

import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { FlowChart } from "@/components/dashboard/FlowChart";
import { GoalsPreview } from "@/components/dashboard/GoalsPreview";
import { MOCK_SUMMARY, MOCK_CATEGORIES, MOCK_FLOW, MOCK_GOALS } from "./mockData";

/** Recriação do dashboard real (mesmos componentes, dado fictício) em largura mobile fixa — usada dentro do PhoneMockup. */
export function DashboardPreview() {
  return (
    <div className="numi-ambient-bg px-4 py-5 flex flex-col gap-4" style={{ width: 375 }}>
      <div>
        <p className="text-xs text-[var(--numi-text-3)]">Olá, Clarice 👋</p>
        <p className="text-sm font-bold text-[var(--numi-text)]">Resumo do período</p>
      </div>
      <SummaryCards summary={MOCK_SUMMARY} />
      <ExpenseChart categories={MOCK_CATEGORIES} compact />
      <FlowChart data={MOCK_FLOW} />
      <GoalsPreview goals={MOCK_GOALS} />
    </div>
  );
}
