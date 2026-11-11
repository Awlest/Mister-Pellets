import { bonusBadgeFor } from "./bonus";
import { typo } from "./typo";

/**
 * Prix TTC d'une fiche produit, dans l'ordre où la boutique les applique :
 * catalogue (priceTTC), promo saisie dans l'admin (promoPriceTTC, avec le prix
 * catalogue barré), puis bonus de saison (bonusPriceTTC, calculé sur la promo
 * si elle existe, avec le prix d'avant bonus barré). Même logique que le
 * configurateur (lib/estimate-catalog.ts : la promo prime sur le catalogue).
 */
export interface PricedProduct {
  /** Marque : fixe le taux du bonus (-10 % Austroflamm, Cadel et MCZ, -15 % sinon). */
  brand?: string;
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

/**
 * Pastille à côté du prix : bonus de saison, sinon promo admin, sinon rien.
 * Texte d'affichage : « -15 % » passe par `typo`, il ne se coupe pas avant « % ».
 */
export const priceBadge = (p: PricedProduct): string | undefined =>
  p.bonusPriceTTC != null ? typo(bonusBadgeFor(p.brand)) : p.promoPriceTTC != null ? "Promo" : undefined;

/**
 * Ligne sobre sous le prix d'une fiche : la garantie légale, dans les mots de
 * la FAQ (« Quelles garanties offrez-vous ? ») et de la page des garanties,
 * puis le délai de livraison saisi dans l'admin, à des conditions strictes.
 */
export const LEGAL_GUARANTEE = "Garantie légale de 2 ans sur le poêle et la pose";

/**
 * Valeur par défaut du champ `deliveryDelay` (collections/Products.ts et
 * colonne SQL) : une fiche jamais retouchée la porte sans que personne l'ait
 * choisie. Elle ne vaut donc pas un délai annoncé.
 */
export const DEFAULT_DELIVERY_DELAY = "48-72h";

/**
 * Délai de livraison à afficher, ou undefined. Seulement s'il a été saisi
 * (différent de la valeur par défaut), que la fiche montre un prix et que le
 * poêle est en stock : une fiche sur devis ou en commande spéciale n'a pas de
 * délai à promettre (relecture du lot 3, 11/11/2026).
 */
export function shownDeliveryDelay(p: {
  deliveryDelay?: string;
  priceTTC?: number;
  stockStatus?: string;
}): string | undefined {
  const delay = p.deliveryDelay?.trim();
  if (!delay || delay.replace(/\s+/g, "").toLowerCase() === DEFAULT_DELIVERY_DELAY.toLowerCase()) return undefined;
  if (!p.priceTTC || p.priceTTC <= 0) return undefined;
  if (p.stockStatus && p.stockStatus !== "in_stock") return undefined;
  return delay;
}

export function guaranteeLine(p: { deliveryDelay?: string; priceTTC?: number; stockStatus?: string }): string {
  const delay = shownDeliveryDelay(p);
  return delay ? `${LEGAL_GUARANTEE} · délai de livraison indicatif : ${delay}` : LEGAL_GUARANTEE;
}
