"use client";

import Link from "next/link";
import type { Insight } from "@/lib/supabase/queries/insights";

interface Props {
  insights: Insight[];
}

const SEVERITY_STYLES = {
  alert:   { border: "rgba(239,68,68,0.22)",   bg: "rgba(239,68,68,0.07)",   text: "var(--numi-expense)" },
  warning: { border: "rgba(245,158,11,0.22)",  bg: "rgba(245,158,11,0.07)",  text: "var(--numi-warning)" },
  info:    { border: "rgba(16,185,129,0.18)",  bg: "rgba(16,185,129,0.07)",  text: "var(--numi-income)" },
};

export function InsightsBanner({ insights }: Props) {
  if (insights.length === 0) return null;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-[var(--numi-text)]">💡 Insights</p>
        <Link href="/app/insights" className="text-xs text-[var(--numi-income)] hover:underline">
          Ver todos
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {insights.map((insight) => {
          const style = SEVERITY_STYLES[insight.severity];
          return (
            <div
              key={insight.id}
              className="flex items-start gap-3 rounded-xl p-3"
              style={{ background: style.bg, border: `1px solid ${style.border}` }}
            >
              <span className="text-base flex-shrink-0 mt-0.5">{insight.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: style.text }}>
                  {insight.title}
                </p>
                <p className="text-xs text-[var(--numi-text-2)] mt-0.5">{insight.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
