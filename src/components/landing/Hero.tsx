"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValue, useMotionValueEvent } from "framer-motion";
import { FadeIn } from "@/components/common/FadeIn";
import { usePrefersReducedMotion } from "@/components/common/motion/usePrefersReducedMotion";
import { RotatingWord } from "@/components/common/motion/RotatingWord";
import { PhoneMockup } from "./PhoneMockup";
import { DashboardCards } from "./DashboardCards";
import { OrganicWave } from "./OrganicWave";

const CTA_OVERSHOOT: [number, number, number, number] = [0.34, 1.56, 0.64, 1];
const DARK_BG = "var(--numi-landing-nav-bg)";
const HEADING_DARK_HEX = "#E9F3E4";
const SUB_DARK_HEX = "#B9D2B5";

// The section is 260vh tall with a 100vh sticky child, so the CSS pin
// itself only stays active until scrollYProgress reaches
// (260-100)/260 — past that point the section is already unpinning and
// scrolling away, however far from 1 scrollYProgress technically still
// has to go. Every scroll-driven value below is authored against a
// clean 0->1 range and then fed through `pinnedProgress`, which remaps
// raw scrollYProgress so that range completes exactly at the real pin
// end instead of at the unreachable literal 1.
const PIN_END = 160 / 260;
function pinnedProgress(latest: number) {
  return Math.min(1, latest / PIN_END);
}

// Author against pinnedProgress (0->1 across the pin's real lifetime).
// Step 0 — the opening exchange — is always visible before any scroll.
// Shared by the phone's chat transcript and the dashboard cards around
// it, so a message and its card always arrive together.
const CHAT_STEP_START = [0, 0.3, 0.44, 0.58, 0.72, 0.86];

function stepForProgress(latest: number) {
  const p = pinnedProgress(latest);
  let idx = 0;
  for (let i = 1; i < CHAT_STEP_START.length; i++) {
    if (p >= CHAT_STEP_START[i]) idx = i;
  }
  return idx;
}

