"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId?: string;
  maxWidth?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Accessible modal shell — focus trap, Escape key, aria-modal, real
 * enter/exit motion (spring). Bottom-sheet on mobile, centered on desktop.
 */
export function Modal({ open, onClose, title, titleId = "modal-title", maxWidth = "sm:max-w-md", children, footer }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = panelRef.current;
    if (!el) return;

    const FOCUSABLE =
      'a[href], button:not([disabled]), input:not([disabled]), ' +
      'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const focusable = () => Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
    const raf = requestAnimationFrame(() => focusable()[0]?.focus());

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key !== "Tab") return;
      const els = focusable();
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />

          <motion.div
            ref={panelRef}
            className={`glass-card relative w-full ${maxWidth} rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 flex flex-col gap-4`}
            style={{ background: "var(--numi-modal)", maxHeight: "92dvh", overflowY: "auto" }}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
          >
            <div className="flex items-center justify-between">
              <h2 id={titleId} className="text-base font-semibold" style={{ color: "var(--numi-landing-heading)" }}>
                {title}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--numi-text-3)] hover:text-[var(--numi-landing-heading)] hover:bg-[color-mix(in_srgb,var(--numi-landing-heading)_6%,transparent)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {children}

            {footer && <div className="flex items-center gap-2 pt-2">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
