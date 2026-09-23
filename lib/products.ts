import "server-only";
import { getPayloadClient } from "./payload-client";
import { bonusPrice, isBonusPeriod } from "./bonus";
import type {
  ProductDemo,
  ProductColorVariant,
  ProductType,
  Combustible,
  Diffusion,
  ColorCategory,
  VariantOptionAxis,
  VariantOptionValueData,
  ProductVariantData,
  VariantDisplayMode,
  VariantStockStatus,
  ProductImage,
} from "./products-demo";

/**
 * Couche d'accès Payload pour les produits.
 *
 * Phase 5 : la boutique consomme la collection Payload `products` au lieu du
 * tableau statique PRODUCTS_DEMO. On expose des fonctions qui retournent le
 * shape ProductDemo pour minimiser le diff côté UI (ProductCard, filtres…).
 *
 * Toutes les fonctions sont server-only (use Payload Local API → DB direct).
 */

/**
 * Document `media` hydraté (depth ≥ 1). `sizes` = déclinaisons générées par
 * Payload à l'upload (collections/Media.ts → imageSizes : thumbnail 200×200
 * recadrée, card 400 px, display 800 px, full 1600 px). Une taille n'existe
 * que si l'original est au moins aussi large (pas d'agrandissement).
 */
interface PayloadMedia {
  url?: string | null;
  alt?: string | null;
  focalX?: number | null;
  focalY?: number | null;
  width?: number | null;
  height?: number | null;
  sizes?: {
    thumbnail?: { url?: string | null; width?: number | null } | null;
    card?: { url?: string | null; width?: number | null } | null;
    display?: { url?: string | null; width?: number | null } | null;
    full?: { url?: string | null; width?: number | null } | null;
  } | null;
}

interface PayloadProduct {
  id: number;
  slug: string;
  name: string;
  brand: string;
  productType: ProductType;
  combustible?: Combustible | null;
  diffusion: Diffusion;
  color: ColorCategory;
  power: number;
  priceTTC?: number | null;
  promoPrice?: number | null;
  sku?: string | null;
  gtin?: string | null;
  mpn?: string | null;
  googleProductCategory?: string | null;
  stockStatus?: VariantStockStatus | null;
  heatedVolumeM3?: number | null;
  isAirtight?: boolean | null;
  isCanalizable?: boolean | null;
  isHydro?: boolean | null;
  isConnected?: boolean | null;
  isBestseller?: boolean | null;
  isFeatured?: boolean | null;
  isNew?: boolean | null;
  createdAt?: string | null;
  shortDescription?: string | null;
  features?: Array<{ title?: string | null; description?: string | null }> | null;
  mainImage?: number | PayloadMedia | null;
  galleryImages?: Array<{ image?: number | PayloadMedia | null }> | null;
  technicalSheet?:
    | number
    | {
        url?: string | null;
        filename?: string | null;
      }
    | null;
  colorVariants?: Array<{
    colorName?: string | null;
    colorHex?: string | null;
    gtin?: string | null;
    mainImage?: number | PayloadMedia | null;
    galleryImages?: Array<{ image?: number | PayloadMedia | null }> | null;
  }> | null;
  hasVariants?: boolean | null;
  variantOptions?: Array<{
    optionType?:
      | number
      | {
          id: number;
          label?: string | null;
          slug?: string | null;
          displayMode?: VariantDisplayMode | null;
          sortOrder?: number | null;
        }
      | null;
    values?: Array<number | PayloadOptionValue> | null;
  }> | null;
  variants?: Array<{
    id?: string | null;
    optionValues?: Array<number | PayloadOptionValue> | null;
    sku?: string | null;
    gtin?: string | null;
    mpn?: string | null;
    price?: number | null;
    salePrice?: number | null;
    stockStatus?: VariantStockStatus | null;
    leadTimeDays?: number | null;
    image?:
      | number
      | {
          url?: string | null;
          alt?: string | null;
          focalX?: number | null;
          focalY?: number | null;
        }
      | null;
  }> | null;
}

