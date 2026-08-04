"use client";

import { create } from "zustand";
import type { ReactNode } from "react";

interface PageHeaderStore {
  title: string | null;
  actions: ReactNode | null;
  setHeader: (title: string, actions?: ReactNode) => void;
  clearHeader: () => void;
}

export const usePageHeaderStore = create<PageHeaderStore>((set) => ({
  title: null,
  actions: null,
  setHeader: (title, actions = null) => set({ title, actions }),
  clearHeader: () => set({ title: null, actions: null }),
}));
