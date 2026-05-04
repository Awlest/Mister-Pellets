import "server-only";
import { getPayloadClient } from "./payload-client";
import type {
  ProductDemo,
  ProductColorVariant,
  ProductType,
  Diffusion,
  ColorCategory,
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
  priceTTC: number;
  surfaceMin?: number | null;
  surfaceMax?: number | null;
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
      }
    | null;
  galleryImages?: Array<{
    image?:
      | number
      | {
          url?: string | null;
          alt?: string | null;
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
        }
      | null;
    galleryImages?: Array<{
      image?:
        | number
        | {
            url?: string | null;
            alt?: string | null;
          }
        | null;
    }> | null;
  }> | null;
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
  // Reconstruit la string surface "70-130 m²" depuis surfaceMin/Max
  const surface =
    p.surfaceMin && p.surfaceMax
      ? `${p.surfaceMin}-${p.surfaceMax} m²`
      : p.surfaceMin
        ? `${p.surfaceMin}+ m²`
        : undefined;

  // Reconstruit la string power "9 kW" depuis power numeric
  const power = `${p.power} kW`;

  // Si l'image principale est uploadée, on récupère l'URL same-origin
  // relative (cf. helper toRelativeUrl pour le rationale Next.js Image).
  let imageSrc: string | undefined;
  let imageAlt: string | undefined;
  if (p.mainImage && typeof p.mainImage === "object" && p.mainImage.url) {
    imageSrc = toRelativeUrl(p.mainImage.url);
    imageAlt = p.mainImage.alt ?? p.name;
  }

  // Galerie : on filtre les entries valides et on convertit les URLs.
  const galleryImages = Array.isArray(p.galleryImages)
    ? p.galleryImages
        .map((item) => {
          if (!item.image || typeof item.image !== "object" || !item.image.url) return null;
          return {
            url: toRelativeUrl(item.image.url),
            alt: item.image.alt ?? p.name,
          };
        })
        .filter((x): x is { url: string; alt: string } => x !== null)
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
    surface,
    priceTTC: p.priceTTC,
    isBestseller: p.isBestseller ?? false,
    isNew: p.isNew ?? false,
    isAirtight: p.isAirtight ?? false,
    isConnected: p.isConnected ?? false,
    imageSrc,
    imageAlt,
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
                    alt: cv.mainImage.alt ?? `${p.name} — ${cv.colorName}`,
                  }
                : undefined;

            const variantGallery = Array.isArray(cv.galleryImages)
              ? cv.galleryImages
                  .map((g) => {
                    if (!g.image || typeof g.image !== "object" || !g.image.url) return null;
                    return {
                      url: toRelativeUrl(g.image.url),
                      alt: g.image.alt ?? `${p.name} — ${cv.colorName}`,
                    };
                  })
                  .filter((x): x is { url: string; alt: string } => x !== null)
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
  };
}

/**
 * Retourne tous les produits visibles publiquement (la collection Products
 * est en read public via access.read=()=>true).
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
  });

  return result.docs.map((d) => payloadToDemo(d as unknown as PayloadProduct));
}

/**
 * Retourne un produit par son slug, ou undefined si pas trouvé.
 */
export async function getProductBySlug(slug: string): Promise<ProductDemo | undefined> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "products",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  });

  if (result.docs.length === 0) return undefined;
  return payloadToDemo(result.docs[0] as unknown as PayloadProduct);
}

/**
 * Retourne tous les slugs des produits publiés. Utilisé par sitemap.ts et
 * generateStaticParams() de la page produit.
 */
export async function getAllProductSlugs(): Promise<string[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "products",
    limit: 200,
    pagination: false,
    overrideAccess: false,
    select: { slug: true },
  });

  return result.docs.map((d) => (d as unknown as PayloadProduct).slug);
}
