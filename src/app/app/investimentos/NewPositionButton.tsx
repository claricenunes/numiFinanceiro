"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/stores/useToastStore";
import { createClient } from "@/lib/supabase/client";
import { ASSET_TYPE_ICON } from "@/lib/icons";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { IconPicker } from "@/components/ui/IconPicker";

type AssetType = "stock" | "etf" | "fii" | "fixed_income" | "crypto" | "cash";

const TYPE_OPTIONS = [
  { value: "stock" as AssetType, label: "Stock", icon: ASSET_TYPE_ICON.stock },
  { value: "etf" as AssetType, label: "ETF", icon: ASSET_TYPE_ICON.etf },
  { value: "fii" as AssetType, label: "REIT", icon: ASSET_TYPE_ICON.fii },
  { value: "fixed_income" as AssetType, label: "Fixed Income", icon: ASSET_TYPE_ICON.fixed_income },
  { value: "crypto" as AssetType, label: "Crypto", icon: ASSET_TYPE_ICON.crypto },
  { value: "cash" as AssetType, label: "Cash", icon: ASSET_TYPE_ICON.cash },
];

type Account = { id: string; name: string };

export function NewPositionButton() {
  const [open,         setOpen]         = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [name,         setName]         = useState("");
  const [type,         setType]         = useState<AssetType>("stock");
  const [quantity,     setQuantity]     = useState("");
  const [avgPrice,     setAvgPrice]     = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [accountId,    setAccountId]    = useState("");
  const [accounts,     setAccounts]     = useState<Account[]>([]);

  const router  = useRouter();
  const { show } = useToastStore();

  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    supabase
      .from("accounts")
      .select("id,name")
      .eq("type", "investment")
      .is("deleted_at", null)
      .order("name")
      .then(({ data }) => {
        const accs = (data ?? []) as Account[];
        setAccounts(accs);
        if (accs.length > 0) setAccountId(prev => prev || accs[0].id);
      });
  }, [open]);

  function reset() {
    setName(""); setType("stock"); setQuantity(""); setAvgPrice("");
    setCurrentPrice(""); setAccountId("");
  }

  function handleClose() { setOpen(false); reset(); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseFloat(quantity.replace(",", "."));
    const avg = parseFloat(avgPrice.replace(",", "."));
    if (!name.trim() || !qty || !avg) {
      show("Name, quantity and average price are required", "error");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { show("Session expired", "error"); setLoading(false); return; }

    const row: Record<string, unknown> = {
      user_id:       user.id,
      name:          name.trim(),
      type,
      quantity:      qty,
      average_price: avg,
      currency_code: "USD",
    };
    if (accountId) row.account_id = accountId;
    const cur = parseFloat(currentPrice.replace(",", "."));
    if (cur > 0) row.current_price = cur;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("user_positions") as any).insert(row);
    setLoading(false);
    if (error) { show("Error: " + error.message, "error"); return; }

    show("Position added!", "success");
    handleClose();
    router.refresh();
  }

  return (
    <>
      <Button variant="accent" size="sm" onClick={() => setOpen(true)}>+ New Position</Button>

      <Modal open={open} onClose={handleClose} title="New Position">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <IconPicker label="Type" options={TYPE_OPTIONS} value={type} onChange={setType} />

          <Input label="Name / Ticker" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. AAPL, VTI, Treasury Bond..." required autoFocus />

          {accounts.length > 0 && (
            <Select label="Investment account" value={accountId} onChange={e => setAccountId(e.target.value)}>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input label="Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} type="text" inputMode="decimal" placeholder="0" required />
            <Input label="Average price ($)" value={avgPrice} onChange={e => setAvgPrice(e.target.value)} type="text" inputMode="decimal" placeholder="0.00" required />
          </div>

          <Input label="Current price ($) — optional" value={currentPrice} onChange={e => setCurrentPrice(e.target.value)} type="text" inputMode="decimal" placeholder="0.00" />

          <Button type="submit" variant="accent" loading={loading} className="w-full mt-1">
            Add position
          </Button>
        </form>
      </Modal>
    </>
  );
}
