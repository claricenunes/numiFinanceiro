"use client";
import { create } from "zustand";

interface UIStore {
  sidebarOpen: boolean;
  quickAddOpen: boolean;
  quickAddType: "income" | "expense" | "transfer";
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openQuickAdd: (type?: "income" | "expense" | "transfer") => void;
  closeQuickAdd: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  quickAddOpen: false,
  quickAddType: "expense",
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openQuickAdd: (type = "expense") => set({ quickAddOpen: true, quickAddType: type }),
  closeQuickAdd: () => set({ quickAddOpen: false }),
}));
