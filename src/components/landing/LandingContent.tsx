"use client";

import { CinematicHero } from "./CinematicHero";
import { ChartRevealSection } from "./ChartRevealSection";
import { BeforeAfterSection } from "./BeforeAfterSection";

export function LandingContent() {
  return (
    <div className="numi-ambient-bg">
      {/* ── Cenas 1-5: Hero + transição cinematográfica ─── */}
      <CinematicHero />

      {/* ── Cenas 6-8: gráfico se desenhando + título ────── */}
      <ChartRevealSection />

      {/* ── Seção 3 ──────────────────────────────────────── */}
      <BeforeAfterSection />
    </div>
  );
}
