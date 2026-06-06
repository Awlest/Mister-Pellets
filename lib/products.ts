import "server-only";
import { getPayloadClient } from "./payload-client";
import type {
  ProductDemo,
  ProductColorVariant,
  ProductType,
  Diffusion,
  ColorCategory,
  VariantOptionAxis,
  VariantOptionValueData,
  ProductVariantData,
  VariantDisplayMode,
  VariantStockStatus,
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

interface PayloadProduct {
  id: number;
  slug: string;
  name: string;
  brand: string;
  productType: ProductType;
  diffusion: Diffusion;
  color: ColorCategory;
  power: number;
  priceTTC?: number | null;
  sku?: string | null;
  gtin?: string | null;
  mpn?: string | null;
  googleProductCategory?: string | null;
  heatedVolumeM3?: number | null;
  isAirtight?: boolean | null;
  isConnected?: boolean | null;
  isBestseller?: boolean | null;
  isNew?: boolean | null;
  shortDescription?: string | null;
  features?: Array<{ title?: string | null; description?: string | null }> | null;
  mainImage?:
    | number
    | {
        url?: string | null;
        alt?: string | null;
        focalX?: number | null;
        focalY?: number | null;
      }
    | null;
  galleryImages?: Array<{
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
    mainImage?:
      | number
      | {
          url?: string | null;
          alt?: string | null;
          focalX?: number | null;
          focalY?: number | null;
        }
      | null;
    galleryImages?: Array<{
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

  // Si l'image principale est uploadée, on récupère l'URL same-origin
  // relative (cf. helper toRelativeUrl pour le rationale Next.js Image).
  // On remonte aussi focalX/focalY (pourcentages 0-100 saisis dans l'admin
  // Media) pour positionner l'image correctement dans la carte boutique et
  // la galerie produit.
  let imageSrc: string | undefined;
  let imageAlt: string | undefined;
  let imageFocalX: number | undefined;
  let imageFocalY: number | undefined;
  if (p.mainImage && typeof p.mainImage === "object" && p.mainImage.url) {
    imageSrc = toRelativeUrl(p.mainImage.url);
    imageAlt = p.mainImage.alt ?? p.name;
    if (typeof p.mainImage.focalX === "number") imageFocalX = p.mainImage.focalX;
    if (typeof p.mainImage.focalY === "number") imageFocalY = p.mainImage.focalY;
  }

  // Galerie : on filtre les entries valides et on convertit les URLs.
  const galleryImages = Array.isArray(p.galleryImages)
    ? p.galleryImages
        .map((item) => {
          if (!item.image || typeof item.image !== "object" || !item.image.url) return null;
          return {
            url: toRelativeUrl(item.image.url),
            alt: item.image.alt ?? p.name,
            ...(typeof item.image.focalX === "number" ? { focalX: item.image.focalX } : {}),
            ...(typeof item.image.focalY === "number" ? { focalY: item.image.focalY } : {}),
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)
    : undefined;

  // Fiche technique PDF : URL relative + nom du fichier pour l'affichage du lien.
  let technicalSheetUrl: string | undefined;
  let technicalSheetFilename: string | undefined;
  if (p.technicalSheet && typeof p.technicalSheet === "object" && p.technicalSheet.url) {
    technicalSheetUrl = toRelativeUrl(p.technicalSheet.url);
    technicalSheetFilename = p.technicalSheet.filename ?? "fiche-technique.pdf";
  }

  return {
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    type: p.productType,
    diffusion: p.diffusion,
    color: p.color,
    powerKw: p.power,
    power,
    heatedVolume,
    priceTTC: p.priceTTC ?? undefined,
    isBestseller: p.isBestseller ?? false,
    isNew: p.isNew ?? false,
    isAirtight: p.isAirtight ?? false,
    isConnected: p.isConnected ?? false,
    imageSrc,
    imageAlt,
    imageFocalX,
    imageFocalY,
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
            const variantMainImage =
              cv.mainImage && typeof cv.mainImage === "object" && cv.mainImage.url
                ? {
                    url: toRelativeUrl(cv.mainImage.url),
                    alt: cv.mainImage.alt ?? `${p.name}, ${cv.colorName}`,
                    focalX: typeof cv.mainImage.focalX === "number" ? cv.mainImage.focalX : undefined,
                    focalY: typeof cv.mainImage.focalY === "number" ? cv.mainImage.focalY : undefined,
                  }
                : undefined;

            const variantGallery = Array.isArray(cv.galleryImages)
              ? cv.galleryImages
                  .map((g) => {
                    if (!g.image || typeof g.image !== "object" || !g.image.url) return null;
                    return {
                      url: toRelativeUrl(g.image.url),
                      alt: g.image.alt ?? `${p.name}, ${cv.colorName}`,
                      ...(typeof g.image.focalX === "number" ? { focalX: g.image.focalX } : {}),
                      ...(typeof g.image.focalY === "number" ? { focalY: g.image.focalY } : {}),
                    };
                  })
                  .filter((x): x is NonNullable<typeof x> => x !== null)
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
