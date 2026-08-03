"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { useToastStore } from "@/stores/useToastStore";
import { createClient } from "@/lib/supabase/client";
import { GOAL_ICON_MAP, GOAL_ICON_KEYS } from "@/lib/icons";
import type { GoalWithProgress } from "@/types/app";

type GoalStatus = "active" | "completed" | "cancelled" | "paused";

const STATUS_OPTIONS: { value: GoalStatus; label: string }[] = [
  { value: "active",    label: "Active" },
  { value: "paused",    label: "Paused" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function EditGoalButton({ goal }: { goal: GoalWithProgress }) {
  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [name,     setName]     = useState(goal.name);
  const [icon,     setIcon]     = useState(goal.icon && GOAL_ICON_MAP[goal.icon] ? goal.icon : "target");
  const [target,   setTarget]   = useState(String(goal.targetAmount));
  const [deadline, setDeadline] = useState(goal.deadline ?? "");
  const [status,   setStatus]   = useState<GoalStatus>(goal.status);
  const router = useRouter();
  const { show } = useToastStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(target.replace(",", "."));
    if (!name.trim() || !amount) { show("Name and amount are required", "error"); return; }

    setLoading(true);
    const supabase = createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("goals") as any)
      .update({
        name: name.trim(),
        icon,
        target_amount: amount,
        deadline: deadline || null,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", goal.id);

    setLoading(false);
    if (error) { show("Error: " + error.message, "error"); return; }

    show("Goal updated!", "success");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Edit goal"
        className="w-6 h-6 flex items-center justify-center rounded-lg text-xs shrink-0 transition-colors"
        style={{ color: "var(--numi-text-3)" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "color-mix(in srgb, var(--numi-landing-heading) 6%, transparent)"; (e.currentTarget as HTMLElement).style.color = "var(--numi-landing-heading)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--numi-text-3)"; }}
      >
        <Pencil size={13} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div
            className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: "#FFFDF9", border: "1px solid rgba(22, 50, 31, 0.08)", maxHeight: "92dvh", overflowY: "auto" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold" style={{ color: "var(--numi-landing-heading)" }}>Edit Goal</h2>
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--numi-text-4)] hover:text-[var(--numi-landing-heading)] hover:bg-[color-mix(in_srgb,var(--numi-landing-heading)_6%,transparent)]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Icon */}
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: "var(--numi-landing-heading)" }}>Icon</label>
                <div className="flex flex-wrap gap-2">
                  {GOAL_ICON_KEYS.map(key => {
                    const Icon = GOAL_ICON_MAP[key];
                    return (
                      <button key={key} type="button" onClick={() => setIcon(key)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                        style={{
                          background: icon === key ? "color-mix(in srgb, var(--numi-landing-accent) 14%, transparent)" : "#FFFFFF",
                          border: `1px solid ${icon === key ? "var(--numi-landing-accent)" : "rgba(22, 50, 31, 0.12)"}`,
                          color: icon === key ? "var(--numi-landing-heading)" : "var(--numi-text-2)",
                        }}>
                        <Icon size={16} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--numi-landing-heading)" }}>Goal name</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Emergency fund, Trip..." required
                  className="numi-landing-input" />
              </div>

              {/* Target amount */}
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--numi-landing-heading)" }}>Target amount ($)</label>
                <input value={target} onChange={e => setTarget(e.target.value)}
                  type="text" inputMode="decimal" placeholder="0.00" required
                  className="numi-landing-input" />
              </div>

              {/* Deadline */}
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--numi-landing-heading)" }}>Deadline (optional)</label>
                <input value={deadline} onChange={e => setDeadline(e.target.value)}
                  type="date"
                  className="numi-landing-input"
                  style={{ colorScheme: "light" }} />
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--numi-landing-heading)" }}>Status</label>
                <div className="grid grid-cols-4 gap-2">
                  {STATUS_OPTIONS.map(s => (
                    <button key={s.value} type="button" onClick={() => setStatus(s.value)}
                      className="py-2 px-1 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        background: status === s.value ? "color-mix(in srgb, var(--numi-landing-accent) 14%, transparent)" : "#FFFFFF",
                        border: `1px solid ${status === s.value ? "var(--numi-landing-accent)" : "rgba(22, 50, 31, 0.12)"}`,
                        color: status === s.value ? "var(--numi-landing-heading)" : "var(--numi-text-2)",
                      }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="numi-pill-btn numi-pill-btn-accent numi-cta-bounce w-full py-3 text-base mt-1 disabled:opacity-60 disabled:pointer-events-none">
                {loading ? "Saving..." : "Save changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
