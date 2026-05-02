import { NextResponse } from "next/server";
import { getStripe, isStripeConfigured, eurosToCents } from "@/lib/stripe";
import { getPayloadClient } from "@/lib/payload-client";
import { confirmCustomerOrder } from "@/lib/email";

interface CheckoutItem {
  productId: string;
  name: string;
  brand: string;
  priceTTC: number;
  quantity: number;
  imageSrc?: string;
}

interface Customer {
  name: string;
  email: string;
  phone?: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  notes?: string;
}

interface CheckoutPayload {
  items: CheckoutItem[];
  customer: Customer;
}

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `MP-${year}-${random}`;
}

export async function POST(request: Request) {
  let body: Partial<CheckoutPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Panier vide." }, { status: 400 });
  }
  if (!body.customer || !body.customer.email || !body.customer.name) {
    return NextResponse.json({ error: "Coordonnées client manquantes." }, { status: 400 });
  }

  const items = body.items as CheckoutItem[];
  const customer = body.customer as Customer;

  // Calcul totaux
  const subtotal = items.reduce((acc, it) => acc + it.priceTTC * it.quantity, 0);
  const vat = subtotal - subtotal / 1.21;
  const shipping = 0; // gratuit pour l'instant, Phase 7 : calcul dynamique selon zone
  const total = subtotal + shipping;

  const orderNumber = generateOrderNumber();

  // Stripe non configuré → mode dev : créer la commande directement avec payment status "pending"
  if (!isStripeConfigured()) {
    try {
      const payload = await getPayloadClient();
      const order = await payload.create({
        collection: "orders",
        data: {
          orderNumber,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone ?? "",
          customerAddress: `${customer.address}, ${customer.postalCode} ${customer.city}, ${customer.country}`,
          items: items.map((it) => ({
            productSlug: it.productId,
            productName: it.name,
            productBrand: it.brand,
            quantity: it.quantity,
            unitPrice: it.priceTTC,
            totalPrice: it.priceTTC * it.quantity,
          })),
          subtotal: Number((subtotal - vat).toFixed(2)),
          vat: Number(vat.toFixed(2)),
          shipping,
          total,
          paymentStatus: "pending",
          fulfillmentStatus: "new",
        },
      });

      // Email confirmation client (mode "commande à payer plus tard")
      await confirmCustomerOrder({
        customerName: customer.name,
        customerEmail: customer.email,
        orderNumber,
        total,
        items: items.map((it) => ({ name: it.name, quantity: it.quantity })),
      }).catch((err) => console.error("[checkout] confirm email failed", err));

      return NextResponse.json({
        ok: true,
        orderId: order.id,
        warning: "Stripe non configuré, commande enregistrée en attente de paiement (mode dev).",
      });
    } catch (err) {
      console.error("[checkout] order creation failed", err);
      return NextResponse.json(
        { error: "Erreur lors de la création de la commande." },
        { status: 500 }
      );
    }
  }

  // Stripe configuré → créer une Checkout Session
  try {
    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    // Créer la commande en base AVANT d'aller sur Stripe, statut "pending"
    const payload = await getPayloadClient();
    const order = await payload.create({
      collection: "orders",
      data: {
        orderNumber,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone ?? "",
        customerAddress: `${customer.address}, ${customer.postalCode} ${customer.city}, ${customer.country}`,
        items: items.map((it) => ({
          productSlug: it.productId,
          productName: it.name,
          productBrand: it.brand,
          quantity: it.quantity,
          unitPrice: it.priceTTC,
          totalPrice: it.priceTTC * it.quantity,
        })),
        subtotal: Number((subtotal - vat).toFixed(2)),
        vat: Number(vat.toFixed(2)),
        shipping,
        total,
        paymentStatus: "pending",
        fulfillmentStatus: "new",
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "bancontact"],
      line_items: items.map((it) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: `${it.brand} ${it.name}`,
            description: `Référence : ${it.productId}`,
          },
          unit_amount: eurosToCents(it.priceTTC),
        },
        quantity: it.quantity,
      })),
      customer_email: customer.email,
      success_url: `${baseUrl}/commande/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
      metadata: {
        orderId: String(order.id),
        orderNumber,
      },
    });

    // Mettre à jour la commande avec le sessionId
    await payload.update({
      collection: "orders",
      id: order.id,
      data: { stripeCheckoutSessionId: session.id },
    });

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      checkoutUrl: session.url,
    });
  } catch (err) {
    console.error("[checkout] stripe failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur Stripe inconnue." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
