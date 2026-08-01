"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useMotionValueEvent } from "framer-motion";
import { usePrefersReducedMotion } from "@/components/common/motion/usePrefersReducedMotion";
import { PhoneFrame } from "./PhoneFrame";

const ACCENT_GREEN = "#98BB8A";
const SECTION_HEIGHT_VH = 280;
// The sticky child only stays pinned while scrolling through
// (sectionHeight - viewportHeight) of the section — as a fraction of the
// section's own 0→1 scrollYProgress that's (H-100)/H, a fixed ratio since
// both are in vh (viewport-independent). Every band must finish inside
// this window, or its content gets scrolled away mid-animation before it
// ever finishes revealing.
const PIN_END = (SECTION_HEIGHT_VH - 100) / SECTION_HEIGHT_VH;
const PHASE1_END = 0.35; // phone shrink + green circle expansion
const CLAMP = (n: number) => Math.min(1, Math.max(0, n));

const CHAT_MESSAGES = [
  "You spent $780 on Food this month.",
  "Savings rate is up to 49%. 📈",
  "Net worth: $24,380 (+3.2%).",
  "3 new insights are ready for you. 👀",
];

interface CardDef {
  label: string;
  value: string;
  sub: string;
  targetX: number;
  targetY: number;
  start: number;
  end: number;
}

// Sub-ranges overlap slightly (each starts before the previous fully
// finishes) so the reveal feels organic rather than mechanically metered.
// All four fit inside [PHASE1_END, PIN_END] — see PIN_END above.
const PHASE2_SPAN = PIN_END - PHASE1_END;
const CARDS: CardDef[] = [
  { label: "Health score", value: "82", sub: "out of 100", targetX: -360, targetY: -150, start: PHASE1_END + PHASE2_SPAN * 0.0, end: PHASE1_END + PHASE2_SPAN * 0.32 },
  { label: "Net worth", value: "$24,380", sub: "+3.2% this month", targetX: 360, targetY: -170, start: PHASE1_END + PHASE2_SPAN * 0.22, end: PHASE1_END + PHASE2_SPAN * 0.55 },
  { label: "Savings rate", value: "49%", sub: "of income", targetX: -380, targetY: 170, start: PHASE1_END + PHASE2_SPAN * 0.45, end: PHASE1_END + PHASE2_SPAN * 0.78 },
  { label: "Insights", value: "3", sub: "ready to review", targetX: 380, targetY: 160, start: PHASE1_END + PHASE2_SPAN * 0.68, end: PHASE1_END + PHASE2_SPAN * 1.0 },
];

/**
 * Scroll-linked showcase: the phone shrinks while a green circle expands
 * to fill the viewport, then data cards emerge from behind the phone
 * (spreading to the corners) while the chat scrolls internally — all
 * tied 1:1 to scroll progress through this section, not a timer.
 * Replaces the static AnalyticsSection with the same underlying stats.
 */
