"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  onClose:    () => void;
  title:      string;
  titleId?:   string;
  maxWidth?:  string;
  children:   ReactNode;
  /** Extra style applied to the panel (e.g. `maxHeight`, `overflowY`) */
  panelStyle?: React.CSSProperties;
}

/**
 * Accessible modal shell — focus trap, Escape key, aria-modal.
 * Renders a backdrop + centered (desktop) / bottom-sheet (mobile) panel.
 */
export function Modal({
  onClose,
  title,
  titleId  = "modal-title",
  maxWidth = "sm:max-w-md",
  panelStyle,
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  /* ── Focus trap + Escape ────────────────────────────── */
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    const FOCUSABLE =
      'a[href], button:not([disabled]), input:not([disabled]), ' +
      'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    // Auto-focus first element
    const focusable = () => Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first     = focusable()[0];
    // Short delay so CSS transition doesn't fight focus
    const raf = requestAnimationFrame(() => first?.focus());

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key !== "Tab") return;

      const els  = focusable();
      const fst  = els[0];
      const lst  = els[els.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === fst) { e.preventDefault(); lst?.focus(); }
      } else {
        if (document.activeElement === lst) { e.preventDefault(); fst?.focus(); }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const merged: React.CSSProperties = {
    background:  "#0F1B2D",
    border:      "1px solid #1E2D45",
    maxHeight:   "92dvh",
    overflowY:   "auto",
    ...panelStyle,
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`relative w-full ${maxWidth} rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4`}
        style={merged}
      >
        {/* Header row */}
        <div className="flex items-center justify-between">
          <h2 id={titleId} className="text-base font-semibold text-[#F1F5F9]">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#1E2D45] transition-colors"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
