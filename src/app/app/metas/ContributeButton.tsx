"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/stores/useToastStore";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ContributeButton({ goalId, goalName }: { goalId: string; goalName: string }) {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount,  setAmount]  = useState("");
  const [date,    setDate]    = useState(new Date().toISOString().slice(0, 10));
  const [notes,   setNotes]   = useState("");
  const router = useRouter();
  const { show } = useToastStore();

  function reset() { setAmount(""); setDate(new Date().toISOString().slice(0, 10)); setNotes(""); }

  function handleClose() { setOpen(false); reset(); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount.replace(",", "."));
    if (!parsed || parsed <= 0) { show("Enter a valid amount", "error"); return; }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { show("Session expired", "error"); setLoading(false); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("goal_contributions") as any).insert({
      user_id:       user.id,
      goal_id:       goalId,
      amount:        parsed,
      currency_code: "BRL",
      date,
      notes:         notes.trim() || null,
    });
    setLoading(false);
    if (error) { show("Error: " + error.message, "error"); return; }

    show("Contribution recorded!", "success");
    handleClose();
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-semibold px-4 py-1.5 rounded-xl transition-colors"
        style={{ background: "color-mix(in srgb, var(--numi-landing-heading) 8%, transparent)", color: "var(--numi-landing-heading)" }}
      >
        + Add contribution
      </button>

      <Modal open={open} onClose={handleClose} title="Add Contribution" maxWidth="sm:max-w-sm">
        <p className="text-xs text-[var(--numi-text-3)] -mt-2">{goalName}</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input label="Amount ($)" value={amount} onChange={e => setAmount(e.target.value)} type="text" inputMode="decimal" placeholder="0.00" required autoFocus />
          <Input label="Date" value={date} onChange={e => setDate(e.target.value)} type="date" required style={{ colorScheme: "light" }} />
          <Input label="Note (optional)" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. December contribution" />
          <Button type="submit" variant="accent" loading={loading} className="w-full mt-1">
            Add
          </Button>
        </form>
      </Modal>
    </>
  );
}
