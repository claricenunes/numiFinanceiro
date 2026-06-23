"use client";
import { create } from "zustand";

interface UIStore {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  quickAddOpen: boolean;
  quickAddType: "income" | "expense" | "transfer";
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  openQuickAdd: (type?: "income" | "expense" | "transfer") => void;
  closeQuickAdd: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  quickAddOpen: false,
  quickAddType: "expense",
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
  openQuickAdd: (type = "expense") => set({ quickAddOpen: true, quickAddType: type }),
  closeQuickAdd: () => set({ quickAddOpen: false }),
}));
