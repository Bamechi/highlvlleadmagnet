# High Lvl Lead Magnet

Self-serve tool: visitor enters a topic + filters, drops their email, gets a curated
list (AI tools or business leads) emailed to them. Every submission also logs to a
Google Sheet — that log is the actual lead-magnet asset.

Full spec: see `High-Lvl-Lead-Magnet_Source-of-Truth_v1.md` (delivered alongside this).

## What's built

- `app/page.tsx` — the form UI (Construct aesthetic, matches aigentsmith.app)
- `app/api/search/route.ts` — calls Anthropic (Sonnet + web_search tool, capped at 6 sub-searches/list), enforces tier limits and the $10/day cost ceiling
- `app/api/webhooks/polar/route.ts` — flips a subscriber to "paid" in the Sheet when Polar confirms payment
- `app/api/cron/monthly-searches/route.ts` — Vercel Cron job, re-runs paid subscribers' saved topic monthly and emails fresh results automatically
- `lib/email.ts` — Resend delivery, branded HTML, opt-out line on Business Leads mode
- `lib/sheetLogger.ts` / `apps-script/Code.gs` — the Sheet capture pipeline
- `lib/constants.ts` — every price, limit, and tier lives here — change pricing in one place

## What you need to do before this goes live

1. **Google Sheet capture:** Create a new Sheet with a tab named `Submissions` and header row `Email | Topic | Mode | Filters | Tier | ResultsCount | Timestamp`. Open Extensions > Apps Script, paste in `apps-script/Code.gs`, deploy as a Web App (Execute as: Me, Access: Anyone). Put the resulting `/exec` URL into **both** `SHEET_WEBHOOK_URL` and `SHEET_READ_URL` — it's the same deployment; `doPost` handles logging and tier updates, `doGet` handles the monthly cron's subscriber read.
2. **Resend:** Create an account at resend.com, verify a sending domain (or use their test domain to start), generate an API key → `RESEND_API_KEY`.
3. **Stripe:** The 3 Payment Links are already live (Single Search $4.44, Monthly $11.11, Annual $99.99 — built directly into `lib/constants.ts`). Get your Secret Key from Stripe Dashboard > Developers > API keys → `STRIPE_SECRET_KEY`. After first deploy, go to Developers > Webhooks > Add endpoint, point it at `https://<your-domain>/api/webhooks/stripe`, subscribe to `checkout.session.completed`, `invoice.paid`, and `customer.subscription.deleted`, and put the signing secret it generates into `STRIPE_WEBHOOK_SECRET`.
4. **Anthropic:** Generate an API key at console.anthropic.com → `ANTHROPIC_API_KEY`.
5. **Cron secret:** Generate any random string for `CRON_SECRET` — this stops the monthly cron endpoint from being callable by anyone who finds the URL.

## Deploy to Vercel

```bash
npm install
vercel
```

Then in the Vercel dashboard, add every variable from `.env.example` under
Project Settings > Environment Variables, and redeploy. `NEXT_PUBLIC_BASE_URL`
should be set to your live Vercel URL after the first deploy.

## Push to GitHub — copy-paste prompt

Paste this into a new Claude Code session (or any terminal-capable agent) with
this project folder open, once you have a GitHub account ready:

```
Initialize a git repo in this folder, create a new GitHub repository called
"high-lvl-lead-magnet" under my account, and push this code to it on the main
branch. Add a .gitignore for node_modules, .env, and .next. Do not commit the
.env file — .env.example only.
```

## Known scope notes (carried over from the source-of-truth doc)

- Rate limiting and the cost ceiling are in-memory — accurate per serverless
  instance, not perfectly accurate across all of them. Fine for launch; swap
  for Vercel KV/Upstash if volume grows past a few hundred submissions/day.
- The monthly cron treats a subscriber's most recent submission as their
  "saved search." A dedicated save/edit UI for saved searches is a follow-up,
  not included in this build.
- Business Leads mode ships now per your call — the opt-out line is in the
  email template, but this has not had a legal review.
