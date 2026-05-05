import "server-only";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 5_000;

function evictIfFull() {
  if (buckets.size <= MAX_KEYS) return;
  const now = Date.now();
  for (const [k, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(k);
  }
  if (buckets.size > MAX_KEYS) {
    const oldest = [...buckets.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt)[0];
    if (oldest) buckets.delete(oldest[0]);
  }
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetInSeconds: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
  now = Date.now(),
): RateLimitResult {
  evictIfFull();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true, remaining: limit - 1, resetInSeconds: windowSeconds };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      resetInSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return {
    ok: true,
    remaining: limit - bucket.count,
    resetInSeconds: Math.ceil((bucket.resetAt - now) / 1000),
  };
}

export function _resetForTests() {
  buckets.clear();
}
