import { NextResponse } from "next/server";
import { PaymentMethod, SequenceType, Locale, type Payment } from "@mollie/api-client";
import { getMollie, isMollieConfigured, formatMollieAmount } from "@/lib/mollie";
import { getPayloadClient } from "@/lib/payload-client";
import { confirmCustomerOrder } from "@/lib/email";

/**
 * Checkout via Mollie (V1.6 — migration depuis Stripe).
 *
 * Flux :
 *  1. Frontend POST /api/checkout avec {items, customer}
 *  2. On valide, on calcule les totaux, on génère un orderNumber
 *  3. On crée la commande Payload statut "pending"
 *  4. On crée le paiement Mollie (POST /payments) avec redirectUrl + webhookUrl
 *  5. On retourne checkoutUrl au front, qui redirige le user vers Mollie
 *  6. Mollie traite le paiement, redirige vers /commande/{orderId}
 *  7. En parallèle Mollie POST /api/webhooks/mollie qui finalise la commande
 */

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
  const shipping = 0; // gratuit pour l'instant, calcul dynamique selon zone à venir
  const total = subtotal + shipping;

  const orderNumber = generateOrderNumber();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Mode dev sans Mollie : créer la commande directement, pas de checkout url
  if (!isMollieConfigured()) {
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
        warning: "Mollie non configuré, commande enregistrée en attente de paiement (mode dev).",
      });
    } catch (err) {
      console.error("[checkout] order creation failed", err);
      return NextResponse.json(
        { error: "Erreur lors de la création de la commande." },
        { status: 500 },
      );
    }
  }

  // Mollie configuré : créer la commande Payload + le payment Mollie
  try {
    const mollie = getMollie();

    // 1. Commande Payload statut pending (avant Mollie pour avoir un orderId)
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

    // 2. Création du payment Mollie
    // Description visible sur le relevé bancaire du client (max 100 chars).
    const description = `Mister Pellets ${orderNumber}`;
    const itemsLabel = items
      .slice(0, 3)
      .map((it) => `${it.quantity}× ${it.brand} ${it.name}`)
      .join(", ");

    const payment = (await mollie.payments.create({
      amount: formatMollieAmount(total),
      description: description.slice(0, 100),
      redirectUrl: `${baseUrl}/commande/${order.id}`,
      webhookUrl: `${baseUrl}/api/webhooks/mollie`,
      // Bancontact + Visa/Mastercard + Apple Pay prioritaires pour la
      // Belgique. Forfait Bancontact à 0,39 € (vs 1,4 % + 0,25 € chez Stripe).
      method: [
        PaymentMethod.bancontact,
        PaymentMethod.creditcard,
        PaymentMethod.applepay,
      ],
      sequenceType: SequenceType.oneoff,
      metadata: {
        orderId: String(order.id),
        orderNumber,
        itemsLabel: itemsLabel.slice(0, 200),
      },
      billingEmail: customer.email,
      locale: Locale.fr_BE,
    })) as Payment;

    // 3. Lier le payment id à la commande
    await payload.update({
      collection: "orders",
      id: order.id,
      data: {
        molliePaymentId: payment.id,
      } as never,
    });

    const checkoutUrl = payment.getCheckoutUrl();
    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "URL de paiement Mollie indisponible." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      checkoutUrl,
    });
  } catch (err) {
    console.error("[checkout] mollie failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur Mollie inconnue." },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
