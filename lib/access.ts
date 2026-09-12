// Access gate. No free tier — a request runs only if the email has paid
// status in the Sheet, or the promo code matches.
//
// KNOWN TRADE-OFF (flagged, accepted at launch): this is identity by email
// claim, not authentication. Anyone who knows a paying customer's email can
// use their access. Acceptable at this price point; upgrade to magic-link
// auth (Resend one-time links + session) if abuse appears.

export type AccessResult =
  | { ok: true; via: "paid" | "promo"; results: number }
  | { ok: false; reason: string };

export async function checkAccess(email: string, promoCode?: string): Promise<AccessResult> {
  const validPromo = process.env.PROMO_CODE;
  if (promoCode && validPromo && promoCode.trim().toLowerCase() === validPromo.toLowerCase()) {
    return { ok: true, via: "promo", results: 75 };
  }

  const url = process.env.SHEET_READ_URL;
  if (!url) {
    return { ok: false, reason: "Access check unavailable. Try again shortly." };
  }

  try {
    const res = await fetch(`${url}?action=check_tier&email=${encodeURIComponent(email)}`);
    const data = await res.json();
    if (data.tier === "paid") {
      // Single-search buyers get 50; subscribers get 75. The Sheet stores
      // which product they bought in the Results column via the webhook.
      return { ok: true, via: "paid", results: data.plan === "single" ? 50 : 75 };
    }
    return { ok: false, reason: "No active plan found for this email." };
  } catch {
    return { ok: false, reason: "Couldn't verify your plan. Try again shortly." };
  }
}