export function AnalyticsScrollSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const phoneScale = useTransform(scrollYProgress, [0, PHASE1_END], [1, 0.6]);
  const clipPath = useTransform(scrollYProgress, (p) => {
    const t = CLAMP(p / PHASE1_END);
    return `circle(${t * 150}% at 50% 50%)`;
  });

  // Cards and chat messages are updated together from a single scroll
  // subscription (see AppShowcaseScrollSection / PhoneMockup for why:
  // many independent useTransform hooks off one shared scrollYProgress
  // produced inconsistent, non-monotonic values in this codebase).
  const card0Opacity = useMotionValue(0);
  const card0Scale = useMotionValue(0.8);
  const card0X = useMotionValue(0);
  const card0Y = useMotionValue(0);
  const card1Opacity = useMotionValue(0);
  const card1Scale = useMotionValue(0.8);
  const card1X = useMotionValue(0);
  const card1Y = useMotionValue(0);
  const card2Opacity = useMotionValue(0);
  const card2Scale = useMotionValue(0.8);
  const card2X = useMotionValue(0);
  const card2Y = useMotionValue(0);
  const card3Opacity = useMotionValue(0);
  const card3Scale = useMotionValue(0.8);
  const card3X = useMotionValue(0);
  const card3Y = useMotionValue(0);
  const cardMotions = [
    { opacity: card0Opacity, scale: card0Scale, x: card0X, y: card0Y },
    { opacity: card1Opacity, scale: card1Scale, x: card1X, y: card1Y },
    { opacity: card2Opacity, scale: card2Scale, x: card2X, y: card2Y },
    { opacity: card3Opacity, scale: card3Scale, x: card3X, y: card3Y },
  ];

  const msg0Opacity = useMotionValue(0);
  const msg0Y = useMotionValue(20);
  const msg1Opacity = useMotionValue(0);
  const msg1Y = useMotionValue(20);
  const msg2Opacity = useMotionValue(0);
  const msg2Y = useMotionValue(20);
  const msg3Opacity = useMotionValue(0);
  const msg3Y = useMotionValue(20);
  const messageMotions = [
    { opacity: msg0Opacity, y: msg0Y },
    { opacity: msg1Opacity, y: msg1Y },
    { opacity: msg2Opacity, y: msg2Y },
    { opacity: msg3Opacity, y: msg3Y },
  ];

  const sync = (latest: number) => {
    CARDS.forEach((card, i) => {
      const t = CLAMP((latest - card.start) / (card.end - card.start));
      cardMotions[i].opacity.set(t);
      cardMotions[i].scale.set(0.8 + t * 0.2);
      cardMotions[i].x.set(card.targetX * t);
      cardMotions[i].y.set(card.targetY * t);
    });

    const msgSpan = PHASE2_SPAN / CHAT_MESSAGES.length;
    messageMotions.forEach(({ opacity, y }, i) => {
      const start = PHASE1_END + i * msgSpan;
      const t = CLAMP((latest - start) / msgSpan);
      opacity.set(t);
      y.set(20 * (1 - t));
    });
  };

  useMotionValueEvent(scrollYProgress, "change", sync);
  useEffect(() => {
    sync(scrollYProgress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (reducedMotion) {
    return (
      <section className="relative py-24 lg:py-32 overflow-hidden" style={{ background: ACCENT_GREEN }}>
        <div className="relative max-w-5xl mx-auto px-4 flex items-center justify-center" style={{ minHeight: 640 }}>
          {CARDS.map((card) => (
            <div
              key={card.label}
              className="absolute w-[180px] rounded-2xl bg-white p-4 shadow-lg"
              style={{ left: "50%", top: "50%", marginLeft: -90 + card.targetX, marginTop: -50 + card.targetY }}
            >
              <p className="text-xs font-medium text-[var(--numi-text-3)]">{card.label}</p>
              <p className="text-2xl font-bold text-[var(--numi-text)]">{card.value}</p>
              <p className="text-[11px] text-[var(--numi-text-3)]">{card.sub}</p>
            </div>
          ))}
          <div style={{ transform: "scale(0.6)" }}>
            <PhoneFrame>
              {CHAT_MESSAGES.map((text) => (
                <div key={text} className="self-start max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-snug bg-[#F7EEE4] text-[var(--numi-landing-heading)]">
                  {text}
                </div>
              ))}
            </PhoneFrame>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative" style={{ height: `${SECTION_HEIGHT_VH}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ background: ACCENT_GREEN, clipPath, willChange: "clip-path" }}
        />

        <div className="relative w-full max-w-5xl mx-auto flex items-center justify-center" style={{ minHeight: 640 }}>
          {CARDS.map((card, i) => (
            <motion.div
              key={card.label}
              className="absolute w-[180px] rounded-2xl bg-white p-4 shadow-lg"
              style={{
                left: "50%",
                top: "50%",
                marginLeft: -90,
                marginTop: -50,
                opacity: cardMotions[i].opacity,
                scale: cardMotions[i].scale,
                x: cardMotions[i].x,
                y: cardMotions[i].y,
                willChange: "transform, opacity",
              }}
            >
              <p className="text-xs font-medium text-[var(--numi-text-3)]">{card.label}</p>
              <p className="text-2xl font-bold text-[var(--numi-text)]">{card.value}</p>
              <p className="text-[11px] text-[var(--numi-text-3)]">{card.sub}</p>
            </motion.div>
          ))}

          <motion.div className="relative z-10" style={{ scale: phoneScale, willChange: "transform" }}>
            <PhoneFrame>
              {CHAT_MESSAGES.map((text, i) => (
                <motion.div
                  key={text}
                  style={{ opacity: messageMotions[i].opacity, y: messageMotions[i].y, willChange: "transform, opacity" }}
                  className="self-start max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-snug bg-[#F7EEE4] text-[var(--numi-landing-heading)]"
                >
                  {text}
                </motion.div>
              ))}
            </PhoneFrame>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
