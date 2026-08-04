"use client";

import type { LucideIcon } from "lucide-react";

interface IconOption<T extends string> {
  value: T;
  label: string;
  icon: LucideIcon;
}

interface IconPickerProps<T extends string> {
  options: IconOption<T>[];
  value: T;
  onChange: (value: T) => void;
  columns?: number;
  label?: string;
}

export function IconPicker<T extends string>({ options, value, onChange, columns = 3, label }: IconPickerProps<T>) {
  return (
    <div>
      {label && <label className="text-xs font-medium text-[var(--numi-text-2)] mb-1.5 block">{label}</label>}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-medium transition-colors"
              style={{
                background: active ? "color-mix(in srgb, var(--numi-landing-accent) 14%, transparent)" : "var(--numi-elevated)",
                border: `1.5px solid ${active ? "var(--numi-landing-accent)" : "var(--numi-border)"}`,
                color: active ? "var(--numi-landing-heading)" : "var(--numi-text-2)",
              }}
            >
              <Icon size={18} />
              <span className="text-center leading-tight">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
