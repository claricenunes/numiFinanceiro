"use client";

import { useState, useRef, useEffect } from "react";
import { usePeriodStore } from "@/stores/usePeriodStore";
import type { PeriodType } from "@/types/app";

const PRESETS: { type: PeriodType; label: string }[] = [
  { type: "current_month", label: "Este mês" },
  { type: "last_30_days", label: "Últimos 30 dias" },
  { type: "last_90_days", label: "Últimos 90 dias" },
  { type: "this_year", label: "Este ano" },
];

export function PeriodSelector() {
  const { period, setPeriodType } = usePeriodStore();
  const [open, setOpen] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function select(type: PeriodType) {
    setPeriodType(type);
    setShowCustom(false);
    setOpen(false);
  }

  function applyCustom() {
    if (customStart && customEnd) {
      setPeriodType("custom", { start: customStart, end: customEnd });
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-[#F1F5F9] transition-colors hover:bg-[#1A2235]"
        style={{ border: "1px solid #1E2D45" }}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <ChevronLeftIcon
          className="w-4 h-4 text-[#475569] cursor-pointer hover:text-[#F1F5F9]"
          onClick={(e) => { e.stopPropagation(); navigateMonth(-1); }}
        />
        <span className="min-w-[130px] text-center">{period.label}</span>
        <ChevronRightIcon
          className="w-4 h-4 text-[#475569] cursor-pointer hover:text-[#F1F5F9]"
          onClick={(e) => { e.stopPropagation(); navigateMonth(1); }}
        />
        <ChevronDownIcon className="w-3.5 h-3.5 text-[#475569] ml-1" />
      </button>

      {open && (
        <div
          className="absolute top-full mt-2 w-56 rounded-xl z-50 py-1"
          style={{ background: "#131929", border: "1px solid #1E2D45", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
        >
          <p className="px-3 py-1.5 text-xs font-medium text-[#475569]">Atalhos rápidos</p>
          {PRESETS.map((p) => (
            <button
              key={p.type}
              onClick={() => select(p.type)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#F1F5F9] hover:bg-[#1A2235] transition-colors text-left"
            >
              {period.type === p.type && <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />}
              {period.type !== p.type && <span className="w-1.5 h-1.5" />}
              {p.label}
            </button>
          ))}

          <div className="my-1 h-px bg-[#1E2D45]" />

          <button
            onClick={() => setShowCustom((s) => !s)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#F1F5F9] hover:bg-[#1A2235] transition-colors text-left"
          >
            <span className="w-1.5 h-1.5" />
            Personalizado
          </button>

          {showCustom && (
            <div className="px-3 pb-3 flex flex-col gap-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="input-base text-sm py-1.5"
                placeholder="De"
              />
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="input-base text-sm py-1.5"
                placeholder="Até"
              />
              <button
                onClick={applyCustom}
                disabled={!customStart || !customEnd}
                className="btn-primary py-1.5 text-sm"
              >
                Aplicar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  function navigateMonth(direction: -1 | 1) {
    if (period.type !== "current_month" && period.type !== "custom") return;
    const [y, m] = period.startDate.split("-").map(Number);
    const next = new Date(y, m - 1 + direction, 1);
    setPeriodType("custom", {
      start: `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-01`,
      end: new Date(next.getFullYear(), next.getMonth() + 1, 0)
        .toISOString().split("T")[0],
    });
  }
}

function ChevronLeftIcon({ className, onClick }: { className?: string; onClick?: React.MouseEventHandler }) {
  return <svg className={className} onClick={onClick} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 18l-6-6 6-6"/></svg>;
}
function ChevronRightIcon({ className, onClick }: { className?: string; onClick?: React.MouseEventHandler }) {
  return <svg className={className} onClick={onClick} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>;
}
function ChevronDownIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 9l6 6 6-6"/></svg>;
}
