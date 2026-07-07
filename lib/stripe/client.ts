import Stripe from "stripe";
import { env, isStripeEnabled } from "@/lib/env";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!isStripeEnabled()) {
    throw new Error(
      "Stripe is not configured. Add STRIPE_SECRET_KEY to .env"
    );
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(env.STRIPE_SECRET_KEY!);
  }
  return stripeInstance;
}

export function getStripePublishableKey(): string | null {
  return env.STRIPE_PUBLISHABLE_KEY ?? null;
}
