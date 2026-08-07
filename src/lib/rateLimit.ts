/**
 * Small in-memory per-key rate limiter (resets on cold start — same
 * accepted trade-off already used by `fia/analyze/route.ts` for a
 * serverless MVP). Each route that needs one calls `createRateLimiter`
 * once at module scope to get its own independent counter store.
 */
export function createRateLimiter(windowMs: number, limit: number) {
  const store = new Map<string, { count: number; resetAt: number }>();

  return function check(key: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
    }
    if (entry.count >= limit) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }
    entry.count++;
    return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
  };
}
