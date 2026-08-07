"use client";

import { useRef, type ChangeEvent, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function ChatInput({ value, onChange, onSubmit, disabled }: ChatInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) onSubmit();
    }
  }

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value);
    const el = ref.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }

  return (
    <div
      className="flex items-end gap-2 rounded-2xl p-2"
      style={{ background: "var(--numi-elevated)", border: "1px solid var(--numi-border)" }}
    >
      <textarea
        ref={ref}
        rows={1}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask about your finances…"
        disabled={disabled}
        className="flex-1 resize-none bg-transparent outline-none text-sm py-1.5 px-2 max-h-[120px]"
        style={{ color: "var(--numi-text)" }}
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        aria-label="Send"
        className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        style={{ background: "var(--numi-landing-heading)", color: "white" }}
      >
        <ArrowUp size={16} />
      </button>
    </div>
  );
}
