"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/components/common/motion/usePrefersReducedMotion";

const BLOBS = [
  {
    className: "w-[560px] h-[560px] -left-40 -top-40",
    color: "var(--numi-landing-accent)",
    opacity: 0.28,
    animate: { x: [0, 60, -20, 0], y: [0, 40, -30, 0], scale: [1, 1.08, 0.96, 1] },
    duration: 22,
  },
  {
    className: "w-[620px] h-[620px] right-[-160px] top-10",
    color: "var(--numi-landing-tagline)",
    opacity: 0.16,
    animate: { x: [0, -50, 30, 0], y: [0, 50, 10, 0], scale: [1, 0.94, 1.06, 1] },
    duration: 26,
  },
  {
    className: "w-[480px] h-[480px] left-1/3 top-[650px]",
    color: "var(--numi-landing-nav-bg)",
    opacity: 0.1,
    animate: { x: [0, 40, -40, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1] },
    duration: 30,
  },
];

/**
 * Soft, slow-drifting gradient blobs behind the whole hero band (nav +
 * hero + trust badges) — gives the pastel background a living, "site
 * built in Framer" feel instead of sitting completely static.
 */
export function AnimatedHeroBackground() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {BLOBS.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl ${blob.className}`}
          style={{ background: blob.color, opacity: blob.opacity }}
          animate={reducedMotion ? undefined : blob.animate}
          transition={{ duration: blob.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
