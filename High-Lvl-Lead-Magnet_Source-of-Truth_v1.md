# High Lvl Lead Magnet — Master Source of Truth (v3, FINAL)
**Status:** Fully locked. Backend built. Ready for handoff to Fable for the frontend/website build.
**Owner:** B. Amechi | High Lvl Media
**Last updated:** Sept 11, 2026

---

## 1. What This Is

A self-serve web tool: visitor enters a topic + filters, drops an email, and gets a curated resource list (AI tools or business leads) delivered on-screen and via email. Every submission also logs to a Google Sheet — that log is the actual lead-magnet asset, separate from the results email the visitor receives.

Standalone site, cross-linked to aigentsmith.app. Not a feature bolted onto AiGENT SMITH.

## 2. Product Spec (Locked)

**User flow:**
1. One-screen form — topic input, filters (category, location, "free only," "highly rated," count), email field.
2. "Build my list" → progress state.
3. Server searches, compiles list → teaser of first 5 shown on-screen, full list emailed.
4. Email + topic + filters logged to the Sheet — this is the conversion event.

**Two modes (toggle), both live at launch:**
- **AI Tools & Resources** — matches your AiGENT SMITH core use case.
- **Business Leads** — niche + location, name/site/public contact only. Every emailed list carries a public-info-only opt-out line. Flagged, not legally reviewed.

**Tech stack:**
- Next.js + Tailwind, deployed on Vercel.
- Visual identity: the "Construct" aesthetic from aigentsmith.app — mint-white base (#eef7ef), green (#0f8a3e), signal green (#00ff41), near-black ink (#0b1f14), matrix-grid background, white glass cards, Archivo Black display type + Inter body.
- Results engine: Anthropic API (Sonnet) from a server route, web_search tool enabled, capped at 6 sub-searches per list.
- Email delivery: Resend.
- Capture: Google Sheet via Apps Script (see Section 5 for the live URL and code).
- Payments: Stripe Payment Links (see Section 6).
- Rate-limited by email/tier, results capped by tier.

## 3. Funnel Mapping (Brunson Value Ladder)

| Stage | Asset |
|---|---|
| Bait | The free tool itself |
| Frontend | $4.44 single search — zero-commitment entry point |
| Core | $11.11/mo — 5 searches, automatic monthly re-run of a saved topic |
| Continuity | $99.99/yr — 60 searches, same automatic re-run, discounted for commitment |
| Backend | Ecosystem ascension — every captured lead is a candidate for CNFDNT / Ziion opt-in (not yet wired to an actual sequence — see To-Dos) |

## 4. God's Advocate — Standing Challenges

- **Annual margin is thinner than the other two tiers on purpose.** $99.99/yr nets ~3.3x margin on worst-case cost vs. ~9x (single search) and ~4.4x (monthly). Confirmed and kept as-is — flagging so it's a known trade-off, not a missed one, if annual volume ever spikes.
- **Rate limiting and the cost ceiling are in-memory**, not cross-instance-accurate on Vercel serverless. Fine for launch; swap for Vercel KV/Upstash before any real distribution push.
- **The "automatic monthly search" feature reads a subscriber's most recent submission as their saved search.** There's no dedicated save/edit UI. If someone runs three different one-off searches, whichever was most recent becomes their monthly auto-run — worth a real saved-search UI once this has paying users.
- **Business Leads mode ships without legal review**, per your call. The opt-out line is the only safeguard currently built in.
- **The captured lead list has no destination sequence yet.** Right now it's a spreadsheet with an email column. Without a wired CNFDNT/Ziion follow-up, the funnel stops at "captured," not "converted."

## 5. Google Sheet Capture (Live)

- **Sheet:** "High Lvl Lead Magnet intake form" — tab must be renamed from `Sheet1` to `Submissions` (flagged, not yet done as of this doc).
- **Columns (A–H):** Email | Topic | Mode | Filters | Tier | Results | Count | Timestamp
- **Apps Script Web App URL (doubles as both write and read endpoint):**
  `https://script.google.com/macros/s/AKfycbxAvmbl4rU8kL55jYxqGgsLjVcWugKrY6ExQaK7__SV2Hjis0iOZc_J4W_s8Y3WVl9Vgg/exec`
- Code.gs content is in the project zip at `apps-script/Code.gs` — paste it in, save, then redeploy via **Manage deployments > Edit > New version** to keep this same URL live.

## 6. Payments — Stripe (Locked, switched from Polar)

| Product | Price | Link |
|---|---|---|
| Single Search | $4.44 one-time | https://buy.stripe.com/28E3cw5lLbq99Gee3A7bW02 |
| 5 Searches/mo | $11.11/month | https://buy.stripe.com/6oU28s8xX8dX19I5x47bW01 |
| Annual | $99.99/year | https://buy.stripe.com/fZufZi6pP2TD19IaRo7bW00 |

**Still needed from you:** Stripe Secret Key (Dashboard > Developers > API keys), and after first deploy, a webhook endpoint pointed at `/api/webhooks/stripe` subscribed to `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted` — Stripe gives you a signing secret at that point.

## 7. Credentials Status

| Needed | Status |
|---|---|
| Google Sheet + Apps Script URL | Received, live |
| Stripe Payment Links | Received, live |
| Stripe Secret Key | **Outstanding** |
| Stripe Webhook Secret | Outstanding (needs live deploy URL first) |
| Anthropic API Key | **Outstanding** |
| Resend API Key | **Outstanding** |
| "vanta" code | **Unclear — what service does this apply to?** Flagged twice, unanswered. |

## 8. API Contract — For the Fable Frontend Build

The backend (this build) is functionally complete and independent of whatever frontend Fable produces. Point any new UI at these existing routes rather than rebuilding the logic:

**POST `/api/search`**
Request body: `{ topic: string, mode: "ai_tools" | "business_leads", email: string, filters?: { category?, location?, freeOnly?, highlyRated? }, tier?: "free" | "paid" }`
Response: `{ teaser: Result[5], totalResults: number, message: string }` where `Result = { name, description, url, contact? }`

**POST `/api/webhooks/stripe`** — Stripe-called only, not for frontend use.

**GET `/api/cron/monthly-searches`** — Vercel Cron-called only, requires `Authorization: Bearer <CRON_SECRET>`.

Design tokens for Fable to match aigentsmith.app exactly: see Section 2 — colors, matrix grid, Archivo Black/Inter pairing, glass-card treatment (`background: rgba(255,255,255,0.72)`, `backdrop-filter: blur(8px)`).

## 9. To-Dos
- [ ] Rename Sheet tab from `Sheet1` to `Submissions`
- [ ] Paste updated Code.gs, redeploy (new version, same URL)
- [ ] Provide Stripe Secret Key
- [ ] Provide Anthropic API key
- [ ] Provide Resend API key
- [ ] Set up Stripe webhook after first deploy, provide signing secret
- [ ] Clarify the "vanta" code
- [ ] Wire captured leads to an actual CNFDNT/Ziion sequence
- [ ] Hand this doc + the project zip to Fable for the frontend build

## Sources
1. PROMPT_High_Lvl_Lead_Magnet.md — B. Amechi, original product spec
2. High Lvl Cinematic Website Playbook v1.0 — aesthetic reference (aigentsmith.app Construct system)
3. This conversation — all pricing, platform, and data-capture decisions as confirmed turn-by-turn above
