"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  ChartColumn,
  PiggyBank,
  CreditCard,
  Bell,
  Target,
  TrendingUp,
  TrendingDown,
  Receipt,
  Calendar,
  ShieldCheck,
  Building2,
  Sparkles,
  Bot,
  Search,
  ArrowLeftRight,
  CircleDollarSign,
  BadgePercent,
  BarChart3,
  Coins,
  type LucideIcon,
} from "lucide-react";
import { usePrefersReducedMotion } from "@/components/common/motion/usePrefersReducedMotion";

interface MarqueeItem {
  icon: LucideIcon;
  label: string;
}

const ALL_FEATURES: MarqueeItem[] = [
  { icon: Wallet, label: "Smart budgeting" },
  { icon: ChartColumn, label: "Spending analytics" },
  { icon: PiggyBank, label: "Savings goals" },
  { icon: CreditCard, label: "Card management" },
  { icon: Bell, label: "Bill reminders" },
  { icon: Target, label: "Financial goals" },
  { icon: TrendingUp, label: "Investment tracking" },
  { icon: TrendingDown, label: "Expense monitoring" },
  { icon: Receipt, label: "Receipt organization" },
  { icon: Calendar, label: "Upcoming payments" },
  { icon: ShieldCheck, label: "Secure banking" },
  { icon: Building2, label: "Bank account sync" },
  { icon: Sparkles, label: "AI insights" },
  { icon: Bot, label: "AI financial assistant" },
  { icon: Search, label: "Transaction search" },
  { icon: ArrowLeftRight, label: "Money transfers" },
  { icon: CircleDollarSign, label: "Cash flow" },
  { icon: BadgePercent, label: "Savings opportunities" },
  { icon: BarChart3, label: "Financial reports" },
  { icon: Coins, label: "Net worth tracking" },
];

const ROW_1 = ALL_FEATURES.slice(0, 10);
const ROW_2 = ALL_FEATURES.slice(10, 20);

const CARD_BG = "var(--numi-landing-accent)";
const CARD_TEXT = "var(--numi-landing-accent-text)";

function Pill({ icon: Icon, label }: MarqueeItem) {
  return (
    <div
      className="flex items-center gap-3 shrink-0 rounded-full px-6 py-3.5"
      style={{ background: CARD_BG, color: CARD_TEXT, boxShadow: "0 12px 24px -12px rgba(226, 137, 107, 0.5)" }}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <span className="whitespace-nowrap text-sm sm:text-base font-medium">{label}</span>
    </div>
  );
}

function MarqueeRow({
  items,
  reverse,
  duration,
  reducedMotion,
}: {
  items: MarqueeItem[];
  reverse: boolean;
  duration: number;
  reducedMotion: boolean;
}) {
  // Three copies (not two) so there's always a full extra copy's worth of
  // content in reserve past the visible edge, regardless of how wide the
  // viewport is relative to one copy's width — translating by exactly
  // 1/3 of the tripled track lands back on an identical frame, so the
  // loop point is invisible.
  const track = [...items, ...items, ...items];
  const x = reverse ? ["0%", "-33.3333%"] : ["-33.3333%", "0%"];

  return (
    <div
      className="overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      }}
    >
      <motion.div
        className="flex w-max gap-4"
        animate={reducedMotion ? undefined : { x }}
        transition={reducedMotion ? undefined : { duration, repeat: Infinity, ease: "linear" }}
      >
        {track.map((item, i) => (
          <Pill key={i} icon={item.icon} label={item.label} />
        ))}
      </motion.div>
    </div>
  );
}

/**
 * Premium infinite marquee — two rows of coral pill cards drifting in
 * opposite directions at a constant (ease: linear) speed, each row
 * tripled so the loop point never shows a jump or gap. Sits directly in
 * the hero band (same slot the old TrustBadges strip used), so it has
 * no background of its own — it just shows the cream hero gradient
 * through, including at the faded row edges. Purely decorative (icons +
 * labels aren't interactive), so it's excluded from the accessibility
 * tree and frozen in place for prefers-reduced-motion.
 */
export function FeatureMarqueeSection() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section aria-hidden="true" className="py-14 lg:py-20 overflow-hidden">
      <div className="flex flex-col gap-5">
        <MarqueeRow items={ROW_1} reverse={false} duration={34} reducedMotion={reducedMotion} />
        <MarqueeRow items={ROW_2} reverse={true} duration={40} reducedMotion={reducedMotion} />
      </div>
    </section>
  );
}
