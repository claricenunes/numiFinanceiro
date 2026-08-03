"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { FlowChart } from "@/components/dashboard/FlowChart";
import { GoalsPreview } from "@/components/dashboard/GoalsPreview";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { Reveal } from "@/components/common/motion/Reveal";
import { usePrefersReducedMotion } from "@/components/common/motion/usePrefersReducedMotion";
import { MOCK_SUMMARY, MOCK_CATEGORIES, MOCK_FLOW, MOCK_GOALS, MOCK_TRANSACTIONS } from "./mockData";

/**
 * Reuses the REAL dashboard components (same ones logged-in users see),
 * fed with mock data — inside a plain "app window" frame. Sits right below
 * the hero, and "emerges" from it: the bottom half starts covered by a
 * panel in the hero's own background color, which shrinks away as the
 * section scrolls through view (scaleY tied 1:1 to scroll progress, not a
 * fixed-duration animation).
 */
export function DashboardShowcaseSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const curtainScale = useTransform(scrollYProgress, [0.15, 0.55], [1, 0]);
  const mockupParallaxY = useTransform(scrollYProgress, [0, 1], [reducedMotion ? 0 : 30, reducedMotion ? 0 : -30]);

  return (
    <section className="px-4 py-24 lg:py-32 max-w-6xl mx-auto">
      <Reveal className="text-center mb-12">
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--numi-landing-tagline)" }}>Dashboard</p>
        <h2 className="text-3xl lg:text-4xl font-bold max-w-2xl mx-auto leading-tight" style={{ color: "var(--numi-landing-heading)" }}>
          Your whole financial picture, in one screen
        </h2>
        <p className="text-lg text-[var(--numi-text-2)] max-w-md mx-auto mt-3">
          The exact same dashboard you get after signing up — no surprises.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div ref={containerRef} className="relative rounded-3xl">
          {/* Large, soft, low-opacity shapes behind the frame — same
              "depth" technique as CTASection's card, tying this mockup
              into the rest of the page's visual language instead of
              floating as a plain white rectangle on flat cream. */}
          <div aria-hidden="true" className="absolute -inset-x-10 -inset-y-10 -z-10 overflow-hidden pointer-events-none">
            <div
              className="absolute -top-10 -left-10 w-[420px] h-[420px] rounded-full blur-3xl"
              style={{ background: "var(--numi-landing-accent)", opacity: 0.12 }}
            />
            <div
              className="absolute -bottom-16 -right-10 w-[420px] h-[420px] rounded-full blur-3xl"
              style={{ background: "var(--numi-landing-nav-bg)", opacity: 0.1 }}
            />
          </div>

          <div className="relative overflow-hidden rounded-3xl">
            <motion.div
              className="relative rounded-3xl border overflow-hidden"
              style={{
                y: reducedMotion ? 0 : mockupParallaxY,
                background: "var(--numi-elevated)",
                borderColor: "color-mix(in srgb, var(--numi-landing-heading) 10%, transparent)",
                boxShadow: "0 30px 70px -25px color-mix(in srgb, var(--numi-landing-heading) 35%, transparent)",
                // Scoped overrides — only inside this mockup, never touching
                // the real tokens the actual logged-in app relies on. Ties
                // the reused dashboard components' headings/labels/borders
                // into the same dark-green/sage palette as the rest of the
                // page, while leaving income/expense colors alone (real
                // financial meaning shouldn't bend to match a color scheme).
                ["--numi-text" as string]: "var(--numi-landing-heading)",
                ["--numi-text-2" as string]: "var(--numi-landing-tagline)",
                ["--numi-text-3" as string]: "color-mix(in srgb, var(--numi-landing-tagline) 55%, white)",
                ["--numi-border" as string]: "color-mix(in srgb, var(--numi-landing-heading) 8%, transparent)",
              }}
            >
              <div
                className="flex items-center gap-1.5 px-4 py-3 border-b"
                style={{ borderColor: "color-mix(in srgb, var(--numi-landing-heading) 8%, transparent)" }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--numi-expense)", opacity: 0.6 }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--numi-warning)", opacity: 0.6 }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--numi-landing-accent)", opacity: 0.7 }} />
              </div>

              <div className="p-4 lg:p-8 flex flex-col gap-4">
                <SummaryCards summary={MOCK_SUMMARY} locale="en-US" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ExpenseChart categories={MOCK_CATEGORIES} locale="en-US" />
                  <FlowChart data={MOCK_FLOW} locale="en-US" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <GoalsPreview goals={MOCK_GOALS} locale="en-US" />
                  <RecentTransactions transactions={MOCK_TRANSACTIONS} locale="en-US" />
                </div>
              </div>
            </motion.div>

            {!reducedMotion && (
              <motion.div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 top-1/2 z-10 pointer-events-none"
                style={{
                  background: "var(--numi-landing-hero-bg-2)",
                  scaleY: curtainScale,
                  transformOrigin: "bottom",
                }}
              />
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
