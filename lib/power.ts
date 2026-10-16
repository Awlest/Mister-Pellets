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
