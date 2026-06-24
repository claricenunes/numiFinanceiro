"use client";

import Link from "next/link";
import type { Insight } from "@/lib/supabase/queries/insights";

interface Props {
  insights: Insight[];
}

const SEVERITY_STYLES = {
  alert:   { border: "rgba(248,113,113,0.2)",  bg: "rgba(248,113,113,0.06)",  text: "#F87171" },
  warning: { border: "rgba(251,191,36,0.2)",   bg: "rgba(251,191,36,0.06)",   text: "#FBBF24" },
  info:    { border: "rgba(52,211,153,0.15)",  bg: "rgba(52,211,153,0.06)",   text: "#34D399" },
};

export function InsightsBanner({ insights }: Props) {
  if (insights.length === 0) return null;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-[#F1F5F9]">💡 Insights</p>
        <Link href="/app/insights" className="text-xs text-[#34D399] hover:underline">
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
                <p className="text-xs text-[#94A3B8] mt-0.5">{insight.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