/** Document `variant-option-values` hydraté (depth ≥ 1). */
interface PayloadOptionValue {
  id: number;
  label?: string | null;
  slug?: string | null;
  colorHex?: string | null;
  icon?:
    | number
    | {
        url?: string | null;
        alt?: string | null;
        focalX?: number | null;
        focalY?: number | null;
      }
    | null;
}

/**
 * Convertit une valeur d'option Payload (hydratée) vers VariantOptionValueData.
 * Retourne null si la valeur n'est pas hydratée (juste un ID → depth insuffisant).
 */
function mapOptionValue(
  v: number | PayloadOptionValue | null | undefined,
): VariantOptionValueData | null {
  if (!v || typeof v !== "object") return null;
  const iconUrl =
    v.icon && typeof v.icon === "object" && v.icon.url
      ? toRelativeUrl(v.icon.url)
      : undefined;
  return {
    id: v.id,
    label: v.label ?? "",
    slug: v.slug ?? "",
    colorHex: v.colorHex ?? undefined,
    iconUrl,
  };
}

/**
 * Convertit une URL absolue same-origin en chemin relatif.
 * Cf. fix images Next.js Image (commit 2b595fe).
 */
function toRelativeUrl(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    const isSameHost = u.host.includes("mister-pellets");
    return isSameHost ? `${u.pathname}${u.search}` : rawUrl;
  } catch {
    return rawUrl;
  }
}

/**
 * Convertit un média Payload hydraté en ProductImage : URL originale relative
 * + déclinaisons pré-calculées (card/display/full) quand elles existent, pour
 * que les composants construisent un srcset sans passer par l'optimiseur
 * d'images de Vercel (cf. lib/product-image.ts).
 * Retourne undefined si le média n'est pas hydraté ou n'a pas d'URL.
 */
function mapMedia(
  m: number | PayloadMedia | null | undefined,
  fallbackAlt: string,
): ProductImage | undefined {
  if (!m || typeof m !== "object" || !m.url) return undefined;
  const sizes: NonNullable<ProductImage["sizes"]> = {};
  for (const key of ["card", "display", "full"] as const) {
    const s = m.sizes?.[key];
    if (s?.url) sizes[key] = toRelativeUrl(s.url);
  }
  return {
    url: toRelativeUrl(m.url),
    alt: m.alt ?? fallbackAlt,
    ...(typeof m.focalX === "number" ? { focalX: m.focalX } : {}),
    ...(typeof m.focalY === "number" ? { focalY: m.focalY } : {}),
    ...(typeof m.width === "number" && m.width > 0 ? { width: m.width } : {}),
    ...(Object.keys(sizes).length > 0 ? { sizes } : {}),
  };
}

/**
 * Volume de chauffe maximal (m³) par puissance — gamme Girolami, CATALISTINO
 * 2026. Pour une puissance donnée, la valeur est identique sur toute la gamme
 * (relevé sur les fiches produit avant regroupement). Sert UNIQUEMENT à
 * enrichir les fiches regroupées (plusieurs puissances sur une seule fiche) :
 * pastilles d'infos + filtre boutique. Aucune valeur inventée.
 */
const GIROLAMI_VOLUME_BY_POWER_KW: Record<number, number> = {
  6: 165,
  9: 276,
  12: 310,
  14: 375,
  18: 452,
  22: 551,
  26: 584,
};

/**
 * Pour une fiche regroupée par puissance, retourne toutes les puissances (kW)
 * et les volumes de chauffe (m³) correspondants, lus sur l'axe de variante
 * « Puissance ». Retourne {} si la fiche n'a pas plusieurs puissances.
 *
 * - `powers` : lu directement sur les libellés de l'axe (ex: "12 kW" → 12),
 *   valable pour toutes les marques.
 * - `heatedVolumes` : déduit du barème Girolami ci-dessus (scopé à la marque
 *   pour ne pas attribuer un volume Girolami à une autre marque).
 */
