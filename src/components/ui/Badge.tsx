import type { ReactNode } from "react";

type Tone = "neutral" | "income" | "expense" | "warning" | "info" | "accent";

const TONE_COLOR: Record<Tone, string> = {
  neutral: "var(--numi-text-3)",
  income: "var(--numi-income)",
  expense: "var(--numi-expense)",
  warning: "var(--numi-warning)",
  info: "var(--numi-info)",
  accent: "var(--numi-landing-accent)",
};

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = "neutral", children, className = "" }: BadgeProps) {
  const color = TONE_COLOR[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${className}`}
      style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}
    >
      {children}
    </span>
  );
}
