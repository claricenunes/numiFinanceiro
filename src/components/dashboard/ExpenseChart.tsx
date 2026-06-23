"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils/currency";
import type { CategorySpending } from "@/types/app";

interface Props {
  categories: CategorySpending[];
}

export function ExpenseChart({ categories }: Props) {
  const total = categories.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="glass-card p-5">
      <p className="text-sm font-semibold text-[#F1F5F9] mb-4">Gastos por categoria</p>

      <div className="flex flex-col lg:flex-row items-center gap-4">
        {/* Donut */}
        <div style={{ width: 180, height: 180, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                dataKey="amount"
                nameKey="categoryName"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={72}
                paddingAngle={2}
                strokeWidth={0}
              >
                {categories.map((cat) => (
                  <Cell key={cat.categoryId} fill={cat.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), ""]}
                contentStyle={{
                  background: "#131929",
                  border: "1px solid #1E2D45",
                  borderRadius: "10px",
                  fontSize: "12px",
                  color: "#F1F5F9",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Lista */}
        <ul className="flex-1 flex flex-col gap-2 w-full">
          {categories.map((cat) => (
            <li key={cat.categoryId} className="flex items-center gap-2.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: cat.color }}
              />
              <span className="text-sm text-[#94A3B8] flex-1 truncate">{cat.categoryName}</span>
              <span className="text-sm text-[#F1F5F9] font-medium">
                {formatCurrency(cat.amount)}
              </span>
              <span className="text-xs text-[#475569] w-10 text-right">
                {cat.percentage.toFixed(0)}%
              </span>
            </li>
          ))}
          <li className="flex items-center gap-2.5 pt-2 mt-1 border-t border-[#1E2D45]">
            <span className="w-2 h-2 flex-shrink-0" />
            <span className="text-sm font-semibold text-[#94A3B8] flex-1">Total</span>
            <span className="text-sm font-bold text-[#F1F5F9]">{formatCurrency(total)}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
