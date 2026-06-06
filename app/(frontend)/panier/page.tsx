"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCart, useCartTotal } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { formatPrice } from "@/lib/utils";

/**
 * Page panier complète. Phase 5.
 * Note : page client (rendue côté browser) car le cart est stocké en localStorage.
 */
export default function PanierPage() {
  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const total = useCartTotal();
  const empty = items.length === 0;

  return (
    <section className="bg-mp-cream py-10 md:py-16 min-h-[60vh]">
      <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
        <Breadcrumb
          items={[
            { label: "Accueil", href: "/" },
            { label: "Panier" },
          ]}
          className="mb-6"
        />

        <h1 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-8">
          Mon panier
        </h1>

        {empty ? (
          <Card className="p-10 md:p-16 text-center max-w-2xl mx-auto">
            <ShoppingBag className="h-16 w-16 text-mp-sand mx-auto mb-6" />
            <h2
              className="text-2xl font-semibold text-mp-green-deep mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Votre panier est vide
            </h2>
            <p className="text-mp-ink-soft leading-relaxed mb-8 max-w-md mx-auto">
              Parcourez notre boutique pour ajouter un poêle, ou demandez un devis sur mesure pour
              une installation avec pose.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="primary" size="lg">
                <Link href="/boutique">Voir la boutique</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/demande-de-devis">Demander un devis</Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Items */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item) => (
                <Card key={item.productId} className="p-5 md:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Image placeholder */}
                    <div className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-xl bg-mp-beige border border-mp-sand/40 flex items-center justify-center self-start">
                      <ShoppingBag className="h-10 w-10 text-mp-sand" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-mp-orange-flame">
                            {item.brand}
                          </span>
                          <Link
                            href={`/produit/${item.productId}`}
                            className="block text-lg font-semibold text-mp-green-deep hover:text-mp-orange-flame transition-colors leading-tight mt-1"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {item.name}
                          </Link>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="text-mp-ink-soft hover:text-red-600 transition-colors p-2 self-start"
                          aria-label={`Retirer ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-4 flex-wrap">
                        <div className="flex items-center border border-mp-sand/60 rounded-full bg-mp-cream">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="p-2 hover:text-mp-orange-flame transition-colors"
                            aria-label="Diminuer la quantité"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-3 text-base font-semibold tabular-nums min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="p-2 hover:text-mp-orange-flame transition-colors"
                            aria-label="Augmenter la quantité"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-mp-ink-soft">
                            {formatPrice(item.priceTTC)} × {item.quantity}
                          </div>
                          <div
                            className="text-xl font-semibold text-mp-green-deep tabular-nums"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {formatPrice(item.priceTTC * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              <div className="rounded-xl bg-mp-orange-light/40 border border-mp-orange-warm/40 p-4 text-sm text-mp-ink leading-relaxed">
                ⚠️ <strong>La pose n'est pas incluse</strong> dans les prix produits. Pour un projet
                avec installation, on vous recommande de passer par le{" "}
                <Link href="/demande-de-devis" className="text-mp-orange-flame underline font-semibold">
                  formulaire de devis
                </Link>
                . Les primes Wallonie sont calculées dans le devis final.
              </div>
            </div>

            {/* Récap */}
            <div className="lg:col-span-4">
              <Card className="p-6 sticky top-24">
                <h2
                  className="text-xl font-semibold text-mp-green-deep mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Récap
                </h2>

                <dl className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-mp-ink-soft">Sous-total HT</dt>
                    <dd className="tabular-nums">{formatPrice(total / 1.21)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-mp-ink-soft">TVA 21%</dt>
                    <dd className="tabular-nums">{formatPrice(total - total / 1.21)}</dd>
                  </div>
                  <div className="flex justify-between text-mp-ink-soft">
                    <dt>Livraison</dt>
                    <dd>Calculée au checkout</dd>
                  </div>
                </dl>

                <div className="border-t border-mp-sand/40 pt-4 mb-6 flex items-baseline justify-between">
                  <span className="text-base font-semibold text-mp-green-deep">Total TTC</span>
                  <span
                    className="text-3xl font-semibold text-mp-green-deep tabular-nums"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {formatPrice(total)}
                  </span>
                </div>

                <Button asChild variant="primary" size="lg" className="w-full mb-2">
                  <Link href="/checkout">
                    Passer au paiement
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="default" className="w-full">
                  <Link href="/boutique">Continuer mes achats</Link>
                </Button>

                <p className="text-xs text-mp-ink-soft text-center mt-4">
                  Paiement sécurisé · Bancontact, cartes
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