/**
 * The hero and the "app showcase" reveal are the same continuous
 * section — one phone, not two. It starts as a normal hero (full-size
 * phone, looping demo chat) in the first viewport; scrolling further
 * shrinks and raises that exact phone while a dark panel rises behind
 * it and the copy crossfades into proactive-notification messages,
 * all driven 1:1 by scroll progress (not a timed animation).
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const phoneScale = useTransform(scrollYProgress, [0, PIN_END], [1, 0.7]);
  const overlayY = useTransform(scrollYProgress, [0, PIN_END], ["100%", "0%"]);

  // Driven manually (useMotionValue + a single scroll subscription)
  // rather than useTransform — chaining multiple useTransform calls off
  // one shared scrollYProgress proved unreliable elsewhere in this
  // codebase (see AnalyticsScrollSection/PhoneMockup).
  //
  // Page-transition-style exit: the copy rises a short distance early
  // (like the page itself scrolling away), holds there, then fades out
  // once it's already settled near the top. The CTA sits close to the
  // bottom of the viewport (~806px of 900px) and the green panel rises
  // from below, so without the upward shift the panel would reach it
  // almost immediately; the -175px rise buys enough clearance (panel
  // reaches the shifted position only around progress 0.30) for the
  // fade to run at 0.18 -> 0.27, comfortably before that.
  const HERO_TEXT_RISE = 175;
  const heroTextY = useMotionValue(0);
  const heroTextOpacity = useMotionValue(1);
  const showcaseTextOpacity = useMotionValue(0);

  const syncHeroText = (latest: number) => {
    const p = pinnedProgress(latest);
    heroTextY.set(-HERO_TEXT_RISE * Math.min(1, Math.max(0, p / 0.12)));
    heroTextOpacity.set(1 - Math.min(1, Math.max(0, (p - 0.18) / 0.09)));
    showcaseTextOpacity.set(Math.min(1, Math.max(0, (p - 0.3) / 0.2)));
  };

  useMotionValueEvent(scrollYProgress, "change", syncHeroText);
  useEffect(() => {
    syncHeroText(scrollYProgress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drives both the phone's chat transcript and the dashboard cards
  // around it — a plain step index (not a continuous motion value) since
  // each step is a discrete reveal, not something that should visually
  // interpolate with scroll position.
  const [revealedStep, setRevealedStep] = useState(() => stepForProgress(scrollYProgress.get()));
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const idx = stepForProgress(latest);
    setRevealedStep((prev) => (prev === idx ? prev : idx));
  });

  const heroCopy = (
    <>
      <FadeIn delay={0.1} duration={0.5} y={16}>
        <h1
          className="text-6xl sm:text-7xl lg:text-7xl xl:text-8xl font-extrabold leading-[0.95] tracking-tight mb-7"
          style={{ color: "var(--numi-landing-heading)" }}
        >
          Your finances,
          <br />
          <RotatingWord
            words={["organized.", "under control.", "simplified.", "on autopilot."]}
          />
        </h1>
      </FadeIn>

      <FadeIn delay={0.35} duration={0.5} y={16}>
        <p className="text-3xl sm:text-4xl font-bold mb-7" style={{ color: "var(--numi-landing-tagline)" }}>
          Simpler. Clearer. In control.
        </p>
      </FadeIn>

      <FadeIn delay={0.35} duration={0.5} y={16}>
        <p className="text-lg sm:text-xl text-[var(--numi-text-2)] max-w-lg mb-10">
          Numi is the AI finance assistant that helps you understand where your money goes —
          accounts, spending, goals, and investments, all in one place.
        </p>
      </FadeIn>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.4, ease: CTA_OVERSHOOT }}
      >
        <Link href="/register" className="numi-pill-btn numi-pill-btn-dark numi-cta-bounce text-lg px-10 py-4">
          Try it for free
        </Link>
      </motion.div>
    </>
  );

  return (
    <section ref={sectionRef} className="relative" style={{ height: reducedMotion ? undefined : "260vh" }}>
      <OrganicWave />

      <div className="sticky top-0 h-screen overflow-hidden flex items-center pt-48 lg:pt-56 px-6 lg:px-12 xl:px-16">
        {!reducedMotion && (
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{ background: DARK_BG, y: overlayY, willChange: "transform" }}
          />
        )}

        <div className="relative z-10 max-w-[1500px] mx-auto flex flex-col lg:flex-row lg:justify-center items-center gap-10 lg:gap-6 w-full">
          <div className="relative flex-1 min-w-0 max-w-2xl">
            {reducedMotion ? (
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left pb-6">
                {heroCopy}
              </div>
            ) : (
              <motion.div
                style={{ y: heroTextY, opacity: heroTextOpacity }}
                className="flex flex-col items-center lg:items-start text-center lg:text-left pb-6"
              >
                {heroCopy}
              </motion.div>
            )}

            {!reducedMotion && (
              <motion.div
                aria-hidden={false}
                style={{ opacity: showcaseTextOpacity }}
                className="absolute inset-0 flex flex-col items-center lg:items-start text-center lg:text-left justify-center pointer-events-none"
              >
                <p className="text-sm font-semibold mb-3" style={{ color: "var(--numi-landing-tagline)" }}>Always on</p>
                <h2 className="text-3xl lg:text-4xl font-bold max-w-lg leading-tight" style={{ color: HEADING_DARK_HEX }}>
                  Numi watches your money so you don&apos;t have to
                </h2>
                <p className="text-lg max-w-md mt-3" style={{ color: SUB_DARK_HEX }}>
                  Real-time nudges about spending, bills, and goals — no need to open the app.
                </p>
              </motion.div>
            )}
          </div>

          <div className="relative shrink-0 flex items-center justify-center">
            {!reducedMotion && <DashboardCards revealedStep={revealedStep} />}

            <motion.div
              className="relative z-10 shrink-0"
              style={reducedMotion ? undefined : { scale: phoneScale, x: 0, y: 0, willChange: "transform" }}
            >
              <PhoneMockup
                scrollYProgress={reducedMotion ? undefined : scrollYProgress}
                revealedStep={reducedMotion ? undefined : revealedStep}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
