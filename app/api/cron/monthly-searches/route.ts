import { NextRequest, NextResponse } from "next/server";

// Triggered by Vercel Cron (see vercel.json) on a monthly schedule.
// Pulls every paid subscriber's saved topic from the Sheet and re-runs
// their search automatically, emailing fresh results without them
// lifting a finger. This is the "5 automatic searches/mo" and annual
// tier feature — confirmed as v1 scope on top of the original spec.
//
// NOTE: this reads saved searches from the same Sheet the capture route
// writes to. A subscriber's most recent submission's topic/filters are
// treated as their "saved search" — if you want a dedicated save/edit UI
// instead of "your last search is your saved search," that's a follow-up
// build, not included here.

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sheetUrl = process.env.SHEET_READ_URL; // Apps Script doGet endpoint, returns paid subscribers
  if (!sheetUrl) {
    return NextResponse.json({ error: "SHEET_READ_URL not configured" }, { status: 500 });
  }

  const subscribersRes = await fetch(sheetUrl);
  const subscribers: Array<{ email: string; topic: string; mode: string; filters: string }> =
    await subscribersRes.json();

  const results = [];
  for (const sub of subscribers) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: sub.topic,
          mode: sub.mode,
          email: sub.email,
          filters: JSON.parse(sub.filters || "{}"),
          tier: "paid",
        }),
      });
      results.push({ email: sub.email, ok: res.ok });
    } catch (err) {
      results.push({ email: sub.email, ok: false, error: String(err) });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
