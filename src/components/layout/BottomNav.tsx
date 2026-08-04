"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Landmark, PieChart, Target, Plus } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";

const LEFT = [
  { label: "Home", href: "/app/dashboard", icon: Home },
  { label: "Accounts", href: "/app/contas", icon: Landmark },
];

const RIGHT = [
  { label: "Budget", href: "/app/orcamento", icon: PieChart },
  { label: "Goals", href: "/app/metas", icon: Target },
];

export function BottomNav() {
  const pathname = usePathname();
  const { openQuickAdd } = useUIStore();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around px-2 pb-safe border-t"
      style={{
        background: "color-mix(in srgb, var(--numi-elevated) 92%, transparent)",
        backdropFilter: "blur(12px)",
        borderColor: "var(--numi-border)",
        height: "64px",
      }}
    >
      {LEFT.map((item) => (
        <NavItem key={item.href} item={item} active={isActive(item.href)} />
      ))}

      <motion.button
        onClick={() => openQuickAdd("expense")}
        whileTap={{ scale: 0.9 }}
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: "var(--numi-landing-accent)", color: "var(--numi-landing-accent-text)", boxShadow: "0 4px 20px rgba(226, 137, 107, 0.45)" }}
        aria-label="New transaction"
      >
        <Plus size={22} strokeWidth={2.5} />
      </motion.button>

      {RIGHT.map((item) => (
        <NavItem key={item.href} item={item} active={isActive(item.href)} />
      ))}
    </nav>
  );
}

function NavItem({ item, active }: { item: (typeof LEFT)[number]; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="flex flex-col items-center gap-1 min-w-[48px] transition-colors"
      style={{ color: active ? "var(--numi-landing-heading)" : "var(--numi-text-3)" }}
    >
      <Icon size={19} strokeWidth={active ? 2.25 : 1.75} />
      <span className="text-[10px] font-medium">{item.label}</span>
    </Link>
  );
}
