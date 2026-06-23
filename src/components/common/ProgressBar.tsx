"use client";

import { motion } from "framer-motion";

export function ProgressBar({
  percent,
  color,
  height = 6,
  delay = 0.1,
}: {
  percent: number;
  color: string;
  height?: number;
  delay?: number;
}) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <div
      className="rounded-full overflow-hidden"
      style={{ height, background: "#1E2D45" }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay }}
      />
    </div>
  );
}
