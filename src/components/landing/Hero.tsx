"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { FadeIn } from "@/components/common/FadeIn";
import { usePrefersReducedMotion } from "@/components/common/motion/usePrefersReducedMotion";
import { RotatingWord } from "@/components/common/motion/RotatingWord";
import { PhoneMockup } from "./PhoneMockup";
import { OrganicWave } from "./OrganicWave";

const CTA_OVERSHOOT: [number, number, number, number] = [0.34, 1.56, 0.64, 1];
const DARK_BG = "var(--numi-landing-nav-bg)";
const HEADING_DARK_HEX = "#E9F3E4";
const SUB_DARK_HEX = "#B9D2B5";

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

  const phoneScale = useTransform(scrollYProgress, [0, 1], [1, 0.7]);
  const phoneY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const overlayY = useTransform(scrollYProgress, [0, 1], ["100%", "0%"]);
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const showcaseTextOpacity = useTransform(scrollYProgress, [0.15, 0.4], [0, 1]);

  return (
    <section ref={sectionRef} className="relative" style={{ height: reducedMotion ? undefined : "260vh" }}>
      <OrganicWave />

      <div className="sticky top-0 h-screen overflow-hidden flex items-center pt-28 lg:pt-32 px-6 lg:px-12 xl:px-16">
        {!reducedMotion && (
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{ background: DARK_BG, y: overlayY, willChange: "transform" }}
          />
        )}

        <div className="relative z-10 max-w-[1500px] mx-auto flex flex-col lg:flex-row lg:justify-center items-center gap-10 lg:gap-6 w-full">
          <div className="relative flex-1 min-w-0 max-w-2xl">
            <motion.div
              style={{ opacity: reducedMotion ? undefined : heroTextOpacity }}
              className="flex flex-col items-center lg:items-start text-center lg:text-left pb-6"
            >
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
            </motion.div>

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

          <motion.div
            className="shrink-0"
            style={reducedMotion ? undefined : { scale: phoneScale, y: phoneY, willChange: "transform" }}
          >
            <PhoneMockup scrollYProgress={reducedMotion ? undefined : scrollYProgress} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
