import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center gap-3 py-12 px-6 ${className}`}>
      <span
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "color-mix(in srgb, var(--numi-landing-heading) 8%, transparent)", color: "var(--numi-landing-heading)" }}
      >
        <Icon size={22} strokeWidth={1.75} />
      </span>
      <div>
        <p className="text-sm font-semibold text-[var(--numi-text)]">{title}</p>
        {description && <p className="text-xs text-[var(--numi-text-3)] mt-1 max-w-[280px]">{description}</p>}
      </div>
      {action}
    </div>
  );
}
