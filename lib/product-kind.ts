import type { Appliance, Combustible, ProductType } from "./products-demo";

/**
 * Nature d'une fiche produit (poêle, insert, foyer ou chaudière, combustible,
 * hydro), tirée des champs saisis dans l'admin Payload. Source unique du
 * libellé repris par le titre et le schéma Product de la fiche
 * (app/(frontend)/produit/[slug]) et par le flux Google Merchant
 * (app/api/feed/google-merchant).
 *
 * Mister Pellets ne vend pas d'appareil à bois bûche (lib/catalog-scope.ts) :
 * aucun libellé « à bois » n'existe ici. Une fiche bois n'atteint jamais ces
 * fonctions ; si cela arrivait, le libellé se réduit au nom de l'appareil
 * (« insert », « foyer »), sans combustible.
 *
 * L'appareil vient de la case « Nature de l'appareil » ; vide, il se déduit du
 * type (« Insert encastrable » donne un insert, le reste un poêle). Pour le
 * combustible et l'hydro, même règle que les pastilles des cartes
 * (components/product/ProductFeatureBadges.tsx) : le champ `combustible`
 * (source du filtre boutique) d'abord, le type en filet quand les deux
 * divergent.
 */
export interface ProductKindFields {
  type: ProductType;
  combustible?: Combustible;
  /** Raccordé au chauffage central (case « Hydro » de l'admin). */
  isHydro?: boolean;
  /** Case « Nature de l'appareil » de l'admin, quand le type ne suffit pas. */
  appliance?: Appliance;
}

const HYBRID_TYPES: ReadonlySet<ProductType> = new Set(["hybride", "hybride-hydro"]);
const HYDRO_TYPES: ReadonlySet<ProductType> = new Set(["hydro", "hybride-hydro"]);

const APPLIANCE_LABEL: Record<Appliance, string> = {
  poele: "poêle",
  insert: "insert",
  foyer: "foyer",
  chaudiere: "chaudière",
};

const FUEL_LABEL: Record<Exclude<Combustible, "bois">, string> = {
  pellet: "à pellets",
  hybride: "hybride bois/pellets",
};

/** Appareil de la fiche : celui choisi dans l'admin, sinon déduit du type. */
export function productAppliance(p: ProductKindFields): Appliance {
  return p.appliance ?? (p.type === "insert" ? "insert" : "poele");
}

/** Combustible de la fiche ; sans combustible saisi, c'est du pellet. */
export function productFuel(p: ProductKindFields): Combustible {
  if (p.combustible === "hybride" || HYBRID_TYPES.has(p.type)) return "hybride";
  return p.combustible ?? "pellet";
}

/**
 * « poêle à pellets », « insert à pellets », « insert hybride bois/pellets
 * hydro »… En minuscules : la majuscule se met là où le libellé ouvre une
 * phrase.
 */
export function productKindLabel(p: ProductKindFields): string {
  const appliance = productAppliance(p);
  // Une chaudière chauffe l'eau par définition : « hydro » n'y ajoute rien.
  const hydro =
    appliance !== "chaudiere" && (p.isHydro || HYDRO_TYPES.has(p.type)) ? " hydro" : "";
  const fuel = productFuel(p);
  const fuelLabel = fuel === "bois" ? "" : ` ${FUEL_LABEL[fuel]}`;
  return `${APPLIANCE_LABEL[appliance]}${fuelLabel}${hydro}`;
}
