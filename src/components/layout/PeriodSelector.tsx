"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getPeriod, getCurrentPeriod } from "@/lib/utils/date";
import type { PeriodType, Period } from "@/types/app";

const PRESETS: { type: PeriodType; label: string }[] = [
  { type: "current_month", label: "Este mês" },
  { type: "last_30_days",  label: "Últimos 30 dias" },
  { type: "last_90_days",  label: "Últimos 90 dias" },
  { type: "this_year",     label: "Este ano" },
];

/** Deriva o Period atual dos searchParams da URL */
function periodFromParams(params: URLSearchParams): Period {
  const from = params.get("from");
  const to   = params.get("to");
  const pt   = params.get("pt") as PeriodType | null;

  if (pt && pt !== "custom") return getPeriod(pt);
  if (from && to) return getPeriod("custom", { start: from, end: to });
  return getCurrentPeriod();
}

/** Constrói a query string para o período selecionado */
function buildQuery(period: Period): string {
  const p = new URLSearchParams({
    from: period.startDate,
    to:   period.endDate,
    pt:   period.type,
  });
  return p.toString();
}

export function PeriodSelector() {
  const router     = useRouter();
  const pathname   = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen]             = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd,   setCustomEnd]   = useState("");
  const [showCustom,  setShowCustom]  = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const period = periodFromParams(searchParams);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function navigate(p: Period) {
    router.replace(`${pathname}?${buildQuery(p)}`);
    setOpen(false);
    setShowCustom(false);
  }

  function select(type: PeriodType) {
    navigate(getPeriod(type));
  }

  function applyCustom() {
    if (customStart && customEnd) {
      navigate(getPeriod("custom", { start: customStart, end: customEnd }));
    }
  }

  function navigateMonth(direction: -1 | 1) {
    const [y, m] = period.startDate.split("-").map(Number);
    const next   = new Date(y, m - 1 + direction, 1);
    navigate(
      getPeriod("custom", {
        start: `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-01`,
        end:   new Date(next.getFullYear(), next.getMonth() + 1, 0).toISOString().split("T")[0],
      }),
    );
  }

  return (
    <div className="relative" ref={ref}>
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-[#F1F5F9] transition-colors"
        style={{ border: "1px solid #1E2D45" }}
      >
        <button
          type="button"
          aria-label="Mês anterior"
          className="w-5 h-5 flex items-center justify-center text-[#475569] hover:text-[#F1F5F9] transition-colors"
          onClick={() => navigateMonth(-1)}
        >
          <ChevronLeftIcon />
        </button>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="min-w-[130px] text-center hover:text-[#34D399] transition-colors"
        >
          {period.label}
        </button>

        <button
          type="button"
          aria-label="Próximo mês"
          className="w-5 h-5 flex items-center justify-center text-[#475569] hover:text-[#F1F5F9] transition-colors"
          onClick={() => navigateMonth(1)}
        >
          <ChevronRightIcon />
        </button>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-[#475569] hover:text-[#F1F5F9] transition-colors"
        >
          <ChevronDownIcon />
        </button>
      </div>

      {open && (
        <div
          className="absolute top-full mt-2 w-56 rounded-xl z-50 py-1"
          style={{ background: "#131929", border: "1px solid #1E2D45", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
        >
          <p className="px-3 py-1.5 text-xs font-medium text-[#475569]">Atalhos rápidos</p>
          {PRESETS.map((p) => (
            <button
              key={p.type}
              type="button"
              onClick={() => select(p.type)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#F1F5F9] hover:bg-[#1A2235] transition-colors text-left"
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: period.type === p.type ? "#34D399" : "transparent" }} />
              {p.label}
            </button>
          ))}

          <div className="my-1 h-px bg-[#1E2D45]" />

          <button
            type="button"
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
                style={{ colorScheme: "dark" }}
              />
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="input-base text-sm py-1.5"
                style={{ colorScheme: "dark" }}
              />
              <button
                type="button"
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
}

function ChevronLeftIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 18l-6-6 6-6"/></svg>;
}
function ChevronRightIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>;
}
function ChevronDownIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 9l6 6 6-6"/></svg>;
}
