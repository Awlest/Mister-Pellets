import { bonusBadgeFor, bonusPrice, bonusRateFor } from "./bonus";
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
// L'appareil seul : la ligne est affichée à côté de « Pose non incluse », et la
// garantie de la pose ne vaut que si nous la faisons (relecture du lot 3).
export const LEGAL_GUARANTEE = "Garantie légale de 2 ans sur le poêle";

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

// ---------------------------------------------------------------------------
// Prix du poêle à un taux de TVA : une seule règle pour la fiche et l'estimation
// ---------------------------------------------------------------------------

/**
 * Prix du poêle seul, TVA à 6 %, à partir d'un prix TTC à 21 % (celui de la
 * fiche, bonus ou promo déjà déduits) : hors TVA arrondi à l'euro, puis 6 %.
 * La fiche (« X € TVAC si nous le posons… ») et la liste des modèles de
 * l'estimation passent par ici : elles affichent le même montant (recette du
 * lot 3, 11/11/2026 : 3 167 € sur la fiche, 3 519 € avant bonus dans
 * l'estimation).
 */
export const reducedVatPrice = (ttc21: number): number => Math.round(Math.round(ttc21 / 1.21) * 1.06);

/** Prix TTC à 21 % affiché pour un prix catalogue, bonus de saison déduit s'il court. */
export const shownStoveTTC = (ttc21: number, brand: string | undefined, bonus: boolean): number =>
  bonus ? bonusPrice(ttc21, brand) : ttc21;

/**
 * Poêle hors TVA, bonus déduit s'il court : base du chiffrage de
 * l'estimation, égale au hors TVA du prix affiché sur la fiche. Sans prix
 * TTC (seul le HT est saisi), le bonus s'applique au HT.
 */
export function stoveNetHT(p: { priceHT: number; priceTTC?: number; brand?: string }, bonus: boolean): number {
  if (p.priceTTC && p.priceTTC > 0) return Math.round(shownStoveTTC(p.priceTTC, p.brand, bonus) / 1.21);
  return bonus ? p.priceHT - Math.round(p.priceHT * bonusRateFor(p.brand)) : p.priceHT;
}

/**
 * Prix du poêle seul dans la liste des modèles de l'estimation : celui de la
 * fiche, au taux choisi (6 % ou 21 %), bonus compris.
 */
export function stoveListPrice(
  p: { priceHT: number; priceTTC?: number; brand?: string },
  { bonus, reduced }: { bonus: boolean; reduced: boolean },
): number {
  if (p.priceTTC && p.priceTTC > 0) {
    const shown = shownStoveTTC(p.priceTTC, p.brand, bonus);
    return reduced ? reducedVatPrice(shown) : shown;
  }
  return Math.round(stoveNetHT(p, bonus) * (reduced ? 1.06 : 1.21));
}

/**
 * Prix de la fiche tels que la boutique, la fiche et l'estimation les lisent,
 * à partir des champs de l'admin : catalogue (prix de la variante la moins
 * chère si des variantes sont chiffrées, sinon celui de la fiche), promo
 * seulement si elle est plus basse, bonus de saison sur le prix pratiqué.
 */
export function fichePrices(
  p: {
    brand?: string;
    priceTTC?: number | null;
    promoPrice?: number | null;
    hasVariants?: boolean | null;
    variants?: Array<{ price?: number | null; salePrice?: number | null }> | null;
  },
  bonus: boolean,
): { priceTTC?: number; promoPriceTTC?: number; bonusPriceTTC?: number } {
  const variantPrices = p.hasVariants
    ? (p.variants ?? [])
        .map((v) => (v.salePrice && v.salePrice > 0 ? v.salePrice : v.price))
        .filter((n): n is number => typeof n === "number" && n > 0)
    : [];
  const variantMinTTC = variantPrices.length > 0 ? Math.min(...variantPrices) : undefined;
  const catalogTTC = variantMinTTC ?? (p.priceTTC && p.priceTTC > 0 ? p.priceTTC : undefined);
  const promoTTC =
    variantMinTTC == null && p.promoPrice && p.promoPrice > 0 && (catalogTTC == null || p.promoPrice < catalogTTC)
      ? p.promoPrice
      : undefined;
  const effectiveTTC = promoTTC ?? catalogTTC;
  return {
    priceTTC: catalogTTC,
    promoPriceTTC: promoTTC,
    bonusPriceTTC: bonus && effectiveTTC ? bonusPrice(effectiveTTC, p.brand) : undefined,
  };
}
