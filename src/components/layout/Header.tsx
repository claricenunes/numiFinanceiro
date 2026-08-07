"use client";

import { Menu } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";
import { useUserStore } from "@/stores/useUserStore";
import { usePageHeaderStore } from "@/stores/usePageHeaderStore";
import { PeriodSelector } from "./PeriodSelector";

export function Header() {
  const { toggleSidebar, toggleMobileMenu } = useUIStore();
  const { profile } = useUserStore();
  const { title, actions } = usePageHeaderStore();

  return (
    <header
      className="flex items-center justify-between gap-4 px-5 lg:px-6 h-16 flex-shrink-0 sticky top-3 z-40 mt-3 mb-3 mr-3 ml-3 lg:ml-0 rounded-[22px] border"
      style={{
        background: "var(--numi-elevated)",
        borderColor: "var(--numi-border)",
        boxShadow: "0 10px 30px -16px rgba(22, 50, 31, 0.18), 0 2px 8px -4px rgba(22, 50, 31, 0.08)",
      }}
    >
      {/* Left: menu toggle + page identity */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleMobileMenu}
          className="flex lg:hidden w-8 h-8 items-center justify-center rounded-lg text-[var(--numi-text-2)] hover:bg-[color-mix(in_srgb,var(--numi-landing-heading)_6%,transparent)] hover:text-[var(--numi-landing-heading)] transition-colors"
          aria-label="Open menu"
        >
          <Menu size={16} />
        </button>
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-[var(--numi-text-2)] hover:bg-[color-mix(in_srgb,var(--numi-landing-heading)_6%,transparent)] hover:text-[var(--numi-landing-heading)] transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={16} />
        </button>

        {/* Mobile always keeps the brand mark — no sidebar there to carry
            identity, so the logo can't be swapped out for a page title. */}
        <div className="flex lg:hidden items-center">
          <span className="text-2xl leading-none" style={{ color: "var(--numi-landing-heading)", fontFamily: "var(--font-logo)" }}>
            numi
          </span>
        </div>
        {title && (
          <h1 className="hidden lg:block text-base font-semibold truncate" style={{ color: "var(--numi-landing-heading)" }}>
            {title}
          </h1>
        )}
      </div>

      {/* Center: period selector */}
      <PeriodSelector />

      {/* Right: page actions + avatar */}
      <div className="flex items-center gap-3 shrink-0">
        {actions}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer select-none text-white shrink-0"
          style={{ background: "var(--numi-landing-nav-bg)" }}
          title={profile?.full_name ?? "Profile"}
        >
          {profile?.full_name?.charAt(0).toUpperCase() ?? "?"}
        </div>
      </div>
    </header>
  );
}
