"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/components/common/motion/usePrefersReducedMotion";

const X_POINTS = [-100, 220, 540, 860, 1180, 1500, 1820];
const BASELINE = 250;
const AMPLITUDE = 150;
const SEGMENT_PHASE_STEP = 1.1;

/** One undulating curve through X_POINTS — control points offset by `phase`
 * so consecutive keyframes ripple like a worm/wave crawling, not just a
 * rigid shape sliding sideways. */
function buildPath(phase: number) {
  let d = `M${X_POINTS[0]} ${BASELINE + AMPLITUDE * Math.sin(phase)}`;
  for (let i = 0; i < X_POINTS.length - 1; i++) {
    const x0 = X_POINTS[i];
    const x1 = X_POINTS[i + 1];
    const cp1x = x0 + (x1 - x0) / 3;
    const cp2x = x0 + (2 * (x1 - x0)) / 3;
    const y1 = BASELINE + AMPLITUDE * Math.sin(phase + (i + 1) * SEGMENT_PHASE_STEP);
    const cpY = BASELINE + AMPLITUDE * 1.3 * Math.sin(phase + (i + 0.5) * SEGMENT_PHASE_STEP);
    d += ` C${cp1x} ${cpY} ${cp2x} ${cpY} ${x1} ${y1}`;
  }
  return d;
}

const PHASES = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2, 2 * Math.PI];
const PATH_KEYFRAMES = PHASES.map(buildPath);

/**
 * A single wavy line that wiggles like a worm/wave crawling across the
 * hero — the path shape itself morphs (not just translated), by
 * animating the SVG `d` attribute between several undulating states.
 */
export function OrganicWave() {
  const reducedMotion = usePrefersReducedMotion();
  // Rendered client-only: this element doesn't exist in the SSR output at
  // all, and the first client render (mounted=false) also renders nothing —
  // so there's nothing for React to diff during hydration. Once mounted,
  // swapping in the real content is a normal client-side update, not
  // subject to hydration comparison.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div aria-hidden="true" className="numi-hero-wave">
      <svg
        viewBox="0 0 1440 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-[320px] w-full h-[420px]"
      >
        {reducedMotion ? (
          <path d={PATH_KEYFRAMES[0]} stroke="currentColor" strokeWidth="140" strokeLinecap="round" />
        ) : (
          <motion.path
            initial={false}
            animate={{ d: PATH_KEYFRAMES }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            d={PATH_KEYFRAMES[0]}
            stroke="currentColor"
            strokeWidth="140"
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
}
