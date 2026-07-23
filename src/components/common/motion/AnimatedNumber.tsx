"use client";

import { animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/lib/utils/currency";

interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  format = formatCurrency,
  duration = 0.8,
  className,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const controls = animate(prevValue.current, value, {
      duration: prefersReducedMotion ? 0 : duration,
      ease: [0.25, 0.46, 0.45, 0.94],
      onUpdate: (latest) => setDisplay(latest),
    });
    prevValue.current = value;

    return () => controls.stop();
  }, [value, duration]);

  return <span className={className}>{format(display)}</span>;
}
