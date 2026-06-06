"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingBag, X, Minus, Plus, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart, useCartTotal } from "@/lib/cart-store";
import { formatPrice, cn } from "@/lib/utils";

export function CartDrawer() {
  const items = useCart((s) => s.items);
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const total = useCartTotal();
  const empty = items.length === 0;

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && close()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col"
      >
        {/* Header drawer */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-mp-sand/40">
          <h2
            className="text-2xl font-semibold text-mp-green-deep"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Mon panier
          </h2>
          <SheetClose className="rounded-full p-2 hover:bg-mp-beige" aria-label="Fermer">
            <X className="h-5 w-5" />
          </SheetClose>
        </div>

        {/* Body */}
        {empty ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="h-16 w-16 text-mp-sand mb-4" />
            <h3 className="text-xl font-semibold text-mp-green-deep mb-2">
              Votre panier est vide
            </h3>
            <p className="text-mp-ink-soft mb-6 leading-relaxed">
              Ajoutez un poêle depuis la boutique ou demandez un devis sur mesure.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <SheetClose asChild>
                <Button asChild variant="primary" size="default" className="w-full">
                  <Link href="/boutique">Voir la boutique</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild variant="outline" size="default" className="w-full">
                  <Link href="/demande-de-devis">Demander un devis</Link>
                </Button>
              </SheetClose>
            </div>
          </div>
        ) : (
          <>
            {/* Liste items */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 p-4 rounded-2xl bg-mp-beige border border-mp-sand/40"
                >
                  {/* Image placeholder */}
                  <div className="h-20 w-20 shrink-0 rounded-xl bg-mp-cream border border-mp-sand/40 flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-mp-sand" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-mp-orange-flame uppercase tracking-wider">
                      {item.brand}
                    </span>
                    <h4 className="text-sm font-semibold text-mp-green-deep leading-tight line-clamp-2 mb-2">
                      {item.name}
                    </h4>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center border border-mp-sand/60 rounded-full bg-mp-cream">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1.5 hover:text-mp-orange-flame transition-colors"
                          aria-label="Diminuer la quantité"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-2 text-sm font-semibold tabular-nums min-w-[1.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1.5 hover:text-mp-orange-flame transition-colors"
                          aria-label="Augmenter la quantité"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <span className="text-sm font-semibold text-mp-green-deep tabular-nums">
                        {formatPrice(item.priceTTC * item.quantity)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-mp-ink-soft hover:text-red-600 transition-colors p-1"
                    aria-label="Retirer du panier"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <p className="text-xs text-mp-ink-soft pt-2">
                ⚠️ La <strong>pose</strong> n'est pas incluse dans les prix produits ci-dessus.
                Pour un projet avec installation, on vous recommande de passer plutôt par le{" "}
                <Link href="/demande-de-devis" className="text-mp-orange-flame underline" onClick={close}>
                  formulaire de devis
                </Link>
                . C'est plus précis et la prime Wallonie est calculée.
              </p>
            </div>

            {/* Footer total + checkout */}
            <div className="px-6 py-5 border-t border-mp-sand/40 bg-mp-cream">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-sm text-mp-ink-soft">Sous-total TTC</span>
                <span
                  className="text-2xl font-semibold text-mp-green-deep tabular-nums"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {formatPrice(total)}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <SheetClose asChild>
                  <Button asChild variant="primary" size="lg" className="w-full">
                    <Link href="/checkout">Passer au paiement</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild variant="outline" size="default" className="w-full">
                    <Link href="/panier">Voir le panier complet</Link>
                  </Button>
                </SheetClose>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/**
 * Bouton header avec compteur. À placer dans Header.tsx.
 */
export function CartTrigger({ className }: { className?: string }) {
  const count = useCart((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));
  const open = useCart((s) => s.open);

  return (
    <button
      type="button"
      onClick={open}
      className={cn(
        "relative inline-flex items-center justify-center h-10 w-10 rounded-full",
        "text-mp-ink hover:bg-mp-beige-warm transition-colors",
        className
      )}
      aria-label={count > 0 ? `Panier (${count} article${count > 1 ? "s" : ""})` : "Panier"}
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span
          className={cn(
            "absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full",
            "bg-mp-orange-flame text-white text-[11px] font-bold",
            "flex items-center justify-center tabular-nums",
            "ring-2 ring-mp-cream"
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
