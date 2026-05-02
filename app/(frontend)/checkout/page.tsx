"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart, useCartTotal } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { formatPrice, cn } from "@/lib/utils";

interface FormState {
  name: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  notes: string;
  consent: boolean;
}

const initialForm: FormState = {
  name: "",
  email: "",
  phone: "",
  address: "",
  postalCode: "",
  city: "",
  country: "BE",
  notes: "",
  consent: false,
};

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const total = useCartTotal();
  const [form, setForm] = React.useState<FormState>(initialForm);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Redirect si panier vide
  React.useEffect(() => {
    if (items.length === 0 && !submitting) {
      router.replace("/panier");
    }
  }, [items.length, submitting, router]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((s) => ({ ...s, [key]: value }));

  const isValid =
    form.name.length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.address.length >= 5 &&
    /^[0-9]{4}$/.test(form.postalCode) &&
    form.city.length >= 2 &&
    form.consent;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: form, items }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Erreur lors de la création de la session de paiement.");
      }

      if (data.checkoutUrl) {
        // Redirection vers Stripe Checkout
        window.location.href = data.checkoutUrl;
      } else if (data.orderId) {
        // Mode dev (Stripe non configuré) : commande créée directement
        router.push(`/commande/${data.orderId}`);
      } else {
        throw new Error("Réponse inattendue du serveur.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return null; // redirect en cours
  }

  const inputClass = cn(
    "w-full rounded-xl border border-mp-sand bg-white px-4 py-3 text-mp-ink",
    "placeholder:text-mp-ink-soft/60 outline-none transition-colors",
    "focus:border-mp-orange-flame focus:ring-2 focus:ring-mp-orange-flame/20",
    "disabled:bg-mp-beige/50 disabled:cursor-not-allowed"
  );

  return (
    <section className="bg-mp-cream py-10 md:py-16 min-h-[60vh]">
      <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
        <Breadcrumb
          items={[
            { label: "Accueil", href: "/" },
            { label: "Panier", href: "/panier" },
            { label: "Checkout" },
          ]}
          className="mb-6"
        />

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="text-3xl md:text-5xl font-semibold text-mp-green-deep">
            Finaliser ma commande
          </h1>
          <Link
            href="/panier"
            className="inline-flex items-center gap-2 text-sm font-semibold text-mp-green-deep hover:text-mp-orange-flame transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au panier
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6 md:p-8">
              <h2
                className="text-xl font-semibold text-mp-green-deep mb-5"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Coordonnées
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Nom complet <span className="text-mp-orange-flame">*</span>
                  </label>
                  <input
                    id="name"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className={inputClass}
                    placeholder="Sophie Dupont"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email <span className="text-mp-orange-flame">*</span>
                  </label>
                  <input
                    id="email"
                    required
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className={inputClass}
                    placeholder="sophie@exemple.be"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Téléphone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className={inputClass}
                    placeholder="0470 12 34 56"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8">
              <h2
                className="text-xl font-semibold text-mp-green-deep mb-5"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Adresse de livraison
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <label htmlFor="address" className="block text-sm font-medium mb-2">
                    Rue et numéro <span className="text-mp-orange-flame">*</span>
                  </label>
                  <input
                    id="address"
                    required
                    autoComplete="address-line1"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    className={inputClass}
                    placeholder="Rue des Fagotis 3A"
                  />
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium mb-2">
                    Code postal <span className="text-mp-orange-flame">*</span>
                  </label>
                  <input
                    id="postalCode"
                    required
                    autoComplete="postal-code"
                    pattern="[0-9]{4}"
                    inputMode="numeric"
                    maxLength={4}
                    value={form.postalCode}
                    onChange={(e) => update("postalCode", e.target.value.replace(/[^0-9]/g, ""))}
                    className={inputClass}
                    placeholder="5380"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="city" className="block text-sm font-medium mb-2">
                    Ville <span className="text-mp-orange-flame">*</span>
                  </label>
                  <input
                    id="city"
                    required
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    className={inputClass}
                    placeholder="Fernelmont"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="notes" className="block text-sm font-medium mb-2">
                  Notes de livraison (optionnel)
                </label>
                <textarea
                  id="notes"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  className={cn(inputClass, "resize-y")}
                  placeholder="Code interphone, étage, contraintes accès…"
                />
              </div>
            </Card>

            <label
              htmlFor="consent"
              className="flex items-start gap-3 cursor-pointer text-sm text-mp-ink-soft px-2"
            >
              <input
                id="consent"
                type="checkbox"
                required
                checked={form.consent}
                onChange={(e) => update("consent", e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-mp-sand text-mp-orange-flame focus:ring-mp-orange-flame"
              />
              <span>
                J'accepte les{" "}
                <Link href="/cgv" className="text-mp-orange-flame underline">CGV</Link>
                {" "}et la{" "}
                <Link href="/politique-confidentialite" className="text-mp-orange-flame underline">politique de confidentialité</Link>
                .
              </span>
            </label>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                {error}
              </div>
            )}
          </div>

          {/* Récap + bouton */}
          <div className="lg:col-span-4">
            <Card className="p-6 sticky top-24">
              <h2
                className="text-xl font-semibold text-mp-green-deep mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Ma commande
              </h2>

              <ul className="space-y-3 mb-4 text-sm">
                {items.map((it) => (
                  <li key={it.productId} className="flex items-start gap-3">
                    <ShoppingBag className="h-4 w-4 text-mp-sand mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="block font-medium text-mp-green-deep line-clamp-1">
                        {it.name}
                      </span>
                      <span className="block text-xs text-mp-ink-soft">
                        {it.quantity} × {formatPrice(it.priceTTC)}
                      </span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums whitespace-nowrap">
                      {formatPrice(it.priceTTC * it.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-mp-sand/40 pt-4 mb-6 flex items-baseline justify-between">
                <span className="text-base font-semibold text-mp-green-deep">Total TTC</span>
                <span
                  className="text-2xl font-semibold text-mp-green-deep tabular-nums"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {formatPrice(total)}
                </span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!isValid || submitting}
                className="w-full"
              >
                <Lock className="h-4 w-4" />
                {submitting ? "Redirection en cours…" : "Payer en sécurité"}
              </Button>

              <p className="text-xs text-mp-ink-soft text-center mt-4">
                Paiement chiffré via Stripe.
                <br />
                Bancontact, cartes Visa/Mastercard.
              </p>
            </Card>
          </div>
        </form>
      </div>
    </section>
  );
}
