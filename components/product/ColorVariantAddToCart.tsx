"use client";

import * as React from "react";
import { ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { slugify } from "@/lib/slugify";
import { useProductColor } from "./ProductColorContext";
import type { ProductColorVariant } from "@/lib/products-demo";

interface Props {
  productSlug: string;
  productName: string;
  productBrand: string;
  productPriceTTC: number;
  productImageSrc?: string;
  colorVariants: ProductColorVariant[];
}

/**
 * Bouton « Ajouter au panier » pour les produits à déclinaisons de couleur.
 *
 * Lit la couleur sélectionnée dans le contexte partagé (ProductColorProvider),
 * alimenté par le sélecteur de la galerie. Tant qu'aucune couleur n'est
 * choisie, le bouton est désactivé : ça garantit que le panier reçoit
 * toujours le modèle AVEC sa couleur.
 */
export function ColorVariantAddToCart({
  productSlug,
  productName,
  productBrand,
  productPriceTTC,
  productImageSrc,
  colorVariants,
}: Props) {
  const colorCtx = useProductColor();
  const addItem = useCart((s) => s.addItem);
  const [justAdded, setJustAdded] = React.useState(false);

  const index = colorCtx?.index ?? -1;
  const selectedColor =
    index >= 0 && index < colorVariants.length ? colorVariants[index] : undefined;

  function handleAdd() {
    if (!selectedColor) return;
    addItem(
      {
        productId: `${productSlug}::${slugify(selectedColor.colorName)}`,
        name: `${productName} (${selectedColor.colorName})`,
        brand: productBrand,
        priceTTC: productPriceTTC,
        imageSrc: selectedColor.mainImage?.url ?? productImageSrc,
      },
      1,
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={!selectedColor}
        onClick={handleAdd}
        aria-label={
          selectedColor
            ? `Ajouter ${productName} ${selectedColor.colorName} au panier`
            : "Choisir une couleur avant d'ajouter au panier"
        }
      >
        {justAdded ? (
          <>
            <Check className="h-5 w-5" />
            Ajouté au panier
          </>
        ) : selectedColor ? (
          <>
            <ShoppingBag className="h-5 w-5" />
            Ajouter au panier
          </>
        ) : (
          "Choisis une couleur"
        )}
      </Button>
      <p className="text-xs text-mp-ink-soft text-center">
        {selectedColor ? (
          <>
            Couleur sélectionnée :{" "}
            <span className="font-semibold text-mp-green-deep">
              {selectedColor.colorName}
            </span>
          </>
        ) : (
          "Sélectionne une couleur dans la galerie pour ajouter ce modèle au panier."
        )}
      </p>
    </div>
  );
}
