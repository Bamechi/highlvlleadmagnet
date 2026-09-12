// Single source of truth for pricing, limits, and tiers.
// Every route reads from here — never hardcode a number elsewhere.

// No free tier. Access requires either a paid email on file or the promo code.
export const TIERS = {
  single: { label: "Single Search", resultsPerList: 50, listsIncluded: 1 },
  monthly: { label: "5 Searches a Month", resultsPerList: 75, listsPerMonth: 5 },
  annual: { label: "Annual", resultsPerList: 75, listsPerYear: 60 },
  promo: { label: "Promo Access", resultsPerList: 75, listsPerDay: 5 },
} as const;

export type Tier = keyof typeof TIERS;

export const PRICING = {
  single: { label: "Single Search", price: 4.44, results: 50, interval: "one_time" },
  monthly: { label: "5 Searches a Month", price: 11.11, results: 75, interval: "month", included: 5 },
  // 60 searches/yr at 75 results = ~$30 API cost on $99.99 revenue (~3.3x margin).
  // Dropped from 150 results specifically to keep this tier above water.
  annual: { label: "Annual", price: 99.99, results: 75, interval: "year", included: 60 },
} as const;

// Live Stripe Payment Links — created directly in the Stripe dashboard.
export const STRIPE_PAYMENT_LINKS = {
  single: "https://buy.stripe.com/28E3cw5lLbq99Gee3A7bW02",
  monthly: "https://buy.stripe.com/6oU28s8xX8dX19I5x47bW01",
  annual: "https://buy.stripe.com/fZufZi6pP2TD19IaRo7bW00",
} as const;

// Sub-search caps scale with result count. These are the hard ceiling on
// what a single list can spend, regardless of how aggressive the model gets.
export const SUB_SEARCH_CAP = {
  50: 12,
  75: 18,
} as const;

// Hard daily spend ceiling across ALL users' searches combined.
export const DAILY_API_COST_CEILING_USD = 50;

// Pre-filled category options (multi-select). Covers both tool-hunting and
// business/lead-hunting since the two modes are now one unified search.
export const CATEGORIES = [
  "AI & Automation",
  "Marketing",
  "Sales & Leads",
  "Content & Video",
  "Design & Creative",
  "Analytics & Data",
  "Finance & Ops",
  "Local Business",
  "E-commerce",
  "Productivity",
] as const;

export const BRAND = {
  ctaLinks: [
    { label: "CNFDNT Community", url: "https://ziion.io/nations/cnfdnt" },
    { label: "AiGENT SMITH — AI Tools Directory", url: "https://aigentsmith.app" },
  ],
};
