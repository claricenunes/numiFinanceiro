"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { useToastStore } from "@/stores/useToastStore";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { IconPicker } from "@/components/ui/IconPicker";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { Button } from "@/components/ui/Button";
import { TYPE_OPTIONS, ACCOUNT_COLORS, type AccountType } from "./accountOptions";
import type { AccountWithBalance } from "@/types/app";

export function EditAccountButton({ account }: { account: AccountWithBalance }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(account.name);
  const [type, setType] = useState<AccountType>(account.type);
  const [institution, setInstitution] = useState(account.institution ?? "");
  const [color, setColor] = useState(account.color ?? ACCOUNT_COLORS[0]);
  const [creditLimit, setCreditLimit] = useState(account.creditLimit ? String(account.creditLimit) : "");
  const [billingDay, setBillingDay] = useState(account.billingDay ? String(account.billingDay) : "");
  const [dueDay, setDueDay] = useState(account.dueDay ? String(account.dueDay) : "");
  const router = useRouter();
  const { show } = useToastStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { show("Name is required", "error"); return; }

    setLoading(true);
    const supabase = createClient();

    const row: Record<string, unknown> = {
      name: name.trim(),
      type,
      institution: institution.trim() || null,
      color,
      updated_at: new Date().toISOString(),
    };
    if (type === "credit_card") {
      row.credit_limit = creditLimit ? parseFloat(creditLimit.replace(",", ".")) : null;
      row.billing_day = billingDay ? parseInt(billingDay) : null;
      row.due_day = dueDay ? parseInt(dueDay) : null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("accounts") as any).update(row).eq("id", account.id);
    setLoading(false);
    if (error) { show("Error: " + error.message, "error"); return; }

    show("Account updated!", "success");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Edit account"
        className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--numi-text-3)] shrink-0 transition-colors hover:bg-[color-mix(in_srgb,var(--numi-landing-heading)_6%,transparent)] hover:text-[var(--numi-landing-heading)]"
      >
        <Pencil size={14} />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Edit Account">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <IconPicker label="Type" options={TYPE_OPTIONS} value={type} onChange={setType} />

          <Input label="Account name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chase, Wells Fargo..." required />
          <Input label="Bank / Institution (optional)" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g. Chase" />

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
            Save changes
          </Button>
        </form>
      </Modal>
    </>
  );
}
