import type { Metadata } from "next";
import { formatCurrency } from "@/lib/utils/currency";
import { mockGoals } from "@/lib/mock-data";
import type { GoalWithProgress } from "@/types/app";
import { ProgressBar } from "@/components/common/ProgressBar";
import { FadeIn } from "@/components/common/FadeIn";

export const metadata: Metadata = { title: "Metas" };

const STATUS_LABEL: Record<string, string> = {
  active:    "Ativa",
  completed: "Concluída",
  cancelled: "Cancelada",
  paused:    "Pausada",
};

const GOAL_COLOR: Record<string, string> = {
  active:    "#34D399",
  completed: "#38BDF8",
  cancelled: "#F87171",
  paused:    "#FBBF24",
};

export default function MetasPage() {
  const goals = mockGoals;
  const active    = goals.filter(g => g.status === "active").length;
  const completed = goals.filter(g => g.status === "completed").length;

  return (
    <FadeIn className="px-4 py-5 lg:px-8 lg:py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-[#F1F5F9]">Metas</h1>
        <button
          className="text-sm font-semibold px-4 py-2 rounded-xl"
          style={{ background: "#34D399", color: "#0B1020" }}
        >
          + Nova Meta
        </button>
      </div>

      {/* Status pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Pill value={active}    label="ativas"    color="#34D399" />
        <Pill value={completed} label="concluídas" color="#38BDF8" />
      </div>

      {/* Goal cards */}
      <div className="flex flex-col gap-4">
        {goals.map(goal => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-[#94A3B8] font-medium">Nenhuma meta cadastrada</p>
          <p className="text-sm text-[#475569] mt-1">Crie uma meta para começar a acompanhar seu progresso</p>
        </div>
      )}
    </FadeIn>
  );
}

/* ── Sub-componentes ─────────────────────────────────── */

function Pill({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <span
      className="text-xs font-semibold px-3 py-1 rounded-full"
      style={{ background: `${color}22`, color }}
    >
      {value} {label}
    </span>
  );
}

function GoalCard({ goal }: { goal: GoalWithProgress }) {
  const color         = GOAL_COLOR[goal.status] ?? "#34D399";
  const remaining     = goal.targetAmount - goal.currentAmount;
  const isCompleted   = goal.status === "completed";
  const isPaused      = goal.status === "paused";

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "#131929",
        border: `1px solid ${isCompleted ? "#38BDF822" : isPaused ? "#FBBF2422" : "#1E2D45"}`,
      }}
    >
      <div className="flex gap-4">
        {/* Progress circle */}
        <div className="shrink-0">
          <ProgressCircle
            percent={goal.progressPercent}
            color={color}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name + status badge */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              {goal.icon && <span className="text-xl">{goal.icon}</span>}
              <p className="text-base font-bold text-[#F1F5F9] leading-tight">{goal.name}</p>
            </div>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
              style={{ background: `${color}22`, color }}
            >
              {STATUS_LABEL[goal.status]}
            </span>
          </div>

          {/* Amounts */}
          <div className="flex items-baseline gap-1.5 mb-3">
            <p className="text-xl font-bold text-[#F1F5F9]">
              {formatCurrency(goal.currentAmount)}
            </p>
            <p className="text-sm text-[#475569]">
              de {formatCurrency(goal.targetAmount)}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-2">
            <ProgressBar percent={goal.progressPercent} color={color} />
          </div>

          {/* Status line */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {isCompleted ? (
              <p className="text-xs font-semibold" style={{ color: "#38BDF8" }}>
                🎉 Meta concluída!
              </p>
            ) : isPaused ? (
              <p className="text-xs text-[#FBBF24]">⏸ Meta pausada</p>
            ) : goal.isOnTrack ? (
              <p className="text-xs font-semibold" style={{ color: "#34D399" }}>
                ✓ No ritmo certo
              </p>
            ) : (
              <p className="text-xs" style={{ color: "#FBBF24" }}>
                ⚠ Precisaria de {goal.monthlyNeeded ? formatCurrency(goal.monthlyNeeded) : "—"}/mês
              </p>
            )}

            {goal.daysRemaining !== null && !isCompleted && (
              <p className="text-xs text-[#475569]">
                {goal.daysRemaining} dias restantes
              </p>
            )}

            {!isCompleted && (
              <p className="text-xs text-[#475569]">
                Faltam {formatCurrency(remaining)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {goal.status === "active" && (
        <div
          className="mt-4 pt-4"
          style={{ borderTop: "1px solid #1E2D45" }}
        >
          <button
            className="text-sm font-semibold px-4 py-1.5 rounded-xl"
            style={{ background: "#1E2D45", color: "#F1F5F9" }}
          >
            + Registrar aporte
          </button>
        </div>
      )}
    </div>
  );
}

function ProgressCircle({ percent, color, size = 80 }: { percent: number; color: string; size?: number }) {
  const r           = (size - 12) / 2;
  const cx          = size / 2;
  const cy          = size / 2;
  const circumference = 2 * Math.PI * r;
  const filled      = Math.min(percent / 100, 1) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1E2D45" strokeWidth={7} />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeWidth={7}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circumference}`}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text
        x={cx} y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#F1F5F9"
        fontSize={13}
        fontWeight={700}
        fontFamily="inherit"
      >
        {Math.round(percent)}%
      </text>
    </svg>
  );
}
