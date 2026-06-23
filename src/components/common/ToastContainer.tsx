"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useToastStore } from "@/stores/useToastStore";
import type { ToastType } from "@/stores/useToastStore";

const STYLE: Record<ToastType, { bg: string; border: string; color: string; symbol: string }> = {
  success: { bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.28)",  color: "#34D399", symbol: "✓" },
  error:   { bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.28)", color: "#F87171", symbol: "✕" },
  warning: { bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.28)",  color: "#FBBF24", symbol: "!" },
  info:    { bg: "rgba(56,189,248,0.12)",  border: "rgba(56,189,248,0.28)",  color: "#38BDF8", symbol: "i" },
};

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 z-[999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const s = STYLE[t.type];
          return (
            <motion.button
              key={t.id}
              layout
              initial={{ opacity: 0, x: 56, scale: 0.88 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 56, scale: 0.88 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              onClick={() => dismiss(t.id)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-left pointer-events-auto max-w-xs shadow-2xl"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: s.border, color: s.color }}
              >
                {s.symbol}
              </span>
              <p className="text-sm font-medium text-[#F1F5F9] leading-snug">{t.message}</p>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
