// Logs every submission to the Google Sheet via an Apps Script web app.
// This is the actual lead-magnet mechanic — the visitor gets their results
// by email, but this call is what builds YOUR list.
//
// Setup: deploy an Apps Script "Web App" bound to the target Sheet that
// accepts a POST with JSON body and appends a row. Put its /exec URL in
// SHEET_WEBHOOK_URL. A minimal Apps Script doGet/doPost pair is documented
// in the README.

interface LogEntry {
  email: string;
  topic: string;
  mode: string;
  filters: Record<string, any>;
  tier: string;
  resultsCount: number;
  timestamp: string;
}

export async function logSubmission(entry: LogEntry): Promise<void> {
  const url = process.env.SHEET_WEBHOOK_URL;
  if (!url) {
    console.error("SHEET_WEBHOOK_URL not set — submission not logged:", entry.email);
    return;
  }

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
  } catch (err) {
    // Never let a logging failure block the visitor from getting their list.
    console.error("Sheet logging failed (non-blocking):", err);
  }
}

export async function updateTierStatus(email: string, tier: "free" | "paid", plan?: string): Promise<void> {
  const url = process.env.SHEET_WEBHOOK_URL;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_tier", email, tier, plan }),
    });
  } catch (err) {
    console.error("Tier status update failed:", err);
  }
}
