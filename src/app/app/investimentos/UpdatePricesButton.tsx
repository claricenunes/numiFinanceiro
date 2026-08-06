"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToastStore } from "@/stores/useToastStore";

interface PositionStub {
  id: string;
  name: string;
  ticker: string | null;
}

interface Props { positions: PositionStub[] }

export function UpdatePricesButton({ positions }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { show } = useToastStore();

  // Map positionId → symbol (prefer ticker; fallback to name if it looks like a ticker)
  const tickerMap = Object.fromEntries(
    positions
      .map((p) => {
        const sym = p.ticker ?? (p.name && /^[A-Z0-9]{2,12}$/.test(p.name) ? p.name : null);
        return sym ? [p.id, sym] as [string, string] : null;
      })
      .filter((x): x is [string, string] => x !== null)
  );

  if (Object.keys(tickerMap).length === 0) return null;

  async function handleUpdate() {
    setLoading(true);
    try {
      const tickers = [...new Set(Object.values(tickerMap))];
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tickers }),
      });

      const json = await res.json() as { prices?: Record<string, number>; error?: string };
      if (json.error) throw new Error(json.error);

      const prices = json.prices ?? {};
      const supabase = createClient();
      const now = new Date().toISOString();

      const updates = Object.entries(tickerMap)
        .filter(([, sym]) => prices[sym] !== undefined)
        .map(([id, sym]) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (supabase.from("user_positions") as any).update({
            current_price: prices[sym],
            current_price_updated_at: now,
          }).eq("id", id)
        );

      await Promise.all(updates);

      const count = updates.length;
      show(
        count > 0
          ? `${count} price${count !== 1 ? "s" : ""} updated!`
          : "No prices found for the registered tickers",
        count > 0 ? "success" : "warning"
      );
      router.refresh();
    } catch {
      show("Error fetching prices. Check the tickers.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleUpdate}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border"
      style={{
        background: "color-mix(in srgb, var(--numi-landing-heading) 6%, transparent)",
        borderColor: "var(--numi-border)",
        color: loading ? "var(--numi-text-3)" : "var(--numi-landing-heading)",
        opacity: loading ? 0.7 : 1,
      }}
    >
      <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
      {loading ? "Updating..." : "Update prices"}
    </button>
  );
}
