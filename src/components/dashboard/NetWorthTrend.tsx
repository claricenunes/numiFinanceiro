"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils/currency";
import { Card } from "@/components/ui/Card";
import type { NetWorthPoint } from "@/lib/supabase/queries/dashboard";

export function NetWorthTrend({ history }: { history: NetWorthPoint[] }) {
  const format = (v: number) => formatCurrency(v, "USD", true, "en-US");

  return (
    <Card>
      <p className="text-sm font-semibold text-[var(--numi-text)]">Net worth trend</p>
      <p className="text-xs text-[var(--numi-text-3)] mb-4">Based on your monthly snapshots</p>

      {history.length < 2 ? (
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-sm text-[var(--numi-text-3)] text-center max-w-[220px]">
            Not enough history yet — check back after a full month to see your trend.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180} minWidth={0}>
          <AreaChart data={history} margin={{ left: -12, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="netWorthFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--numi-income)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--numi-income)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--numi-border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "var(--numi-text-3)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: "var(--numi-text-3)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => format(v)}
              width={56}
            />
            <Tooltip
              formatter={(value) => [format(Number(value ?? 0)), "Net worth"]}
              contentStyle={{
                background: "var(--numi-elevated)",
                border: "1px solid var(--numi-border)",
                borderRadius: "10px",
                fontSize: "12px",
                color: "var(--numi-text)",
              }}
            />
            <Area
              type="monotone"
              dataKey="netWorth"
              stroke="var(--numi-income)"
              strokeWidth={2}
              fill="url(#netWorthFill)"
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