function deriveVariantPowers(p: PayloadProduct): {
  powers?: number[];
  heatedVolumes?: number[];
} {
  if (!p.hasVariants || !Array.isArray(p.variantOptions)) return {};
  const powerAxis = p.variantOptions.find((vo) => {
    const ot = vo.optionType;
    return (
      ot &&
      typeof ot === "object" &&
      (ot.slug === "puissance" || ot.label === "Puissance")
    );
  });
  if (!powerAxis || !Array.isArray(powerAxis.values)) return {};
  const kws = powerAxis.values
    .map((v) => (v && typeof v === "object" ? v.label : null))
    .map((label) => (typeof label === "string" ? parseInt(label, 10) : NaN))
    .filter((n): n is number => Number.isFinite(n));
  const powers = [...new Set(kws)].sort((a, b) => a - b);
  if (powers.length < 2) return {};

  let heatedVolumes: number[] | undefined;
  if (p.brand === "Girolami") {
    const vols = powers
      .map((kw) => GIROLAMI_VOLUME_BY_POWER_KW[kw])
      .filter((v): v is number => typeof v === "number");
    if (vols.length > 0) heatedVolumes = [...new Set(vols)].sort((a, b) => a - b);
  }
  return { powers, heatedVolumes };
}

/** Prix TTC remisé d'une variante : sur son prix promo admin s'il existe, sinon son prix. */
function variantBonusPrice(price?: number | null, salePrice?: number | null): number | undefined {
  const effective = salePrice && salePrice > 0 ? salePrice : price;
  return effective && effective > 0 ? bonusPrice(effective) : undefined;
}

/**
 * Convertit un document Payload `products` vers le shape ProductDemo
 * attendu par les composants UI existants (ProductCard, filtres boutique).
 */
