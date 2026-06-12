import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { PaymentMethod, SequenceType, Locale, type Payment } from "@mollie/api-client";
import { getMollie, isMollieConfigured, formatMollieAmount } from "@/lib/mollie";
import { getPayloadClient } from "@/lib/payload-client";
import { getProductBySlug } from "@/lib/products";
import { rateLimitResponse, csrfOriginCheck, isHoneypotTriggered } from "@/lib/rate-limit";
import { confirmCustomerOrder } from "@/lib/email";
import type { ProductDemo } from "@/lib/products-demo";

/**
 * Checkout via Mollie.
 *
 * SÉCURITÉ (audit 2026-06-12) : le serveur ne fait JAMAIS confiance au prix
 * envoyé par le client. Le panier vit dans le localStorage du navigateur
 * (Zustand `mp-cart`) et est trivialement falsifiable. Tout montant est
 * RECALCULÉ ici depuis Payload via le slug produit. Le champ `priceTTC` reçu
 * du client n'est utilisé que pour départager les variantes d'un produit
 * multi-prix, et uniquement s'il correspond à un prix légitime du produit.
 *
 * Flux :
 *  1. Frontend POST /api/checkout avec {items:[{productId(=slug), quantity}], customer}
 *  2. CSRF + rate-limit + honeypot, validation des entrées
 *  3. Recalcul serveur de chaque ligne + des totaux (TVA 21%)
 *  4. Création de la commande Payload (statut "pending") avec un accessToken
 *  5. Création du paiement Mollie (redirectUrl tokenisé + webhookUrl)
 *  6. Retour de checkoutUrl au front, qui redirige vers Mollie
 *  7. Mollie redirige vers /commande/{id}?t={token} et POST le webhook
 */

interface CheckoutItem {
  productId: string; // slug du produit
  quantity: number;
  priceTTC?: number; // indicatif client — REVÉRIFIÉ serveur, jamais cru aveuglément
  name?: string;
  brand?: string;
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

interface ServerLine {
  productSlug: string;
  productName: string;
  productBrand: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const MAX_QUANTITY_PER_LINE = 50;
const MAX_LINES = 20;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `MP-${year}-${random}`;
}

/**
 * Résout le prix unitaire TTC fiable d'un produit, côté serveur.
 *
 * On constitue l'ensemble des prix LÉGITIMES du produit (prix produit + prix
 * et prix barré de chaque variante). Le panier ne mémorise pas la variante
 * choisie (clé = slug seul), donc :
 *  - si le prix client correspond à un prix légitime (±1 cent) → on le retient
 *    (préserve le prix exact de la variante que le client a vue) ;
 *  - sinon, si le produit a un prix unique → on force ce prix serveur ;
 *  - sinon → null (produit non vendable / prix falsifié → on refuse).
 *
 * Conséquence : impossible de payer un poêle 1 € — 1 n'est pas un prix légitime.
 */
function resolveUnitPrice(product: ProductDemo, clientPrice: unknown): number | null {
  const valid: number[] = [];
  if (typeof product.priceTTC === "number" && product.priceTTC > 0) {
    valid.push(product.priceTTC);
  }
  for (const v of product.variants ?? []) {
    if (typeof v.price === "number" && v.price > 0) valid.push(v.price);
    if (typeof v.salePrice === "number" && v.salePrice > 0) valid.push(v.salePrice);
  }
  if (valid.length === 0) return null; // pas de prix => non vendable (ex. Girolami masqué)

  const cp = typeof clientPrice === "number" ? clientPrice : Number(clientPrice);
  if (Number.isFinite(cp) && valid.some((p) => Math.abs(p - cp) < 0.01)) {
    return round2(cp);
  }
  if (typeof product.priceTTC === "number" && product.priceTTC > 0) {
    return product.priceTTC;
  }
  return null;
}

export async function POST(request: Request) {
  // 1. CSRF + rate-limit + honeypot (aligné sur /api/contact et /api/quote)
  const csrf = csrfOriginCheck(request);
  if (csrf) return csrf;
  const limited = rateLimitResponse(request, { routeKey: "checkout", max: 20 });
  if (limited) return limited;

  let body: Partial<CheckoutPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  if (isHoneypotTriggered(body as Record<string, unknown>)) {
    // Bot : on renvoie un OK neutre sans rien créer.
    return NextResponse.json({ ok: true, orderId: null });
  }

  // 2. Validation des entrées
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Panier vide." }, { status: 400 });
  }
  if (body.items.length > MAX_LINES) {
    return NextResponse.json({ error: "Trop d'articles dans le panier." }, { status: 400 });
  }
  if (!body.customer || !body.customer.email || !body.customer.name) {
    return NextResponse.json({ error: "Coordonnées client manquantes." }, { status: 400 });
  }
  if (!EMAIL_RE.test(body.customer.email)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }

