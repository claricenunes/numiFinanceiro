"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/useUserStore";

interface Props {
  initialTheme: "dark" | "light" | "system";
}

function applyTheme(theme: "dark" | "light" | "system") {
  const root = document.documentElement;
  if (theme === "light") {
    root.classList.add("light");
  } else if (theme === "dark") {
    root.classList.remove("light");
  } else {
    // system: follow OS preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) root.classList.remove("light");
    else root.classList.add("light");
  }
}

export function ThemeProvider({ initialTheme }: Props) {
  // Apply initial theme immediately on mount
  useEffect(() => {
    applyTheme(initialTheme);
  }, [initialTheme]);

  // Re-apply whenever profile changes (e.g., user toggles from settings)
  const theme = useUserStore((s) => s.profile?.theme);
  useEffect(() => {
    if (theme) applyTheme(theme);
  }, [theme]);

  return null;
}
