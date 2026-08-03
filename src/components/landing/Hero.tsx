"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValue, useMotionValueEvent } from "framer-motion";
import { usePrefersReducedMotion } from "@/components/common/motion/usePrefersReducedMotion";
import { RotatingWord } from "@/components/common/motion/RotatingWord";
import { PhoneMockup } from "./PhoneMockup";
import { DashboardCards } from "./DashboardCards";
import { OrganicWave } from "./OrganicWave";

// Deliberately not var(--numi-landing-nav-bg) — that's the header's own
// color, and this rising panel needs to read as a distinct surface, not
// a continuation of the header. Matches AnalyticsScrollSection's own
// green further down the page, so the two scroll-reveal sections share
// one secondary-green identity instead of each inventing their own.
const DARK_BG = "#32453A";
const HEADING_DARK_HEX = "#E9F3E4";
const SUB_DARK_HEX = "#B9D2B5";

// The section is SECTION_HEIGHT_VH tall with a 100vh sticky child, so
// the CSS pin itself only stays active until scrollYProgress reaches
// (SECTION_HEIGHT_VH-100)/SECTION_HEIGHT_VH — past that point the
// section is already unpinning and scrolling away, however far from 1
// scrollYProgress technically still has to go. Every scroll-driven
// value below is authored against a clean 0->1 range and then fed
// through `pinnedProgress`, which remaps raw scrollYProgress so that
// range completes exactly at the real pin end instead of at the
// unreachable literal 1. Bumping SECTION_HEIGHT_VH stretches the whole
// sequence (and the "hold" after the last card, before the section
// scrolls away) without touching any of the step timings below.
const SECTION_HEIGHT_VH = 620;
const PIN_END = (SECTION_HEIGHT_VH - 100) / SECTION_HEIGHT_VH;
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
  // The green panel finishes rising at pinnedProgress OVERLAY_END rather
  // than at 1 — it used to only reach full coverage exactly as the pin
  // ended, so the screen was never "just green" for any real stretch of
  // scroll. Finishing at 0.5 means it's fully covering for the entire
  // second half of the pin (a large span now that SECTION_HEIGHT_VH is
  // 340), instead of only for an instant.
  const OVERLAY_END = 0.5;
  const overlayY = useTransform(scrollYProgress, [0, OVERLAY_END * PIN_END], ["100%", "0%"]);

  // Driven manually (useMotionValue + a single scroll subscription)
  // rather than useTransform — chaining multiple useTransform calls off
  // one shared scrollYProgress proved unreliable elsewhere in this
  // codebase (see AnalyticsScrollSection/PhoneMockup).
  //
  // Page-transition-style exit: the copy rises a short distance early
  // (like the page itself scrolling away), holds there, then fades out
  // once it's already settled near the top. The CTA sits close to the
  // bottom of the viewport (~806px of 900px), and with the panel now
  // finishing its rise at OVERLAY_END=0.5 instead of 1, it reaches that
  // shifted position much sooner (~pinnedProgress 0.15) — the rise+fade
  // has to complete well before that, so both are compressed into the
  // opening sliver of the pin.
  const HERO_TEXT_RISE = 175;
  const heroTextY = useMotionValue(0);
  const heroTextOpacity = useMotionValue(1);
  const showcaseTextOpacity = useMotionValue(0);

  // Once the last card has settled (step 5, pinnedProgress 0.86) and
  // held for a beat, the phone + cards rise together as one unit for
  // the rest of the pin — the green panel is already filling the whole
  // sticky container, so lifting them off-center reveals more of it
  // underneath instead of just holding static until the section
  // releases.
  const CARD_RISE_START = 0.9;
  const CARD_RISE_DISTANCE = 350;
  const contentRiseY = useMotionValue(0);

  const syncHeroText = (latest: number) => {
    const p = pinnedProgress(latest);
    heroTextY.set(-HERO_TEXT_RISE * Math.min(1, Math.max(0, p / 0.05)));
    heroTextOpacity.set(1 - Math.min(1, Math.max(0, (p - 0.07) / 0.04)));
    showcaseTextOpacity.set(Math.min(1, Math.max(0, (p - 0.3) / 0.2)));
    contentRiseY.set(-CARD_RISE_DISTANCE * Math.min(1, Math.max(0, (p - CARD_RISE_START) / (1 - CARD_RISE_START))));
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

  // No mount-triggered entrance animation on this copy — it sits above
  // the fold, visible the instant the page loads, and a JS-driven
  // fade/slide-in is one more thing that could get stuck at its initial
  // (invisible) state. Opacity here is already driven by `heroTextOpacity`
  // (the scroll-linked wrapper below), which is real, working, and
  // initialized to 1 — no separate entrance transition needed on top of it.
  const heroCopy = (
    <>
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

      <p className="text-3xl sm:text-4xl font-bold mb-7" style={{ color: "var(--numi-landing-tagline)" }}>
        Simpler. Clearer. In control.
      </p>

      <p className="text-lg sm:text-xl text-[var(--numi-text-2)] max-w-lg mb-10">
        Numi is the AI finance assistant that helps you understand where your money goes —
        accounts, spending, goals, and investments, all in one place.
      </p>

      <Link href="/register" className="numi-pill-btn numi-pill-btn-dark numi-cta-bounce text-lg px-10 py-4">
        Try it for free
      </Link>
    </>
  );

  return (
    <section ref={sectionRef} className="relative" style={{ height: reducedMotion ? undefined : `${SECTION_HEIGHT_VH}vh` }}>
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
                style={{ opacity: showcaseTextOpacity, y: contentRiseY }}
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

          <motion.div
            className="relative shrink-0 flex items-center justify-center"
            style={reducedMotion ? undefined : { y: contentRiseY, willChange: "transform" }}
          >
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}