function payloadToDemo(p: PayloadProduct): ProductDemo {
  // Volume de chauffe MAX en m³ — donnée constructeur saisie directement par
  // l'équipe Awlest dans l'admin Payload. Pas de conversion.
  const heatedVolume =
    p.heatedVolumeM3 && p.heatedVolumeM3 > 0 ? `${p.heatedVolumeM3} m³` : undefined;

  // Reconstruit la string power "9 kW" depuis power numeric
  const power = `${p.power} kW`;

  // Fiche regroupée multi-puissances : éventail complet des puissances +
  // volumes, pour les pastilles et le filtre boutique.
  const { powers, heatedVolumes } = deriveVariantPowers(p);

  // Si l'image principale est uploadée, on récupère l'URL same-origin
  // relative (cf. helper toRelativeUrl pour le rationale Next.js Image).
  // On remonte aussi focalX/focalY (pourcentages 0-100 saisis dans l'admin
  // Media) pour positionner l'image correctement dans la carte boutique et
  // la galerie produit.
  const image = mapMedia(p.mainImage, p.name);
  const imageSrc = image?.url;
  const imageAlt = image?.alt;
  const imageFocalX = image?.focalX;
  const imageFocalY = image?.focalY;

  // Galerie : on filtre les entries valides et on convertit les URLs.
  const galleryImages = Array.isArray(p.galleryImages)
    ? p.galleryImages
        .map((item) => mapMedia(item.image, p.name))
        .filter((x): x is ProductImage => x !== undefined)
    : undefined;

  // Fiche technique PDF : URL relative + nom du fichier pour l'affichage du lien.
  let technicalSheetUrl: string | undefined;
  let technicalSheetFilename: string | undefined;
  if (p.technicalSheet && typeof p.technicalSheet === "object" && p.technicalSheet.url) {
    technicalSheetUrl = toRelativeUrl(p.technicalSheet.url);
    technicalSheetFilename = p.technicalSheet.filename ?? "fiche-technique.pdf";
  }

  // Bonus de saison (lib/bonus.ts) : calculé ici, côté serveur, à la lecture du
  // catalogue, pour que cartes, fiche, schéma Product et flux partent du même
  // prix remisé sans que le navigateur ait à lire la date.
  const bonusActive = isBonusPeriod();

  // Promo saisie dans l'admin : ne compte que si elle est bien inférieure au
  // prix catalogue (sinon ce n'est pas une promo). Le bonus de saison se
  // calcule sur le prix réellement pratiqué avant lui, promo comprise, comme
  // dans le configurateur (lib/estimate-catalog.ts).
  const catalogTTC = p.priceTTC && p.priceTTC > 0 ? p.priceTTC : undefined;
  const promoTTC =
    p.promoPrice && p.promoPrice > 0 && (catalogTTC == null || p.promoPrice < catalogTTC)
      ? p.promoPrice
      : undefined;
  const effectiveTTC = promoTTC ?? catalogTTC;

  return {
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    type: p.productType,
    combustible: p.combustible ?? "pellet",
    isHydro: p.isHydro ?? false,
    diffusion: p.diffusion,
    color: p.color,
    powerKw: p.power,
    power,
    heatedVolume,
    powers,
    heatedVolumes,
    priceTTC: p.priceTTC ?? undefined,
    promoPriceTTC: promoTTC,
    bonusPriceTTC: bonusActive && effectiveTTC ? bonusPrice(effectiveTTC) : undefined,
    stockStatus: p.stockStatus ?? undefined,
    isBestseller: p.isBestseller ?? false,
    isFeatured: p.isFeatured ?? false,
    isNew: p.isNew ?? false,
    createdAt: p.createdAt ?? undefined,
    isAirtight: p.isAirtight ?? false,
    isCanalizable: p.isCanalizable ?? false,
    isConnected: p.isConnected ?? false,
    imageSrc,
    imageAlt,
    imageFocalX,
    imageFocalY,
    image,
    shortDescription: p.shortDescription ?? undefined,
    features: Array.isArray(p.features)
      ? p.features
          .filter((f) => f && f.title && f.description)
          .map((f) => ({
            title: f.title as string,
            description: f.description as string,
          }))
      : undefined,
    galleryImages,
    technicalSheetUrl,
    technicalSheetFilename,
    colorVariants: Array.isArray(p.colorVariants)
      ? p.colorVariants
          .filter((cv) => cv && cv.colorName)
          .map<ProductColorVariant>((cv) => {
            const variantAlt = `${p.name}, ${cv.colorName}`;
            const variantMainImage = mapMedia(cv.mainImage, variantAlt);
            const variantGallery = Array.isArray(cv.galleryImages)
              ? cv.galleryImages
                  .map((g) => mapMedia(g.image, variantAlt))
                  .filter((x): x is ProductImage => x !== undefined)
              : undefined;

            return {
              colorName: cv.colorName as string,
              colorHex: cv.colorHex ?? undefined,
              gtin: cv.gtin ?? undefined,
              mainImage: variantMainImage,
              galleryImages: variantGallery,
            };
          })
      : undefined,

    // ===== IDENTIFIANTS MERCHANT =====
    sku: p.sku ?? undefined,
    gtin: p.gtin ?? undefined,
    mpn: p.mpn ?? undefined,
    googleProductCategory: p.googleProductCategory ?? undefined,

    // ===== VARIANTES GÉNÉRIQUES (multi-axes) =====
    hasVariants: p.hasVariants ?? false,
    variantOptions: Array.isArray(p.variantOptions)
      ? p.variantOptions
          .map((vo): VariantOptionAxis | null => {
            const ot = vo.optionType;
            if (!ot || typeof ot !== "object") return null;
            const values = Array.isArray(vo.values)
              ? vo.values
                  .map(mapOptionValue)
                  .filter((x): x is VariantOptionValueData => x !== null)
              : [];
            return {
              optionTypeId: ot.id,
              label: ot.label ?? "",
              slug: ot.slug ?? "",
              displayMode: (ot.displayMode ?? "text") as VariantDisplayMode,
              sortOrder: typeof ot.sortOrder === "number" ? ot.sortOrder : 100,
              values,
            };
          })
          .filter((x): x is VariantOptionAxis => x !== null)
      : undefined,
    variants: Array.isArray(p.variants)
      ? p.variants.map((v): ProductVariantData => {
          const optionValueIds = Array.isArray(v.optionValues)
            ? v.optionValues
                .map((ov) => (ov && typeof ov === "object" ? ov.id : ov))
                .filter((x): x is number => typeof x === "number")
            : [];
          const variantImage =
            v.image && typeof v.image === "object" && v.image.url
              ? { url: toRelativeUrl(v.image.url), alt: v.image.alt ?? p.name }
              : undefined;
          return {
            id: String(v.id ?? ""),
            optionValueIds,
            sku: v.sku ?? undefined,
            gtin: v.gtin ?? undefined,
            mpn: v.mpn ?? undefined,
            price: typeof v.price === "number" ? v.price : 0,
            salePrice: typeof v.salePrice === "number" ? v.salePrice : undefined,
            bonusPrice: bonusActive ? variantBonusPrice(v.price, v.salePrice) : undefined,
            stockStatus: v.stockStatus ?? undefined,
            leadTimeDays:
              typeof v.leadTimeDays === "number" ? v.leadTimeDays : undefined,
            image: variantImage,
          };
        })
      : undefined,
  };
}

