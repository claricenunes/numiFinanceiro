"use client";

import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, type MotionValue } from "framer-motion";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/components/common/motion/usePrefersReducedMotion";
import { PhoneFrame } from "./PhoneFrame";

const CHAT_STEPS = [
  { from: "numi" as const, text: "You spent 20% more on delivery this month. Want to adjust your goal?" },
  { from: "user" as const, text: "Yes!" },
  { from: "numi" as const, text: "Done. I'll let you know if you hit the new limit. 🎯" },
];

const STEP_DELAY = 1400;
const HOLD_DELAY = 2600;

// Second act, shown once the user starts scrolling past the hero —
// replaces the looping exchange above with proactive notifications,
// revealed one at a time in sync with scroll (not on a timer).
const SHOWCASE_MESSAGES = [
  "Rent payment detected — I updated your budget automatically.",
  "You're 12% under budget this month. Nice work! 🎉",
  "Netflix renews in 3 days. Still want it?",
  "Emergency fund just hit 60% of its goal. 💪",
];
const SHOWCASE_START = 0.1; // leaves room for the loop-chat crossfade before showcase messages begin

interface PhoneMockupProps {
  /** When provided, the phone crossfades from its looping demo chat into
   * scroll-synced showcase messages as this progresses past 0. */
  scrollYProgress?: MotionValue<number>;
}

/**
 * Phone mockup with a chat transcript styled after the app's own
 * bubble/avatar language. The conversation loops on a timer so the
 * hero always feels "alive" — until the user scrolls, at which point
 * it hands off to a second, scroll-driven set of messages.
 */
export function PhoneMockup({ scrollYProgress }: PhoneMockupProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setVisibleCount(CHAT_STEPS.length);
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const run = (step: number) => {
      if (cancelled) return;
      setVisibleCount(step);
      if (step < CHAT_STEPS.length) {
        timeoutId = setTimeout(() => run(step + 1), STEP_DELAY);
      } else {
        timeoutId = setTimeout(() => run(0), HOLD_DELAY);
      }
    };

    timeoutId = setTimeout(() => run(1), STEP_DELAY);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  const loopOpacity = useMotionValue(1);
  const msg0Opacity = useMotionValue(0);
  const msg0Y = useMotionValue(10);
  const msg1Opacity = useMotionValue(0);
  const msg1Y = useMotionValue(10);
  const msg2Opacity = useMotionValue(0);
  const msg2Y = useMotionValue(10);
  const msg3Opacity = useMotionValue(0);
  const msg3Y = useMotionValue(10);
  const messageMotions = [
    { opacity: msg0Opacity, y: msg0Y },
    { opacity: msg1Opacity, y: msg1Y },
    { opacity: msg2Opacity, y: msg2Y },
    { opacity: msg3Opacity, y: msg3Y },
  ];

  const sync = (latest: number) => {
    loopOpacity.set(Math.max(0, 1 - latest / SHOWCASE_START));

    const span = 1 - SHOWCASE_START;
    const bandSize = span / SHOWCASE_MESSAGES.length;
    messageMotions.forEach(({ opacity, y }, i) => {
      const start = SHOWCASE_START + i * bandSize;
      const t = Math.min(1, Math.max(0, (latest - start) / bandSize));
      opacity.set(t);
      y.set(10 * (1 - t));
    });
  };

  const fallbackProgress = useMotionValue(0);
  const progress = scrollYProgress ?? fallbackProgress;
  useMotionValueEvent(progress, "change", (latest) => {
    if (scrollYProgress) sync(latest);
  });
  useEffect(() => {
    if (scrollYProgress) sync(scrollYProgress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      animate={reducedMotion ? undefined : { y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
    >
      <PhoneFrame>
        <div className="relative flex-1">
          <motion.div className="absolute inset-0 flex flex-col gap-3.5" style={{ opacity: scrollYProgress ? loopOpacity : 1 }}>
            <AnimatePresence>
              {CHAT_STEPS.slice(0, visibleCount).map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-snug ${
                    step.from === "numi"
                      ? "self-start bg-[#F7EEE4] text-[var(--numi-landing-heading)] rounded-bl-sm"
                      : "self-end text-white rounded-br-sm"
                  }`}
                  style={step.from === "user" ? { background: "var(--numi-landing-accent)", color: "var(--numi-landing-accent-text)" } : undefined}
                >
                  {step.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {scrollYProgress && (
            <div className="absolute inset-0 flex flex-col gap-3.5">
              {SHOWCASE_MESSAGES.map((text, i) => (
                <motion.div
                  key={text}
                  style={{ opacity: messageMotions[i].opacity, y: messageMotions[i].y, willChange: "transform, opacity" }}
                  className="self-start max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-snug bg-[#F7EEE4] text-[var(--numi-landing-heading)]"
                >
                  {text}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </PhoneFrame>
    </motion.div>
  );
}
