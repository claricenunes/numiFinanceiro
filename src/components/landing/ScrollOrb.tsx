"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState, type RefObject } from "react";
import { AIOrb, type OrbStatus } from "@/components/mascot/AIOrb";

const STEPS: { status: OrbStatus; message: string }[] = [
  { status: "good",    message: "Oi! Eu sou a IA do Numi." },
  { status: "warning", message: "Detectei um padrão nos seus gastos." },
  { status: "good",    message: "Agora seu dinheiro trabalha com você." },
];

export function ScrollOrb({ containerRef }: { containerRef: RefObject<HTMLElement | null> }) {
  const [step, setStep] = useState(0);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = v < 0.33 ? 0 : v < 0.66 ? 1 : 2;
    setStep((prev) => (prev === next ? prev : next));
  });

  const current = STEPS[step];

  return (
    <div className="hidden lg:flex sticky top-28 self-start flex-col items-center gap-3 shrink-0 z-20">
      <AIOrb status={current.status} size={56} />
      <AnimatePresence mode="wait">
        <motion.p
          key={current.message}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-xs text-center max-w-[140px] text-[var(--numi-text-2)] leading-snug"
        >
          {current.message}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
