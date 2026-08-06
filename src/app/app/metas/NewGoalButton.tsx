"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/stores/useToastStore";
import { createClient } from "@/lib/supabase/client";
import { GOAL_ICON_MAP, GOAL_ICON_KEYS } from "@/lib/icons";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function NewGoalButton() {
  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [name,     setName]     = useState("");
  const [icon,     setIcon]     = useState("target");
  const [target,   setTarget]   = useState("");
  const [deadline, setDeadline] = useState("");
  const router = useRouter();
  const { show } = useToastStore();

  function reset() { setName(""); setIcon("target"); setTarget(""); setDeadline(""); }

  function handleClose() { setOpen(false); reset(); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(target.replace(",", "."));
    if (!name.trim() || !amount) { show("Name and amount are required", "error"); return; }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { show("Session expired", "error"); setLoading(false); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("goals") as any).insert({
      user_id:       user.id,
      name:          name.trim(),
      icon,
      target_amount: amount,
      currency_code: "BRL",
      deadline:      deadline || null,
      status:        "active",
    });
    setLoading(false);
    if (error) { show("Error: " + error.message, "error"); return; }

    show("Goal created!", "success");
    handleClose();
    router.refresh();
  }

  return (
    <>
      <Button variant="accent" onClick={() => setOpen(true)}>+ New Goal</Button>

      <Modal open={open} onClose={handleClose} title="New Goal">
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
          <Input label="Deadline (optional)" value={deadline} onChange={e => setDeadline(e.target.value)} type="date" min={new Date().toISOString().slice(0, 10)} style={{ colorScheme: "light" }} />

          <Button type="submit" variant="accent" loading={loading} className="w-full mt-1">
            Create goal
          </Button>
        </form>
      </Modal>
    </>
  );
}
