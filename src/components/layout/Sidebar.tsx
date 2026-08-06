"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";
import { createClient } from "@/lib/supabase/client";
import { NAV_GROUPS, NOTIFICATIONS_ITEM, type NavItem } from "./navConfig";

interface Props {
  userName?: string;
  userAvatar?: string | null;
  notifCount?: number;
}

const SIDEBAR_BG = "color-mix(in srgb, var(--numi-landing-nav-bg) 95%, black 6%)";
const SPRING = { type: "spring" as const, stiffness: 340, damping: 32 };
const FADE = { duration: 0.15 };

export function Sidebar({ userName, userAvatar, notifCount = 0 }: Props) {
  const pathname = usePathname();
  const { sidebarOpen } = useUIStore();
  const router = useRouter();
  const collapsed = !sidebarOpen;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  const initial = userName?.charAt(0).toUpperCase() ?? "?";

  return (
    <motion.aside
      animate={{ width: collapsed ? 84 : 272 }}
      transition={SPRING}
      className="hidden lg:flex flex-col m-3 rounded-[28px] overflow-hidden flex-shrink-0"
      style={{
        height: "calc(100dvh - 1.5rem)",
        background: SIDEBAR_BG,
        backdropFilter: "blur(20px) saturate(140%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 24px 60px -16px rgba(19, 36, 24, 0.45), 0 8px 20px -10px rgba(19, 36, 24, 0.35)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 flex-shrink-0">
        {!collapsed ? (
          <span className="text-3xl leading-none" style={{ color: "var(--numi-landing-nav-text)", fontFamily: "var(--font-logo)" }}>
            numi
          </span>
        ) : (
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: "var(--numi-landing-accent)", color: "var(--numi-landing-accent-text)" }}
          >
            N
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
        {NAV_GROUPS.map((group, i) => (
          <div
            key={group.label}
            className={`flex flex-col gap-1 pb-2 ${i > 0 ? "mt-1 pt-3 border-t" : ""}`}
            style={i > 0 ? { borderColor: "rgba(255,255,255,0.08)" } : undefined}
          >
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={FADE}
                  className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--numi-landing-nav-muted)" }}
                >
                  {group.label}
                </motion.p>
              )}
            </AnimatePresence>
            {group.items.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} count={0} />
            ))}
          </div>
        ))}

        <div className="flex flex-col gap-1 mt-auto pt-3 pb-2 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <NavLink item={NOTIFICATIONS_ITEM} active={isActive(NOTIFICATIONS_ITEM.href)} collapsed={collapsed} count={notifCount} />
        </div>
      </nav>

      {/* Profile */}
      <div className={`flex-shrink-0 px-3 pb-3 pt-1 flex gap-2 ${collapsed ? "flex-col items-center" : "items-center"}`}>
        <Link
          href="/app/settings"
          title={collapsed ? "Account settings" : undefined}
          className="group flex items-center gap-2.5 flex-1 min-w-0 rounded-2xl p-2 transition-colors duration-200 hover:bg-white/[0.06]"
        >
          {userAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={userAvatar} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
          ) : (
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
              style={{ background: "var(--numi-landing-accent)", color: "var(--numi-landing-accent-text)" }}
            >
              {initial}
            </span>
          )}
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={FADE}
                className="min-w-0 flex-1"
              >
                <p className="text-sm font-medium truncate" style={{ color: "var(--numi-landing-nav-text)" }}>
                  {userName ?? "Account"}
                </p>
                <p className="text-xs truncate" style={{ color: "var(--numi-landing-nav-muted)" }}>
                  Personal account
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        <button
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200"
          style={{ color: "var(--numi-landing-nav-muted)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--numi-expense)"; e.currentTarget.style.background = "rgba(239,68,68,0.12)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--numi-landing-nav-muted)"; e.currentTarget.style.background = "transparent"; }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </motion.aside>
  );
}

function NavLink({ item, active, collapsed, count }: { item: NavItem; active: boolean; collapsed: boolean; count: number }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className="group relative flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-transform duration-200 will-change-transform hover:-translate-y-[1px] active:translate-y-0"
      style={{ color: active ? "var(--numi-landing-accent)" : "var(--numi-landing-nav-muted)" }}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active-pill"
          className="absolute inset-0 rounded-2xl"
          style={{ background: "color-mix(in srgb, var(--numi-landing-accent) 16%, transparent)", boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--numi-landing-accent) 30%, transparent)" }}
          transition={SPRING}
        />
      )}
      {!active && (
        <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: "rgba(255,255,255,0.06)" }} />
      )}

      <span className="relative flex-shrink-0">
        <Icon size={19} strokeWidth={active ? 2.25 : 1.75} />
        {count > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] rounded-full flex items-center justify-center text-[9px] font-bold px-0.5 text-white"
            style={{ background: "var(--numi-expense)", boxShadow: `0 0 0 2px ${SIDEBAR_BG}` }}
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </span>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE}
            className="relative text-sm font-medium truncate flex-1"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
