"use client";

import type { LucideIcon } from "lucide-react";
import { Plus, Download } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";
import { useToastStore } from "@/stores/useToastStore";
import { Card } from "@/components/ui/Card";

interface ActionDef {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

/**
 * Only the two actions that AREN'T simple page navigation (those live in
 * QuickAccessGrid now) — adding a transaction inline and exporting, neither
 * of which has its own destination page.
 */
export function QuickActions() {
  const openQuickAdd = useUIStore((s) => s.openQuickAdd);
  const showToast = useToastStore((s) => s.show);

  const actions: ActionDef[] = [
    { label: "New transaction", icon: Plus, onClick: () => openQuickAdd("expense") },
    { label: "Export report", icon: Download, onClick: () => showToast("Report export is coming soon.", "info") },
  ];

  return (
    <Card>
      <p className="text-sm font-semibold mb-4" style={{ color: "var(--numi-landing-heading)" }}>Quick actions</p>
      <div className="grid grid-cols-2 gap-2.5 max-w-xs">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="group flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-[color-mix(in_srgb,var(--numi-text)_4%,transparent)]"
            >
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ background: "color-mix(in srgb, var(--numi-landing-heading) 8%, transparent)", color: "var(--numi-landing-heading)" }}
              >
                <Icon size={16} />
              </span>
              <span className="text-xs font-medium text-[var(--numi-text)] text-center leading-tight">{action.label}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
