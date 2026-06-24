"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToastStore } from "@/stores/useToastStore";
import type { Notification } from "@/lib/supabase/queries/notifications";

const SEVERITY_ICON: Record<string, string> = {
  alert:   "🚨",
  warning: "⚠️",
  info:    "💡",
};

const SEVERITY_COLOR: Record<string, string> = {
  alert:   "#F87171",
  warning: "#FBBF24",
  info:    "#38BDF8",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return "agora";
  if (mins < 60) return `${mins}m atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h atrás`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d atrás`;
  return new Date(dateStr).toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

interface Props { notifications: Notification[] }

export function NotificationsView({ notifications: initial }: Props) {
  const [items, setItems] = useState(initial);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { show } = useToastStore();

  const unreadCount = items.filter((n) => !n.is_read).length;

  async function markAllRead() {
    if (unreadCount === 0) return;
    setLoading(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("financial_events") as any).update({ is_read: true }).eq("is_read", false);
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setLoading(false);
    show("Todas marcadas como lidas", "success");
    router.refresh();
  }

  async function markOneRead(id: string) {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("financial_events") as any).update({ is_read: true }).eq("id", id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-4xl mb-3">🔔</p>
        <p className="text-[#94A3B8] font-medium">Nenhuma notificação</p>
        <p className="text-sm text-[#475569] mt-1">
          Você receberá alertas sobre orçamentos, metas e movimentações importantes
        </p>
      </div>
    );
  }

  return (
    <div>
      {unreadCount > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[#64748B]">
            {unreadCount} não lida{unreadCount !== 1 ? "s" : ""}
          </p>
          <button
            onClick={markAllRead}
            disabled={loading}
            className="text-xs font-medium text-[#34D399] hover:text-[#6EE7B7] transition-colors disabled:opacity-50"
          >
            Marcar tudo como lido
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {items.map((n) => {
          const color = SEVERITY_COLOR[n.severity] ?? "#34D399";
          return (
            <div
              key={n.id}
              onClick={() => !n.is_read && markOneRead(n.id)}
              className="rounded-2xl p-4 transition-colors"
              style={{
                background: n.is_read ? "#131929" : "#0D1D33",
                border:     `1px solid ${n.is_read ? "#1E2D45" : "#1E3A5F"}`,
                cursor:     n.is_read ? "default" : "pointer",
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">
                  {SEVERITY_ICON[n.severity] ?? "🔔"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[#F1F5F9] leading-tight">{n.title}</p>
                    {!n.is_read && (
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: color }}
                      />
                    )}
                  </div>
                  {n.description && (
                    <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{n.description}</p>
                  )}
                  <p className="text-xs text-[#475569] mt-2">{timeAgo(n.created_at)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
