// Simple in-memory rate limiter, keyed by email or IP. Same caveat as
// costCeiling.ts: resets on cold start. Fine for launch; move to
// Vercel KV/Upstash if this needs to be bulletproof across instances.

const submissions = new Map<string, number[]>();

export function isRateLimited(key: string, maxPerDay: number): boolean {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const history = (submissions.get(key) || []).filter((t) => t > oneDayAgo);

  if (history.length >= maxPerDay) {
    submissions.set(key, history);
    return true;
  }

  history.push(now);
  submissions.set(key, history);
  return false;
}
