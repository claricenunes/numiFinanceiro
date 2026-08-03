"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/components/common/motion/usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Same shared secondary-green "stage" identity used by Hero's showcase
// overlay and AnalyticsScrollSection — a third brand moment reusing the
// same surface instead of inventing a new color for this one section.
const STAGE_BG = "#32453A";

const STATEMENT = "Understand your money. Master your future.";

/**
 * A single giant statement that crosses the screen horizontally, pinned
 * and scrubbed 1:1 with scroll (GSAP ScrollTrigger) — a "brand moment"
 * pause between two content sections, shorter than the Hero/Analytics
 * showcases but with enough scrub distance that the traverse doesn't
 * feel rushed. The section is a 100vh pin with 250vh of extra scrub.
 */
export function HorizontalStatementSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    if (reducedMotion) return;
    if (!sectionRef.current || !trackRef.current) return;

    const ctx = gsap.context(() => {
      const track = trackRef.current;
      if (!track) return;

      const vw = window.innerWidth;
      // Offset relative to the VIEWPORT, not the text's own rendered
      // width — the phrase is many viewport-widths wide at this font
      // size, so scaling the start offset off scrollWidth (the old bug)
      // skipped straight to a middle/later chunk of the sentence, making
      // it look like it started mid-way through instead of near its own
      // beginning. A small viewport-relative clip means the visible
      // start is genuinely close to the first word, just cropped a bit
      // by the left edge — and it still travels far enough right that
      // its own left edge clears the viewport's right edge, so the
      // whole line has fully exited before the pin releases.
      const startX = -vw * 0.2;
      const endX = vw;

      gsap.set(track, { x: startX });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${window.innerHeight * 2.5}`,
          scrub: true,
          pin: true,
          invalidateOnRefresh: true,
        },
      });

      // Every tween below needs an explicit `duration` — GSAP defaults to
      // 0.5 for any tween that omits one, which used to leave the x-move
      // (no duration set) finishing at the timeline's halfway point while
      // the opacity fade-out tween further down assumed a full 0-to-1
      // timeline. That mismatch meant the text finished its whole
      // left-to-right traverse after only half the scrub range, then sat
      // there fully exited (and invisible) for the entire second half —
      // a long dead stretch of scrolling that read as broken. Giving the
      // x tween the same duration:1 as the timeline's real span keeps
      // position and opacity moving together across the whole scrub.
      tl.fromTo(track, { x: startX }, { x: endX, ease: "none", duration: 1 }, 0);
      // A soft opacity ramp at both ends — the line doesn't hard-cut the
      // instant the pin engages or releases, it eases in/out of view.
      tl.fromTo(track, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.15 }, 0);
      tl.to(track, { opacity: 0, ease: "none", duration: 0.15 }, 0.85);
    }, sectionRef);

    const refresh = () => ScrollTrigger.refresh();
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(refresh);
    }
    window.addEventListener("load", refresh);
    window.addEventListener("resize", refresh);

    return () => {
      ctx.revert();
      window.removeEventListener("load", refresh);
      window.removeEventListener("resize", refresh);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <section
        className="flex items-center justify-center px-6 py-32 overflow-hidden"
        style={{ background: STAGE_BG }}
      >
        <p
          className="font-black text-center leading-none tracking-tight"
          style={{ color: "var(--numi-landing-nav-text)", fontSize: "clamp(2rem, 7vw, 6rem)" }}
        >
          {STATEMENT}
        </p>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative h-screen overflow-hidden flex items-center"
      style={{ background: STAGE_BG }}
    >
      <div
        ref={trackRef}
        className="absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap will-change-transform"
      >
        <span
          className="font-black leading-none tracking-tight"
          style={{ color: "var(--numi-landing-nav-text)", fontSize: "clamp(2.5rem, 11vw, 9rem)" }}
        >
          {STATEMENT}
        </span>
      </div>
    </section>
  );
}
