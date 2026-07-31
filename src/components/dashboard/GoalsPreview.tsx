"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/utils/currency";
import type { GoalWithProgress } from "@/types/app";

interface Props {
  goals: GoalWithProgress[];
  /** "en-US" is used only by the landing page's Dashboard Showcase — the
   * real logged-in app never passes this and keeps its pt-BR/BRL default. */
  locale?: "pt-BR" | "en-US";
}

export function GoalsPreview({ goals, locale = "pt-BR" }: Props) {
  const active = goals.filter((g) => g.status === "active").slice(0, 3);
  const currency = locale === "en-US" ? "USD" : "BRL";
  const format = (value: number) => formatCurrency(value, currency, false, locale);
  const t =
    locale === "en-US"
      ? {
          title: "Goals",
          viewAll: "View all",
          empty: "No active goals.",
          create: "+ Create first goal",
          onTrack: "✓ On track",
          needsPerMonth: (amount: string) => `⚠ Would need ${amount}/month`,
        }
      : {
          title: "Metas",
          viewAll: "Ver todas",
          empty: "Nenhuma meta ativa.",
          create: "+ Criar primeira meta",
          onTrack: "✓ No ritmo certo",
          needsPerMonth: (amount: string) => `⚠ Precisaria de ${amount}/mês`,
        };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-[var(--numi-text)]">{t.title}</p>
        <Link href="/app/goals" className="text-xs text-[var(--numi-income)] hover:underline">
          {t.viewAll}
        </Link>
      </div>

      {active.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-[var(--numi-text-3)]">{t.empty}</p>
          <Link href="/app/goals" className="text-xs text-[var(--numi-income)] hover:underline mt-1 inline-block">
            {t.create}
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {active.map((goal) => (
            <li key={goal.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-[var(--numi-text)]">
                  {goal.icon && <span>{goal.icon}</span>}
                  {goal.name}
                </span>
                <span className="text-xs text-[var(--numi-text-2)]">
                  {goal.progressPercent.toFixed(0)}%
                </span>
              </div>

              {/* Progress bar */}
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: "color-mix(in srgb, var(--numi-text) 10%, transparent)" }}
                role="progressbar"
                aria-valuenow={goal.progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(goal.progressPercent, 100)}%`,
                    background: goal.isOnTrack ? "var(--numi-income)" : "var(--numi-warning)",
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--numi-text-3)]">
                <span>{format(goal.currentAmount)}</span>
                <span>{format(goal.targetAmount)}</span>
              </div>

              {goal.isOnTrack ? (
                <p className="text-xs text-[var(--numi-income)]">{t.onTrack}</p>
              ) : (
                <p className="text-xs text-[var(--numi-warning)]">
                  {t.needsPerMonth(goal.monthlyNeeded ? format(goal.monthlyNeeded) : "—")}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
