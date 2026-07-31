"use client";

import { Check } from "lucide-react";
import { Reveal } from "@/components/common/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/common/motion/Stagger";
import { TrendAreaChart } from "./charts/TrendAreaChart";
import { MOCK_WEEKLY_PRODUCTIVITY } from "./mockData";

const ITEMS = [
  "Every bill, goal, and recurring payment on one financial calendar",
  "Tasks that adjust automatically when a due date changes",
  "A weekly review generated for you, not built from scratch",
  "Routines that keep your budget on track without micromanaging it",
];

export function ProductivitySection() {
  return (
    <section className="px-4 py-24 lg:py-32 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <Reveal direction="left">
          <p className="text-sm font-semibold mb-3" style={{ color: "#98BB8A" }}>Productivity</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-[var(--numi-text)] leading-tight mb-6">
            One system for your money, not ten spreadsheets
          </h2>

          <StaggerGroup className="flex flex-col gap-4">
            {ITEMS.map((item) => (
              <StaggerItem key={item} className="flex items-start gap-3">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "#98BB8A22" }}
                >
                  <Check className="w-3 h-3" style={{ color: "#98BB8A" }} strokeWidth={3} aria-hidden="true" />
                </span>
                <p className="text-sm lg:text-base text-[var(--numi-text-2)] leading-relaxed">{item}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Reveal>

        <Reveal direction="right" delay={0.1} className="glass-card p-6">
          <p className="text-sm font-medium text-[var(--numi-text-2)] mb-1">Weekly productivity score</p>
          <p className="text-xs text-[var(--numi-text-3)] mb-4">How consistently you stayed on top of your plan</p>
          <TrendAreaChart data={MOCK_WEEKLY_PRODUCTIVITY} color="#6E76A8" formatValue={(v) => `${Math.round(v)}`} height={200} />
        </Reveal>
      </div>
    </section>
  );
}
