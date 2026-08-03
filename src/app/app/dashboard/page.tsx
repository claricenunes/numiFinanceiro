import type { Metadata } from "next";
import { FadeIn } from "@/components/common/FadeIn";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { FlowChart } from "@/components/dashboard/FlowChart";
import { GoalsPreview } from "@/components/dashboard/GoalsPreview";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { InsightsBanner } from "@/components/dashboard/InsightsBanner";
import { AIOrb } from "@/components/mascot/AIOrb";
import { getOrbStatus } from "@/components/mascot/orbStatus";
import { getDashboardData } from "@/lib/supabase/queries/dashboard";
import { getBudgetItems }   from "@/lib/supabase/queries/budgets";
import { generateInsights } from "@/lib/supabase/queries/insights";
import { parsePeriodFromParams } from "@/lib/utils/date";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; pt?: string }>;
}) {
  const { from, to, pt } = await searchParams;
  const period = parsePeriodFromParams(from, to, pt);

  const [dashData, budgetItems] = await Promise.all([
    getDashboardData(period),
    getBudgetItems(period.startDate, period.endDate),
  ]);

  const { summary, categories, weeklyFlow, goals, transactions, firstName } = dashData;
  const insights = generateInsights(dashData, budgetItems);

  const orbStatus = getOrbStatus(summary.savingsRate);
  const statusMessage = {
    good:    "You're saving well this month.",
    warning: "Keep an eye on spending — your savings dipped a bit.",
    alert:   "Your savings are low this period.",
  }[orbStatus];

  return (
    <FadeIn className="px-4 py-5 lg:px-8 lg:py-6 max-w-6xl mx-auto">
      <div className="mb-5 flex items-center gap-4">
        <AIOrb status={orbStatus} />
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--numi-landing-heading)" }}>
            Hi{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-sm text-[var(--numi-text-3)] mt-0.5">
            {statusMessage}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <SummaryCards summary={summary} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ExpenseChart categories={categories} />
          <FlowChart data={weeklyFlow} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GoalsPreview goals={goals} />
          <RecentTransactions transactions={transactions} />
        </div>

        <InsightsBanner insights={insights} />
      </div>
    </FadeIn>
  );
}
