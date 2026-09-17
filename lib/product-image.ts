/**
 * Images produit SANS l'optimiseur d'images de Vercel.
 *
 * Le 17/09/2026, toutes les photos du site étaient cassées : Vercel répondait
 * « 402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED » sur chaque URL /_next/image,
 * le quota d'optimisation d'images du plan Hobby étant épuisé. Payload génère
 * déjà, à l'upload, les tailles dont le site a besoin (collections/Media.ts →
 * imageSizes : card 400 px, display 800 px, full 1600 px). On les sert donc
 * directement via un `srcset`, sans transformation à la volée : zéro quota,
 * et les fichiers sont mis en cache par le CDN (route /api/media/file).
 *
 * Ne PAS réintroduire next/image (ou retirer `images.unoptimized` dans
 * next.config.ts) pour les photos produit : la panne reviendrait dès que le
 * quota mensuel serait atteint.
 *
 * Module sans dépendance : importable par les composants serveur et client.
 */

export type ProductImageSize = "card" | "display" | "full";

export interface ProductImage {
  /** URL de l'original. Repli, lightbox, flux Merchant et JSON-LD. */
  url: string;
  alt?: string;
  /** Point focal (0-100 %) défini dans l'admin Media (CSS object-position). */
  focalX?: number;
  focalY?: number;
  /** Largeur de l'original en px (descripteur `w` du srcset). */
  width?: number;
  /** Déclinaisons pré-générées par Payload, par nom de taille. */
  sizes?: Partial<Record<ProductImageSize, string>>;
}

/** Largeur (px) de chaque taille, telle que déclarée dans collections/Media.ts. */
export const PRODUCT_IMAGE_WIDTHS: Record<ProductImageSize, number> = {
  card: 400,
  display: 800,
  full: 1600,
};

interface Candidate {
  url: string;
  width: number;
}

/**
 * Toutes les versions disponibles d'une image, triées par largeur croissante.
 * La vignette 200×200 de Payload est volontairement exclue : elle est recadrée
 * au centre et n'a pas le même cadrage que les autres tailles.
 */
export function imageCandidates(img: ProductImage): Candidate[] {
  const list: Candidate[] = [];
  for (const size of Object.keys(PRODUCT_IMAGE_WIDTHS) as ProductImageSize[]) {
    const url = img.sizes?.[size];
    if (url) list.push({ url, width: PRODUCT_IMAGE_WIDTHS[size] });
  }
  // L'original n'entre dans le srcset que si sa largeur est connue et qu'il
  // apporte plus de pixels que la plus grande déclinaison.
  const largest = list.length > 0 ? list[list.length - 1]!.width : 0;
  if (typeof img.width === "number" && img.width > largest) {
    list.push({ url: img.url, width: img.width });
  }
  return list.sort((a, b) => a.width - b.width);
}

/**
 * Attribut `srcset` prêt à l'emploi, ou undefined quand aucune déclinaison
 * n'est connue (le navigateur utilise alors `src`).
 */
export function buildSrcSet(img: ProductImage): string | undefined {
  const candidates = imageCandidates(img);
  if (candidates.length === 0) return undefined;
  // Une virgule dans une URL casserait la liste : on l'encode.
  return candidates.map((c) => `${c.url.replace(/,/g, "%2C")} ${c.width}w`).join(", ");
}

/**
 * URL de repli (`src`) : la plus petite version d'au moins `targetWidth` px,
 * sinon la plus grande disponible, sinon l'original.
 */
export function pickImageSrc(img: ProductImage, targetWidth: number): string {
  const candidates = imageCandidates(img);
  const fit = candidates.find((c) => c.width >= targetWidth);
  return (fit ?? candidates[candidates.length - 1])?.url ?? img.url;
}
