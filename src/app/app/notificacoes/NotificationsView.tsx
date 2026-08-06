"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Siren, AlertTriangle, Lightbulb, Bell, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToastStore } from "@/stores/useToastStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
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
      <Card>
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You'll get alerts about budgets, goals and important transactions"
        />
      </Card>
    );
  }

  return (
    <div>
      {unreadCount > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[var(--numi-text-4)]">
            {unreadCount} unread
          </p>
          <Button variant="ghost" size="sm" loading={loading} onClick={markAllRead}>
            Mark all as read
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {items.map((n) => {
          const color = SEVERITY_COLOR[n.severity] ?? "var(--numi-info)";
          const Icon  = SEVERITY_ICON[n.severity] ?? Bell;
          return (
            <Card
              key={n.id}
              padding="sm"
              variant={n.is_read ? "default" : "interactive"}
              onClick={() => !n.is_read && markOneRead(n.id)}
              style={{
                background: n.is_read ? "var(--numi-surface)" : `color-mix(in srgb, ${color} 5%, var(--numi-surface))`,
                borderColor: n.is_read ? "var(--numi-border)" : `color-mix(in srgb, ${color} 30%, transparent)`,
                cursor: n.is_read ? "default" : "pointer",
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
            </Card>
          );
        })}
      </div>
    </div>
  );
}
