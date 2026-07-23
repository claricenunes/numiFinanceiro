"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useToastStore } from "@/stores/useToastStore";
import type { ToastType } from "@/stores/useToastStore";

const STYLE: Record<ToastType, { bg: string; border: string; color: string; symbol: string }> = {
  success: { bg: "rgba(16,185,129,0.14)",  border: "rgba(16,185,129,0.3)",  color: "#10B981", symbol: "✓" },
  error:   { bg: "rgba(239,68,68,0.14)",   border: "rgba(239,68,68,0.3)",   color: "#EF4444", symbol: "✕" },
  warning: { bg: "rgba(245,158,11,0.14)",  border: "rgba(245,158,11,0.3)",  color: "#F59E0B", symbol: "!" },
  info:    { bg: "rgba(59,130,246,0.14)",  border: "rgba(59,130,246,0.3)",  color: "#3B82F6", symbol: "i" },
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
              style={{ background: `linear-gradient(${s.bg}, ${s.bg}), var(--numi-elevated)`, border: `1px solid ${s.border}` }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: s.border, color: s.color }}
              >
                {s.symbol}
              </span>
              <p className="text-sm font-medium text-[var(--numi-text)] leading-snug">{t.message}</p>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
