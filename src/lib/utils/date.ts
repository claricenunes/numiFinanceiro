import type { Period, PeriodType } from "@/types/app";

const LOCALE = "pt-BR";

export function getCurrentPeriod(): Period {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    type: "current_month",
    startDate: toISO(start),
    endDate: toISO(end),
    label: capitalize(start.toLocaleDateString(LOCALE, { month: "long", year: "numeric" })),
  };
}

export function getPeriod(type: PeriodType, custom?: { start: string; end: string }): Period {
  const now = new Date();

  if (type === "current_month") return getCurrentPeriod();

  if (type === "last_30_days") {
    const end = now;
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    return { type, startDate: toISO(start), endDate: toISO(end), label: "Últimos 30 dias" };
  }

  if (type === "last_90_days") {
    const end = now;
    const start = new Date(now);
    start.setDate(start.getDate() - 89);
    return { type, startDate: toISO(start), endDate: toISO(end), label: "Últimos 90 dias" };
  }

  if (type === "this_year") {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    return { type, startDate: toISO(start), endDate: toISO(end), label: `${now.getFullYear()}` };
  }

  if (type === "custom" && custom) {
    return {
      type,
      startDate: custom.start,
      endDate: custom.end,
      label: `${formatDate(custom.start)} – ${formatDate(custom.end)}`,
    };
  }

  return getCurrentPeriod();
}

/** Constrói um Period a partir dos searchParams da URL (?from=&to=&pt=) */
export function parsePeriodFromParams(
  from?: string,
  to?: string,
  pt?: string,
): Period {
  if (from && to) {
    const type = (pt ?? "custom") as PeriodType;
    // Presets recalculados server-side para freshness
    if (type !== "custom") return getPeriod(type);
    return {
      type: "custom",
      startDate: from,
      endDate: to,
      label: `${formatDateShort(from)} – ${formatDateShort(to)}`,
    };
  }
  if (pt && pt !== "current_month") return getPeriod(pt as PeriodType);
  return getCurrentPeriod();
}

function formatDateShort(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(iso + "T12:00:00").toLocaleDateString(LOCALE, opts ?? { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateRelative(iso: string): string {
  const date = new Date(iso + "T12:00:00");
  const today = new Date();
  const diff = Math.floor((today.getTime() - date.getTime()) / 86400000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  if (diff < 7) return `${diff} dias atrás`;
  return formatDate(iso, { day: "2-digit", month: "short" });
}

function toISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
