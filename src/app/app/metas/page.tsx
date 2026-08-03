import type { Metadata } from "next";
import { formatCurrency } from "@/lib/utils/currency";
import { getGoals } from "@/lib/supabase/queries/goals";
import type { GoalWithProgress } from "@/types/app";
import { ProgressBar } from "@/components/common/ProgressBar";
import { FadeIn } from "@/components/common/FadeIn";
import { NewGoalButton } from "./NewGoalButton";
import { ContributeButton } from "./ContributeButton";
import { EditGoalButton } from "./EditGoalButton";

export const metadata: Metadata = { title: "Goals" };

const STATUS_LABEL: Record<string, string> = {
  active: "Active", completed: "Completed", cancelled: "Cancelled", paused: "Paused",
};
const GOAL_COLOR: Record<string, string> = {
  active: "var(--numi-income)", completed: "var(--numi-info)", cancelled: "var(--numi-expense)", paused: "var(--numi-warning)",
};

export default async function MetasPage() {
  const goals     = await getGoals();
  const active    = goals.filter(g => g.status === "active").length;
  const completed = goals.filter(g => g.status === "completed").length;

  return (
    <FadeIn className="px-4 py-5 lg:px-8 lg:py-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--numi-landing-heading)" }}>Goals</h1>
        <NewGoalButton />
      </div>

      {goals.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <Pill value={active}    label="active"    color="var(--numi-income)" />
          <Pill value={completed} label="completed" color="var(--numi-info)" />
        </div>
      )}

      {goals.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-[var(--numi-text-2)] font-medium">No goals yet</p>
          <p className="text-sm text-[var(--numi-text-3)] mt-1">Click &quot;+ New Goal&quot; to start tracking your progress</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {goals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
        </div>
      )}
    </FadeIn>
  );
}

function Pill({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
      {value} {label}
    </span>
  );
}

function GoalCard({ goal }: { goal: GoalWithProgress }) {
  const color       = GOAL_COLOR[goal.status] ?? "var(--numi-income)";
  const remaining   = goal.targetAmount - goal.currentAmount;
  const isCompleted = goal.status === "completed";
  const isPaused    = goal.status === "paused";

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "#FFFFFF", border: `1px solid ${isCompleted ? "rgba(59,130,246,0.22)" : isPaused ? "rgba(245,158,11,0.22)" : "rgba(22, 50, 31, 0.08)"}`, boxShadow: "0 8px 20px -12px rgba(22, 50, 31, 0.15)" }}
    >
      <div className="flex gap-4">
        <div className="shrink-0">
          <ProgressCircle percent={goal.progressPercent} color={color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              {goal.icon && <span className="text-xl">{goal.icon}</span>}
              <p className="text-base font-bold leading-tight" style={{ color: "var(--numi-landing-heading)" }}>{goal.name}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
                {STATUS_LABEL[goal.status]}
              </span>
              <EditGoalButton goal={goal} />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mb-3">
            <p className="text-xl font-bold" style={{ color: "var(--numi-landing-heading)" }}>{formatCurrency(goal.currentAmount)}</p>
            <p className="text-sm text-[var(--numi-text-3)]">of {formatCurrency(goal.targetAmount)}</p>
          </div>
          <div className="mb-2">
            <ProgressBar percent={goal.progressPercent} color={color} />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {isCompleted ? (
              <p className="text-xs font-semibold" style={{ color: "var(--numi-info)" }}>🎉 Goal completed!</p>
            ) : isPaused ? (
              <p className="text-xs text-[var(--numi-warning)]">⏸ Goal paused</p>
            ) : goal.isOnTrack ? (
              <p className="text-xs font-semibold" style={{ color: "var(--numi-income)" }}>✓ On track</p>
            ) : (
              <p className="text-xs" style={{ color: "var(--numi-warning)" }}>
                ⚠ Would need {goal.monthlyNeeded ? formatCurrency(goal.monthlyNeeded) : "—"}/month
              </p>
            )}
            {goal.daysRemaining !== null && !isCompleted && (
              <p className="text-xs text-[var(--numi-text-3)]">{goal.daysRemaining} days left</p>
            )}
            {!isCompleted && (
              <p className="text-xs text-[var(--numi-text-3)]">{formatCurrency(remaining)} to go</p>
            )}
          </div>
        </div>
      </div>
      {goal.status === "active" && (
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(22, 50, 31, 0.08)" }}>
          <ContributeButton goalId={goal.id} goalName={goal.name} />
        </div>
      )}
    </div>
  );
}

function ProgressCircle({ percent, color, size = 80 }: { percent: number; color: string; size?: number }) {
  const r = (size - 12) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const filled = Math.min(percent / 100, 1) * circumference;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(22, 50, 31, 0.1)" strokeWidth={7} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeLinecap="round" strokeDasharray={`${filled} ${circumference}`}
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
        fill="var(--numi-landing-heading)" fontSize={13} fontWeight={700} fontFamily="inherit">
        {Math.round(percent)}%
      </text>
    </svg>
  );
}
