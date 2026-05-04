import "server-only";
import { getPayloadClient } from "./payload-client";
import type {
  ProductDemo,
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
  mainImage?:
    | number
    | {
        url?: string | null;
        alt?: string | null;
      }
    | null;
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

  // Si l'image principale est uploadée, sortir l'URL Cloudinary/S3
  let imageSrc: string | undefined;
  let imageAlt: string | undefined;
  if (p.mainImage && typeof p.mainImage === "object" && p.mainImage.url) {
    imageSrc = p.mainImage.url;
    imageAlt = p.mainImage.alt ?? p.name;
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
