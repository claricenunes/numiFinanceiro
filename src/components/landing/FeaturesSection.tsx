"use client";

import {
  Wallet,
  Sparkles,
  RefreshCw,
  Target,
  BarChart3,
  Calendar,
  Repeat,
  TrendingUp,
  Bell,
  Landmark,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/common/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/common/motion/Stagger";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

const FEATURES: Feature[] = [
  { icon: Wallet, title: "Smart Budgeting", description: "Budgets that adjust to how you actually spend, not the other way around.", color: "#8FAE7C" },
  { icon: Sparkles, title: "AI Insights", description: "Patterns in your spending, surfaced before they become a problem.", color: "#6E76A8" },
  { icon: RefreshCw, title: "Subscription Tracking", description: "Every recurring charge in one list — cancel what you don't use.", color: "#E3A6AE" },
  { icon: Target, title: "Savings Goals", description: "Set a target, see the plan, watch the progress bar move.", color: "#E3BE87" },
  { icon: BarChart3, title: "Expense Analytics", description: "Beautiful charts that actually explain where your money goes.", color: "#93A8B5" },
  { icon: Calendar, title: "Financial Calendar", description: "Bills, paydays, and goals on a single timeline.", color: "#8FAE7C" },
  { icon: Repeat, title: "Recurring Payments", description: "Automatic detection of rent, subscriptions, and installments.", color: "#B08160" },
  { icon: TrendingUp, title: "Investment Overview", description: "Portfolio performance alongside your everyday finances.", color: "#6E76A8" },
  { icon: Bell, title: "Bill Reminders", description: "A gentle nudge before anything is due — never a late fee again.", color: "#E3A6AE" },
  { icon: Landmark, title: "Bank Sync", description: "Connect your accounts once; balances stay current on their own.", color: "#93A8B5" },
];

export function FeaturesSection() {
  return (
    <section className="px-4 py-24 lg:py-32 max-w-6xl mx-auto">
      <Reveal className="text-center mb-16">
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--numi-landing-tagline)" }}>Features</p>
        <h2 className="text-3xl lg:text-4xl font-bold max-w-2xl mx-auto leading-tight" style={{ color: "var(--numi-landing-heading)" }}>
          Everything your finances need, nothing they don&apos;t
        </h2>
      </Reveal>

      <StaggerGroup className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description, color }) => (
          <StaggerItem key={title} className="glass-card p-6 flex flex-col gap-4 snap-center shrink-0 w-[78%] sm:w-auto sm:shrink">
            <span
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${color}22` }}
            >
              <Icon className="w-5 h-5" style={{ color }} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-[var(--numi-text)] mb-1.5">{title}</h3>
              <p className="text-sm text-[var(--numi-text-2)] leading-relaxed">{description}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
