import type { Combustible, ProductType } from "./products-demo";

/**
 * Nature d'une fiche produit (poêle ou insert, combustible, hydro), tirée des
 * champs saisis dans l'admin Payload. Source unique du libellé repris par le
 * titre et le schéma Product de la fiche (app/(frontend)/produit/[slug]) et
 * par le flux Google Merchant (app/api/feed/google-merchant) : un insert à
 * bois ne doit plus sortir en « poêle à pellets ».
 *
 * Même règle que les pastilles des cartes (components/product/ProductFeatureBadges.tsx) :
 * le combustible vient du champ `combustible` (source du filtre boutique), le
 * type sert de filet quand les deux divergent.
 */
export interface ProductKindFields {
  type: ProductType;
  combustible?: Combustible;
  /** Raccordé au chauffage central (case « Hydro » de l'admin). */
  isHydro?: boolean;
}

const HYBRID_TYPES: ReadonlySet<ProductType> = new Set(["hybride", "hybride-hydro"]);
const HYDRO_TYPES: ReadonlySet<ProductType> = new Set(["hydro", "hybride-hydro"]);

const FUEL_LABEL: Record<Combustible, string> = {
  pellet: "à pellets",
  bois: "à bois",
  hybride: "hybride bois/pellets",
};

/** Combustible de la fiche ; sans combustible saisi, c'est du pellet. */
export function productFuel(p: ProductKindFields): Combustible {
  if (p.combustible === "hybride" || HYBRID_TYPES.has(p.type)) return "hybride";
  return p.combustible ?? "pellet";
}

/**
 * « poêle à pellets », « insert à bois », « poêle hybride bois/pellets hydro »…
 * En minuscules : la majuscule se met là où le libellé ouvre une phrase.
 */
export function productKindLabel(p: ProductKindFields): string {
  const form = p.type === "insert" ? "insert" : "poêle";
  const hydro = p.isHydro || HYDRO_TYPES.has(p.type) ? " hydro" : "";
  return `${form} ${FUEL_LABEL[productFuel(p)]}${hydro}`;
}
