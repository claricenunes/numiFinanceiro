"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useId } from "react";

interface TrendPoint {
  label: string;
  value: number;
}

interface TrendAreaChartProps {
  data: TrendPoint[];
  color?: string;
  formatValue?: (v: number) => string;
  height?: number;
}

/**
 * One reusable smooth area/line chart, fed different data/colors for
 * spending trend, savings growth, and weekly productivity — rather than
 * three near-identical chart components. Follows the same tooltip/grid/
 * axis styling already established in FlowChart/ExpenseChart.
 */
export function TrendAreaChart({ data, color = "#8FAE7C", formatValue, height = 220 }: TrendAreaChartProps) {
  const gradientId = `trend-gradient-${useId()}`;
  const format = formatValue ?? ((v: number) => `${v}`);

  return (
    <ResponsiveContainer width="100%" height={height} minWidth={0}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--numi-border)" vertical={false} />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--numi-text-3)", fontSize: 11 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          width={40}
          tick={{ fill: "var(--numi-text-3)", fontSize: 11 }}
          tickFormatter={format}
        />
        <Tooltip
          formatter={(value) => [format(Number(value)), ""]}
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
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          animationDuration={900}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
