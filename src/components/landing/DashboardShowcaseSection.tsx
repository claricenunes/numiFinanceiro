"use client";

import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { FlowChart } from "@/components/dashboard/FlowChart";
import { GoalsPreview } from "@/components/dashboard/GoalsPreview";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { Reveal } from "@/components/common/motion/Reveal";
import { MOCK_SUMMARY, MOCK_CATEGORIES, MOCK_FLOW, MOCK_GOALS, MOCK_TRANSACTIONS } from "./mockData";

/**
 * Reuses the REAL dashboard components (same ones logged-in users see),
 * fed with mock data — inside a plain "app window" frame instead of the
 * iPhone mockup used earlier in the landing's history.
 */
export function DashboardShowcaseSection() {
  return (
    <section className="px-4 py-24 lg:py-32 max-w-6xl mx-auto">
      <Reveal className="text-center mb-12">
        <p className="text-sm font-semibold mb-3" style={{ color: "#98BB8A" }}>Dashboard</p>
        <h2 className="text-3xl lg:text-4xl font-bold text-[var(--numi-text)] max-w-2xl mx-auto leading-tight">
          Your whole financial picture, in one screen
        </h2>
        <p className="text-lg text-[var(--numi-text-2)] max-w-md mx-auto mt-3">
          The exact same dashboard you get after signing up — no surprises.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="rounded-3xl border border-[var(--numi-border)] bg-[var(--numi-elevated)] shadow-[0_20px_60px_-20px_rgba(15,23,42,0.15)] overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[var(--numi-border)]">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--numi-expense)", opacity: 0.6 }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--numi-warning)", opacity: 0.6 }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--numi-income)", opacity: 0.6 }} />
          </div>

          <div className="p-4 lg:p-8 flex flex-col gap-4">
            <SummaryCards summary={MOCK_SUMMARY} locale="en-US" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ExpenseChart categories={MOCK_CATEGORIES} locale="en-US" />
              <FlowChart data={MOCK_FLOW} locale="en-US" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <GoalsPreview goals={MOCK_GOALS} locale="en-US" />
              <RecentTransactions transactions={MOCK_TRANSACTIONS} locale="en-US" />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
