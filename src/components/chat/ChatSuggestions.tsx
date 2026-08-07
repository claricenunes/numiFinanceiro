"use client";

import { Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "Give me a summary of my finances",
  "What were my biggest expenses this month?",
  "How much did I save compared to last month?",
  "Which subscriptions are weighing on my budget?",
  "Which category cost me the most?",
  "How much can I still spend until the end of the month?",
];

export function ChatSuggestions({ onPick }: { onPick: (question: string) => void }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--numi-text-3)] uppercase tracking-wider">
        <Sparkles size={12} />
        Try asking
      </p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            className="glass-card glass-card-interactive text-left text-sm px-3.5 py-2 rounded-xl"
            style={{ color: "var(--numi-text-2)" }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
