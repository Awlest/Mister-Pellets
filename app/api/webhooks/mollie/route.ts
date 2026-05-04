import { NextResponse } from "next/server";
import type { Payment } from "@mollie/api-client";
import { getMollie } from "@/lib/mollie";
import { getPayloadClient } from "@/lib/payload-client";
import { confirmCustomerOrder } from "@/lib/email";

/**
 * Webhook Mollie (V1.6 — remplace l'ancien webhook Stripe).
 *
 * Différences avec Stripe :
 * - Pas de signature à vérifier (Mollie ne signe pas ses webhooks)
 *   → Sécurité par "obscurité de l'ID" : Mollie n'envoie que l'ID du payment,
 *     pas le détail. On doit GET /payments/{id} pour récupérer le statut.
 *   → Personne ne peut forger un faux webhook valide sans connaître les IDs
 *     des payments en cours (qui sont des UUID non devinables).
 * - Mollie peut renvoyer le webhook plusieurs fois (retry, changement de
 *   statut). On gère l'idempotence : si la commande est déjà "paid", on
 *   ne renvoie pas l'email de confirmation.
 *
 * Setup côté Mollie Dashboard :
 *   - L'URL webhook est passée à chaque création de payment via webhookUrl
 *     (cf. /api/checkout). Pas de configuration globale dans le dashboard.
 *   - URL en prod : https://mister-pellets.be/api/webhooks/mollie
 *   - URL en dev : utiliser ngrok ou Mollie ne peut pas atteindre localhost
 */

export const runtime = "nodejs";

export async function POST(request: Request) {
  // Mollie envoie le payment id en form-encoded : "id=tr_xxxxxxxxxxxxx"
  const contentType = request.headers.get("content-type") ?? "";
  let paymentId: string | null = null;

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await request.text();
    const params = new URLSearchParams(text);
    paymentId = params.get("id");
  } else if (contentType.includes("application/json")) {
    // Compatibilité au cas où Mollie change de format
    const json = await request.json().catch(() => ({}));
    paymentId = json.id ?? null;
  }

  if (!paymentId || !paymentId.startsWith("tr_")) {
    console.warn("[mollie-webhook] no valid payment id received");
    return NextResponse.json({ error: "Payment id manquant ou invalide." }, { status: 400 });
  }

  // Récupération du payment depuis l'API Mollie (source de vérité)
  let payment: Payment;
  try {
    const mollie = getMollie();
    payment = (await mollie.payments.get(paymentId)) as Payment;
  } catch (err) {
    console.error(`[mollie-webhook] failed to fetch payment ${paymentId}`, err);
    // 200 pour éviter retry infini si le payment n'existe pas (test/scan).
    return NextResponse.json({ ok: true, error: "payment not found" });
  }

  // Mollie stocke metadata comme un objet libre (Record<string, unknown>).
  const metadata = (payment.metadata ?? {}) as { orderId?: string };
  const orderId = metadata.orderId;
  if (!orderId) {
    console.error(`[mollie-webhook] payment ${paymentId} has no orderId in metadata`);
    return NextResponse.json({ ok: true });
  }

  try {
    const payload = await getPayloadClient();

    // Idempotence : si la commande est déjà payée et que le webhook revient
    // (Mollie peut retry sur changement de statut), on ne fait rien de plus.
    const existing = await payload.findByID({
      collection: "orders",
      id: orderId,
    });

    // Mapping statut Mollie → statut interne
    let newPaymentStatus: "pending" | "paid" | "failed" | "refunded" = "pending";
    let newFulfillmentStatus: "new" | "processing" | "shipped" | "delivered" | "cancelled" =
      existing.fulfillmentStatus;

    if (payment.status === "paid") {
      newPaymentStatus = "paid";
      newFulfillmentStatus =
        existing.fulfillmentStatus === "new" ? "processing" : existing.fulfillmentStatus;
    } else if (
      payment.status === "failed" ||
      payment.status === "canceled" ||
      payment.status === "expired"
    ) {
      newPaymentStatus = "failed";
    }

    // Si le statut n'a pas changé, on ne fait rien (idempotence)
    if (existing.paymentStatus === newPaymentStatus) {
      console.log(
        `[mollie-webhook] payment ${paymentId} status unchanged (${newPaymentStatus}), skipping`,
      );
      return NextResponse.json({ ok: true, alreadyProcessed: true });
    }

    // Mise à jour
    const order = await payload.update({
      collection: "orders",
      id: orderId,
      data: {
        paymentStatus: newPaymentStatus,
        fulfillmentStatus: newFulfillmentStatus,
        molliePaymentId: paymentId,
      } as never,
    });

    // Email confirmation client uniquement si paid (transition pending → paid)
    if (newPaymentStatus === "paid" && existing.paymentStatus !== "paid") {
      await confirmCustomerOrder({
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        orderNumber: order.orderNumber,
        total: order.total,
        items: order.items.map((it) => ({
          name: it.productName,
          quantity: it.quantity,
        })),
      }).catch((err) => console.error("[mollie-webhook] confirm email failed", err));

      console.log(`[mollie-webhook] order ${order.orderNumber} marked as paid`);
    }

    if (newPaymentStatus === "failed") {
      console.warn(`[mollie-webhook] payment ${paymentId} failed (${payment.status})`);
    }
  } catch (err) {
    console.error(`[mollie-webhook] failed to update order ${orderId}`, err);
    // 500 pour que Mollie retry. Si l'erreur est persistante, l'admin verra
    // les logs et corrigera.
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
