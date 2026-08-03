"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/components/common/motion/usePrefersReducedMotion";
import { PhoneFrame } from "./PhoneFrame";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const GREEN_BG = "#32453A";

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
}

const CARDS: CardDef[] = [
  { label: "Health score", value: "82", sub: "out of 100", targetX: -280, targetY: -140 },
  { label: "Net worth", value: "$24,380", sub: "+3.2% this month", targetX: 280, targetY: -160 },
  { label: "Savings rate", value: "49%", sub: "of income", targetX: -300, targetY: 150 },
  { label: "Insights", value: "3", sub: "ready to review", targetX: 300, targetY: 140 },
];

/**
 * Scroll-linked showcase (GSAP ScrollTrigger, scrub): the green stage
 * behind the phone rises to cover the previous background while the
 * phone shrinks; data cards emerge from directly behind the phone
 * (opacity 0/scale 0.8 → opacity 1/scale 1, sliding out to their spread
 * positions) and the chat reveals internally. The left copy column is
 * untouched by any of this — no tween ever targets it.
 */
export function AnalyticsScrollSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const greenPanelRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    if (reducedMotion) return;
    if (!sectionRef.current || !stageRef.current) return;

    const ctx = gsap.context(() => {
      const cards = cardRefs.current.filter((el): el is HTMLDivElement => el !== null);
      const messages = messageRefs.current.filter((el): el is HTMLDivElement => el !== null);

      gsap.set(greenPanelRef.current, { yPercent: 100 });
      // transformOrigin + explicit x/y lock the phone's center to a fixed
      // point — scale is the only property this element's tween ever sets,
      // and x/y are pinned at 0 on every frame so nothing (this tween or
      // otherwise) can introduce vertical drift.
      gsap.set(phoneRef.current, { scale: 1, x: 0, y: 0, transformOrigin: "50% 50%" });
      gsap.set(cards, { opacity: 0, scale: 0.8, x: 0, y: 0 });
      gsap.set(messages, { opacity: 0, y: 20 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${window.innerHeight * 4.2}`,
          scrub: true,
          pin: true,
          invalidateOnRefresh: true,
        },
      });

      // Phase 1: green stage rises + phone shrinks, simultaneously.
      // The phone tween sets only `scale` (plus a static x:0/y:0 — same
      // value start-to-end, never animated) so its center never moves.
      tl.to(greenPanelRef.current, { yPercent: 0, ease: "none", duration: 1.2 }, 0);
      tl.to(phoneRef.current, { scale: 0.6, x: 0, y: 0, ease: "none", duration: 1.2 }, 0);

      // Phase 2: cards emerge from behind the phone (overlapping starts),
      // chat messages reveal in parallel.
      CARDS.forEach((card, i) => {
        tl.to(
          cardRefs.current[i],
          { opacity: 1, scale: 1, x: card.targetX, y: card.targetY, ease: "none", duration: 0.9 },
          0.7 + i * 0.35
        );
      });

      CHAT_MESSAGES.forEach((_, i) => {
        tl.to(
          messageRefs.current[i],
          { opacity: 1, y: 0, ease: "none", duration: 0.5 },
          0.9 + i * 0.3
        );
      });

      // Padding tween — animates nothing, just extends the timeline's
      // total duration past the last real tween (card 3 finishes at
      // 2.65). Without it, scrub maps scroll-progress 1.0 directly onto
      // that same 2.65 mark, so the last card finished exactly as the
      // section unpinned — no hold, it just ended right after the phone.
      // This hold needs to be a clearly noticeable stretch of the green
      // stage sitting fully settled before the page moves on to the
      // next (coral-accented) section, not a token pause.
      tl.to({}, { duration: 1.5 });
    }, sectionRef);

    // Web fonts (and anything else) finishing layout after this effect's
    // initial measurement would leave the pinned position calculated
    // against stale geometry — refreshing once everything has settled
    // re-measures and re-anchors it, which is what prevents the whole
    // pinned block (phone + text) from drifting during real scrolling.
    const refresh = () => ScrollTrigger.refresh();
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(refresh);
    }
    window.addEventListener("load", refresh);

    return () => {
      ctx.revert();
      window.removeEventListener("load", refresh);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <section className="px-4 py-24 lg:py-32 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: "var(--numi-landing-tagline)" }}>Analytics</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--numi-text)] leading-tight mb-4">
              Every number, one glance away
            </h2>
            <p className="text-base text-[var(--numi-text-2)] leading-relaxed max-w-md">
              Health score, net worth, savings rate — the metrics that actually matter, always in view.
            </p>
          </div>

          <div className="relative flex items-center justify-center" style={{ minHeight: 720 }}>
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none" style={{ background: GREEN_BG }} />
            {CARDS.map((card) => (
              <div
                key={card.label}
                className="absolute w-[170px] rounded-2xl bg-white p-4 shadow-lg"
                style={{ left: "50%", top: "50%", marginLeft: -85 + card.targetX, marginTop: -50 + card.targetY }}
              >
                <p className="text-xs font-medium text-[var(--numi-text-3)]">{card.label}</p>
                <p className="text-2xl font-bold text-[var(--numi-text)]">{card.value}</p>
                <p className="text-[11px] text-[var(--numi-text-3)]">{card.sub}</p>
              </div>
            ))}
            <div className="relative z-10" style={{ transform: "scale(0.6)" }}>
              <PhoneFrame>
                {CHAT_MESSAGES.map((text) => (
                  <div key={text} className="self-start max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-snug bg-[#F7EEE4] text-[var(--numi-landing-heading)]">
                    {text}
                  </div>
                ))}
              </PhoneFrame>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative px-4 py-24 lg:py-32 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Static — no ref, no tween ever targets this column. */}
        <div>
          <p className="text-sm font-semibold mb-3" style={{ color: "var(--numi-landing-tagline)" }}>Analytics</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-[var(--numi-text)] leading-tight mb-4">
            Every number, one glance away
          </h2>
          <p className="text-base text-[var(--numi-text-2)] leading-relaxed max-w-md">
            Health score, net worth, savings rate — the metrics that actually matter, always in view.
          </p>
        </div>

        <div ref={stageRef} className="relative flex items-center justify-center" style={{ minHeight: 720 }}>
          {/* Only the green panel is clipped to the rounded stage — cards
              are free to spread past its edges without getting cut off. */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div
              ref={greenPanelRef}
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: GREEN_BG, willChange: "transform" }}
            />
          </div>

          {CARDS.map((card, i) => (
            <div
              key={card.label}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="absolute z-10 w-[170px] rounded-2xl bg-white p-4 shadow-lg"
              style={{ left: "50%", top: "50%", marginLeft: -85, marginTop: -50, willChange: "transform, opacity" }}
            >
              <p className="text-xs font-medium text-[var(--numi-text-3)]">{card.label}</p>
              <p className="text-2xl font-bold text-[var(--numi-text)]">{card.value}</p>
              <p className="text-[11px] text-[var(--numi-text-3)]">{card.sub}</p>
            </div>
          ))}

          <div ref={phoneRef} className="relative z-20" style={{ willChange: "transform" }}>
            <PhoneFrame>
              {CHAT_MESSAGES.map((text, i) => (
                <div
                  key={text}
                  ref={(el) => { messageRefs.current[i] = el; }}
                  className="self-start max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-snug bg-[#F7EEE4] text-[var(--numi-landing-heading)]"
                  style={{ willChange: "transform, opacity" }}
                >
                  {text}
                </div>
              ))}
            </PhoneFrame>
          </div>
        </div>
      </div>
    </section>
  );
}
