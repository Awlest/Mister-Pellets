import {
  FICHES_BOIS_SANS_EQUIVALENT,
  FICHES_BOIS_VERS_MISTER_BOIS,
  FICHES_HYBRIDES_SUR_MISTER_BOIS,
  MISTER_BOIS,
} from "@/config/mister-bois";
import type { Combustible, ProductType } from "./products-demo";

/**
 * Périmètre du catalogue de Mister Pellets.
 *
 * Le site est spécialisé dans le pellet. La base contient pourtant des fiches
 * à bois bûche (gammes Edilkamin et Girolami encodées avant la création de
 * mister-bois.be). Elles ne sont pas supprimées de la base, elles sont
 * écartées ICI, pour tout le site : boutique, pages marque et ville, modèles
 * voisins, sitemap, pages construites, configurateur /estimation et flux
 * Google Merchant passent tous par les fonctions de lib/products.ts et de
 * lib/estimate-catalog.ts, qui appliquent ce filtre. Leur adresse est
 * redirigée vers mister-bois.be (config/mister-bois.ts).
 *
 * Ne lisez jamais la collection `products` pour l'afficher sans passer par
 * ces fonctions : une fiche bois reviendrait sur un site qui écrit « pellets
 * uniquement ». scripts/check-catalogue.ts le vérifie.
 */
export const COMBUSTIBLES_HORS_CATALOGUE: readonly Combustible[] = ["bois"];

/** La fiche porte un combustible que Mister Pellets ne vend pas. */
export function isOffCatalogue(combustible: string | null | undefined): boolean {
  return COMBUSTIBLES_HORS_CATALOGUE.some((c) => c === combustible);
}

/**
 * Conditions Payload qui écartent les combustibles hors catalogue, à poser
 * dans un `and`. `not_equals` garde les fiches sans combustible saisi (NULL),
 * ce que `not_in` ne ferait pas.
 */
export function inCatalogueWhere(): Array<{ combustible: { not_equals: Combustible } }> {
  return COMBUSTIBLES_HORS_CATALOGUE.map((c) => ({ combustible: { not_equals: c } }));
}

const HYBRID_TYPES: ReadonlySet<string> = new Set<ProductType>(["hybride", "hybride-hydro"]);

/** Hybride bois + pellets : par son combustible, ou par son type en filet. */
export function isHybrid(p: { combustible?: string | null; type?: string | null }): boolean {
  return p.combustible === "hybride" || (p.type != null && HYBRID_TYPES.has(p.type));
}

/**
 * Fiche de mister-bois.be qui fait référence pour un hybride affiché ici, ou
 * `undefined` si l'appareil n'y a pas (encore) de fiche connue : la page reste
 * alors hors index et hors sitemap jusqu'à ce que
 * FICHES_HYBRIDES_SUR_MISTER_BOIS soit complétée.
 */
export function misterBoisCanonical(slug: string): string | undefined {
  return FICHES_HYBRIDES_SUR_MISTER_BOIS[slug];
}

/**
 * Où envoyer une fiche hors catalogue : sa fiche sur Mister Bois si elle est
 * connue, sinon la catégorie de son appareil, sinon l'accueil de Mister Bois.
 * Filet de sécurité pour une fiche bois créée dans l'admin après le relevé du
 * 11/11/2026 : elle n'est jamais affichée ici.
 */
export function misterBoisDestination(p: {
  slug: string;
  appliance?: string | null;
  type?: string | null;
}): string {
  const known = FICHES_BOIS_VERS_MISTER_BOIS[p.slug] ?? FICHES_BOIS_SANS_EQUIVALENT[p.slug];
  if (known) return known;
  if (p.appliance === "insert" || p.appliance === "foyer") return MISTER_BOIS.inserts;
  if (p.appliance === "poele") return MISTER_BOIS.stoves;
  if (p.appliance === "chaudiere") return MISTER_BOIS.home;
  // Appareil non saisi : il se déduit du type, comme dans lib/product-kind.ts.
  return p.type === "insert" ? MISTER_BOIS.inserts : MISTER_BOIS.stoves;
}
