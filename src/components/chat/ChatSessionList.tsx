"use client";

import { Plus } from "lucide-react";
import type { ChatSession } from "@/types/chat";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

interface ChatSessionListProps {
  sessions: ChatSession[];
  activeId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
}

export function ChatSessionList({ sessions, activeId, loading, onSelect, onNewConversation }: ChatSessionListProps) {
  return (
    <div className="glass-card p-2 flex flex-col gap-1 h-full overflow-y-auto">
      <button
        type="button"
        onClick={onNewConversation}
        className="flex items-center gap-2 text-sm font-semibold px-3 py-2.5 rounded-xl mb-1 transition-colors hover:bg-[color-mix(in_srgb,var(--numi-text)_5%,transparent)]"
        style={{
          color: "var(--numi-landing-heading)",
          background: !activeId ? "color-mix(in srgb, var(--numi-landing-accent) 12%, transparent)" : "transparent",
        }}
      >
        <Plus size={15} />
        New conversation
      </button>

      {loading ? (
        <div className="flex flex-col gap-1.5 px-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-11 rounded-xl animate-pulse" style={{ background: "var(--numi-elevated)" }} />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-xs text-[var(--numi-text-3)] px-3 py-2">No conversations yet.</p>
      ) : (
        sessions.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            className="flex flex-col items-start gap-0.5 text-left px-3 py-2 rounded-xl transition-colors hover:bg-[color-mix(in_srgb,var(--numi-text)_5%,transparent)]"
            style={{
              background: s.id === activeId ? "color-mix(in srgb, var(--numi-landing-heading) 8%, transparent)" : "transparent",
            }}
          >
            <span
              className="text-sm font-medium truncate w-full"
              style={{ color: s.id === activeId ? "var(--numi-landing-heading)" : "var(--numi-text)" }}
            >
              {s.title ?? "New conversation"}
            </span>
            <span className="text-xs text-[var(--numi-text-3)]">{formatDate(s.updatedAt)}</span>
          </button>
        ))
      )}
    </div>
  );
}
