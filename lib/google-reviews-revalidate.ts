import { revalidatePath } from "next/cache";

/** Pages qui affichent des avis Google (bloc complet). */
const PAGES_WITH_REVIEWS = ["/", "/prix-poele-pellets", "/prendre-rendez-vous", "/avis-clients"];

/**
 * Pages en ISR à rafraîchir quand un avis ou la note Google change dans
 * l'admin. Avec `withProductPages`, aussi les fiches produit, qui affichent la
 * note et le nombre d'avis (pas les avis eux-mêmes) : elles sont marquées
 * périmées et régénérées à la visite suivante, pas toutes d'un coup.
 */
export function revalidateGoogleReviewPages({ withProductPages = false } = {}): void {
  try {
    for (const path of PAGES_WITH_REVIEWS) revalidatePath(path);
    if (withProductPages) revalidatePath("/produit/[slug]", "page");
  } catch (err) {
    // En dev local ou en script, revalidatePath peut échouer ; ne bloque pas la sauvegarde.
    console.warn("[google-reviews] revalidate failed:", err);
  }
}