  const rawItems = body.items as CheckoutItem[];
  const customer = body.customer as Customer;
  const payload = await getPayloadClient();

  // 3. Recalcul serveur de chaque ligne depuis Payload (prix de confiance)
  const serverItems: ServerLine[] = [];
  for (const it of rawItems) {
    const slug = typeof it.productId === "string" ? it.productId.trim() : "";
    if (!slug) {
      return NextResponse.json({ error: "Article invalide (référence manquante)." }, { status: 400 });
    }
    const qty = Math.floor(Number(it.quantity));
    if (!Number.isFinite(qty) || qty <= 0 || qty > MAX_QUANTITY_PER_LINE) {
      return NextResponse.json({ error: `Quantité invalide pour « ${slug} ».` }, { status: 400 });
    }
    const product = await getProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: `Produit introuvable : « ${slug} ».` }, { status: 400 });
    }
    const unit = resolveUnitPrice(product, it.priceTTC);
    if (unit == null) {
      return NextResponse.json(
        { error: `Ce produit n'est pas disponible à la vente en ligne : ${product.name}.` },
        { status: 400 },
      );
    }
    serverItems.push({
      productSlug: product.slug,
      productName: product.name,
      productBrand: product.brand ?? "",
      quantity: qty,
      unitPrice: unit,
      totalPrice: round2(unit * qty),
    });
  }

  // 4. Totaux serveur (les prix produit sont TTC ; on en déduit la TVA 21%)
  const subtotalTTC = round2(serverItems.reduce((acc, l) => acc + l.totalPrice, 0));
  const vat = round2(subtotalTTC - subtotalTTC / 1.21);
  const subtotalHT = round2(subtotalTTC - vat);
  const shipping = 0; // gratuit pour l'instant, calcul dynamique selon zone à venir
  const total = round2(subtotalTTC + shipping);

  const orderNumber = generateOrderNumber();
  const accessToken = randomUUID();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const orderData = {
    orderNumber,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone ?? "",
    customerAddress: `${customer.address ?? ""}, ${customer.postalCode ?? ""} ${customer.city ?? ""}, ${customer.country ?? ""}`,
    items: serverItems,
    subtotal: subtotalHT,
    vat,
    shipping,
    total,
    paymentStatus: "pending",
    fulfillmentStatus: "new",
    accessToken,
  };

  // Mode dev sans Mollie : on crée la commande directement (pas de checkout url)
  if (!isMollieConfigured()) {
    try {
      const order = await payload.create({
        collection: "orders",
        data: orderData as never,
        overrideAccess: true, // création serveur de confiance (REST public verrouillé)
      });

      await confirmCustomerOrder({
        customerName: customer.name,
        customerEmail: customer.email,
        orderNumber,
        total,
        items: serverItems.map((l) => ({ name: l.productName, quantity: l.quantity })),
        orderUrl: `${baseUrl}/commande/${order.id}?t=${accessToken}`,
      }).catch((err) => console.error("[checkout] confirm email failed", err));

      return NextResponse.json({
        ok: true,
        orderId: order.id,
        accessToken,
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

  // Mollie configuré : commande Payload (pending) + payment Mollie
  try {
    const mollie = getMollie();

    const order = await payload.create({
      collection: "orders",
      data: orderData as never,
      overrideAccess: true, // création serveur de confiance (REST public verrouillé)
    });

    // Description visible sur le relevé bancaire du client (max 100 chars).
    const description = `Mister Pellets ${orderNumber}`;
    const itemsLabel = serverItems
      .slice(0, 3)
      .map((l) => `${l.quantity}× ${l.productBrand} ${l.productName}`)
      .join(", ");

    const payment = (await mollie.payments.create({
      amount: formatMollieAmount(total),
      description: description.slice(0, 100),
      redirectUrl: `${baseUrl}/commande/${order.id}?t=${accessToken}`,
      webhookUrl: `${baseUrl}/api/webhooks/mollie`,
      // Bancontact + Visa/Mastercard + Apple Pay prioritaires pour la Belgique.
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

    await payload.update({
      collection: "orders",
      id: order.id,
      data: { molliePaymentId: payment.id } as never,
      overrideAccess: true,
    });

    const checkoutUrl = payment.getCheckoutUrl();
    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "URL de paiement Mollie indisponible." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, orderId: order.id, accessToken, checkoutUrl });
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
