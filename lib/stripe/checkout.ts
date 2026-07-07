import { env } from "@/lib/env";
import { getStripe } from "./client";

export interface CheckoutLineItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CreateCheckoutParams {
  orderId: string;
  orderNumber: string;
  items: CheckoutLineItem[];
  customerEmail: string;
  successUrl?: string;
  cancelUrl?: string;
}

export async function createCheckoutSession(params: CreateCheckoutParams) {
  const stripe = getStripe();
  const baseUrl = env.NEXT_PUBLIC_APP_URL;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: params.customerEmail,
    line_items: params.items.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })),
    metadata: {
      orderId: params.orderId,
      orderNumber: params.orderNumber,
    },
    success_url:
      params.successUrl ??
      `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: params.cancelUrl ?? `${baseUrl}/checkout/error`,
  });

  return session;
}

export async function retrieveCheckoutSession(sessionId: string) {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId);
}

export async function constructWebhookEvent(
  body: string,
  signature: string
) {
  const stripe = getStripe();
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }
  return stripe.webhooks.constructEvent(
    body,
    signature,
    env.STRIPE_WEBHOOK_SECRET
  );
}
