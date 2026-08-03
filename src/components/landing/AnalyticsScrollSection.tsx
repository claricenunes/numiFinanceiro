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

type ChartKind = "ring" | "spark" | "bar" | "compare";

interface MetricDef {
  label: string;
  chart: ChartKind;
  caption: string;
  value?: number;
  compareA?: number;
  compareB?: number;
}

// The phone shows a compact dashboard summary — not a chat — since the
// real mobile dashboard screen doesn't exist yet; this is a stand-in
// mockup of "what it'll roughly show", built from the same chart
// primitives as the cards that slide out from behind it. Each row here
// has a matching card (same order) that reveals alongside it; CARDS has
// one extra entry (cash flow) that reveals last, as a bonus beat once
// the phone's own rows have all settled.
const DASHBOARD_ROWS: MetricDef[] = [
  { label: "Financial health", chart: "ring", caption: "82 / 100", value: 82 },
  { label: "Net worth", chart: "spark", caption: "$24,380" },
  { label: "Savings rate", chart: "bar", caption: "49% of income", value: 49 },
  { label: "Spending", chart: "compare", caption: "$780 this month", compareA: 620, compareB: 780 },
];

const CARDS: (MetricDef & { targetX: number; targetY: number })[] = [
  { ...DASHBOARD_ROWS[0], label: "Health score", targetX: -280, targetY: -140 },
  { ...DASHBOARD_ROWS[3], label: "Food spending", targetX: -300, targetY: 150 },
  { ...DASHBOARD_ROWS[1], targetX: 280, targetY: -160 },
  { ...DASHBOARD_ROWS[2], targetX: 300, targetY: 140 },
  { label: "Cash flow", chart: "compare", caption: "$6,200 in · $3,140 out", compareA: 3140, compareB: 6200, targetX: 0, targetY: -240 },
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

function Chart({ metric, size = "md" }: { metric: MetricDef; size?: "sm" | "md" }) {
  switch (metric.chart) {
    case "ring":
      return <Ring value={metric.value ?? 0} size={size === "sm" ? 48 : 64} />;
    case "spark":
      return <Spark width={size === "sm" ? 88 : 130} height={size === "sm" ? 28 : 38} />;
    case "bar":
      return <Bar value={metric.value ?? 0} width={size === "sm" ? "72px" : "100%"} />;
    case "compare":
      return <Compare a={metric.compareA ?? 1} b={metric.compareB ?? 1} height={size === "sm" ? 32 : 44} />;
  }
}

const PHONE_HEADER = (
  <>
    <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: "var(--numi-landing-nav-bg)" }}>
      N
    </div>
    <span className="text-sm font-semibold text-[var(--numi-landing-heading)]">Dashboard</span>
    <span className="ml-auto text-xs" style={{ color: "var(--numi-landing-heading)", opacity: 0.5 }}>
      This month
    </span>
  </>
);

/**
 * Scroll-linked showcase (GSAP ScrollTrigger, scrub): the green stage
 * behind the phone rises to cover the previous background while the
 * phone shrinks; data cards emerge from directly behind the phone
 * (opacity 0/scale 0.8 → opacity 1/scale 1, sliding out to their spread
 * positions) and the phone's own dashboard rows reveal in parallel. The
 * phone shows a compact dashboard summary (not a chat) — a stand-in for
 * the real mobile dashboard screen, which doesn't exist yet. The left
 * copy column is untouched by any of this — no tween ever targets it.
 */
