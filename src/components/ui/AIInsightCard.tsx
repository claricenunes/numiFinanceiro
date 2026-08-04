import { Sparkles, type LucideIcon } from "lucide-react";

type Severity = "info" | "warning" | "alert";

const SEVERITY_COLOR: Record<Severity, string> = {
  alert: "var(--numi-expense)",
  warning: "var(--numi-warning)",
  info: "var(--numi-income)",
};

interface AIInsightCardProps {
  title: string;
  description: string;
  severity?: Severity;
  icon?: LucideIcon;
  eyebrow?: string;
  className?: string;
}

export function AIInsightCard({
  title,
  description,
  severity = "info",
  icon: Icon = Sparkles,
  eyebrow = "Numi AI",
  className = "",
}: AIInsightCardProps) {
  const color = SEVERITY_COLOR[severity];
  return (
    <div
      className={`glass-card p-4 flex items-start gap-3 ${className}`}
      style={{ borderColor: `color-mix(in srgb, ${color} 25%, var(--numi-border))` }}
    >
      <span
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
      >
        <Icon size={15} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--numi-text-3)]">{eyebrow}</p>
        <p className="text-sm font-medium text-[var(--numi-text)] mt-0.5">{title}</p>
        <p className="text-xs text-[var(--numi-text-2)] mt-0.5">{description}</p>
      </div>
    </div>
  );
}
