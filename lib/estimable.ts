import { parseKw } from "./power";

/**
 * Une fiche est-elle dans l'estimation en ligne ? Règle unique, lue par le
 * catalogue de l'estimation (lib/estimate-catalog.ts) et par la fiche produit
 * (lib/products.ts, bouton principal : lib/price-request.ts). Avant, la fiche
 * jugeait sur son prix affiché et l'estimation sur prix ET puissance : une
 * fiche chiffrée sans puissance exploitable envoyait vers une estimation qui
 * ne la connaissait pas (relecture du lot 3, 11/11/2026).
 *
 * Module pur, sans base : il lit une ligne Payload déjà chargée (depth 1, axes
 * et valeurs hydratés).
 */

interface OptionValue {
  id: number;
  label?: string | null;
}

export interface EstimableRow {
  hiddenFromBoutique?: boolean | null;
  power?: number | null;
  priceHT?: number | null;
  priceTTC?: number | null;
  promoPrice?: number | null;
  hasVariants?: boolean | null;
  variantOptions?: Array<{
    optionType?: number | { id: number; label?: string | null; slug?: string | null } | null;
    values?: Array<number | OptionValue> | null;
  }> | null;
  variants?: Array<{
    optionValues?: Array<number | OptionValue> | null;
    price?: number | null;
    salePrice?: number | null;
  }> | null;
}

/** Une puissance chiffrable d'une fiche : prix TTC (21 %) et HT retenus par l'estimation. */
export interface EstimateOption {
  kw: number;
  /** TTC à 21 % : celui de la variante si elle est chiffrée, sinon celui de la fiche. */
  ttc: number | null;
  ht: number;
  /** Prix pris sur une variante de puissance. */
  fromVariant: boolean;
}

/**
 * Prix TTC le plus bas parmi les variantes portant une valeur d'option donnée.
 * Les variantes croisent plusieurs axes (puissance × couleur × matériau) : pour
 * une puissance, plusieurs prix coexistent, on retient le plus bas — c'est un
 * « à partir de », la finition exacte se choisit au devis.
 */
function lowestVariantTTC(row: EstimableRow, valueId: number): number | null {
  let best: number | null = null;
  for (const v of row.variants ?? []) {
    const ids = (v.optionValues ?? []).map((o) => (typeof o === "object" && o ? o.id : o));
    if (!ids.includes(valueId)) continue;
    const price = v.salePrice && v.salePrice > 0 ? v.salePrice : v.price;
    if (!price || price <= 0) continue;
    if (best == null || price < best) best = price;
  }
  return best;
}

/**
 * Les puissances proposées par une fiche : soit l'axe de variantes
 * « Puissance » (avec le prix de chaque puissance), soit la puissance unique du
 * champ principal.
 */
function powerOptions(row: EstimableRow): Array<{ kw: number; ttc: number | null; fromVariant: boolean }> {
  const axis = (row.variantOptions ?? []).find((vo) => {
    const t = vo.optionType;
    return t && typeof t === "object" && (t.slug === "puissance" || t.label === "Puissance");
  });

  if (row.hasVariants && axis && Array.isArray(axis.values)) {
    const out: Array<{ kw: number; ttc: number | null; fromVariant: boolean }> = [];
    for (const value of axis.values) {
      if (!value || typeof value !== "object") continue;
      const kw = parseKw(value.label);
      if (kw == null) continue;
      out.push({ kw, ttc: lowestVariantTTC(row, value.id), fromVariant: true });
    }
    if (out.length > 0) {
      // Dédoublonne (deux valeurs au même libellé) et trie par puissance.
      const seen = new Set<number>();
      return out
        .filter((o) => (seen.has(o.kw) ? false : (seen.add(o.kw), true)))
        .sort((a, b) => a.kw - b.kw);
    }
  }

  const kw = row.power ?? 0;
  return kw > 0 ? [{ kw, ttc: null, fromVariant: false }] : [];
}

/**
 * Puissances chiffrables d'une fiche, telles que l'estimation les propose.
 * Prix de la fiche : une promo saisie prime sur le prix catalogue (promoPrice
 * et priceTTC sont des TTC à 21 %), repli quand la variante n'a pas de prix.
 * Une puissance sans prix exploitable est écartée.
 */
export function estimateOptions(row: EstimableRow): EstimateOption[] {
  const promoTTC = row.promoPrice && row.promoPrice > 0 ? row.promoPrice : null;
  const baseTTC = promoTTC ?? (row.priceTTC && row.priceTTC > 0 ? row.priceTTC : null);
  const baseHT =
    promoTTC != null
      ? Math.round(promoTTC / 1.21)
      : row.priceHT && row.priceHT > 0
        ? Math.round(row.priceHT)
        : baseTTC != null
          ? Math.round(baseTTC / 1.21)
          : 0;
  const out: EstimateOption[] = [];
  for (const opt of powerOptions(row)) {
    const ttc = opt.ttc ?? baseTTC ?? null;
    const ht = opt.ttc != null ? Math.round(opt.ttc / 1.21) : baseHT;
    if (ht <= 0) continue;
    out.push({ kw: opt.kw, ttc, ht, fromVariant: opt.fromVariant });
  }
  return out;
}

/** La fiche figure-t-elle dans l'estimation en ligne ? (masquée de la boutique : non) */
export function isEstimable(row: EstimableRow): boolean {
  return row.hiddenFromBoutique !== true && estimateOptions(row).length > 0;
}
