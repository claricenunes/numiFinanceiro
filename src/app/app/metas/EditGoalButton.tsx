"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { useToastStore } from "@/stores/useToastStore";
import { createClient } from "@/lib/supabase/client";
import { GOAL_ICON_MAP, GOAL_ICON_KEYS } from "@/lib/icons";
import type { GoalWithProgress } from "@/types/app";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
        className="w-6 h-6 flex items-center justify-center rounded-lg text-[var(--numi-text-3)] shrink-0 transition-colors hover:bg-[color-mix(in_srgb,var(--numi-landing-heading)_6%,transparent)] hover:text-[var(--numi-landing-heading)]"
      >
        <Pencil size={13} />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Edit Goal">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-[var(--numi-text-2)] mb-1.5 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_ICON_KEYS.map(key => {
                const Icon = GOAL_ICON_MAP[key];
                const active = icon === key;
                return (
                  <button key={key} type="button" onClick={() => setIcon(key)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                    style={{
                      background: active ? "color-mix(in srgb, var(--numi-landing-accent) 14%, transparent)" : "var(--numi-elevated)",
                      border: `1px solid ${active ? "var(--numi-landing-accent)" : "var(--numi-border)"}`,
                      color: active ? "var(--numi-landing-heading)" : "var(--numi-text-2)",
                    }}>
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>
          </div>

          <Input label="Goal name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Emergency fund, Trip..." required />
          <Input label="Target amount ($)" value={target} onChange={e => setTarget(e.target.value)} type="text" inputMode="decimal" placeholder="0.00" required />
          <Input label="Deadline (optional)" value={deadline} onChange={e => setDeadline(e.target.value)} type="date" style={{ colorScheme: "light" }} />

          <div>
            <label className="text-xs font-medium text-[var(--numi-text-2)] mb-1.5 block">Status</label>
            <div className="grid grid-cols-4 gap-2">
              {STATUS_OPTIONS.map(s => {
                const active = status === s.value;
                return (
                  <button key={s.value} type="button" onClick={() => setStatus(s.value)}
                    className="py-2 px-1 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background: active ? "color-mix(in srgb, var(--numi-landing-accent) 14%, transparent)" : "var(--numi-elevated)",
                      border: `1px solid ${active ? "var(--numi-landing-accent)" : "var(--numi-border)"}`,
                      color: active ? "var(--numi-landing-heading)" : "var(--numi-text-2)",
                    }}>
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Button type="submit" variant="accent" loading={loading} className="w-full mt-1">
            Save changes
          </Button>
        </form>
      </Modal>
    </>
  );
}
