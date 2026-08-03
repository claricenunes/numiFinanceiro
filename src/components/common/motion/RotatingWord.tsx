"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface RotatingWordProps {
  words: string[];
  interval?: number;
  className?: string;
  /** Texto fixo que acompanha a palavra (ex.: pontuação), na cor padrão do texto ao redor. */
  suffix?: string;
}

export function RotatingWord({ words, interval = 2200, className, suffix = "" }: RotatingWordProps) {
  const [index, setIndex] = useState(0);
  // The very first word must render visible immediately — it's often
  // above the fold — so it skips the entrance animation entirely rather
  // than depending on a mount-triggered transition to reach opacity:1.
  // Only words swapped in later (via the interval) animate.
  const [isFirst, setIsFirst] = useState(true);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
      setIsFirst(false);
    }, interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  const longest = words.reduce((a, b) => (a.length > b.length ? a : b));

  return (
    <span className="relative inline-grid align-bottom text-center">
      {/* Reserva a largura da maior palavra para não "pular" o layout */}
      <span className="invisible col-start-1 row-start-1 whitespace-nowrap" aria-hidden="true">
        <span className={className}>{longest}</span>{suffix}
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          className="col-start-1 row-start-1 whitespace-nowrap"
          initial={isFirst ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className={className}>{words[index]}</span>{suffix}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
