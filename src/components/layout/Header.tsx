"use client";

import { useUIStore } from "@/stores/useUIStore";
import { useUserStore } from "@/stores/useUserStore";
import { PeriodSelector } from "./PeriodSelector";

export function Header() {
  const { toggleSidebar, toggleMobileMenu } = useUIStore();
  const { profile } = useUserStore();

  return (
    <header
      className="flex items-center justify-between px-5 lg:px-6 h-16 flex-shrink-0 sticky top-0 z-40"
      style={{ background: "#FFFFFF", borderBottom: "1px solid rgba(22, 50, 31, 0.08)" }}
    >
      {/* Left: mobile menu toggle + desktop sidebar toggle + mobile logo */}
      <div className="flex items-center gap-3">
        {/* Mobile: opens the drawer */}
        <button
          onClick={toggleMobileMenu}
          className="flex lg:hidden w-8 h-8 items-center justify-center rounded-lg text-[var(--numi-text-2)] hover:bg-[color-mix(in_srgb,var(--numi-landing-heading)_6%,transparent)] hover:text-[var(--numi-landing-heading)] transition-colors"
          aria-label="Open menu"
        >
          <MenuIcon className="w-4 h-4" />
        </button>

        {/* Desktop: collapses/expands the sidebar */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-[var(--numi-text-2)] hover:bg-[color-mix(in_srgb,var(--numi-landing-heading)_6%,transparent)] hover:text-[var(--numi-landing-heading)] transition-colors"
          aria-label="Toggle sidebar"
        >
          <MenuIcon className="w-4 h-4" />
        </button>

        {/* Logo visible only on mobile */}
        <div className="flex lg:hidden items-center">
          <span
            className="text-2xl leading-none"
            style={{ color: "var(--numi-landing-heading)", fontFamily: "var(--font-logo)" }}
          >
            numi
          </span>
        </div>
      </div>

      {/* Center: period selector */}
      <PeriodSelector />

      {/* Right: user avatar */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer select-none text-white"
          style={{ background: "var(--numi-landing-nav-bg)" }}
          title={profile?.full_name ?? "Profile"}
        >
          {profile?.full_name?.charAt(0).toUpperCase() ?? "?"}
        </div>
      </div>
    </header>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
