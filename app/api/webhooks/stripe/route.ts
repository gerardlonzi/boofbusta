import { NextRequest } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe/checkout";
import { confirmPayment } from "@/services/order.service";
import { isStripeEnabled } from "@/lib/env";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  if (!isStripeEnabled()) {
    return apiError("Stripe not configured", 503);
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return apiError("Missing signature", 400);

  try {
    const event = await constructWebhookEvent(body, signature);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.metadata?.orderId) {
        await confirmPayment(session.id);
        await prisma.order.update({
          where: { id: session.metadata.orderId },
          data: { stripePaymentId: session.payment_intent as string },
        });
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error("[Stripe Webhook]", error);
    return apiError("Webhook error", 400);
  }
}
