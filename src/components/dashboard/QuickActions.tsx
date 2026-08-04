"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Plus, Upload, PiggyBank, Target, LineChart, Download } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";
import { useToastStore } from "@/stores/useToastStore";
import { Card } from "@/components/ui/Card";

interface ActionDef {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  href?: string;
}

export function QuickActions() {
  const openQuickAdd = useUIStore((s) => s.openQuickAdd);
  const showToast = useToastStore((s) => s.show);

  const actions: ActionDef[] = [
    { label: "New transaction", icon: Plus, onClick: () => openQuickAdd("expense") },
    { label: "Import statement", icon: Upload, href: "/app/contas" },
    { label: "Create budget", icon: PiggyBank, href: "/app/orcamento" },
    { label: "Set a goal", icon: Target, href: "/app/metas" },
    { label: "Add investment", icon: LineChart, href: "/app/investimentos" },
    { label: "Export report", icon: Download, onClick: () => showToast("Report export is coming soon.", "info") },
  ];

  return (
    <Card>
      <p className="text-sm font-semibold text-[var(--numi-text)] mb-4">Quick actions</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {actions.map((action) => {
          const Icon = action.icon;
          const content = (
            <>
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ background: "color-mix(in srgb, var(--numi-landing-heading) 8%, transparent)", color: "var(--numi-landing-heading)" }}
              >
                <Icon size={16} />
              </span>
              <span className="text-xs font-medium text-[var(--numi-text)] text-center leading-tight">{action.label}</span>
            </>
          );
          const className = "group flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-[color-mix(in_srgb,var(--numi-text)_4%,transparent)]";

          return action.href ? (
            <Link key={action.label} href={action.href} className={className}>
              {content}
            </Link>
          ) : (
            <button key={action.label} type="button" onClick={action.onClick} className={className}>
              {content}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