export function AnalyticsScrollSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const greenPanelRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    if (reducedMotion) return;
    if (!sectionRef.current || !stageRef.current) return;

    const ctx = gsap.context(() => {
      const cards = cardRefs.current.filter((el): el is HTMLDivElement => el !== null);
      const rows = rowRefs.current.filter((el): el is HTMLDivElement => el !== null);

      gsap.set(greenPanelRef.current, { yPercent: 100 });
      // transformOrigin + explicit x/y lock the phone's center to a fixed
      // point — scale is the only property this element's tween ever sets,
      // and x/y are pinned at 0 on every frame so nothing (this tween or
      // otherwise) can introduce vertical drift.
      gsap.set(phoneRef.current, { scale: 1, x: 0, y: 0, transformOrigin: "50% 50%" });
      gsap.set(cards, { opacity: 0, scale: 0.8, x: 0, y: 0 });
      gsap.set(rows, { opacity: 0, y: 20 });

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

      // Phase 2: the first 4 cards emerge from behind the phone in sync
      // with their matching dashboard row settling inside it.
      CARDS.slice(0, 4).forEach((card, i) => {
        tl.to(cardRefs.current[i], { opacity: 1, scale: 1, x: card.targetX, y: card.targetY, ease: "none", duration: 0.9 }, 0.7 + i * 0.35);
      });
      DASHBOARD_ROWS.forEach((_, i) => {
        tl.to(rowRefs.current[i], { opacity: 1, y: 0, ease: "none", duration: 0.5 }, 0.9 + i * 0.3);
      });

      // The 5th card (cash flow) has no row inside the phone — it's a
      // bonus beat that slides out once the four paired reveals settle.
      tl.to(cardRefs.current[4], { opacity: 1, scale: 1, x: CARDS[4].targetX, y: CARDS[4].targetY, ease: "none", duration: 0.9 }, 2.5);

      // Padding tween — animates nothing, just extends the timeline's
      // total duration past the last real tween. Without it, scrub maps
      // scroll-progress 1.0 directly onto the last card's finish, so the
      // section unpins immediately after — no hold. This hold needs to
      // be a clearly noticeable stretch of the green stage sitting fully
      // settled before the page moves on, not a token pause.
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

  const dashboardScreen = (
    <PhoneFrame header={PHONE_HEADER} footer={false} contentClassName="flex-1 min-h-0 px-5 py-2 flex flex-col overflow-hidden">
      {DASHBOARD_ROWS.map((row, i) => (
        <div
          key={row.label}
          ref={reducedMotion ? undefined : (el) => { rowRefs.current[i] = el; }}
          className={`flex items-center justify-between gap-3 py-4 ${i < DASHBOARD_ROWS.length - 1 ? "border-b border-black/5" : ""}`}
        >
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-xs font-medium text-[var(--numi-landing-heading)]/60 truncate">{row.label}</p>
            <p className="text-sm font-semibold text-[var(--numi-landing-heading)] truncate">{row.caption}</p>
          </div>
          <Chart metric={row} size="sm" />
        </div>
      ))}
    </PhoneFrame>
  );

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

          <div className="relative flex items-center justify-center pt-16" style={{ minHeight: 720 }}>
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none" style={{ background: GREEN_BG }} />
            {CARDS.map((card) => (
              <div
                key={card.label}
                className="absolute w-[170px] rounded-2xl bg-white p-4 shadow-lg flex flex-col gap-2.5"
                style={{ left: "50%", top: "50%", marginLeft: -85 + card.targetX, marginTop: -60 + card.targetY }}
              >
                <p className="text-xs font-medium text-[var(--numi-text-3)]">{card.label}</p>
                <Chart metric={card} />
                <p className="text-[11px] font-semibold text-[var(--numi-text)]">{card.caption}</p>
              </div>
            ))}
            <div className="relative z-10" style={{ transform: "scale(0.6)" }}>
              {dashboardScreen}
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

        <div ref={stageRef} className="relative flex items-center justify-center pt-16" style={{ minHeight: 720 }}>
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
              className="absolute z-10 w-[170px] rounded-2xl bg-white p-4 shadow-lg flex flex-col gap-2.5"
              style={{ left: "50%", top: "50%", marginLeft: -85, marginTop: -60, willChange: "transform, opacity" }}
            >
              <p className="text-xs font-medium text-[var(--numi-text-3)]">{card.label}</p>
              <Chart metric={card} />
              <p className="text-[11px] font-semibold text-[var(--numi-text)]">{card.caption}</p>
            </div>
          ))}

          <div ref={phoneRef} className="relative z-20" style={{ willChange: "transform" }}>
            {dashboardScreen}
          </div>
        </div>
      </div>
    </section>
  );
}
