"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface ProductColorCtx {
  /** Index de la variante de couleur sélectionnée. -1 si aucune. */
  index: number;
  setIndex: (i: number) => void;
}

const Ctx = createContext<ProductColorCtx | null>(null);

/**
 * Partage l'index de couleur sélectionnée entre la galerie produit (colonne
 * de gauche) et le bloc d'achat (colonne de droite).
 *
 * Sans ce contexte, la couleur choisie dans le sélecteur de la galerie reste
 * interne à la galerie : le bouton « Ajouter au panier » ne la connaît pas,
 * et le panier reçoit le modèle sans la couleur.
 */
export function ProductColorProvider({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState(-1);
  return <Ctx.Provider value={{ index, setIndex }}>{children}</Ctx.Provider>;
}

/** Retourne le contexte couleur, ou null si appelé hors d'un provider. */
export function useProductColor(): ProductColorCtx | null {
  return useContext(Ctx);
}
