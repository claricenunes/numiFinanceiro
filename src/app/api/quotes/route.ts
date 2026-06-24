type BrapiResult = { symbol: string; regularMarketPrice: number };
type BrapiResponse = { results?: BrapiResult[] };

export async function POST(req: Request): Promise<Response> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = await req.json() as { tickers?: unknown };
  if (!Array.isArray(body.tickers) || body.tickers.length === 0) {
    return Response.json({ prices: {} });
  }

  // Sanitize: only uppercase alphanumeric, max 20 tickers
  const safe = (body.tickers as unknown[])
    .filter((t): t is string => typeof t === "string" && /^[A-Z0-9]{2,12}$/.test(t))
    .slice(0, 20);

  if (safe.length === 0) return Response.json({ prices: {} });

  try {
    const res = await fetch(
      `https://brapi.dev/api/quote/${safe.join(",")}?fundamental=false`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) throw new Error(`Brapi returned ${res.status}`);

    const data = await res.json() as BrapiResponse;
    const prices: Record<string, number> = {};
    for (const r of data.results ?? []) {
      if (r.symbol && typeof r.regularMarketPrice === "number") {
        prices[r.symbol] = r.regularMarketPrice;
      }
    }
    return Response.json({ prices });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 502 });
  }
}
