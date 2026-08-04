"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RingProgress } from "./charts/RingProgress";

type Tone = "income" | "warning" | "expense";

function bandFor(score: number): { label: string; tone: Tone; color: string } {
  if (score >= 80) return { label: "Excellent", tone: "income", color: "var(--numi-income)" };
  if (score >= 60) return { label: "Good", tone: "income", color: "var(--numi-income)" };
  if (score >= 40) return { label: "Needs attention", tone: "warning", color: "var(--numi-warning)" };
  return { label: "At risk", tone: "expense", color: "var(--numi-expense)" };
}

export function FinancialHealthCard({ score }: { score: number }) {
  const band = bandFor(score);

  return (
    <Card className="flex items-center gap-4">
      <RingProgress value={score} color={band.color}>
        <span className="text-lg font-bold text-[var(--numi-text)]">{score}</span>
      </RingProgress>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--numi-text)]">Financial health</p>
        <Badge tone={band.tone} className="mt-1">{band.label}</Badge>
        <p className="text-xs text-[var(--numi-text-3)] mt-2 max-w-[200px]">
          Based on savings rate, budget adherence and goals on track.
        </p>
      </div>
    </Card>
  );
}
