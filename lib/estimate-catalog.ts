import "server-only";
import { getPayloadClient } from "./payload-client";
import type { EstimateProduct } from "./estimate";

/**
 * Catalogue vu par le configurateur d'estimation (/estimation).
 *
 * On repart des mêmes produits que la boutique (ceux qui ne sont pas masqués),
 * mais on ne garde que ce qui est chiffrable : un prix ET une puissance. Un
 * poêle sans prix saisi dans l'admin ne peut pas produire d'estimation, il est
 * donc écarté du sélecteur plutôt que d'afficher un total faux.
 *
 * Le prix de référence est le HT (le TTC dépend du taux de TVA du chantier :
 * 6 % en rénovation d'un logement de plus de 10 ans, 21 % sinon). Si seul le
 * TTC est saisi, on retombe sur le HT en le divisant par 1,21 — c'est le taux
 * dans lequel les prix TTC sont encodés (cf. libellé du champ Payload).
 */

interface PayloadOptionValue {
  id: number;
  label?: string | null;
}

interface PayloadEstimateRow {
  slug: string;
  name: string;
  brand: string;
  productType: string;
  power?: number | null;
  priceHT?: number | null;
  priceTTC?: number | null;
  promoPrice?: number | null;
  installationPrice?: number | null;
  isHydro?: boolean | null;
  heatedVolumeM3?: number | null;
  mainImage?: number | { url?: string | null } | null;
  hasVariants?: boolean | null;
  variantOptions?: Array<{
    optionType?: number | { id: number; label?: string | null; slug?: string | null } | null;
    values?: Array<number | PayloadOptionValue> | null;
  }> | null;
  variants?: Array<{
    optionValues?: Array<number | PayloadOptionValue> | null;
    price?: number | null;
    salePrice?: number | null;
  }> | null;
}

/** Puissance (kW) lue sur le libellé d'une valeur de variante : « 22 kW » → 22. */
function parseKw(label: string | null | undefined): number | null {
  if (!label) return null;
  const m = label.replace(",", ".").match(/([\d.]+)\s*kW/i);
  const kw = m ? Number(m[1]) : NaN;
  return Number.isFinite(kw) && kw > 0 ? kw : null;
}

/**
 * Prix TTC le plus bas parmi les variantes portant une valeur d'option donnée.
 * Les variantes croisent plusieurs axes (puissance × couleur × matériau) : pour
 * une puissance, plusieurs prix coexistent, on retient le plus bas — c'est un
 * « à partir de », la finition exacte se choisit au devis.
 */
function lowestVariantTTC(row: PayloadEstimateRow, valueId: number): number | null {
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
function powerOptions(row: PayloadEstimateRow): Array<{ kw: number; ttc: number | null; fromVariant: boolean }> {
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
 * Hôtes distants acceptés par `next/image` (cf. images.remotePatterns dans
 * next.config.ts). Une URL servie depuis un autre hôte ferait LEVER next/image
 * au rendu — donc planter tout le configurateur pour une simple vignette.
 */
const ALLOWED_IMAGE_HOSTS = [
  ".public.blob.vercel-storage.com",
  ".vercel.app",
  ".supabase.co",
  ".cellar-c2.services.clever-cloud.com",
];

/**
 * Normalise l'URL d'une photo pour `next/image` :
 * - notre propre hôte (prod) ou l'hôte local (dev) → chemin relatif ;
 * - hôte distant explicitement autorisé → URL telle quelle ;
 * - tout le reste → undefined, la vignette bascule sur le pictogramme.
 *
 * Mieux vaut un poêle sans photo qu'une page d'erreur.
 */
function toImageSrc(rawUrl: string): string | undefined {
  if (rawUrl.startsWith("/")) return rawUrl;
  try {
    const u = new URL(rawUrl);
    const isOwnHost =
      u.host.includes("mister-pellets") ||
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1";
    if (isOwnHost) return `${u.pathname}${u.search}`;
    if (u.protocol === "https:" && ALLOWED_IMAGE_HOSTS.some((h) => u.hostname.endsWith(h))) {
      return rawUrl;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export async function getEstimateCatalog(): Promise<EstimateProduct[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "products",
    limit: 200,
    pagination: false,
    depth: 1, // hydrate mainImage
    overrideAccess: false, // respecte la règle read publique
    where: { hiddenFromBoutique: { not_equals: true } },
  });

  const products: EstimateProduct[] = [];

  for (const doc of result.docs as unknown as PayloadEstimateRow[]) {
    // Prix de la fiche : une promo saisie prime sur le prix catalogue (promoPrice
    // et priceTTC sont des TTC à 21 %). Sert de repli quand la variante n'a pas
    // de prix propre.
    const promoTTC = doc.promoPrice && doc.promoPrice > 0 ? doc.promoPrice : null;
    const baseTTC = promoTTC ?? (doc.priceTTC && doc.priceTTC > 0 ? doc.priceTTC : null);
    const baseHT =
      promoTTC != null
        ? Math.round(promoTTC / 1.21)
        : doc.priceHT && doc.priceHT > 0
          ? Math.round(doc.priceHT)
          : baseTTC != null
            ? Math.round(baseTTC / 1.21)
            : 0;

    const img = doc.mainImage;
    const imageSrc =
      img && typeof img === "object" && typeof img.url === "string" && img.url.length > 0
        ? toImageSrc(img.url)
        : undefined;

    const options = powerOptions(doc);
    const multi = options.length > 1;

    for (const opt of options) {
      // Prix de la puissance : celui de sa variante si saisi, sinon celui de la
      // fiche. Une puissance sans prix exploitable est écartée du configurateur.
      const ttc = opt.ttc ?? baseTTC ?? null;
      const ht = opt.ttc != null ? Math.round(opt.ttc / 1.21) : baseHT;
      if (ht <= 0) continue;

      products.push({
        key: multi ? `${doc.slug}::${opt.kw}` : doc.slug,
        slug: doc.slug,
        name: doc.name,
        brand: doc.brand,
        productType: doc.productType,
        powerKw: opt.kw,
        fromVariant: opt.fromVariant && multi,
        priceHT: ht,
        priceTTC: ttc ?? undefined,
        installationHT:
          doc.installationPrice && doc.installationPrice > 0 ? doc.installationPrice : undefined,
        imageSrc,
        isHydro: doc.isHydro ?? undefined,
        heatedVolumeM3: doc.heatedVolumeM3 ?? undefined,
      });
    }
  }

  // Tri stable par marque puis puissance : le configurateur reclasse ensuite
  // selon le besoin en kW du visiteur (rankProducts).
  return products.sort(
    (a, b) => a.brand.localeCompare(b.brand, "fr") || a.powerKw - b.powerKw,
  );
}

/** Une option chiffrable par sa clé (revalidation côté serveur). */
export async function getEstimateProduct(key: string): Promise<EstimateProduct | undefined> {
  const all = await getEstimateCatalog();
  return all.find((p) => p.key === key);
}
