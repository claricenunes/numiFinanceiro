"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal } from "@/components/common/motion/Reveal";
import { usePrefersReducedMotion } from "@/components/common/motion/usePrefersReducedMotion";

// Same shared secondary-green "stage" identity used by the Hero showcase
// overlay, AnalyticsScrollSection, and HorizontalStatementSection right
// before this one — the outer background carries over unchanged so the
// giant-text section flows straight into this one with no visible seam.
const STAGE_BG = "#32453A";

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const blobY1 = useTransform(scrollYProgress, [0, 1], [reducedMotion ? 0 : -40, reducedMotion ? 0 : 40]);
  const blobY2 = useTransform(scrollYProgress, [0, 1], [reducedMotion ? 0 : 30, reducedMotion ? 0 : -30]);

  return (
    <section ref={sectionRef} className="px-4 py-24 lg:py-32" style={{ background: STAGE_BG }}>
      <Reveal className="max-w-6xl mx-auto">
        <div
          className="relative overflow-hidden rounded-[2.5rem] lg:rounded-[3rem] p-10 sm:p-16 lg:p-24 flex flex-col items-center text-center gap-7"
          style={{ background: "var(--numi-landing-accent)" }}
        >
          {/* Large, blurred, low-opacity shapes — pure depth, no other purpose. */}
          <motion.div
            aria-hidden="true"
            className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none"
            style={{ background: "var(--numi-landing-nav-text)", opacity: 0.12, y: blobY1 }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute -bottom-32 -right-16 w-[480px] h-[480px] rounded-full blur-3xl pointer-events-none"
            style={{ background: "var(--numi-landing-nav-bg)", opacity: 0.15, y: blobY2 }}
          />

          <h2
            className="relative text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight max-w-2xl"
            style={{ color: "var(--numi-landing-accent-text)" }}
          >
            Take control of your money today.
          </h2>

          <p
            className="relative text-lg sm:text-xl max-w-lg"
            style={{ color: "color-mix(in srgb, var(--numi-landing-accent-text) 75%, transparent)" }}
          >
            Join Numi and organize your finances with AI-powered insights, expense tracking, and smarter financial
            decisions.
          </p>

          <div className="relative flex flex-col sm:flex-row items-center gap-4 mt-2">
            <Link href="/register" className="numi-pill-btn numi-pill-btn-dark numi-cta-bounce text-lg px-10 py-4">
              Get Started
            </Link>
            <Link href="/login" className="numi-pill-btn numi-pill-btn-outline-dark text-lg px-10 py-4">
              Learn More
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
