import type { Metadata } from "next";
import { FadeIn } from "@/components/common/FadeIn";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { QuickAccessGrid } from "@/components/dashboard/QuickAccessGrid";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { NetWorthTrend } from "@/components/dashboard/NetWorthTrend";
import { SpendingHeatmap } from "@/components/dashboard/SpendingHeatmap";
import { InsightsBanner } from "@/components/dashboard/InsightsBanner";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { FlowChart } from "@/components/dashboard/FlowChart";
import { StatsStrip } from "@/components/dashboard/StatsStrip";
import { GoalsPreview } from "@/components/dashboard/GoalsPreview";
import { UpcomingPayments } from "@/components/dashboard/UpcomingPayments";
import { InvestmentsPanel } from "@/components/dashboard/InvestmentsPanel";
import { FinancialHealthCard } from "@/components/dashboard/FinancialHealthCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { getOrbStatus } from "@/components/mascot/orbStatus";
import { getDashboardData } from "@/lib/supabase/queries/dashboard";
import { getBudgetItems }   from "@/lib/supabase/queries/budgets";
import { generateInsights } from "@/lib/supabase/queries/insights";
import { getInvestments } from "@/lib/supabase/queries/investments";
import { computeHealthScore } from "@/lib/utils/financialHealth";
import { parsePeriodFromParams } from "@/lib/utils/date";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; pt?: string }>;
}) {
  const { from, to, pt } = await searchParams;
  const period = parsePeriodFromParams(from, to, pt);

  const [dashData, budgetItems, investments] = await Promise.all([
    getDashboardData(period),
    getBudgetItems(period.startDate, period.endDate),
    getInvestments(),
  ]);

  const { summary, goals, transactions, firstName } = dashData;
  const insights = generateInsights(dashData, budgetItems);
  const healthScore = computeHealthScore(summary, goals, budgetItems);

  const orbStatus = getOrbStatus(summary.savingsRate);
  const statusMessage = {
    good:    "You're saving well this month.",
    warning: "Keep an eye on spending — your savings dipped a bit.",
    alert:   "Your savings are low this period.",
  }[orbStatus];

  return (
    <FadeIn className="px-4 py-5 lg:px-8 lg:py-6 max-w-7xl mx-auto">
      <PageHeader title="Dashboard" />
      <div className="flex flex-col gap-4">
        <DashboardGreeting
          firstName={firstName}
          orbStatus={orbStatus}
          statusMessage={statusMessage}
          highlight={insights[0]}
        />

        <QuickAccessGrid />

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--numi-landing-tagline)" }}>
            Overview
          </p>
          <div className="flex flex-col gap-4">
            <KpiGrid data={dashData} />
            <RecentTransactions transactions={transactions} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <NetWorthTrend history={dashData.netWorthHistory} />
          <SpendingHeatmap
            dailyExpenses={dashData.dailyExpenses}
            startDate={period.startDate}
            endDate={period.endDate}
          />
        </div>

        <InsightsBanner insights={insights} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ExpenseChart categories={dashData.categories} />
          <FlowChart data={dashData.weeklyFlow} />
        </div>

        <StatsStrip data={dashData} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GoalsPreview goals={goals} />
          <UpcomingPayments bills={dashData.upcomingBills} goals={goals} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InvestmentsPanel positions={investments.positions} summary={investments.summary} />
          <FinancialHealthCard score={healthScore} />
        </div>

        <QuickActions />
      </div>
    </FadeIn>
  );
}
