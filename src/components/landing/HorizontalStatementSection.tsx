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
 * feel rushed. The scrub distance is derived from the measured travel
 * distance (see `end` below), not a fixed vh number.
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
      const section = sectionRef.current;
      if (!track || !section) return;

      const vw = window.innerWidth;
      // Right-to-left, like the tellet.ai reference: the line starts
      // fully off-screen to the right (its own leftmost/first character
      // sits exactly at the right edge, so nothing is visible yet) and
      // ends fully off-screen to the left (its own rightmost/last
      // character has cleared the left edge). Anchoring both ends to a
      // single edge of the track (its own x=0 point) rather than mixing
      // in scrollWidth-based offsets keeps the reveal monotonic — every
      // character becomes visible in normal reading order as it slides
      // through, never jumping into a later or earlier chunk first.
      const startX = vw;
      const endX = -track.scrollWidth;
      const travelDistance = startX - endX;

      gsap.set(track, { x: startX });

      // Scrub distance is derived from the actual measured travel
      // distance (not a fixed vh number) — a full off-screen-to-off-
      // screen traverse covers a lot more ground than a partial-clip
      // version would, and a fixed scrub range tuned for a shorter
      // distance made this finish (and unpin) early, well before the
      // scroll range was used up. The 1.3 ratio matches the pace
      // already established as comfortable (~2250px of scroll for
      // ~1728px of travel) — scaling it keeps that same feel
      // regardless of viewport width or font-size clamp.
      const end = travelDistance * 1.3;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${end}`,
          scrub: true,
          pin: true,
          invalidateOnRefresh: true,
        },
      });

      // Every tween below needs an explicit `duration` — GSAP defaults
      // to 0.5 for any tween that omits one, which used to leave the
      // x-move (no duration set) finishing at the timeline's halfway
      // point while the opacity fade-out tween further down assumed a
      // full 0-to-1 timeline. That mismatch meant the text finished
      // its whole traverse after only half the scrub range, then sat
      // there fully exited (and invisible) for the entire second half
      // — a long dead stretch of scrolling that read as broken. Giving
      // the x tween the same duration:1 as the timeline's real span
      // keeps position and opacity moving together across the whole
      // scrub.
      tl.fromTo(track, { x: startX }, { x: endX, ease: "none", duration: 1 }, 0);
      // A soft opacity ramp at both ends — the line doesn't hard-cut
      // the instant the pin engages or releases, it eases in/out.
      tl.fromTo(track, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.15 }, 0);
      tl.to(track, { opacity: 0, ease: "none", duration: 0.15 }, 0.85);
    }, sectionRef);

    // Refreshing once fonts settle recalculates every ScrollTrigger on
    // the page (including this one and any others further down, like
    // AnalyticsScrollSection) against final, web-font-accurate layout —
    // a cheap safety net, not a reason to defer building the timeline
    // itself (that caused its own problems: React's dev-mode StrictMode
    // double-invokes effects, and a deferred setup risks the first
    // invocation's cleanup firing before its own setup ever runs).
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
