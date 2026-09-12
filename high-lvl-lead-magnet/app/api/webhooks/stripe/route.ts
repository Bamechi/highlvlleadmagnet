import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateTierStatus } from "@/lib/sheetLogger";
import { STRIPE_PAYMENT_LINKS } from "@/lib/constants";



// Stripe requires the RAW request body for signature verification —
// do not call req.json() before this, it will invalidate the signature.
export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured yet." }, { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    // Fires for both the one-time $4.44 link and the first payment on
    // the $11.11/mo and $99.99/yr subscription links.
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email;
      const plan = session.mode === "subscription" ? "subscription" : "single";
      if (email) await updateTierStatus(email, "paid", plan);
      break;
    }
    // Fires on every subscription renewal — re-affirms paid status.
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const email = invoice.customer_email;
      if (email) await updateTierStatus(email, "paid", "subscription");
      break;
    }
    // Fires when a subscription ends (cancellation or failed renewal).
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customer = await stripe.customers.retrieve(sub.customer as string);
      const email = (customer as Stripe.Customer).email;
      if (email) await updateTierStatus(email, "free");
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({ status: "Stripe webhook endpoint active" });
}
