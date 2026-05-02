import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getPayloadClient } from "@/lib/payload-client";
import { confirmCustomerOrder } from "@/lib/email";

/**
 * Webhook Stripe — confirme le paiement d'une Checkout Session et met à jour
 * la commande Payload + envoie l'email de confirmation client.
 *
 * Setup côté Stripe Dashboard → Developers → Webhooks → Add endpoint :
 *   URL : https://www.mister-pellets.be/api/webhooks/stripe
 *   Events : checkout.session.completed, payment_intent.payment_failed
 *   Secret : STRIPE_WEBHOOK_SECRET dans env vars
 */

export const runtime = "nodejs"; // Stripe nécessite Node runtime (pas Edge)

export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook non configuré (signature ou secret manquant)." },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed", err);
    return NextResponse.json(
      { error: "Signature webhook invalide." },
      { status: 400 }
    );
  }

  // Handle event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      console.error("[stripe-webhook] no orderId in metadata");
      return NextResponse.json({ ok: true }); // ack quand même
    }

    try {
      const payload = await getPayloadClient();
      const order = await payload.update({
        collection: "orders",
        id: orderId,
        data: {
          paymentStatus: "paid",
          fulfillmentStatus: "processing",
          stripePaymentIntentId: typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? "",
        },
      });

      // Email confirmation client
      await confirmCustomerOrder({
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        orderNumber: order.orderNumber,
        total: order.total,
        items: order.items.map((it) => ({ name: it.productName, quantity: it.quantity })),
      }).catch((err) => console.error("[stripe-webhook] confirm email failed", err));

      console.log(`[stripe-webhook] order ${order.orderNumber} marked as paid`);
    } catch (err) {
      console.error("[stripe-webhook] failed to update order", err);
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const sessionId = (intent.metadata?.checkout_session_id as string) ?? null;
    console.warn(`[stripe-webhook] payment failed for intent ${intent.id} (session ${sessionId})`);
    // Phase ultérieure : mark order as failed si on retrouve l'orderId
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
