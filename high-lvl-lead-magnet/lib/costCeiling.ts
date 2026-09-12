import { DAILY_API_COST_CEILING_USD } from "./constants";

// In-memory tracker for a single serverless instance. Not cross-instance
// accurate on Vercel (cold starts reset it). Starting safety net only —
// swap for Vercel KV / Upstash for a hard guarantee.

let dailySpend = 0;
let dayStamp = new Date().toDateString();

function resetIfNewDay() {
  const today = new Date().toDateString();
  if (today !== dayStamp) { dayStamp = today; dailySpend = 0; }
}

export function recordSpend(amountUsd: number) {
  resetIfNewDay();
  dailySpend += amountUsd;
}

export function isCeilingReached(): boolean {
  resetIfNewDay();
  return dailySpend >= DAILY_API_COST_CEILING_USD;
}

export function currentSpend(): number {
  resetIfNewDay();
  return dailySpend;
}
