import type { Metadata } from "next";
import { Target, PartyPopper, Pause, Check, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { getGoals } from "@/lib/supabase/queries/goals";
import { GOAL_ICON_MAP } from "@/lib/icons";
import type { GoalWithProgress } from "@/types/app";
import { ProgressBar } from "@/components/common/ProgressBar";
import { FadeIn } from "@/components/common/FadeIn";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
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
      <PageHeader title="Goals" actions={<NewGoalButton />} />

      {goals.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <Badge tone="income">{active} active</Badge>
          <Badge tone="info">{completed} completed</Badge>
        </div>
      )}

      {goals.length === 0 ? (
        <Card>
          <EmptyState icon={Target} title="No goals yet" description={'Click "+ New Goal" to start tracking your progress'} />
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {goals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
        </div>
      )}
    </FadeIn>
  );
}

function GoalCard({ goal }: { goal: GoalWithProgress }) {
  const color       = GOAL_COLOR[goal.status] ?? "var(--numi-income)";
  const remaining   = goal.targetAmount - goal.currentAmount;
  const isCompleted = goal.status === "completed";
  const isPaused    = goal.status === "paused";

  return (
    <Card
      variant="interactive"
      style={
        isCompleted ? { borderColor: "rgba(59,130,246,0.22)" }
        : isPaused ? { borderColor: "rgba(245,158,11,0.22)" }
        : undefined
      }
    >
      <div className="flex gap-4">
        <div className="shrink-0">
          <ProgressCircle percent={goal.progressPercent} color={color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              {(() => {
                const GoalIcon = (goal.icon && GOAL_ICON_MAP[goal.icon]) || Target;
                return <GoalIcon size={18} style={{ color }} className="shrink-0" />;
              })()}
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
              <p className="text-xs font-semibold flex items-center gap-1" style={{ color: "var(--numi-info)" }}><PartyPopper size={12} /> Goal completed!</p>
            ) : isPaused ? (
              <p className="text-xs flex items-center gap-1" style={{ color: "var(--numi-warning)" }}><Pause size={12} /> Goal paused</p>
            ) : goal.isOnTrack ? (
              <p className="text-xs font-semibold flex items-center gap-1" style={{ color: "var(--numi-income)" }}><Check size={12} /> On track</p>
            ) : (
              <p className="text-xs flex items-center gap-1" style={{ color: "var(--numi-warning)" }}>
                <AlertTriangle size={12} /> Would need {goal.monthlyNeeded ? formatCurrency(goal.monthlyNeeded) : "—"}/month
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
        <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--numi-border)" }}>
          <ContributeButton goalId={goal.id} goalName={goal.name} />
        </div>
      )}
    </Card>
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
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--numi-border)" strokeWidth={7} />
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
