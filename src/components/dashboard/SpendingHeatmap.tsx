"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils/currency";
import { Card } from "@/components/ui/Card";
import type { DailyExpense } from "@/lib/supabase/queries/dashboard";

interface Props {
  dailyExpenses: DailyExpense[];
  startDate: string;
  endDate: string;
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function SpendingHeatmap({ dailyExpenses, startDate, endDate }: Props) {
  const format = (v: number) => formatCurrency(v, "USD", true, "en-US");

  const amountByDate = useMemo(() => new Map(dailyExpenses.map((d) => [d.date, d.amount])), [dailyExpenses]);
  const max = useMemo(() => Math.max(1, ...dailyExpenses.map((d) => d.amount)), [dailyExpenses]);

  const days = useMemo(() => {
    const start = new Date(startDate + "T12:00:00");
    const end = new Date(endDate + "T12:00:00");
    const list: { date: string; day: number }[] = [];
    for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      list.push({ date: d.toISOString().split("T")[0], day: d.getDate() });
    }
    return list;
  }, [startDate, endDate]);

  const leadingBlanks = new Date(startDate + "T12:00:00").getDay();

  return (
    <Card>
      <p className="text-sm font-semibold text-[var(--numi-text)] mb-4">Spending heatmap</p>

      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {WEEKDAY_LABELS.map((w, i) => (
          <span key={i} className="text-[10px] text-center text-[var(--numi-text-3)]">{w}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map(({ date, day }) => {
          const amount = amountByDate.get(date) ?? 0;
          const intensity = amount / max;
          return (
            <div
              key={date}
              title={amount > 0 ? `${date}: ${format(amount)}` : date}
              className="aspect-square rounded-md flex items-center justify-center text-[10px] transition-transform hover:scale-110 cursor-default"
              style={{
                background: amount > 0
                  ? `color-mix(in srgb, var(--numi-expense) ${Math.round(15 + intensity * 70)}%, transparent)`
                  : "color-mix(in srgb, var(--numi-text) 5%, transparent)",
                color: intensity > 0.5 ? "#fff" : "var(--numi-text-3)",
              }}
            >
              {day}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
