"use client";

import { AnimatePresence, motion, type MotionValue } from "framer-motion";
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/components/common/motion/usePrefersReducedMotion";
import { PhoneFrame } from "./PhoneFrame";

interface ChatMessage {
  from: "numi" | "user";
  text: string;
  /** Raw comparison values (e.g. dollar amounts) — renders a tiny inline bar chart under the bubble text, scaled relative to the larger of the two. */
  chart?: { lastMonth: number; thisMonth: number };
}

// One continuous, ever-growing conversation — never a different screen,
// never restarted. The first pair is already on screen the moment the
// phone mounts (before any scroll); each further pair is revealed
// together as the user scrolls, and everything shown before stays
// visible — full history, nothing removed or replaced.
const MESSAGE_PAIRS: [ChatMessage, ChatMessage][] = [
  [
    { from: "user", text: "Hi Numi! How did I do this month?" },
    { from: "numi", text: "I've analyzed your finances. Here's a quick summary." },
  ],
  [
    { from: "numi", text: "You spent 10% more than last month." },
    { from: "numi", text: "📊 Last month: $2,430 • This month: $2,675", chart: { lastMonth: 2430, thisMonth: 2675 } },
  ],
  [
    { from: "user", text: "Where did it go?" },
    { from: "numi", text: "Mostly dining out — up 24%. 🍽️" },
  ],
  [
    { from: "numi", text: "You also saved $180 less than usual." },
    { from: "numi", text: "💰 That's mainly because of weekend trips." },
  ],
  [
    { from: "user", text: "How can I improve?" },
    { from: "numi", text: "Cutting dining expenses by 15% would put you back on track next month." },
  ],
  [
    { from: "numi", text: "If you keep this pace, you'll reach your savings goal in 4 months. 🎯" },
    { from: "user", text: "Great! Let's do it." },
  ],
];

const ALL_MESSAGES = MESSAGE_PAIRS.flat();

// Pixel heights, not percentages — a percentage height only resolves
// against a parent with a *definite* height, and these bars' direct
// parent (the flex column wrapper) sizes to its content instead.
const CHART_MAX_BAR_HEIGHT = 40;

function SpendingBarsChart({ lastMonth, thisMonth }: { lastMonth: number; thisMonth: number }) {
  const max = Math.max(lastMonth, thisMonth);
  return (
    <div className="mt-2.5 flex items-end gap-3">
      <div className="flex flex-col items-center gap-1">
        <div className="w-6 rounded-t-md bg-[var(--numi-landing-heading)]/20" style={{ height: (lastMonth / max) * CHART_MAX_BAR_HEIGHT }} />
        <span className="text-[9px] leading-none text-[var(--numi-landing-heading)]/60">Last</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-6 rounded-t-md" style={{ height: (thisMonth / max) * CHART_MAX_BAR_HEIGHT, background: "var(--numi-landing-accent)" }} />
        <span className="text-[9px] leading-none text-[var(--numi-landing-heading)]/60">This</span>
      </div>
    </div>
  );
}

interface PhoneMockupProps {
  /** When provided, only message pairs up to this index (0-based) are shown — the same step index driving the dashboard cards around the phone, so both stay in lockstep. Omit to show the full conversation immediately. */
  revealedStep?: number;
  scrollYProgress?: MotionValue<number>;
}

/**
 * Phone mockup with a single, continuously-growing chat transcript —
 * the first exchange is visible on mount, and each further step appends
 * a pair of messages without ever clearing or replacing what's already
 * there, so it reads as one real conversation being built up. The step
 * index is computed by the parent (Hero) so the dashboard cards that
 * surround the phone reveal in exact sync with the messages that
 * prompted them.
 */
export function PhoneMockup({ scrollYProgress, revealedStep }: PhoneMockupProps) {
  const reducedMotion = usePrefersReducedMotion();
  const messagesRef = useRef<HTMLDivElement>(null);

  const effectiveStep = revealedStep ?? MESSAGE_PAIRS.length - 1;
  const visibleMessages = ALL_MESSAGES.slice(0, (effectiveStep + 1) * 2);

  // Instant snap, not a native smooth scroll — a second, uncoordinated
  // animation timeline (the browser's own scroll easing) running at the
  // same time as the bubble's own rise+fade below fought with it and
  // read as janky/conflicting motion. The container jumps to the bottom
  // immediately (before paint), and the new bubble's own transform is
  // the only "arriving" motion left to see.
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
  }, [effectiveStep]);

  // The idle "bob" float is only for the standalone presentation.
  // Once this phone is driven by scroll (scale-only per the section's
  // spec), it must never carry its own independent translateY.
  const enableBob = !reducedMotion && !scrollYProgress;

  return (
    <motion.div
      animate={enableBob ? { y: [0, -8, 0] } : undefined}
      transition={enableBob ? { duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" } : undefined}
    >
      <PhoneFrame>
        <div
          ref={messagesRef}
          className="flex-1 min-h-0 flex flex-col gap-3.5 overflow-y-auto [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          <AnimatePresence>
            {visibleMessages.map((msg, i) => (
              <motion.div
                key={i}
                // New messages rise up from below the chat (like a real
                // messaging app), not fade in place — a large positive y
                // that eases down to 0, stacked with a fade. The second
                // bubble of a pair starts a beat after the first so the
                // two feel like they're arriving one after another.
                initial={reducedMotion ? false : { opacity: 0, y: 56 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: reducedMotion ? 0 : (i % 2) * 0.12 }}
                className={`shrink-0 max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-snug ${
                  msg.from === "numi"
                    ? "self-start bg-[#F7EEE4] text-[var(--numi-landing-heading)] rounded-bl-sm"
                    : "self-end text-white rounded-br-sm"
                }`}
                style={{
                  willChange: "transform, opacity",
                  ...(msg.from === "user"
                    ? { background: "var(--numi-landing-accent)", color: "var(--numi-landing-accent-text)" }
                    : undefined),
                }}
              >
                {msg.text}
                {msg.chart && <SpendingBarsChart lastMonth={msg.chart.lastMonth} thisMonth={msg.chart.thisMonth} />}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </PhoneFrame>
    </motion.div>
  );
}
