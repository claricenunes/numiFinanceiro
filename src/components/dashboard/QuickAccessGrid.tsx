"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeftRight, Landmark, PieChart, Target, TrendingUp, Sparkles, Bot, Settings } from "lucide-react";
import { StaggerGroup, StaggerItem } from "@/components/common/motion/Stagger";

interface ShortcutDef {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: "brand" | "accent" | "sage";
}

const TONE_COLOR: Record<ShortcutDef["tone"], string> = {
  brand: "var(--numi-landing-heading)",
  accent: "var(--numi-landing-accent)",
  sage: "var(--numi-landing-tagline)",
};

const SHORTCUTS: ShortcutDef[] = [
  { label: "Transactions", description: "Track every income and expense", href: "/app/transacoes", icon: ArrowLeftRight, tone: "brand" },
  { label: "Accounts", description: "See balances across all accounts", href: "/app/contas", icon: Landmark, tone: "accent" },
  { label: "Budget", description: "Stay on top of monthly spending", href: "/app/orcamento", icon: PieChart, tone: "sage" },
  { label: "Goals", description: "Track progress toward what matters", href: "/app/metas", icon: Target, tone: "brand" },
  { label: "Investments", description: "Monitor your portfolio's performance", href: "/app/investimentos", icon: TrendingUp, tone: "accent" },
  { label: "Insights", description: "AI-found patterns in your spending", href: "/app/insights", icon: Sparkles, tone: "sage" },
  { label: "Financial AI", description: "Get personalized financial guidance", href: "/app/fia", icon: Bot, tone: "brand" },
  { label: "Settings", description: "Manage your profile and preferences", href: "/app/settings", icon: Settings, tone: "accent" },
];

export function QuickAccessGrid() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--numi-landing-tagline)" }}>
        Quick access
      </p>
      <StaggerGroup className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {SHORTCUTS.map((s) => {
          const Icon = s.icon;
          const color = TONE_COLOR[s.tone];
          return (
            <StaggerItem key={s.href}>
              <Link href={s.href} className="glass-card glass-card-interactive group flex flex-col gap-3 p-5 h-full">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                  style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
                >
                  <Icon size={19} />
                </span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--numi-landing-heading)" }}>{s.label}</p>
                  <p className="text-xs text-[var(--numi-text-3)] mt-0.5 leading-snug">{s.description}</p>
                </div>
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </div>
  );
}
