"use client";

import { useEffect, type ReactNode } from "react";
import { usePageHeaderStore } from "@/stores/usePageHeaderStore";

/**
 * Renders nothing — registers this page's title/actions into the shared
 * app Header (`src/components/layout/Header.tsx`) for as long as it's
 * mounted. Lets each `/app/*` page have its own header identity without
 * the Header component itself needing to know about every route.
 */
export function PageHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  const setHeader = usePageHeaderStore((s) => s.setHeader);
  const clearHeader = usePageHeaderStore((s) => s.clearHeader);

  useEffect(() => {
    setHeader(title, actions);
    return () => clearHeader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  return null;
}
