import { BONUS } from "./bonus";

/**
 * Prix TTC d'une fiche produit, dans l'ordre où la boutique les applique :
 * catalogue (priceTTC), promo saisie dans l'admin (promoPriceTTC, avec le prix
 * catalogue barré), puis bonus de saison (bonusPriceTTC, calculé sur la promo
 * si elle existe, avec le prix d'avant bonus barré). Même logique que le
 * configurateur (lib/estimate-catalog.ts : la promo prime sur le catalogue).
 */
export interface PricedProduct {
  priceTTC?: number;
  promoPriceTTC?: number;
  bonusPriceTTC?: number;
}

/** Prix TTC avant bonus : promo admin si elle existe, sinon catalogue. */
export const effectivePriceTTC = (p: PricedProduct): number | undefined =>
  p.promoPriceTTC ?? p.priceTTC;

/** Prix TTC affiché : bonus de saison, sinon promo admin, sinon catalogue. */
export const shownPriceTTC = (p: PricedProduct): number | undefined =>
  p.bonusPriceTTC ?? p.promoPriceTTC ?? p.priceTTC;

/** Prix TTC à barrer à côté du prix affiché, s'il y a une réduction à montrer. */
export const struckPriceTTC = (p: PricedProduct): number | undefined => {
  if (p.bonusPriceTTC != null) return effectivePriceTTC(p);
  if (p.promoPriceTTC != null) return p.priceTTC;
  return undefined;
};

/** Pastille à côté du prix : bonus de saison, sinon promo admin, sinon rien. */
export const priceBadge = (p: PricedProduct): string | undefined =>
  p.bonusPriceTTC != null ? BONUS.badge : p.promoPriceTTC != null ? "Promo" : undefined;
