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
const ACCENT = "var(--numi-landing-accent)";

type ChartKind = "ring" | "spark" | "bar" | "compare" | "dots";

interface MetricDef {
  label: string;
  chart: ChartKind;
  caption: string;
  value?: number;
  compareA?: number;
  compareB?: number;
}

// Same four metrics drive both the chat bubbles and the cards — a
// message's chart is a small preview, the matching card is its
// "expanded" chart, reinforcing that each message is what prompts its
// card to slide out from behind the phone.
const METRICS: MetricDef[] = [
  { label: "Food spending", chart: "compare", caption: "$780 this month", compareA: 620, compareB: 780 },
  { label: "Savings rate", chart: "bar", caption: "49% of income", value: 49 },
  { label: "Net worth", chart: "spark", caption: "$24,380 (+3.2%)" },
  { label: "Insights ready", chart: "dots", caption: "3 ready to review", value: 3 },
];

const CARD_POSITIONS: { targetX: number; targetY: number }[] = [
  { targetX: -280, targetY: -140 },
  { targetX: -300, targetY: 150 },
  { targetX: 280, targetY: -160 },
  { targetX: 300, targetY: 140 },
];

function Ring({ value, size = 56 }: { value: number; size?: number }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 shrink-0" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="6" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={ACCENT}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value / 100)}
      />
    </svg>
  );
}

function Spark({ width = 120, height = 36 }: { width?: number; height?: number }) {
  return (
    <svg viewBox="0 0 100 34" width={width} height={height} preserveAspectRatio="none" className="shrink-0" aria-hidden="true">
      <polyline
        points="0,30 20,25 38,22 55,14 72,16 100,3"
        fill="none"
        stroke={ACCENT}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Bar({ value, width }: { value: number; width?: string }) {
  return (
    <div className="h-2.5 rounded-full overflow-hidden shrink-0" style={{ width: width ?? "100%", background: "rgba(0,0,0,0.07)" }}>
      <div className="h-full rounded-full" style={{ width: `${value}%`, background: ACCENT }} />
    </div>
  );
}

function Compare({ a, b, height = 40 }: { a: number; b: number; height?: number }) {
  const max = Math.max(a, b);
  return (
    <div className="flex items-end gap-2 shrink-0" style={{ height, width: 72 }}>
      <div className="flex-1 rounded-t-sm" style={{ height: `${(a / max) * 100}%`, background: "rgba(0,0,0,0.12)" }} />
      <div className="flex-1 rounded-t-sm" style={{ height: `${(b / max) * 100}%`, background: ACCENT }} />
    </div>
  );
}

function Dots({ filled, total = 5 }: { filled: number; total?: number }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: i < filled ? ACCENT : "rgba(0,0,0,0.1)" }} />
      ))}
    </div>
  );
}

function Chart({ metric, size = "md" }: { metric: MetricDef; size?: "sm" | "md" }) {
  switch (metric.chart) {
    case "ring":
      return <Ring value={metric.value ?? 0} size={size === "sm" ? 48 : 64} />;
    case "spark":
      return <Spark width={size === "sm" ? 100 : 130} height={size === "sm" ? 30 : 38} />;
    case "bar":
      return <Bar value={metric.value ?? 0} />;
    case "compare":
      return <Compare a={metric.compareA ?? 1} b={metric.compareB ?? 1} height={size === "sm" ? 32 : 44} />;
    case "dots":
      return <Dots filled={metric.value ?? 0} />;
  }
}

/**
 * Scroll-linked showcase (GSAP ScrollTrigger, scrub): the green stage
 * behind the phone rises to cover the previous background while the
 * phone shrinks; data cards emerge from directly behind the phone
 * (opacity 0/scale 0.8 → opacity 1/scale 1, sliding out to their spread
 * positions) and the chat reveals internally. Both the chat bubbles and
 * the cards are chart-first (a mini graphic + a short caption) rather
 * than sentences — the message is a small preview of the same chart its
 * matching card shows larger. The left copy column is untouched by any
 * of this — no tween ever targets it.
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
      CARD_POSITIONS.forEach((pos, i) => {
        tl.to(
          cardRefs.current[i],
          { opacity: 1, scale: 1, x: pos.targetX, y: pos.targetY, ease: "none", duration: 0.9 },
          0.7 + i * 0.35
        );
      });

      METRICS.forEach((_, i) => {
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
            {METRICS.map((metric, i) => (
              <div
                key={metric.label}
                className="absolute w-[170px] rounded-2xl bg-white p-4 shadow-lg flex flex-col gap-2.5"
                style={{
                  left: "50%",
                  top: "50%",
                  marginLeft: -85 + CARD_POSITIONS[i].targetX,
                  marginTop: -60 + CARD_POSITIONS[i].targetY,
                }}
              >
                <p className="text-xs font-medium text-[var(--numi-text-3)]">{metric.label}</p>
                <Chart metric={metric} />
                <p className="text-[11px] font-semibold text-[var(--numi-text)]">{metric.caption}</p>
              </div>
            ))}
            <div className="relative z-10" style={{ transform: "scale(0.6)" }}>
              <PhoneFrame>
                {METRICS.map((metric) => (
                  <div
                    key={metric.label}
                    className="self-start max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 flex flex-col gap-2 bg-[#F7EEE4]"
                  >
                    <p className="text-[11px] font-medium text-[var(--numi-landing-heading)]/70">{metric.label}</p>
                    <Chart metric={metric} size="sm" />
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

          {METRICS.map((metric, i) => (
            <div
              key={metric.label}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="absolute z-10 w-[170px] rounded-2xl bg-white p-4 shadow-lg flex flex-col gap-2.5"
              style={{ left: "50%", top: "50%", marginLeft: -85, marginTop: -60, willChange: "transform, opacity" }}
            >
              <p className="text-xs font-medium text-[var(--numi-text-3)]">{metric.label}</p>
              <Chart metric={metric} />
              <p className="text-[11px] font-semibold text-[var(--numi-text)]">{metric.caption}</p>
            </div>
          ))}

          <div ref={phoneRef} className="relative z-20" style={{ willChange: "transform" }}>
            <PhoneFrame>
              {METRICS.map((metric, i) => (
                <div
                  key={metric.label}
                  ref={(el) => { messageRefs.current[i] = el; }}
                  className="self-start max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 flex flex-col gap-2 bg-[#F7EEE4]"
                  style={{ willChange: "transform, opacity" }}
                >
                  <p className="text-[11px] font-medium text-[var(--numi-landing-heading)]/70">{metric.label}</p>
                  <Chart metric={metric} size="sm" />
                </div>
              ))}
            </PhoneFrame>
          </div>
        </div>
      </div>
    </section>
  );
}
