"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils/currency";

interface WeekData {
  label: string;
  income: number;
  expense: number;
}

interface Props {
  data: WeekData[];
}

export function FlowChart({ data }: Props) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-[var(--numi-text)]">Fluxo do período</p>
        <div className="flex items-center gap-3 text-xs text-[var(--numi-text-2)]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-[var(--numi-income)]" /> Receita
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-[var(--numi-expense)]" /> Despesas
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180} minWidth={0}>
        <BarChart data={data} barCategoryGap="30%" barGap={4}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--numi-border)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--numi-text-3)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--numi-text-3)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v / 1000}k`}
            width={36}
          />
          <Tooltip
            formatter={(value, name) => [
              formatCurrency(Number(value ?? 0)),
              name === "income" ? "Receita" : "Despesas",
            ]}
            contentStyle={{
              background: "var(--numi-elevated)",
              border: "1px solid var(--numi-border)",
              borderRadius: "10px",
              fontSize: "12px",
              color: "var(--numi-text)",
            }}
            cursor={{ fill: "color-mix(in srgb, var(--numi-text) 4%, transparent)" }}
          />
          <Bar dataKey="income"  fill="var(--numi-income)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" fill="var(--numi-expense)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
