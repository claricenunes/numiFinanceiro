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
      style={{ background: "var(--numi-bg)", borderBottom: "1px solid var(--numi-border)" }}
    >
      {/* Esquerda: toggle menu (mobile) + toggle sidebar (desktop) + logo mobile */}
      <div className="flex items-center gap-3">
        {/* Mobile: abre o drawer */}
        <button
          onClick={toggleMobileMenu}
          className="flex lg:hidden w-8 h-8 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#131929] hover:text-[#F1F5F9] transition-colors"
          aria-label="Abrir menu"
        >
          <MenuIcon className="w-4 h-4" />
        </button>

        {/* Desktop: colapsa/expande sidebar */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#131929] hover:text-[#F1F5F9] transition-colors"
          aria-label="Toggle sidebar"
        >
          <MenuIcon className="w-4 h-4" />
        </button>

        {/* Logo visível apenas no mobile */}
        <div className="flex lg:hidden items-center gap-2">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)" }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#34D399] block" />
          </span>
          <span className="text-base font-semibold text-[#F1F5F9] tracking-tight">Numi</span>
        </div>
      </div>

      {/* Centro: seletor de período */}
      <PeriodSelector />

      {/* Direita: avatar do usuário */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer select-none"
          style={{ background: "rgba(52,211,153,0.15)", color: "#34D399", border: "1px solid rgba(52,211,153,0.3)" }}
          title={profile?.full_name ?? "Perfil"}
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
