"use client";

import { useState, useEffect, useRef } from "react";
import { STRIPE_PAYMENT_LINKS, CATEGORIES } from "@/lib/constants";

interface Result { name: string; description: string; url: string; contact?: string; }

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setShown(true), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, shown };
}

export default function Home() {
  const [topic, setTopic] = useState("");
  const [email, setEmail] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [cats, setCats] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);
  const [highlyRated, setHighlyRated] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [teaser, setTeaser] = useState<Result[]>([]);
  const [message, setMessage] = useState("");
  const [needsPlan, setNeedsPlan] = useState(false);

  const how = useReveal();
  const pricing = useReveal();

  function toggleCat(c: string) {
    setCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    setNeedsPlan(false);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic, email, promoCode,
          filters: { categories: cats, location, freeOnly, highlyRated },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
        setNeedsPlan(Boolean(data.needsPlan));
        return;
      }
      setTeaser(data.teaser || []);
      setMessage(data.message || "");
      setStatus("done");
    } catch {
      setStatus("error");
      setMessage("Couldn't reach the server. Try again.");
    }
  }

  return (
    <main className="min-h-screen">
      <section className="px-6 pt-24 pb-14 max-w-5xl mx-auto">
        <p className="text-sm font-semibold tracking-wide text-construct-accent">High Lvl AI</p>
        <h1 className="mt-4 font-display text-5xl md:text-7xl leading-[0.95] text-construct-ink">
          Tell it what you
          <br />need. Get the list.
        </h1>
        <p className="mt-6 text-lg text-construct-ink/70 max-w-lg leading-relaxed">
          A research engine that searches the live web, compiles what it finds, and emails
          you a clean list. Tools, resources, or businesses in a niche — one search handles all of it.
        </p>
        <a href="#tool" className="mt-8 inline-block rounded-lg bg-construct-ink px-6 py-3 font-semibold text-construct-signal transition hover:opacity-90">
          Start a search
        </a>
      </section>

      <section id="tool" className="px-6 pb-24 max-w-2xl mx-auto scroll-mt-8">
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 space-y-6">
          <div>
            <label className="text-sm font-semibold text-construct-ink/80">What are you looking for?</label>
            <input
              required value={topic} onChange={(e) => setTopic(e.target.value)}
              placeholder="AI video editing tools — or plumbers in Austin, TX"
              className="mt-2 w-full rounded-lg border border-construct-accent/20 bg-white/80 px-4 py-3.5 text-lg placeholder:text-construct-ink/35 focus:outline-none focus:ring-2 focus:ring-construct-accent"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-construct-ink/80">Narrow it down</label>
            <div className="mt-3 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c} type="button" onClick={() => toggleCat(c)}
                  className={`rounded-full px-3.5 py-1.5 text-sm border transition ${
                    cats.includes(c)
                      ? "bg-construct-accent text-white border-construct-accent"
                      : "bg-white/70 text-construct-ink/75 border-construct-accent/25 hover:border-construct-accent/60"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-construct-ink/80">Location</label>
            <input
              value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Optional"
              className="mt-2 w-full rounded-lg border border-construct-accent/20 bg-white/80 px-4 py-3 placeholder:text-construct-ink/35 focus:outline-none focus:ring-2 focus:ring-construct-accent"
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-construct-ink/80 cursor-pointer">
              <input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} className="accent-construct-accent w-4 h-4" />
              Must be free
            </label>
            <label className="flex items-center gap-2 text-sm text-construct-ink/80 cursor-pointer">
              <input type="checkbox" checked={highlyRated} onChange={(e) => setHighlyRated(e.target.checked)} className="accent-construct-accent w-4 h-4" />
              Highly rated
            </label>
          </div>

          <div className="pt-2 border-t border-construct-accent/15 space-y-4">
            <div>
              <label className="text-sm font-semibold text-construct-ink/80">
                Email you purchased with
              </label>
              <input
                required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="mt-2 w-full rounded-lg border border-construct-accent/20 bg-white/80 px-4 py-3 placeholder:text-construct-ink/35 focus:outline-none focus:ring-2 focus:ring-construct-accent"
              />
              <p className="mt-1.5 text-xs text-construct-ink/50">
                Your list is sent here, and it is how we find your plan.
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-construct-ink/80">Promo code</label>
              <input
                value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Optional"
                className="mt-2 w-full rounded-lg border border-construct-accent/20 bg-white/80 px-4 py-3 placeholder:text-construct-ink/35 focus:outline-none focus:ring-2 focus:ring-construct-accent"
              />
            </div>
          </div>

          <button
            type="submit" disabled={status === "loading"}
            className="w-full rounded-lg bg-construct-ink py-4 font-semibold text-construct-signal transition hover:opacity-90 disabled:opacity-50"
          >
            {status === "loading" ? "Searching the web..." : "Build my list"}
          </button>
        </form>

        {status === "error" && (
          <div className="mt-4 rounded-lg bg-white/80 border border-construct-accent/20 px-5 py-4">
            <p className="text-sm font-semibold text-construct-ink">{message}</p>
            {needsPlan && (
              <>
                <p className="mt-1 text-sm text-construct-ink/65">
                  Pick a plan below, then come back and search with that same email.
                </p>
                <a href="#pricing" className="mt-3 inline-block text-sm font-semibold text-construct-accent underline">
                  See plans
                </a>
              </>
            )}
          </div>
        )}

        {status === "done" && (
          <div className="mt-8 space-y-3">
            <p className="font-semibold text-construct-accent">{message}</p>
            <p className="text-sm text-construct-ink/60">First five, previewed here:</p>
            {teaser.map((r, i) => (
              <div key={i} className="glass-card rounded-xl p-4">
                <div className="font-semibold text-construct-ink">{r.name}</div>
                <div className="mt-1 text-sm text-construct-ink/70">{r.description}</div>
                <a href={r.url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-construct-accent underline break-all">{r.url}</a>
                {r.contact && <div className="mt-1 text-sm text-construct-ink/60">{r.contact}</div>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section ref={how.ref} className={`px-6 py-20 bg-construct-ink text-construct-base transition-opacity duration-700 ${how.shown ? "opacity-100" : "opacity-0"}`}>
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl">What happens when you hit the button</h2>
          <ol className="mt-10 grid md:grid-cols-3 gap-8">
            <li><div className="font-display text-4xl text-construct-signal">01</div>
              <h3 className="mt-3 font-semibold">It searches live</h3>
              <p className="mt-2 text-sm text-construct-base/70 leading-relaxed">Your topic and filters go to a live web search. No stale database, no list someone wrote last year.</p></li>
            <li><div className="font-display text-4xl text-construct-signal">02</div>
              <h3 className="mt-3 font-semibold">It compiles and cleans</h3>
              <p className="mt-2 text-sm text-construct-base/70 leading-relaxed">Results come back structured — names, descriptions, working links. Business contacts are pulled from public listings only.</p></li>
            <li><div className="font-display text-4xl text-construct-signal">03</div>
              <h3 className="mt-3 font-semibold">It lands in your inbox</h3>
              <p className="mt-2 text-sm text-construct-base/70 leading-relaxed">The full list emails to you. The first five preview on screen so you know it worked.</p></li>
          </ol>
        </div>
      </section>

      <section id="pricing" ref={pricing.ref} className={`px-6 py-20 scroll-mt-8 transition-opacity duration-700 ${pricing.shown ? "opacity-100" : "opacity-0"}`}>
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl text-construct-ink">Pick your plan</h2>
          <p className="mt-3 text-construct-ink/65 max-w-lg">
            Purchase with the email you want your lists sent to. Then search with that same email.
          </p>

          <div className="mt-10 grid md:grid-cols-3 gap-5">
            <div className="glass-card rounded-2xl p-6 flex flex-col">
              <div className="font-semibold text-construct-ink">Single Search</div>
              <div className="mt-2 font-display text-3xl text-construct-ink">$4.44</div>
              <p className="mt-3 text-sm text-construct-ink/65 flex-1">One list, up to 50 results. No subscription.</p>
              <a href={STRIPE_PAYMENT_LINKS.single} className="mt-5 rounded-lg border border-construct-accent px-4 py-2.5 text-center text-sm font-semibold text-construct-accent transition hover:bg-construct-accent hover:text-white">Buy one list</a>
            </div>
            <div className="glass-card rounded-2xl p-6 flex flex-col ring-2 ring-construct-accent">
              <div className="font-semibold text-construct-ink">5 Searches a Month</div>
              <div className="mt-2 font-display text-3xl text-construct-ink">$11.11<span className="text-base font-body font-normal text-construct-ink/50">/mo</span></div>
              <p className="mt-3 text-sm text-construct-ink/65 flex-1">Five lists a month, up to 75 results each, and your saved topic re-runs monthly on its own.</p>
              <a href={STRIPE_PAYMENT_LINKS.monthly} className="mt-5 rounded-lg bg-construct-accent px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90">Start monthly</a>
            </div>
            <div className="glass-card rounded-2xl p-6 flex flex-col">
              <div className="font-semibold text-construct-ink">Annual</div>
              <div className="mt-2 font-display text-3xl text-construct-ink">$99.99<span className="text-base font-body font-normal text-construct-ink/50">/yr</span></div>
              <p className="mt-3 text-sm text-construct-ink/65 flex-1">Sixty lists across the year, up to 75 results each, at a lower rate per list.</p>
              <a href={STRIPE_PAYMENT_LINKS.annual} className="mt-5 rounded-lg bg-construct-ink px-4 py-2.5 text-center text-sm font-semibold text-construct-signal transition hover:opacity-90">Go annual</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-6 py-12 border-t border-construct-accent/15">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between">
          <div>
            <div className="font-display text-lg text-construct-ink">High Lvl Lead Magnet</div>
            <p className="mt-1 text-sm text-construct-ink/55">Built by High Lvl Media.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 text-sm">
            <a href="https://aigentsmith.app" className="text-construct-accent hover:underline">AiGENT SMITH — AI tools directory</a>
            <a href="https://ziion.io/nations/cnfdnt" className="text-construct-accent hover:underline">CNFDNT Community</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
