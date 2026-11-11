import type { ProductCardData, ProductColorPreview } from "@/components/product/ProductCard";
import type { ColorCategory, Combustible, Diffusion, ProductType } from "./products-demo";
import { pickImageSrc, type ProductImage } from "./product-image";
import { formatKw } from "./power";
import { shownPriceTTC } from "./product-price";
import { formatPrice } from "./utils";

/**
 * Listes du catalogue (boutique, pages catégorie, pages marque) : ce qui part
 * dans la page pour chaque fiche.
 *
 * Mesuré sur le build du 11/11/2026 : une carte pèse 4,4 Ko de HTML, et une
 * carte rendue par le serveur 6 Ko de plus dans le flux RSC de la page, soit
 * 1,9 Mo pour les 175 poêles étanches. Une liste ne porte donc que
 * `LISTING_PAGE_SIZE` cartes ; chaque autre fiche est une ligne de texte, un
 * vrai lien de 120 à 200 octets. Les deux sont rendues par un composant
 * client (components/product/ProductListing.tsx) à partir des entrées
 * ci-dessous : dans le flux, une entrée coûte bien moins que l'arbre de la
 * carte. `scripts/check-catalogue.ts` mesure ces poids et refuse une rechute.
 *
 * Module sans dépendance au navigateur : importé par le serveur, le client et
 * le contrôle.
 */

/** Cartes complètes d'une liste, puis par clic sur « Voir plus ». */
export const LISTING_PAGE_SIZE = 24;

/** Fiche d'une liste : la carte, et ce que lisent les filtres et le tri de la boutique. */
export interface ListedProduct extends ProductCardData {
  type: ProductType;
  combustible?: Combustible;
  /** Raccordé à l'eau (thermo) : filtre « Chauffage ». */
  isHydro?: boolean;
  powerKw: number;
  diffusion: Diffusion;
  color?: ColorCategory;
  /** Case « Mis en avant » de l'admin : pèse dans le tri par défaut. */
  isFeatured?: boolean;
  /** Rang d'ajout, 0 pour la fiche la plus récente : tri « Derniers ajouts ». */
  recency?: number;
}

/**
 * Une fiche telle qu'elle voyage dans la page : clés courtes, valeurs par
 * défaut omises, aucun champ vide (chaque `undefined` coûte une entrée dans le
 * flux). `encodeEntry` l'écrit côté serveur, `decodeEntry` la relit.
 *
 * Deux tailles. Complète, pour les fiches du premier écran : la carte obtenue
 * est celle que rendait le serveur, photo en `srcset`, texte alternatif et nom
 * des couleurs compris. Courte, pour toutes les autres : une seule adresse de
 * photo, celle que la carte complète met dans `src`, et les teintes sans leur
 * nom. La carte courte ne se voit qu'après « Voir plus », un filtre ou un tri.
 */
export interface CatalogueEntry {
  /** Slug. */
  s: string;
  /** Nom affiché. */
  n: string;
  /** Marque. */
  b: string;
  /** Puissance en kW. */
  k: number;
  /** Libellé de puissance, seulement s'il ne se déduit pas de `k`. */
  pw?: string;
  /** Puissances d'une fiche regroupée. */
  ks?: number[];
  /** Volume chauffé (« 223 m³ »). */
  v?: string;
  /** Volumes d'une fiche regroupée. */
  vs?: number[];
  /** Prix catalogue TVAC. */
  p?: number;
  /** Prix promo TVAC. */
  pp?: number;
  /** Prix après bonus de saison TVAC. */
  pb?: number;
  /** Photo, une seule adresse. */
  i?: string;
  /** Photo et ses déclinaisons (entrée complète). */
  im?: ProductImage;
  /** Texte alternatif, s'il diffère du nom (entrée complète). */
  a?: string;
  /** Point focal de la photo, s'il n'est pas au centre. */
  fx?: number;
  fy?: number;
  /** Couleurs avec leur nom (entrée complète). */
  cv?: ProductColorPreview[];
  /** Teintes seules (entrée courte). */
  sw?: string[];
  /** Type, s'il n'est pas « standard ». */
  t?: ProductType;
  /** Combustible, s'il n'est pas « pellet ». */
  f?: Combustible;
  /** Drapeaux, une lettre chacun : voir FLAGS. */
  x?: string;
  /** Famille de couleur (filtre de la boutique). */
  col?: ColorCategory;
  /** Rang d'ajout (tri de la boutique). */
  r?: number;
}

/** Lettre de chaque drapeau de `CatalogueEntry.x`. */
const FLAGS = {
  hydro: "h",
  canalizable: "c",
  airtight: "e",
  bestseller: "b",
  isNew: "n",
  featured: "m",
  /** Convection naturelle ; sans la lettre, ventilation forcée. */
  convection: "s",
} as const;

export interface EncodeOptions {
  /** Entrée complète : à réserver aux `LISTING_PAGE_SIZE` premières fiches. */
  full?: boolean;
  /** Champs des filtres et du tri de la boutique (diffusion, couleur, rang, mise en avant). */
  shop?: boolean;
}

const powerFromKw = (kw: number): string => `${formatKw(kw)} kW`;

