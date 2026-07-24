"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const DIRECTION_OFFSET: Record<"up" | "left" | "right", { x?: number; y?: number }> = {
  up: { y: 12 },
  left: { x: -12 },
  right: { x: 12 },
};

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
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94], delay }}
    >
      {children}
    </motion.div>
  );
}
