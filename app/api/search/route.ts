import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SUB_SEARCH_CAP } from "@/lib/constants";
import { checkAccess } from "@/lib/access";
import { isRateLimited } from "@/lib/rateLimit";
import { isCeilingReached, recordSpend } from "@/lib/costCeiling";
import { logSubmission } from "@/lib/sheetLogger";
import { sendResultsEmail } from "@/lib/email";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface SearchRequestBody {
  topic: string;
  email: string;
  promoCode?: string;
  filters?: {
    categories?: string[];
    location?: string;
    freeOnly?: boolean;
    highlyRated?: boolean;
  };
}

export async function POST(req: NextRequest) {
  const body: SearchRequestBody = await req.json();
  const { topic, email, promoCode, filters = {} } = body;

  if (!topic || !email) {
    return NextResponse.json({ error: "Enter what you're looking for and your email." }, { status: 400 });
  }

  // Gate first — no work happens before access is confirmed.
  const access = await checkAccess(email, promoCode);
  if (!access.ok) {
    return NextResponse.json({ error: access.reason, needsPlan: true }, { status: 402 });
  }

  if (isRateLimited(email, 5)) {
    return NextResponse.json({ error: "You've hit 5 lists today. Try again tomorrow." }, { status: 429 });
  }

  if (isCeilingReached()) {
    return NextResponse.json(
      { error: "Daily capacity reached across all users. Try again tomorrow." },
      { status: 503 }
    );
  }

  const resultsCount = access.results;
  const maxSearches = SUB_SEARCH_CAP[resultsCount as 50 | 75] ?? 12;

  const filterText = [
    filters.categories?.length && `Categories: ${filters.categories.join(", ")}`,
    filters.location && `Location: ${filters.location}`,
    filters.freeOnly && "Must be free",
    filters.highlyRated && "Must be highly rated",
  ]
    .filter(Boolean)
    .join(". ");

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      tools: [
        { type: "web_search_20250305" as const, name: "web_search", max_uses: maxSearches } as any,
      ],
      messages: [
        {
          role: "user",
          content: `Find resources matching this request. The request may be for AI tools/apps/websites, OR for businesses in a niche and location — infer which from the topic itself and return whichever fits.

For tools/apps/sites: name, one-line description, URL, and whether free or paid.
For businesses: name, one-line description, website, and ONLY publicly listed contact info (phone/email published on their own site). Never include non-public or personal data.

Topic: ${topic}
${filterText}

Return exactly ${resultsCount} results as a JSON array of objects with keys: name, description, url, contact (omit contact if not applicable). Return ONLY the JSON array, no other text.`,
        },
      ],
    });

    // Actual spend estimate scales with the result tier.
    recordSpend(resultsCount === 75 ? 0.51 : 0.34);

    const textBlock = message.content.find((b) => b.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "[]";
    const results = JSON.parse(raw.replace(/```json|```/g, "").trim());

    logSubmission({
      email,
      topic,
      mode: "unified",
      filters,
      tier: access.via,
      resultsCount: results.length,
      timestamp: new Date().toISOString(),
    });
    sendResultsEmail({ email, topic, results, via: access.via });

    return NextResponse.json({
      teaser: results.slice(0, 5),
      totalResults: results.length,
      message: `Full list of ${results.length} sent to ${email}.`,
    });
  } catch (err) {
    console.error("Search route error:", err);
    return NextResponse.json({ error: "Something went wrong building your list. Try again." }, { status: 500 });
  }
}