export function encodeEntry(p: ListedProduct, { full = false, shop = false }: EncodeOptions = {}): CatalogueEntry {
  const e: CatalogueEntry = { s: p.slug, n: p.name, b: p.brand, k: p.powerKw };
  // Une fiche sans libellé de puissance n'en reçoit pas un au décodage.
  if (p.power !== powerFromKw(p.powerKw)) e.pw = p.power ?? "";
  if (p.powers && p.powers.length > 0) e.ks = p.powers;
  if (p.heatedVolume) e.v = p.heatedVolume;
  if (p.heatedVolumes && p.heatedVolumes.length > 0) e.vs = p.heatedVolumes;
  if (p.priceTTC != null) e.p = p.priceTTC;
  if (p.promoPriceTTC != null) e.pp = p.promoPriceTTC;
  if (p.bonusPriceTTC != null) e.pb = p.bonusPriceTTC;

  if (p.image && full) {
    const im: ProductImage = { url: p.image.url };
    if (p.image.width != null) im.width = p.image.width;
    if (p.image.sizes) im.sizes = p.image.sizes;
    e.im = im;
  } else if (p.image) {
    e.i = pickImageSrc(p.image, 800);
  } else if (p.imageSrc) {
    e.i = p.imageSrc;
  }
  if (full && p.imageAlt && p.imageAlt !== p.name) e.a = p.imageAlt;
  if (p.imageFocalX != null && p.imageFocalX !== 50) e.fx = p.imageFocalX;
  if (p.imageFocalY != null && p.imageFocalY !== 50) e.fy = p.imageFocalY;

  const colours = (p.colorVariants ?? []).filter((c) => c.colorHex);
  if (colours.length > 0 && full) e.cv = colours.map((c) => ({ colorName: c.colorName, colorHex: c.colorHex }));
  else if (colours.length > 0) e.sw = [...new Set(colours.map((c) => c.colorHex as string))];

  if (p.type !== "standard") e.t = p.type;
  if (p.combustible && p.combustible !== "pellet") e.f = p.combustible;

  const flags = [
    p.isHydro && FLAGS.hydro,
    p.isCanalizable && FLAGS.canalizable,
    p.isAirtight && FLAGS.airtight,
    p.isBestseller && FLAGS.bestseller,
    p.isNew && FLAGS.isNew,
    shop && p.isFeatured && FLAGS.featured,
    shop && p.diffusion === "convection-naturelle" && FLAGS.convection,
  ]
    .filter(Boolean)
    .join("");
  if (flags) e.x = flags;

  if (shop && p.color) e.col = p.color;
  if (shop && p.recency != null) e.r = p.recency;
  return e;
}

export function decodeEntry(e: CatalogueEntry): ListedProduct {
  const has = (flag: string): boolean => e.x?.includes(flag) ?? false;
  const p: ListedProduct = {
    slug: e.s,
    name: e.n,
    brand: e.b,
    powerKw: e.k,
    power: e.pw ?? powerFromKw(e.k),
    type: e.t ?? "standard",
    combustible: e.f ?? "pellet",
    diffusion: has(FLAGS.convection) ? "convection-naturelle" : "ventilation-forcee",
    isHydro: has(FLAGS.hydro),
    isCanalizable: has(FLAGS.canalizable),
    isAirtight: has(FLAGS.airtight),
    isBestseller: has(FLAGS.bestseller),
    isNew: has(FLAGS.isNew),
    isFeatured: has(FLAGS.featured),
  };
  if (e.ks) p.powers = e.ks;
  if (e.v) p.heatedVolume = e.v;
  if (e.vs) p.heatedVolumes = e.vs;
  if (e.p != null) p.priceTTC = e.p;
  if (e.pp != null) p.promoPriceTTC = e.pp;
  if (e.pb != null) p.bonusPriceTTC = e.pb;
  if (e.im) p.image = e.im;
  if (e.i) p.imageSrc = e.i;
  if (e.a) p.imageAlt = e.a;
  if (e.fx != null) p.imageFocalX = e.fx;
  if (e.fy != null) p.imageFocalY = e.fy;
  if (e.cv) p.colorVariants = e.cv;
  else if (e.sw) p.colorVariants = e.sw.map((colorHex) => ({ colorHex }));
  if (e.col) p.color = e.col;
  if (e.r != null) p.recency = e.r;
  return p;
}

/**
 * Ordre d'une liste de marque ou de catégorie : best-sellers, fiches mises
 * en avant, fiches avec photo, puis ordre alphabétique (« Rise 7 » avant
 * « Rise 11 »).
 */
export function sortForGrid<T extends ProductCardData & { isFeatured?: boolean }>(products: readonly T[]): T[] {
  const score = (p: T) => (p.isBestseller ? 4 : 0) + (p.isFeatured ? 2 : 0) + (p.image?.url || p.imageSrc ? 1 : 0);
  return [...products].sort(
    (a, b) => score(b) - score(a) || a.name.localeCompare(b.name, "fr", { numeric: true, sensitivity: "base" }),
  );
}

/** Entrées d'une liste déjà triée : complètes pour les fiches montrées en cartes d'emblée. */
export function encodeListing(products: readonly ListedProduct[], options: Pick<EncodeOptions, "shop"> = {}): CatalogueEntry[] {
  return products.map((p, i) => encodeEntry(p, { ...options, full: i < LISTING_PAGE_SIZE }));
}

/**
 * Textes d'une ligne compacte : le nom avec sa marque, la puissance, le prix
 * TVAC affiché sur la carte ou « Sur devis ».
 */
export function lineParts(p: ProductCardData): { name: string; power: string | undefined; price: string } {
  const name = p.name.toLowerCase().startsWith(p.brand.toLowerCase()) ? p.name : `${p.brand} ${p.name}`;
  const power = p.powers && p.powers.length > 1 ? `${p.powers.map(formatKw).join(" · ")} kW` : p.power;
  const shown = shownPriceTTC(p);
  return {
    name,
    power: power || undefined,
    price: shown ? `${formatPrice(shown)} TVAC` : "Sur devis",
  };
}
