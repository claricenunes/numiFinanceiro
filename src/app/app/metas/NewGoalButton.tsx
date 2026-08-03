"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useToastStore } from "@/stores/useToastStore";
import { createClient } from "@/lib/supabase/client";
import { GOAL_ICON_MAP, GOAL_ICON_KEYS } from "@/lib/icons";

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
    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="numi-pill-btn numi-pill-btn-accent numi-cta-bounce text-sm px-4 py-2.5"
      >
        + New Goal
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => { setOpen(false); reset(); }} />

          <div
            className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: "#FFFDF9", border: "1px solid rgba(22, 50, 31, 0.08)", maxHeight: "92dvh", overflowY: "auto" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold" style={{ color: "var(--numi-landing-heading)" }}>New Goal</h2>
              <button onClick={() => { setOpen(false); reset(); }}
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
                  type="date" min={new Date().toISOString().slice(0, 10)}
                  className="numi-landing-input"
                  style={{ colorScheme: "light" }} />
              </div>

              <button type="submit" disabled={loading}
                className="numi-pill-btn numi-pill-btn-accent numi-cta-bounce w-full py-3 text-base mt-1 disabled:opacity-60 disabled:pointer-events-none">
                {loading ? "Saving..." : "Create goal"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
