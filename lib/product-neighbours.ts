import type { ProductDemo } from "./products-demo";

/**
 * Modèles voisins d'une fiche produit : 3 de la même marque, puis 3 d'autres
 * marques, de même famille et de puissance proche. Chaque fiche reçoit ainsi
 * des liens d'autres fiches, pas seulement de sa marque.
 *
 * Module sans dépendance : importé par la fiche et par check:catalogue.
 */

/** Nombre de fiches proposées dans chaque bloc. */
export const NEIGHBOURS = 3;

type Family = "insert" | "hydro" | "canalisable" | "air";

type Candidate = Pick<
  ProductDemo,
  "slug" | "brand" | "type" | "appliance" | "isHydro" | "isCanalizable" | "combustible" | "powerKw" | "imageSrc"
>;

/** Famille d'un appareil, pour proposer des modèles comparables d'une autre marque. */
export function productFamily(p: Pick<Candidate, "type" | "appliance" | "isHydro" | "isCanalizable">): Family {
  if (p.type === "insert" || p.appliance === "insert" || p.appliance === "foyer") return "insert";
  if (p.isHydro || p.type === "hydro" || p.type === "hybride-hydro") return "hydro";
  if (p.isCanalizable || p.type === "canalisable") return "canalisable";
  return "air";
}

/**
 * `catalogue` arrive de la fiche la plus récente à la plus ancienne
 * (getAllProducts) : à égalité, la plus récente passe devant. On montre
 * d'abord les fiches qui ont une photo et le même combustible.
 */
export function productNeighbours<T extends Candidate>(
  product: Candidate,
  catalogue: readonly T[],
): { sameBrand: T[]; otherBrands: T[] } {
  const family = productFamily(product);
  const others = catalogue.filter((p) => p.slug !== product.slug).map((p, i) => ({ p, i }));
  const fit = (p: T) => (p.imageSrc ? 2 : 0) + (p.combustible === product.combustible ? 1 : 0);
  const closeness = (p: T) => Math.abs(p.powerKw - product.powerKw);

  const sameBrand = others
    .filter(({ p }) => p.brand === product.brand)
    .sort(
      (a, b) =>
        fit(b.p) - fit(a.p) ||
        Number(productFamily(b.p) === family) - Number(productFamily(a.p) === family) ||
        a.i - b.i,
    )
    .slice(0, NEIGHBOURS)
    .map(({ p }) => p);

  const ranked = others
    .filter(({ p }) => p.brand !== product.brand && productFamily(p) === family)
    .sort((a, b) => fit(b.p) - fit(a.p) || closeness(a.p) - closeness(b.p) || a.i - b.i)
    .map(({ p }) => p);
  // Une fiche par marque d'abord, pour varier les propositions. Quand la
  // famille ne compte que deux autres marques (hybrides raccordés au
  // chauffage central, par exemple), les fiches suivantes du classement
  // complètent le bloc : il en manquait une (recette du 11/11/2026).
  const varied = ranked.filter((p, index) => ranked.findIndex((x) => x.brand === p.brand) === index);
  const otherBrands = [...varied, ...ranked.filter((p) => !varied.includes(p))].slice(0, NEIGHBOURS);

  return { sameBrand, otherBrands };
}
