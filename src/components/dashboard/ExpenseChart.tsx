"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils/currency";
import type { CategorySpending } from "@/types/app";

interface Props {
  categories: CategorySpending[];
  /**
   * Força layout em coluna (donut acima da lista) mesmo em telas largas.
   * Usado quando o card é renderizado dentro de um canvas de largura fixa
   * e estreita (o preview do PhoneMockup na landing) — `lg:` reage à
   * largura real do navegador, não à largura desse canvas, então sem essa
   * flag o card tentava usar o layout em linha num espaço que não cabe.
   */
  compact?: boolean;
  /** "en-US" is used only by the landing page's Dashboard Showcase — the
   * real logged-in app never passes this and keeps its pt-BR/BRL default. */
  locale?: "pt-BR" | "en-US";
}

export function ExpenseChart({ categories, compact = false, locale = "en-US" }: Props) {
  const total = categories.reduce((s, c) => s + c.amount, 0);
  const currency = locale === "en-US" ? "USD" : "BRL";
  const format = (value: number) => formatCurrency(value, currency, false, locale);
  const title = locale === "en-US" ? "Spending by category" : "Gastos por categoria";

  return (
    <div className="glass-card p-5">
      <p className="text-sm font-semibold text-[var(--numi-text)] mb-4">{title}</p>

      <div className={`flex flex-col ${compact ? "" : "lg:flex-row"} items-center gap-4`}>
        {/* Donut */}
        <div style={{ flexShrink: 0 }}>
          <PieChart width={180} height={180}>
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
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
            >
              {categories.map((cat) => (
                <Cell key={cat.categoryId} fill={cat.color} />
              ))}
            </Pie>
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
          </PieChart>
        </div>

        {/* Lista */}
        <ul className="flex-1 flex flex-col gap-2 w-full">
          {categories.map((cat) => (
            <li key={cat.categoryId} className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: cat.color }}
              />
              <span className="text-sm text-[var(--numi-text-2)] flex-1 min-w-0 truncate">{cat.categoryName}</span>
              <span className="text-sm text-[var(--numi-text)] font-medium shrink-0">
                {format(cat.amount)}
              </span>
              <span className="text-xs text-[var(--numi-text-3)] w-8 shrink-0 text-right">
                {cat.percentage.toFixed(0)}%
              </span>
            </li>
          ))}
          <li className="flex items-center gap-2.5 pt-2 mt-1 border-t border-[var(--numi-border)]">
            <span className="w-2 h-2 flex-shrink-0" />
            <span className="text-sm font-semibold text-[var(--numi-text-2)] flex-1">Total</span>
            <span className="text-sm font-bold text-[var(--numi-text)]">{format(total)}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
