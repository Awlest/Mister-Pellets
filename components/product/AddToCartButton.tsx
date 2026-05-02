"use client";

import * as React from "react";
import { ShoppingBag, Check } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";

interface AddToCartButtonProps extends Omit<ButtonProps, "children" | "onClick"> {
  productId: string;
  productName: string;
  productBrand: string;
  productPriceTTC: number;
  productImageSrc?: string;
}

/**
 * Bouton "Ajouter au panier" branché sur le store Zustand useCart.
 * Affiche un feedback visuel "Ajouté" pendant 2s puis revient.
 * Au premier ajout, le drawer panier s'ouvre automatiquement.
 */
export function AddToCartButton({
  productId,
  productName,
  productBrand,
  productPriceTTC,
  productImageSrc,
  className,
  ...rest
}: AddToCartButtonProps) {
  const addItem = useCart((s) => s.addItem);
  const [justAdded, setJustAdded] = React.useState(false);

  const handleClick = () => {
    addItem(
      {
        productId,
        name: productName,
        brand: productBrand,
        priceTTC: productPriceTTC,
        imageSrc: productImageSrc,
      },
      1
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <Button
      type="button"
      variant="primary"
      size="lg"
      onClick={handleClick}
      aria-label={`Ajouter ${productName} au panier`}
      className={className}
      {...rest}
    >
      {justAdded ? (
        <>
          <Check className="h-5 w-5" />
          Ajouté au panier
        </>
      ) : (
        <>
          <ShoppingBag className="h-5 w-5" />
          Ajouter au panier
        </>
      )}
    </Button>
  );
}
