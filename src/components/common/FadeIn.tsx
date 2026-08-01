"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_OUT_EXPO } from "./motion/Reveal";

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
  y = 16,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, ease: EASE_OUT_EXPO, delay }}
    >
      {children}
    </motion.div>
  );
}
