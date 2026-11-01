import "server-only";
import { cache } from "react";
import { getPayloadClient } from "@/lib/payload-client";

export interface GoogleReviewItem {
  id: number;
  /** Prénom et initiale, comme « Olivier P. ». */
  authorName: string;
  rating: number;
  /** Texte recopié tel quel depuis Google (retours à la ligne compris). */
  quote: string;
}

export interface GoogleReviewsData {
  /** Note moyenne de la fiche, comme Google l'affiche (5, 4,9…). */
  rating: number;
  /** Nombre total d'avis de la fiche, tous métiers confondus. */
  reviewCount: number;
  /** Date du relevé de la note et du nombre d'avis (ISO). */
  checkedAt: string;
  placeUrl: string;
  /** Avis repris sur le site : ceux qui parlent de poêles à pellets. */
  reviews: GoogleReviewItem[];
}

/**
 * Avis Google de la fiche Awlest, saisis dans l'admin (collection
 * `google-reviews` et global `google-reviews-summary`). Une seule lecture par
 * rendu. `null` si la base ne répond pas ou si la migration n'est pas encore
 * passée : le bloc d'avis ne s'affiche pas plutôt que de casser la page.
 */
export const getGoogleReviews = cache(async (): Promise<GoogleReviewsData | null> => {
  try {
    const payload = await getPayloadClient();
    const [summary, { docs }] = await Promise.all([
      payload.findGlobal({ slug: "google-reviews-summary", depth: 0 }),
      payload.find({ collection: "google-reviews", sort: "sortOrder", depth: 0, limit: 100 }),
    ]);
    if (!summary?.rating || !summary.reviewCount || !summary.checkedAt) return null;
    return {
      rating: summary.rating,
      reviewCount: summary.reviewCount,
      checkedAt: summary.checkedAt,
      placeUrl: summary.placeUrl,
      reviews: docs.map((d) => ({
        id: d.id,
        authorName: d.authorName,
        rating: d.rating,
        quote: d.quote,
      })),
    };
  } catch (err) {
    console.warn("[google-reviews] lecture impossible:", err instanceof Error ? err.message.slice(0, 200) : err);
    return null;
  }
});

/** « 5,0 » ou « 4,9 » : une décimale, comme Google. */
export function formatRating(rating: number): string {
  return rating.toLocaleString("fr-BE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/** « 1er novembre 2026 ». */
export function formatCheckedAt(iso: string): string {
  const d = new Date(iso);
  const day = d.getUTCDate();
  const monthYear = d.toLocaleDateString("fr-BE", { month: "long", year: "numeric", timeZone: "UTC" });
  return `${day === 1 ? "1er" : day} ${monthYear}`;
}
