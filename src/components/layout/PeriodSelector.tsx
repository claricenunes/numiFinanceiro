"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getPeriod, getCurrentPeriod } from "@/lib/utils/date";
import type { PeriodType, Period } from "@/types/app";

const PRESETS: { type: PeriodType; label: string }[] = [
  { type: "current_month", label: "This month" },
  { type: "last_30_days",  label: "Last 30 days" },
  { type: "last_90_days",  label: "Last 90 days" },
  { type: "this_year",     label: "This year" },
];

/** Derives the current Period from the URL's searchParams */
function periodFromParams(params: URLSearchParams): Period {
  const from = params.get("from");
  const to   = params.get("to");
  const pt   = params.get("pt") as PeriodType | null;

  if (pt && pt !== "custom") return getPeriod(pt);
  if (from && to) return getPeriod("custom", { start: from, end: to });
  return getCurrentPeriod();
}

/** Builds the query string for the selected period */
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

  // Close dropdown on outside click
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
        className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors"
        style={{ border: "1px solid rgba(22, 50, 31, 0.12)", color: "var(--numi-landing-heading)" }}
      >
        <button
          type="button"
          aria-label="Previous month"
          className="hidden lg:flex w-5 h-5 items-center justify-center text-[var(--numi-text-3)] hover:text-[var(--numi-landing-heading)] transition-colors"
          onClick={() => navigateMonth(-1)}
        >
          <ChevronLeftIcon />
        </button>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="min-w-0 max-w-[38vw] lg:max-w-none lg:min-w-[130px] truncate text-center hover:opacity-70 transition-opacity"
        >
          {period.label}
        </button>

        <button
          type="button"
          aria-label="Next month"
          className="hidden lg:flex w-5 h-5 items-center justify-center text-[var(--numi-text-3)] hover:text-[var(--numi-landing-heading)] transition-colors"
          onClick={() => navigateMonth(1)}
        >
          <ChevronRightIcon />
        </button>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="shrink-0 text-[var(--numi-text-3)] hover:text-[var(--numi-landing-heading)] transition-colors"
        >
          <ChevronDownIcon />
        </button>
      </div>

      {open && (
        <div
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-56 max-w-[90vw] rounded-2xl z-50 py-1"
          style={{ background: "#FFFFFF", border: "1px solid rgba(22, 50, 31, 0.08)", boxShadow: "0 8px 32px rgba(22, 50, 31, 0.14)" }}
        >
          <p className="px-3 py-1.5 text-xs font-medium text-[var(--numi-text-3)]">Quick ranges</p>
          {PRESETS.map((p) => (
            <button
              key={p.type}
              type="button"
              onClick={() => select(p.type)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[color-mix(in_srgb,var(--numi-landing-heading)_5%,transparent)] transition-colors text-left"
              style={{ color: "var(--numi-landing-heading)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: period.type === p.type ? "var(--numi-landing-accent)" : "transparent" }} />
              {p.label}
            </button>
          ))}

          <div className="my-1 h-px" style={{ background: "rgba(22, 50, 31, 0.08)" }} />

          <button
            type="button"
            onClick={() => setShowCustom((s) => !s)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[color-mix(in_srgb,var(--numi-landing-heading)_5%,transparent)] transition-colors text-left"
            style={{ color: "var(--numi-landing-heading)" }}
          >
            <span className="w-1.5 h-1.5" />
            Custom
          </button>

          {showCustom && (
            <div className="px-3 pb-3 flex flex-col gap-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="numi-landing-input text-sm py-1.5"
                style={{ colorScheme: "light" }}
              />
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="numi-landing-input text-sm py-1.5"
                style={{ colorScheme: "light" }}
              />
              <button
                type="button"
                onClick={applyCustom}
                disabled={!customStart || !customEnd}
                className="numi-pill-btn numi-pill-btn-accent py-1.5 text-sm disabled:opacity-60 disabled:pointer-events-none"
              >
                Apply
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
