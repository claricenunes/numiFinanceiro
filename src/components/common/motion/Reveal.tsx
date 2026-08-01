"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const DIRECTION_OFFSET: Record<"up" | "left" | "right", { x?: number; y?: number }> = {
  up: { y: 24 },
  left: { x: -24 },
  right: { x: 24 },
};

/** ease-out-expo — the "decelerating" curve used across all scroll-reveal motion. */
export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
  /** false = a revelação recomeça toda vez que o elemento volta a entrar na tela. */
  once?: boolean;
}) {
  const offset = DIRECTION_OFFSET[direction];

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: 0.15 }}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay }}
    >
      {children}
    </motion.div>
  );
}
