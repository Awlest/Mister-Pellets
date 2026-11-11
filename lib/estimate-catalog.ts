import "server-only";
import { getPayloadClient } from "./payload-client";
import type { EstimateProduct } from "./estimate";
import { webpUrl } from "./product-image";
import { estimateOptions, isEstimable } from "./estimable";
import { inCatalogueWhere, isOffCatalogue } from "./catalog-scope";

/**
 * Catalogue vu par le configurateur d'estimation (/estimation).
 *
 * On repart des mêmes produits que la boutique (ceux qui ne sont pas masqués,
 * hors combustibles que le site ne vend pas : lib/catalog-scope.ts), mais on
 * ne garde que ce qui est chiffrable : un prix ET une puissance. Un poêle sans
 * prix saisi dans l'admin ne peut pas produire d'estimation, il est donc
 * écarté du sélecteur plutôt que d'afficher un total faux. Les forfaits de
 * pose sont ceux d'un appareil à pellets : un appareil à bois bûche n'a pas à
 * être chiffré ici.
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
  combustible?: string | null;
  appliance?: string | null;
  power?: number | null;
  priceHT?: number | null;
  priceTTC?: number | null;
  promoPrice?: number | null;
  installationPrice?: number | null;
  isHydro?: boolean | null;
  heatedVolumeM3?: number | null;
  mainImage?:
    | number
    | { url?: string | null; sizes?: { card?: { url?: string | null } | null } | null }
    | null;
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

/**
 * Hôtes distants acceptés pour les vignettes (les mêmes que
 * images.remotePatterns dans next.config.ts). La liste protégeait next/image,
 * qui levait une erreur au rendu pour tout autre hôte et plantait le
 * configurateur ; la vignette est un simple <img> depuis le 11/10/2026, la
 * liste reste en garde-fou : photo d'un hôte inconnu = pictogramme.
 */
const ALLOWED_IMAGE_HOSTS = [
  ".public.blob.vercel-storage.com",
  ".vercel.app",
  ".supabase.co",
  ".cellar-c2.services.clever-cloud.com",
];

/**
 * Normalise l'URL d'une photo de vignette :
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

/** Catalogue de l'estimation, plus les fiches qu'elle ne connaît pas, par motif. */
export interface EstimateCatalogData {
  products: EstimateProduct[];
  /**
   * Fiches visibles sans aucun prix (« Sur devis ») : l'estimation ouverte sur
   * l'une d'elles écrit « Ce modèle est chiffré sur devis ». Toute autre fiche
   * absente (chiffrée mais sans puissance exploitable, masquée, lien ancien) :
   * « Ce modèle n'est pas encore dans l'estimation en ligne ».
   */
  quoteOnlySlugs: string[];
}

/** Prix affiché sur la fiche : variante chiffrée ou prix de la fiche (même règle que lib/products.ts). */
function hasShownPrice(doc: PayloadEstimateRow): boolean {
  const variantPriced =
    Boolean(doc.hasVariants) &&
    (doc.variants ?? []).some((v) => ((v.salePrice && v.salePrice > 0 ? v.salePrice : v.price) ?? 0) > 0);
  return variantPriced || (doc.priceTTC ?? 0) > 0;
}

export async function getEstimateCatalogData(): Promise<EstimateCatalogData> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "products",
    // Pas de `limit` : avec `pagination: false`, Payload renvoie tout, alors
    // qu'une limite explicite s'appliquerait quand même (Payload 3.84).
    pagination: false,
    depth: 1, // hydrate mainImage
    overrideAccess: false, // respecte la règle read publique
    where: { and: [{ hiddenFromBoutique: { not_equals: true } }, ...inCatalogueWhere()] },
  });

  const products: EstimateProduct[] = [];
  const quoteOnlySlugs: string[] = [];

  for (const doc of result.docs as unknown as PayloadEstimateRow[]) {
    // Seconde barrière après la requête : jamais d'appareil hors catalogue.
    if (isOffCatalogue(doc.combustible)) continue;
    // Règle partagée avec la fiche produit (lib/estimable.ts).
    if (!isEstimable(doc)) {
      if (!hasShownPrice(doc)) quoteOnlySlugs.push(doc.slug);
      continue;
    }

    // Vignette 64 px dans le configurateur : la taille « card » (400 px)
    // pré-générée par Payload suffit, l'original (souvent > 300 Ko) alourdirait
    // la page pour rien. Servie sans l'optimiseur Vercel (cf. lib/product-image.ts).
    const img = doc.mainImage;
    const rawUrl =
      img && typeof img === "object"
        ? (img.sizes?.card?.url && img.sizes.card.url.length > 0 ? img.sizes.card.url : img.url)
        : undefined;
    const relSrc =
      typeof rawUrl === "string" && rawUrl.length > 0 ? toImageSrc(rawUrl) : undefined;
    // Ancienne déclinaison JPEG ou PNG : servie en WebP (lib/product-image.ts).
    const imageSrc = relSrc ? webpUrl(relSrc) : undefined;

    const options = estimateOptions(doc);
    const multi = options.length > 1;

    for (const opt of options) {
      products.push({
        key: multi ? `${doc.slug}::${opt.kw}` : doc.slug,
        slug: doc.slug,
        name: doc.name,
        brand: doc.brand,
        productType: doc.productType,
        combustible: doc.combustible ?? undefined,
        appliance: doc.appliance ?? undefined,
        powerKw: opt.kw,
        fromVariant: opt.fromVariant && multi,
        priceHT: opt.ht,
        priceTTC: opt.ttc ?? undefined,
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
  products.sort((a, b) => a.brand.localeCompare(b.brand, "fr") || a.powerKw - b.powerKw);
  return { products, quoteOnlySlugs };
}

export async function getEstimateCatalog(): Promise<EstimateProduct[]> {
  return (await getEstimateCatalogData()).products;
}

/** Une option chiffrable par sa clé (revalidation côté serveur). */
export async function getEstimateProduct(key: string): Promise<EstimateProduct | undefined> {
  const all = await getEstimateCatalog();
  return all.find((p) => p.key === key);
}
