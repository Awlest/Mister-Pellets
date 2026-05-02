"use client";

import * as React from "react";
import { ShoppingBag, Check } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

interface AddToCartButtonProps extends Omit<ButtonProps, "children" | "onClick"> {
  productId: string;
  productName?: string;
  /** Hook pour brancher le panier réel (Zustand / Context / fetch). Phase 5. */
  onAdd?: (productId: string) => Promise<void> | void;
}

/**
 * Bouton "Ajouter au panier" avec feedback de succès.
 * Le hook onAdd est branché Phase 5 sur le state global panier + Stripe.
 */
export function AddToCartButton({
  productId,
  productName,
  onAdd,
  className,
  ...rest
}: AddToCartButtonProps) {
  const [state, setState] = React.useState<"idle" | "loading" | "success">("idle");

  const handleClick = async () => {
    setState("loading");
    try {
      if (onAdd) await onAdd(productId);
      setState("success");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("idle");
    }
  };

  return (
    <Button
      type="button"
      variant="primary"
      size="lg"
      onClick={handleClick}
      disabled={state === "loading"}
      aria-label={productName ? `Ajouter ${productName} au panier` : "Ajouter au panier"}
      className={className}
      {...rest}
    >
      {state === "success" ? (
        <>
          <Check className="h-5 w-5" />
          Ajouté
        </>
      ) : (
        <>
          <ShoppingBag className="h-5 w-5" />
          {state === "loading" ? "Ajout..." : "Ajouter au panier"}
        </>
      )}
    </Button>
  );
}
