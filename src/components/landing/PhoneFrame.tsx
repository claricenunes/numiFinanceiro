import type { ReactNode } from "react";

/**
 * Shared iPhone chrome (titanium frame, dynamic island, status bar,
 * Numi header row, home indicator) — pure presentation, no animation
 * or chat logic of its own. `children` renders inside the scrollable
 * screen area. Used by both the Hero's looping-chat mockup and the
 * scroll-driven showcase phone, so the two never drift apart visually.
 */
export function PhoneFrame({
  children,
  className = "w-[300px] sm:w-[360px] lg:w-[400px]",
  screenMinHeightClassName = "min-h-[650px] lg:min-h-[760px]",
}: {
  children: ReactNode;
  className?: string;
  screenMinHeightClassName?: string;
}) {
  return (
    <div className={`relative shrink-0 ${className}`}>
      {/* Side controls, protruding from the titanium frame */}
      <div className="absolute -left-[3px] top-[118px] w-[3px] h-7 rounded-l-sm bg-gradient-to-b from-[#8e8e93] to-[#48484a]" />
      <div className="absolute -left-[3px] top-[160px] w-[3px] h-11 rounded-l-sm bg-gradient-to-b from-[#8e8e93] to-[#48484a]" />
      <div className="absolute -left-[3px] top-[216px] w-[3px] h-11 rounded-l-sm bg-gradient-to-b from-[#8e8e93] to-[#48484a]" />
      <div className="absolute -right-[3px] top-[170px] w-[3px] h-16 rounded-r-sm bg-gradient-to-b from-[#8e8e93] to-[#48484a]" />

      {/* Titanium frame — layered shadow (soft ambient + tighter contact) for depth */}
      <div
        className="relative rounded-[3.1rem] p-[3px]"
        style={{
          background: "linear-gradient(135deg, #9a9a9e 0%, #4b4b4e 22%, #232325 45%, #58585b 65%, #ababaf 85%, #6b6b6e 100%)",
          boxShadow: "0 50px 80px -25px rgba(22, 50, 31, 0.35), 0 18px 30px -12px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div className="rounded-[2.9rem] bg-black p-[9px]">
          <div className={`relative bg-white rounded-[2.35rem] overflow-hidden flex flex-col ${screenMinHeightClassName}`}>
            {/* Dynamic island */}
            <div className="absolute left-1/2 top-[14px] -translate-x-1/2 h-[26px] w-[92px] bg-black rounded-full z-20" />

            {/* Status bar */}
            <div className="flex items-center justify-between px-8 pt-3.5 pb-1 text-[11px] font-semibold text-[var(--numi-landing-heading)]">
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <svg width="14" height="10" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
                  <rect x="0" y="8" width="3" height="4" rx="0.5" />
                  <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.5" />
                  <rect x="9" y="3" width="3" height="9" rx="0.5" />
                  <rect x="13" y="0" width="3" height="12" rx="0.5" opacity="0.35" />
                </svg>
                <svg width="14" height="10" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
                  <path d="M8 10.2a1.1 1.1 0 100-2.2 1.1 1.1 0 000 2.2z" />
                  <path d="M8 6c1.28 0 2.45.44 3.38 1.18l-1.3 1.3A3.4 3.4 0 008 7.6c-.78 0-1.5.24-2.08.66l-1.3-1.3A5.4 5.4 0 018 6z" />
                  <path d="M8 2.2c2.55 0 4.87.9 6.7 2.4l-1.3 1.3A8.4 8.4 0 008 4.2a8.4 8.4 0 00-5.4 1.7l-1.3-1.3A10.4 10.4 0 018 2.2z" />
                </svg>
                <svg width="22" height="11" viewBox="0 0 24 12" fill="none" aria-hidden="true">
                  <rect x="1" y="1" width="19" height="10" rx="2.5" stroke="currentColor" strokeOpacity="0.4" />
                  <rect x="2.5" y="2.5" width="16" height="7" rx="1.4" fill="currentColor" />
                  <rect x="21.5" y="4" width="1.5" height="4" rx="0.75" fill="currentColor" fillOpacity="0.4" />
                </svg>
              </div>
            </div>

            <div className="flex items-center gap-2 px-5 pt-3 pb-4 border-b border-black/5 bg-white">
              <span className="text-[var(--numi-landing-heading)] text-lg leading-none">‹</span>
              <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: "var(--numi-landing-nav-bg)" }}>
                N
              </div>
              <span className="text-sm font-semibold text-[var(--numi-landing-heading)]">Numi</span>
              <span className="ml-auto text-[var(--numi-landing-heading)] text-xs opacity-60">ⓘ</span>
            </div>

            <div className="flex-1 px-5 py-6 flex flex-col gap-3.5 overflow-hidden">{children}</div>

            {/* Home indicator */}
            <div className="pb-2 pt-1 flex justify-center">
              <div className="h-[5px] w-[134px] rounded-full bg-black/80" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
