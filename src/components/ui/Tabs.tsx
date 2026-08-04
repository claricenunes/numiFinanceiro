"use client";

import { motion } from "framer-motion";

interface TabItem<T extends string> {
  value: T;
  label: string;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Must be unique per Tabs instance on the page (Framer Motion layout animation id). */
  layoutId: string;
  className?: string;
}

export function Tabs<T extends string>({ tabs, value, onChange, layoutId, className = "" }: TabsProps<T>) {
  return (
    <div className={`glass-card flex gap-1 p-1 rounded-xl overflow-x-auto ${className}`}>
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className="relative px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors flex-shrink-0"
          style={{ color: value === t.value ? "var(--numi-landing-heading)" : "var(--numi-text-3)" }}
        >
          {value === t.value && (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 rounded-lg"
              style={{ background: "color-mix(in srgb, var(--numi-landing-accent) 14%, transparent)" }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
          <span className="relative">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
