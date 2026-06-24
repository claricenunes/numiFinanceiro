"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
          ? `${count} cotação${count !== 1 ? "ões" : ""} atualizada${count !== 1 ? "s" : ""}!`
          : "Nenhuma cotação encontrada para os tickers cadastrados",
        count > 0 ? "success" : "warning"
      );
      router.refresh();
    } catch {
      show("Erro ao buscar cotações. Verifique os tickers.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleUpdate}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
      style={{
        background: "rgba(52,211,153,0.08)",
        border: "1px solid rgba(52,211,153,0.25)",
        color: loading ? "#475569" : "#34D399",
        opacity: loading ? 0.7 : 1,
      }}
    >
      <RefreshIcon spinning={loading} />
      {loading ? "Atualizando..." : "Atualizar cotações"}
    </button>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 transition-transform ${spinning ? "animate-spin" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 4v6h6" />
      <path d="M23 20v-6h-6" />
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
    </svg>
  );
}
