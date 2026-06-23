"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { AllocationEntry } from "@/types/app";

interface TooltipPayload {
  name: string;
  value: number;
  payload: AllocationEntry;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload;
  return (
    <div
      className="rounded-xl px-3 py-2 text-sm"
      style={{ background: "#1A2235", border: "1px solid #1E2D45" }}
    >
      <p className="font-semibold text-[#F1F5F9]">{entry.label}</p>
      <p style={{ color: entry.color }}>{entry.percent.toFixed(1)}%</p>
    </div>
  );
}

export function AllocationChart({ data }: { data: AllocationEntry[] }) {
  return (
    <ResponsiveContainer width="100%" height={200} minWidth={0}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={58}
          outerRadius={85}
          dataKey="percent"
          nameKey="label"
          paddingAngle={2}
          strokeWidth={0}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
