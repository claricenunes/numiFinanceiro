"use client";

import { CreditCard, Target, CalendarCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { UpcomingBill } from "@/lib/supabase/queries/dashboard";
import type { GoalWithProgress } from "@/types/app";

interface Props {
  bills: UpcomingBill[];
  goals: GoalWithProgress[];
}

type Priority = "high" | "medium" | "low";

const PRIORITY_COLOR: Record<Priority, string> = {
  high: "var(--numi-expense)",
  medium: "var(--numi-warning)",
  low: "var(--numi-text-3)",
};

function priorityFor(daysUntil: number): Priority {
  if (daysUntil <= 3) return "high";
  if (daysUntil <= 14) return "medium";
  return "low";
}

function daysUntil(iso: string): number {
  const target = new Date(iso + "T12:00:00");
  return Math.ceil((target.getTime() - Date.now()) / 86400000);
}

export function UpcomingPayments({ bills, goals }: Props) {
  const format = (v: number) => formatCurrency(v, "USD", false, "en-US");

  const goalDeadlines = goals
    .filter((g) => g.status === "active" && g.deadline && g.daysRemaining !== null)
    .sort((a, b) => (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0))
    .slice(0, 3);

  const items = [
    ...bills.map((b) => ({
      id: `bill-${b.id}`,
      title: `${b.accountName} bill`,
      amount: b.amount,
      date: b.dueDate,
      icon: CreditCard,
    })),
    ...goalDeadlines.map((g) => ({
      id: `goal-${g.id}`,
      title: g.name,
      amount: null,
      date: g.deadline as string,
      icon: Target,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Card>
      <p className="text-sm font-semibold text-[var(--numi-text)] mb-4">Upcoming payments</p>

      {items.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="Nothing due soon" description="Bills and goal deadlines will show up here." />
      ) : (
        <ul className="flex flex-col divide-y" style={{ borderColor: "var(--numi-border)" }}>
          {items.map((item) => {
            const remaining = daysUntil(item.date);
            const priority = priorityFor(remaining);
            const Icon = item.icon;
            return (
              <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `color-mix(in srgb, ${PRIORITY_COLOR[priority]} 12%, transparent)`, color: PRIORITY_COLOR[priority] }}
                >
                  <Icon size={15} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--numi-text)] truncate">{item.title}</p>
                  <p className="text-xs text-[var(--numi-text-3)]">
                    {remaining <= 0 ? "Due today" : `Due in ${remaining} day${remaining === 1 ? "" : "s"}`}
                  </p>
                </div>
                {item.amount !== null && (
                  <span className="text-sm font-semibold text-[var(--numi-text)] shrink-0">{format(item.amount)}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
