"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Settings, LogOut } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";
import { createClient } from "@/lib/supabase/client";
import { NAV_GROUPS, NOTIFICATIONS_ITEM, type NavItem } from "./navConfig";

interface Props {
  userName?: string;
  userAvatar?: string | null;
  notifCount?: number;
}

export function Sidebar({ notifCount = 0 }: Props) {
  const pathname = usePathname();
  const { sidebarOpen } = useUIStore();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside
      className="hidden lg:flex flex-col h-full transition-all duration-300 border-r"
      style={{ width: sidebarOpen ? "248px" : "72px", background: "var(--numi-elevated)", borderColor: "var(--numi-border)", flexShrink: 0 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: "var(--numi-border)", minHeight: "68px" }}>
        {sidebarOpen ? (
          <span className="text-3xl leading-none" style={{ color: "var(--numi-landing-heading)", fontFamily: "var(--font-logo)" }}>
            numi
          </span>
        ) : (
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: "var(--numi-landing-nav-bg)" }}
          >
            N
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-4 flex flex-col gap-4 overflow-y-auto overflow-x-hidden">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-0.5">
            {sidebarOpen && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--numi-text-4)]">
                {group.label}
              </p>
            )}
            {group.items.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(item.href)} collapsed={!sidebarOpen} count={0} />
            ))}
          </div>
        ))}

        <div className="flex flex-col gap-0.5 mt-auto pt-2 border-t" style={{ borderColor: "var(--numi-border)" }}>
          <NavLink
            item={NOTIFICATIONS_ITEM}
            active={isActive(NOTIFICATIONS_ITEM.href)}
            collapsed={!sidebarOpen}
            count={notifCount}
          />
        </div>
      </nav>

      {/* Footer */}
      <div className="px-2.5 py-4 border-t" style={{ borderColor: "var(--numi-border)" }}>
        <Link
          href="/app/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--numi-text-2)] hover:bg-[color-mix(in_srgb,var(--numi-landing-heading)_5%,transparent)] hover:text-[var(--numi-landing-heading)] transition-colors"
        >
          <Settings size={18} className="flex-shrink-0" />
          {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--numi-text-2)] hover:bg-[color-mix(in_srgb,var(--numi-expense)_10%,transparent)] hover:text-[var(--numi-expense)] transition-colors"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {sidebarOpen && <span className="text-sm font-medium">Log out</span>}
        </button>
      </div>
    </aside>
  );
}

function NavLink({ item, active, collapsed, count }: { item: NavItem; active: boolean; collapsed: boolean; count: number }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
        active
          ? "text-[var(--numi-landing-heading)]"
          : "text-[var(--numi-text-2)] hover:bg-[color-mix(in_srgb,var(--numi-landing-heading)_5%,transparent)] hover:text-[var(--numi-landing-heading)]"
      }`}
      style={
        active
          ? {
              background: "color-mix(in srgb, var(--numi-landing-heading) 8%, transparent)",
              boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--numi-landing-heading) 10%, transparent)",
            }
          : undefined
      }
    >
      <span className="relative flex-shrink-0">
        <Icon size={18} />
        {count > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] rounded-full flex items-center justify-center text-[9px] font-bold px-0.5 text-white"
            style={{ background: "var(--numi-expense)" }}
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </span>
      {!collapsed && <span className="text-sm font-medium truncate flex-1">{item.label}</span>}
      {active && !collapsed && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--numi-landing-accent)" }} />
      )}
    </Link>
  );
}
