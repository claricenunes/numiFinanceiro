"use client";

import type { LucideIcon } from "lucide-react";
import { CalendarDays, CalendarRange, Heart, ShoppingBag, Flame, PiggyBank, Flag } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { StaggerGroup, StaggerItem } from "@/components/common/motion/Stagger";
import type { DashboardData } from "@/lib/supabase/queries/dashboard";

function toISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

interface Chip {
  label: string;
  value: string;
  icon: LucideIcon;
}

export function StatsStrip({ data }: { data: DashboardData }) {
  const format = (v: number) => formatCurrency(v, "USD", true, "en-US");
  const todayISO = toISO(new Date());

  const spentToday = data.dailyExpenses.find((d) => d.date === todayISO)?.amount ?? 0;

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  const weekStartISO = toISO(weekStart);
  const spentThisWeek = data.dailyExpenses
    .filter((d) => d.date >= weekStartISO && d.date <= todayISO)
    .reduce((s, d) => s + d.amount, 0);

  const favoriteCategory = data.categories[0]?.categoryName ?? "—";

  const nextGoal = [...data.goals]
    .filter((g) => g.status === "active" && g.daysRemaining !== null)
    .sort((a, b) => (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0))[0];

  const chips: Chip[] = [
    { label: "Spent today", value: format(spentToday), icon: CalendarDays },
    { label: "Spent this week", value: format(spentThisWeek), icon: CalendarRange },
    { label: "Favorite category", value: favoriteCategory, icon: Heart },
    { label: "Biggest purchase", value: data.biggestExpense ? format(data.biggestExpense.amount) : "—", icon: ShoppingBag },
    { label: "Logging streak", value: `${data.loggingStreak} day${data.loggingStreak === 1 ? "" : "s"}`, icon: Flame },
    { label: "Saved this year", value: format(data.yearToDateSavings), icon: PiggyBank },
    { label: "Next goal", value: nextGoal ? nextGoal.name : "—", icon: Flag },
  ];

  return (
    <StaggerGroup className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
      {chips.map((chip) => {
        const Icon = chip.icon;
        return (
          <StaggerItem key={chip.label} className="glass-card p-4 flex flex-col gap-1.5">
            <span className="text-[var(--numi-text-3)]"><Icon size={14} /></span>
            <p className="text-[11px] text-[var(--numi-text-3)] truncate">{chip.label}</p>
            <p className="text-sm font-semibold text-[var(--numi-text)] truncate">{chip.value}</p>
          </StaggerItem>
        );
      })}
    </StaggerGroup>
  );
}
