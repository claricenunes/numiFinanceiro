"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useToastStore } from "@/stores/useToastStore";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { IconPicker } from "@/components/ui/IconPicker";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { Button } from "@/components/ui/Button";
import { TYPE_OPTIONS, ACCOUNT_COLORS, type AccountType } from "./accountOptions";

export function NewAccountButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("checking");
  const [institution, setInstitution] = useState("");
  const [balance, setBalance] = useState("0");
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);
  const [creditLimit, setCreditLimit] = useState("");
  const [billingDay, setBillingDay] = useState("");
  const [dueDay, setDueDay] = useState("");
  const router = useRouter();
  const { show } = useToastStore();

  function reset() {
    setName(""); setType("checking"); setInstitution(""); setBalance("0");
    setColor(ACCOUNT_COLORS[0]); setCreditLimit(""); setBillingDay(""); setDueDay("");
  }

  function handleClose() {
    setOpen(false);
    reset();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { show("Name is required", "error"); return; }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { show("Session expired", "error"); setLoading(false); return; }

    const row: Record<string, unknown> = {
      user_id: user.id,
      name: name.trim(),
      type,
      institution: institution.trim() || null,
      initial_balance: parseFloat(balance.replace(",", ".")) || 0,
      currency_code: "BRL",
      color,
    };
    if (type === "credit_card") {
      if (creditLimit) row.credit_limit = parseFloat(creditLimit.replace(",", "."));
      if (billingDay) row.billing_day = parseInt(billingDay);
      if (dueDay) row.due_day = parseInt(dueDay);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("accounts") as any).insert(row);
    setLoading(false);
    if (error) { show("Error: " + error.message, "error"); return; }

    show("Account created!", "success");
    handleClose();
    router.refresh();
  }

  return (
    <>
      <Button variant="accent" size="sm" icon={<Plus size={14} />} onClick={() => setOpen(true)}>
        <span className="hidden sm:inline">New Account</span>
      </Button>

      <Modal open={open} onClose={handleClose} title="New Account">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <IconPicker label="Type" options={TYPE_OPTIONS} value={type} onChange={setType} />

          <Input label="Account name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chase, Wells Fargo..." required />
          <Input label="Bank / Institution (optional)" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g. Chase" />
          <Input
            label={type === "credit_card" ? "Current bill ($)" : "Initial balance ($)"}
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            type="text"
            inputMode="decimal"
            placeholder="0.00"
          />

          {type === "credit_card" && (
            <>
              <Input label="Credit limit ($)" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} type="text" inputMode="decimal" placeholder="0.00" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Statement closing day" value={billingDay} onChange={(e) => setBillingDay(e.target.value)} type="number" min={1} max={31} placeholder="e.g. 25" />
                <Input label="Due day" value={dueDay} onChange={(e) => setDueDay(e.target.value)} type="number" min={1} max={31} placeholder="e.g. 5" />
              </div>
            </>
          )}

          <ColorPicker label="Color" value={color} onChange={setColor} colors={ACCOUNT_COLORS} />

          <Button type="submit" variant="accent" loading={loading} className="w-full mt-1">
            Create account
          </Button>
        </form>
      </Modal>
    </>
  );
}
