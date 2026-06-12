import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, Phone, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { getPayloadClient } from "@/lib/payload-client";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Confirmation de commande",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ orderId: string }>;
  searchParams?: Promise<{ t?: string }>;
}

/** Masque une adresse email (defense-in-depth si le lien tokenisé fuite). */
function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at < 1) return "votre adresse";
  const name = email.slice(0, at);
  const shown = name.length <= 2 ? name.slice(0, 1) : name.slice(0, 2);
  return `${shown}${"*".repeat(Math.max(2, name.length - shown.length))}${email.slice(at)}`;
}

export default async function OrderConfirmationPage({ params, searchParams }: Props) {
  const { orderId } = await params;
  const { t: accessToken } = (await searchParams) ?? {};

  let order: Awaited<ReturnType<typeof getPayloadClient>> extends infer P ? unknown : never;
  try {
    const payload = await getPayloadClient();
    order = await payload.findByID({
      collection: "orders",
      id: orderId,
    });
  } catch {
    notFound();
  }

  // Type-safe (les types Payload sont générés)
  const orderData = order as {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    items: { productName: string; productBrand?: string; quantity: number; totalPrice: number }[];
    subtotal: number;
    vat: number;
    shipping: number;
    total: number;
    paymentStatus: "pending" | "paid" | "failed" | "refunded";
    fulfillmentStatus: string;
    accessToken: string;
  };

  // Anti-IDOR : sans le bon jeton (fourni par la redirection Mollie et l'email
  // de confirmation), on renvoie un 404. Les ids de commande étant séquentiels,
  // ce contrôle empêche d'énumérer /commande/1, /commande/2… et de lire les
  // données personnelles de tous les clients.
  if (!accessToken || !orderData.accessToken || accessToken !== orderData.accessToken) {
    notFound();
  }

  const isPaid = orderData.paymentStatus === "paid";
  const isPending = orderData.paymentStatus === "pending";

  return (
    <section className="bg-mp-cream py-10 md:py-16 min-h-[60vh]">
      <div className="container mx-auto max-w-3xl px-4 md:px-6">
        <Breadcrumb
          items={[
            { label: "Accueil", href: "/" },
            { label: "Commande" },
          ]}
          className="mb-6"
        />

        <Card className="p-8 md:p-12 text-center mb-8">
          <div className="flex justify-center mb-6">
            <span
              className={`flex items-center justify-center h-20 w-20 rounded-full ${
                isPaid
                  ? "bg-mp-green-light text-white"
                  : "bg-mp-orange-light text-mp-orange-flame"
              }`}
            >
              <CheckCircle className="h-10 w-10" />
            </span>
          </div>

          <h1
            className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {isPaid ? "Paiement confirmé !" : "Commande enregistrée"}
          </h1>

          <p className="text-lg text-mp-ink-soft leading-relaxed max-w-xl mx-auto mb-2">
            Merci {orderData.customerName.split(" ")[0]}. Votre commande{" "}
            <strong className="text-mp-green-deep">#{orderData.orderNumber}</strong> est{" "}
            {isPaid ? "confirmée" : "en attente de finalisation"}.
          </p>

          {isPaid && (
            <p className="text-mp-ink-soft mb-6">
              Un email de confirmation arrive sur <strong>{maskEmail(orderData.customerEmail)}</strong> dans
              quelques minutes. On vous tient au courant pour la livraison.
            </p>
          )}

          {isPending && (
            <div className="rounded-xl bg-mp-orange-light/40 border border-mp-orange-warm/40 p-4 text-sm text-mp-ink leading-relaxed mt-4 max-w-xl mx-auto">
              Le paiement n'est pas encore confirmé (webhook Mollie pas encore reçu, ou mode dev).
              On vous recontacte rapidement pour finaliser.
            </div>
          )}
        </Card>

        {/* Récap */}
        <Card className="p-6 md:p-8 mb-8">
          <h2
            className="text-xl font-semibold text-mp-green-deep mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Récap de la commande
          </h2>

          <ul className="space-y-3 mb-6">
            {orderData.items.map((it, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <ShoppingBag className="h-4 w-4 text-mp-sand mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="block font-medium text-mp-green-deep">
                    {it.productBrand ? `${it.productBrand} ` : ""}{it.productName}
                  </span>
                  <span className="block text-xs text-mp-ink-soft">Quantité : {it.quantity}</span>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {formatPrice(it.totalPrice)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 text-sm border-t border-mp-sand/40 pt-4">
            <div className="flex justify-between">
              <dt className="text-mp-ink-soft">Sous-total HT</dt>
              <dd className="tabular-nums">{formatPrice(orderData.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mp-ink-soft">TVA 21%</dt>
              <dd className="tabular-nums">{formatPrice(orderData.vat)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mp-ink-soft">Livraison</dt>
              <dd className="tabular-nums">{orderData.shipping > 0 ? formatPrice(orderData.shipping) : "Gratuite"}</dd>
            </div>
            <div className="flex justify-between border-t border-mp-sand/40 pt-2 mt-2">
              <dt className="text-base font-semibold text-mp-green-deep">Total TTC</dt>
              <dd
                className="text-xl font-semibold text-mp-green-deep tabular-nums"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {formatPrice(orderData.total)}
              </dd>
            </div>
          </dl>
        </Card>

        {/* Next steps */}
        <Card className="p-6 md:p-8 bg-mp-beige border-mp-sand/40">
          <h3
            className="text-lg font-semibold text-mp-green-deep mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Et maintenant ?
          </h3>
          <ol className="space-y-3 text-sm text-mp-ink leading-relaxed mb-6">
            <li className="flex gap-3">
              <span className="font-bold text-mp-orange-flame">1.</span>
              <span>On vérifie le stock et on vous recontacte sous 24h ouvrées.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-mp-orange-flame">2.</span>
              <span>
                Si vous avez besoin d'une <strong>pose</strong>, on vous recommande de remplir le{" "}
                <Link href="/demande-de-devis" className="text-mp-orange-flame underline">
                  formulaire de devis
                </Link>{" "}
                pour qu'on chiffre l'installation avec primes.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-mp-orange-flame">3.</span>
              <span>Livraison gratuite dans un rayon de 50 km autour de Fernelmont.</span>
            </li>
          </ol>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="primary" size="default">
              <a href="tel:+32472043222">
                <Phone className="h-4 w-4" />
                0472 04 32 22
              </a>
            </Button>
            <Button asChild variant="outline" size="default">
              <Link href="/contact">Nous écrire</Link>
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
