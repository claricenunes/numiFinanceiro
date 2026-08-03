"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/stores/useUIStore";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV = [
  { label: "Dashboard",     href: "/app/dashboard",     icon: DashboardIcon },
  { label: "Accounts",      href: "/app/contas",        icon: AccountsIcon },
  { label: "Transactions",  href: "/app/transacoes",    icon: TransactionsIcon },
  { label: "Budget",        href: "/app/orcamento",     icon: BudgetIcon },
  { label: "Goals",         href: "/app/metas",         icon: GoalsIcon },
  { label: "Investments",   href: "/app/investimentos", icon: InvestmentsIcon },
  { label: "Insights",      href: "/app/insights",      icon: InsightsIcon },
  { label: "Financial AI",  href: "/app/fia",           icon: FIAIcon },
  { label: "Notifications", href: "/app/notificacoes",  icon: BellIcon, badge: true },
];

interface Props {
  userName?: string;
  userAvatar?: string | null;
  notifCount?: number;
}

export function Sidebar({ userName, userAvatar, notifCount = 0 }: Props) {
  const pathname = usePathname();
  const { sidebarOpen } = useUIStore();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className="hidden lg:flex flex-col h-full transition-all duration-300"
      style={{
        width: sidebarOpen ? "240px" : "64px",
        background: "#FFFFFF",
        borderRight: "1px solid rgba(22, 50, 31, 0.08)",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5"
        style={{ borderBottom: "1px solid rgba(22, 50, 31, 0.08)", minHeight: "64px" }}
      >
        {sidebarOpen ? (
          <span
            className="text-3xl leading-none"
            style={{ color: "var(--numi-landing-heading)", fontFamily: "var(--font-logo)" }}
          >
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
      <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5 overflow-hidden">
        {NAV.map(({ label, href, icon: Icon, badge }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          const count  = badge ? notifCount : 0;
          return (
            <Link
              key={href}
              href={href}
              title={!sidebarOpen ? label : undefined}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
              style={{
                background: active ? "color-mix(in srgb, var(--numi-landing-heading) 8%, transparent)" : "transparent",
                color: active ? "var(--numi-landing-heading)" : "var(--numi-text-2)",
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "color-mix(in srgb, var(--numi-landing-heading) 5%, transparent)";
                if (!active) (e.currentTarget as HTMLElement).style.color = "var(--numi-landing-heading)";
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
                if (!active) (e.currentTarget as HTMLElement).style.color = "var(--numi-text-2)";
              }}
            >
              {/* Icon with optional unread badge */}
              <span className="relative flex-shrink-0">
                <Icon className="w-5 h-5" />
                {count > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] rounded-full flex items-center justify-center text-[9px] font-bold px-0.5"
                    style={{ background: "var(--numi-expense)", color: "#FFFFFF" }}
                  >
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </span>

              {sidebarOpen && (
                <span className="text-sm font-medium truncate flex-1">{label}</span>
              )}
              {active && sidebarOpen && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--numi-landing-accent)" }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-4" style={{ borderTop: "1px solid rgba(22, 50, 31, 0.08)" }}>
        <Link
          href="/app/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--numi-text-2)] transition-colors"
          style={{ background: "transparent" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "color-mix(in srgb, var(--numi-landing-heading) 5%, transparent)"; (e.currentTarget as HTMLElement).style.color = "var(--numi-landing-heading)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--numi-text-2)"; }}
        >
          <SettingsIcon className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--numi-text-2)] hover:bg-[var(--numi-expense)]/10 hover:text-[var(--numi-expense)] transition-colors"
        >
          <LogoutIcon className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span className="text-sm font-medium">Log out</span>}
        </button>
      </div>
    </aside>
  );
}

// ── Inline icons (Lucide-style) ──────────────────────────────
function DashboardIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
}
function AccountsIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
}
function TransactionsIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>;
}
function BudgetIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2v10l6.5 3.5"/></svg>;
}
function GoalsIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
}
function InvestmentsIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
}
function InsightsIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17H8v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/></svg>;
}
function FIAIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>;
}
function BellIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
function SettingsIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}
function LogoutIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
