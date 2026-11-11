import { ISO, recommendedKw, type IsoKey } from "./pose/moteur";

/**
 * Puissances en kW : lecture des libellés de variante et affichage à la
 * française. Partagé par la boutique (lib/products.ts, cartes, fiche) et le
 * configurateur (lib/estimate-catalog.ts) pour qu'ils lisent les mêmes valeurs.
 */

/** Puissance (kW) lue sur le libellé d'une valeur de variante : « 22 kW » → 22, « 8,3 kW » → 8,3. */
export function parseKw(label: string | null | undefined): number | null {
  if (!label) return null;
  const m = label.replace(",", ".").match(/([\d.]+)\s*kW/i);
  const kw = m ? Number(m[1]) : NaN;
  return Number.isFinite(kw) && kw > 0 ? kw : null;
}

/** 8.3 → « 8,3 », 13 → « 13 » (sans l'unité). */
export const formatKw = (kw: number): string => String(kw).replace(".", ",");

/**
 * Règle de puissance en une phrase, tirée de la grille de l'estimation en
 * ligne (ISO, lib/pose/moteur.ts) : la seule grille du site. La FAQ,
 * l'accueil, les guides et llms.txt la citent au lieu d'écrire leurs
 * propres coefficients.
 */
export const POWER_RULE = `environ ${ISO.recent.wattsPerM2} W par m² en PEB A ou B, ${ISO.bonne.wattsPerM2} W en PEB C ou D, ${ISO.moyenne.wattsPerM2} W en PEB E et ${ISO.ancienne.wattsPerM2} W en PEB F ou G`;

/** Puissance conseillée (kW, à la française) pour une surface et une isolation. */
export const kwFor = (surfaceM2: number, iso: IsoKey): string => formatKw(recommendedKw(surfaceM2, iso));
