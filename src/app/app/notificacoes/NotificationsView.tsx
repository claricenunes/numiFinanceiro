"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Siren, AlertTriangle, Lightbulb, Bell, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToastStore } from "@/stores/useToastStore";
import type { Notification } from "@/lib/supabase/queries/notifications";

const SEVERITY_ICON: Record<string, LucideIcon> = {
  alert:   Siren,
  warning: AlertTriangle,
  info:    Lightbulb,
};

const SEVERITY_COLOR: Record<string, string> = {
  alert:   "var(--numi-expense)",
  warning: "var(--numi-warning)",
  info:    "var(--numi-info)",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return "now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { day: "numeric", month: "short" });
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
    show("All marked as read", "success");
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
        <Bell size={40} className="mx-auto mb-3" style={{ color: "var(--numi-text-3)" }} />
        <p className="text-[var(--numi-text-2)] font-medium">No notifications</p>
        <p className="text-sm text-[var(--numi-text-3)] mt-1">
          You&apos;ll get alerts about budgets, goals and important transactions
        </p>
      </div>
    );
  }

  return (
    <div>
      {unreadCount > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[var(--numi-text-4)]">
            {unreadCount} unread
          </p>
          <button
            onClick={markAllRead}
            disabled={loading}
            className="text-xs font-medium hover:opacity-80 transition-colors disabled:opacity-50"
            style={{ color: "var(--numi-landing-heading)" }}
          >
            Mark all as read
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {items.map((n) => {
          const color = SEVERITY_COLOR[n.severity] ?? "var(--numi-info)";
          const Icon  = SEVERITY_ICON[n.severity] ?? Bell;
          return (
            <div
              key={n.id}
              onClick={() => !n.is_read && markOneRead(n.id)}
              className="rounded-2xl p-4 transition-colors"
              style={{
                background: n.is_read ? "#FFFFFF" : "color-mix(in srgb, var(--numi-info) 6%, #FFFFFF)",
                border:     `1px solid ${n.is_read ? "rgba(22, 50, 31, 0.08)" : "rgba(59,130,246,0.3)"}`,
                boxShadow:  "0 8px 20px -12px rgba(22, 50, 31, 0.15)",
                cursor:     n.is_read ? "default" : "pointer",
              }}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-0.5" style={{ color }}>
                  <Icon size={18} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold leading-tight" style={{ color: "var(--numi-landing-heading)" }}>{n.title}</p>
                    {!n.is_read && (
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: color }}
                      />
                    )}
                  </div>
                  {n.description && (
                    <p className="text-xs text-[var(--numi-text-4)] mt-1 leading-relaxed">{n.description}</p>
                  )}
                  <p className="text-xs text-[var(--numi-text-3)] mt-2">{timeAgo(n.created_at)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
