"use client";

import { motion } from "framer-motion";
import type { OrbStatus } from "./orbStatus";

const GRADIENTS: Record<OrbStatus, string> = {
  good: "var(--numi-gradient-cool)",
  warning: "var(--numi-gradient-warm)",
  alert: "var(--numi-gradient-alert)",
};

interface AIOrbProps {
  status?: OrbStatus;
  size?: number;
  className?: string;
}

export function AIOrb({ status = "good", size = 48, className }: AIOrbProps) {
  const gradient = GRADIENTS[status];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: gradient, filter: "blur(10px)" }}
        animate={{ opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 3, repeat: Infinity, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
      <motion.div
        className="relative rounded-full"
        style={{ width: size * 0.7, height: size * 0.7, background: gradient }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
    </div>
  );
}
