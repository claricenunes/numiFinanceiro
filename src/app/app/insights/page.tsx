import type { Metadata } from "next";
import { FadeIn } from "@/components/common/FadeIn";
import { getDashboardData } from "@/lib/supabase/queries/dashboard";
import { getBudgetItems } from "@/lib/supabase/queries/budgets";
import { generateInsights } from "@/lib/supabase/queries/insights";
import { InsightsView } from "./InsightsView";

export const metadata: Metadata = { title: "Insights" };

export default async function InsightsPage() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const endDate   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  const label     = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(now);

  const period = { type: "current_month" as const, startDate, endDate, label };

  const [dashData, budgets] = await Promise.all([
    getDashboardData(period),
    getBudgetItems(startDate, endDate),
  ]);

  const insights = generateInsights(dashData, budgets);

  const periodLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long", year: "numeric",
  }).format(now);

  return (
    <FadeIn className="px-4 py-5 lg:px-8 lg:py-6 max-w-5xl mx-auto">
      <InsightsView insights={insights} periodLabel={periodLabel} />
    </FadeIn>
  );
}
