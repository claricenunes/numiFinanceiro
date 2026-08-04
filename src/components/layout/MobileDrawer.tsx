"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";
import { NAV_GROUPS, NOTIFICATIONS_ITEM } from "./navConfig";

export function MobileDrawer() {
  const { mobileMenuOpen, closeMobileMenu } = useUIStore();
  const pathname = usePathname();

  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          <motion.div
            className="lg:hidden fixed inset-0 bg-black/65 z-40"
            style={{ backdropFilter: "blur(3px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMobileMenu}
          />

          <motion.aside
            className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col border-r"
            style={{ background: "var(--numi-elevated)", borderColor: "var(--numi-border)" }}
            initial={{ x: -264 }}
            animate={{ x: 0 }}
            exit={{ x: -264 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: "var(--numi-border)", minHeight: "64px" }}>
              <span className="text-2xl leading-none" style={{ color: "var(--numi-landing-heading)", fontFamily: "var(--font-logo)" }}>
                numi
              </span>
              <button
                onClick={closeMobileMenu}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--numi-text-3)] hover:text-[var(--numi-landing-heading)] hover:bg-[color-mix(in_srgb,var(--numi-landing-heading)_6%,transparent)] transition-colors text-xl leading-none"
                aria-label="Close menu"
              >
                ×
              </button>
            </div>

            <nav className="flex-1 px-2 py-4 flex flex-col gap-4 overflow-y-auto">
              {NAV_GROUPS.map((group) => (
                <div key={group.label} className="flex flex-col gap-0.5">
                  <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--numi-text-4)]">
                    {group.label}
                  </p>
                  {group.items.map((item) => (
                    <DrawerLink key={item.href} href={item.href} label={item.label} icon={item.icon} active={isActive(item.href)} />
                  ))}
                </div>
              ))}

              <div className="flex flex-col gap-0.5 pt-2 border-t" style={{ borderColor: "var(--numi-border)" }}>
                <DrawerLink
                  href={NOTIFICATIONS_ITEM.href}
                  label={NOTIFICATIONS_ITEM.label}
                  icon={NOTIFICATIONS_ITEM.icon}
                  active={isActive(NOTIFICATIONS_ITEM.href)}
                />
                <DrawerLink href="/app/settings" label="Settings" icon={Settings} active={isActive("/app/settings")} />
              </div>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function DrawerLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof Settings; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
        active ? "text-[var(--numi-landing-heading)]" : "text-[var(--numi-text-2)]"
      }`}
      style={active ? { background: "color-mix(in srgb, var(--numi-landing-heading) 8%, transparent)" } : undefined}
    >
      <Icon size={18} className="flex-shrink-0" />
      <span className="text-sm font-medium">{label}</span>
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "var(--numi-landing-accent)" }} />}
    </Link>
  );
}
