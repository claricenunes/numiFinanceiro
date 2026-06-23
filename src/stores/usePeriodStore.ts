"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Period, PeriodType } from "@/types/app";
import { getCurrentPeriod, getPeriod } from "@/lib/utils/date";

interface PeriodStore {
  period: Period;
  setPeriodType: (type: PeriodType, custom?: { start: string; end: string }) => void;
  setPeriod: (period: Period) => void;
}

export const usePeriodStore = create<PeriodStore>()(
  persist(
    (set) => ({
      period: getCurrentPeriod(),
      setPeriodType: (type, custom) => set({ period: getPeriod(type, custom) }),
      setPeriod: (period) => set({ period }),
    }),
    { name: "numi-period" }
  )
);
