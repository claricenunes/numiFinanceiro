"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

interface AccordionItemProps {
  question: string;
  children: ReactNode;
}

/**
 * A single FAQ entry built on native `<details>/<summary>` — keyboard
 * navigation, screen-reader semantics, and open/close state all come free
 * from the browser instead of being hand-rolled with ARIA + React state.
 */
export function AccordionItem({ question, children }: AccordionItemProps) {
  return (
    <details className="group glass-card overflow-hidden [&_summary::-webkit-details-marker]:hidden">
      <summary
        className="flex items-center justify-between gap-4 p-5 lg:p-6 cursor-pointer list-none font-semibold text-[var(--numi-text)] select-none"
      >
        {question}
        <ChevronDown
          className="shrink-0 w-5 h-5 text-[var(--numi-text-3)] transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="px-5 pb-5 lg:px-6 lg:pb-6 -mt-2 text-[var(--numi-text-2)] leading-relaxed">
        {children}
      </div>
    </details>
  );
}

export function Accordion({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}