/**
 * Retourne tous les produits visibles publiquement DANS LA BOUTIQUE.
 * Filtre les produits avec hiddenFromBoutique=true (cochés "Masquer de la
 * boutique" par l'équipe Awlest). Ces produits restent accessibles via leur
 * URL directe /produit/{slug} mais n'apparaissent plus dans le listing.
 *
 * Phase 5 : pas de pagination car catalogue ≤ 100 produits attendus.
 */
export async function getAllProducts(): Promise<ProductDemo[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "products",
    limit: 200,
    depth: 1, // hydrate mainImage
    overrideAccess: false, // respecte la règle read public
    where: {
      // Les produits sans hiddenFromBoutique=true sont visibles (gère NULL,
      // false, et undefined — utile pour les produits créés avant la migration)
      hiddenFromBoutique: { not_equals: true },
    },
  });

  return result.docs.map((d) => payloadToDemo(d as unknown as PayloadProduct));
}

/**
 * Retourne un produit par son slug, ou undefined si pas trouvé.
 * Pas de filtre sur hiddenFromBoutique — l'URL directe doit rester accessible
 * même pour les produits masqués (favoris, liens externes, etc.).
 */
export async function getProductBySlug(slug: string): Promise<ProductDemo | undefined> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "products",
    where: { slug: { equals: slug } },
    limit: 1,
    // depth 2 : hydrate les variantes (optionType, values, optionValues) ET
    // les icônes des valeurs (icon = upload imbriqué un niveau plus bas).
    depth: 2,
    overrideAccess: false,
  });

  if (result.docs.length === 0) return undefined;
  return payloadToDemo(result.docs[0] as unknown as PayloadProduct);
}

/**
 * Retourne tous les slugs des produits VISIBLES dans la boutique. Utilisé par
 * sitemap.ts (on ne référence pas les produits masqués dans Google) et
 * generateStaticParams() de la page produit (pas besoin de pré-générer les
 * pages masquées au build, elles seront rendues à la demande si quelqu'un
 * arrive par URL directe).
 */
export async function getAllProductSlugs(): Promise<string[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "products",
    limit: 200,
    pagination: false,
    overrideAccess: false,
    select: { slug: true },
    where: {
      hiddenFromBoutique: { not_equals: true },
    },
  });

  return result.docs.map((d) => (d as unknown as PayloadProduct).slug);
}

/**
 * Slug + date de dernière modification des produits visibles en boutique.
 * Utilisé par sitemap.ts pour émettre un lastmod réel (updatedAt Payload)
 * plutôt que la date de génération du sitemap.
 */
export type ProductSitemapEntry = { slug: string; updatedAt?: string };

export async function getProductSitemapEntries(): Promise<ProductSitemapEntry[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "products",
    limit: 200,
    pagination: false,
    overrideAccess: false,
    select: { slug: true, updatedAt: true },
    where: {
      hiddenFromBoutique: { not_equals: true },
    },
  });

  return result.docs.map((d) => {
    const doc = d as unknown as PayloadProduct & { updatedAt?: string };
    return { slug: doc.slug, updatedAt: doc.updatedAt };
  });
}
