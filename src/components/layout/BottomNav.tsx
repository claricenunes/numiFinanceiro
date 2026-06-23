"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/stores/useUIStore";

const NAV = [
  { label: "Início",   href: "/app/dashboard",    icon: HomeIcon },
  { label: "Contas",   href: "/app/contas",       icon: CardIcon },
  { label: "Orçamento",href: "/app/orcamento",    icon: ChartIcon },
  { label: "Metas",    href: "/app/metas",        icon: TargetIcon },
  { label: "Investir", href: "/app/investimentos",icon: TrendIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const { openQuickAdd } = useUIStore();

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around px-2 pb-safe"
      style={{
        background: "rgba(13, 21, 38, 0.95)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid #1E2D45",
        height: "64px",
      }}
    >
      {NAV.map(({ label, href, icon: Icon }, i) => {
        const active = pathname === href || pathname.startsWith(href + "/");

        // FAB no centro
        if (i === 2) {
          return (
            <div key="fab" className="flex flex-col items-center gap-1">
              <button
                onClick={() => openQuickAdd("expense")}
                className="w-12 h-12 rounded-full flex items-center justify-center text-[#0B1020] font-bold text-xl shadow-lg transition-transform active:scale-95"
                style={{ background: "#34D399", boxShadow: "0 4px 20px rgba(52,211,153,0.4)" }}
                aria-label="Nova transação"
              >
                +
              </button>
            </div>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 min-w-[48px] transition-colors"
            style={{ color: active ? "#34D399" : "#475569" }}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function CardIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
}
function ChartIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2v10l6.5 3.5"/></svg>;
}
function TargetIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
}
function TrendIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
}
