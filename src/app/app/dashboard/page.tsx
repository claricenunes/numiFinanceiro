import type { Metadata } from "next";
import { FadeIn } from "@/components/common/FadeIn";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { FlowChart } from "@/components/dashboard/FlowChart";
import { GoalsPreview } from "@/components/dashboard/GoalsPreview";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { InsightsBanner } from "@/components/dashboard/InsightsBanner";
import {
  mockSummary,
  mockCategories,
  mockWeeklyFlow,
  mockGoals,
  mockTransactions,
  mockInsights,
} from "@/lib/mock-data";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  // TODO (Fase 7): substituir mock data por queries reais ao Supabase
  const summary      = mockSummary;
  const categories   = mockCategories;
  const weeklyFlow   = mockWeeklyFlow;
  const goals        = mockGoals;
  const transactions = mockTransactions;
  const insights     = mockInsights;

  const firstName = "";

  return (
    <FadeIn className="px-4 py-5 lg:px-8 lg:py-6 max-w-6xl mx-auto">
      {/* Saudação */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#F1F5F9]">
          Olá{firstName ? `, ${firstName}` : ""} 👋
        </h1>
        <p className="text-sm text-[#475569] mt-0.5">
          Aqui está o resumo do seu período.
        </p>
      </div>

      {/* Grade do dashboard */}
      <div className="flex flex-col gap-4">
        {/* Linha 1 — Cards de resumo */}
        <SummaryCards summary={summary} />

        {/* Linha 2 — Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ExpenseChart categories={categories} />
          <FlowChart data={weeklyFlow} />
        </div>

        {/* Linha 3 — Metas + Transações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GoalsPreview goals={goals} />
          <RecentTransactions transactions={transactions} />
        </div>

        {/* Linha 4 — Insights */}
        <InsightsBanner insights={insights} />
      </div>
    </FadeIn>
  );
}
