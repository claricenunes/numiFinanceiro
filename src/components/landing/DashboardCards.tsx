"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const ACCENT = "var(--numi-landing-accent)";
const GOOD = "#6E9B6E";

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

function CardTitle({ children }: { children: ReactNode }) {
  return <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--numi-text-3)] mb-2.5">{children}</p>;
}

function CompareBars({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: {
  leftLabel: string;
  leftValue: number;
  rightLabel: string;
  rightValue: number;
}) {
  const max = Math.max(leftValue, rightValue);
  return (
    <div>
      <div className="flex items-end gap-3 h-10 mb-1.5">
        <div className="flex-1 rounded-t-md bg-[var(--numi-landing-heading)]/15" style={{ height: (leftValue / max) * 40 }} />
        <div className="flex-1 rounded-t-md" style={{ height: (rightValue / max) * 40, background: ACCENT }} />
      </div>
      <div className="flex gap-3 text-[10px] leading-tight text-[var(--numi-text-3)]">
        <div className="flex-1">
          {leftLabel}
          <br />
          <span className="font-semibold text-[var(--numi-text)]">{money(leftValue)}</span>
        </div>
        <div className="flex-1">
          {rightLabel}
          <br />
          <span className="font-semibold text-[var(--numi-text)]">{money(rightValue)}</span>
        </div>
      </div>
    </div>
  );
}

function DeltaBarRow({ label, delta }: { label: string; delta: number }) {
  const positive = delta >= 0;
  const width = Math.min(100, Math.abs(delta) * 3.2);
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-[10px] text-[var(--numi-text-2)] w-14 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-black/5 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${width}%`, background: positive ? ACCENT : GOOD }} />
      </div>
      <span className="text-[10px] font-semibold w-8 text-right shrink-0" style={{ color: positive ? ACCENT : GOOD }}>
        {positive ? "+" : ""}
        {delta}%
      </span>
    </div>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-2 rounded-full bg-black/5 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: ACCENT }} />
    </div>
  );
}

function Sparkline() {
  return (
    <svg viewBox="0 0 100 34" className="w-full h-9" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points="0,30 20,26 40,20 60,18 80,8 100,4"
        fill="none"
        stroke={ACCENT}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface DashboardCardDef {
  /** revealedStep at which this card slides out from behind the phone. */
  step: number;
  targetX: number;
  targetY: number;
  content: ReactNode;
}

const DASHBOARD_CARDS: DashboardCardDef[] = [
  {
    step: 1,
    targetX: -260,
    targetY: -110,
    content: (
      <>
        <CardTitle>Monthly Spending</CardTitle>
        <CompareBars leftLabel="Last month" leftValue={2430} rightLabel="This month" rightValue={2675} />
      </>
    ),
  },
  {
    step: 2,
    targetX: -280,
    targetY: 150,
    content: (
      <>
        <CardTitle>Category Breakdown</CardTitle>
        <DeltaBarRow label="Dining" delta={24} />
        <DeltaBarRow label="Shopping" delta={8} />
        <DeltaBarRow label="Transport" delta={-5} />
      </>
    ),
  },
  {
    step: 3,
    targetX: 270,
    targetY: -130,
    content: (
      <>
        <CardTitle>Savings</CardTitle>
        <div className="flex justify-between text-[10px] text-[var(--numi-text-3)] mb-1.5">
          <span>
            Current <span className="font-semibold text-[var(--numi-text)]">{money(3820)}</span>
          </span>
          <span>
            Goal <span className="font-semibold text-[var(--numi-text)]">{money(5000)}</span>
          </span>
        </div>
        <ProgressBar value={3820} max={5000} />
      </>
    ),
  },
  {
    step: 4,
    targetX: 280,
    targetY: 140,
    content: (
      <>
        <CardTitle>AI Recommendation</CardTitle>
        <p className="text-[10px] text-[var(--numi-text-2)] mb-2">Dining Budget</p>
        <CompareBars leftLabel="Current" leftValue={620} rightLabel="Suggested" rightValue={520} />
        <p className="text-[10px] mt-2.5 font-semibold" style={{ color: ACCENT }}>
          Potential savings: $100/mo
        </p>
      </>
    ),
  },
  {
    step: 5,
    targetX: -250,
    targetY: -280,
    content: (
      <>
        <CardTitle>Savings Forecast</CardTitle>
        <Sparkline />
        <div className="flex justify-between text-[10px] text-[var(--numi-text-3)] mt-1.5">
          <span>
            ETA <span className="font-semibold text-[var(--numi-text)]">4 months</span>
          </span>
          <span className="font-semibold" style={{ color: ACCENT }}>
            Goal 100%
          </span>
        </div>
      </>
    ),
  },
];

/**
 * The visual counterpart to each AI insight message — cards hidden
 * directly behind the phone (opacity 0, scale 0.75, centered on it)
 * that slide out to their spread position the moment the matching
 * message step is revealed, so each new insight in the chat visibly
 * becomes a dashboard around the phone rather than appearing on its own.
 */
export function DashboardCards({ revealedStep }: { revealedStep: number }) {
  return (
    <>
      {DASHBOARD_CARDS.map((card, i) => {
        const revealed = revealedStep >= card.step;
        return (
          <motion.div
            key={i}
            aria-hidden="true"
            className="absolute z-0 w-[186px] rounded-2xl bg-white p-4 shadow-xl pointer-events-none"
            style={{ left: "50%", top: "50%", marginLeft: -93, marginTop: -68 }}
            initial={false}
            animate={{
              opacity: revealed ? 1 : 0,
              scale: revealed ? 1 : 0.75,
              x: revealed ? card.targetX : 0,
              y: revealed ? card.targetY : 0,
            }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            {card.content}
          </motion.div>
        );
      })}
    </>
  );
}
