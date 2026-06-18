/**
 * Catalogue de démo pour Phase 3.
 * Phase 5 : remplacé par la collection Payload `Products` + import du CSV Wix (61 produits).
 */

import type { ProductCardData } from "@/components/product/ProductCard";

/**
 * Taxonomie filtres boutique (Hotfix V1.3 §P3+P4) :
 *
 * Type (5 valeurs, ce qu'EST le poêle) :
 * - standard : poêle classique chauffant la pièce, sans canal ni hydro
 * - canalisable : diffusion vers plusieurs pièces via gaines
 * - hydro : connecté au circuit chauffage central (radiateurs/plancher)
 * - hybride : fonctionnement bois + pellets (ex Dielle Ghibli Hybrid Idro)
 * - insert : à encastrer dans une cheminée existante
 *
 * Diffusion (2 valeurs, COMMENT la chaleur sort) :
 * - ventilation-forcee : avec ventilateur, diffusion rapide
 * - convection-naturelle : sans ventilateur, chaleur douce silencieuse
 *
 * Couleur (3 catégories simples et inclusives) :
 * - light : tons clairs (blanc, crème, ivoire, beige clair, gris clair)
 * - dark : tons foncés (noir, gris anthracite, bordeaux, brun foncé)
 * - natural : tons naturels (acier brossé, fonte, terracotta, bois/pierre)
 */
export type ProductType = "standard" | "canalisable" | "hydro" | "hybride" | "insert";

export type Diffusion = "ventilation-forcee" | "convection-naturelle";

export type ColorCategory = "light" | "dark" | "natural";

/**
 * Combustible (V1.4) — axe de filtre dédié, séparé du mode de chauffage.
 * Un modèle « hybride » brûle bois ET pellets (souvent au choix via variante).
 */
export type Combustible = "pellet" | "bois" | "hybride";

/**
 * Mode de chauffage (V1.4) — air (ventilé) vs hydro (raccordé à l'eau / thermo).
 * Dérivé du booléen `isHydro` du produit. Remplace, avec `Combustible`,
 * l'ancien filtre « Type » qui mélangeait les deux notions.
 */
export type Chauffage = "ventile" | "hydro";

export interface ProductDemo extends ProductCardData {
  /** Type de poêle (5 valeurs taxonomie V1.3) */
  type: ProductType;
  /** Combustible (pellet/bois/hybride) — filtre boutique V1.4. */
  combustible?: Combustible;
  /** Raccordé à l'eau (thermo). Pilote le filtre « Chauffage » ventilé/hydro. */
  isHydro?: boolean;
  isAirtight: boolean;
  isConnected: boolean;
  /** Mode de diffusion de la chaleur (2 valeurs) */
  diffusion: Diffusion;
  /** Catégorie de couleur regroupée (3 valeurs) */
  color: ColorCategory;
  /** Puissance en kW (numérique, dérivable de power mais on stocke pour filtrage rapide) */
  powerKw: number;
  /**
   * Description courte saisie dans l'admin Payload (max 200 chars).
   * Affichée en haut de la page produit en remplacement du texte marketing
   * générique quand elle est définie. Optionnelle.
   */
  shortDescription?: string;
  /**
   * Points forts (jusqu'à 6) saisis dans l'admin Payload. Chaque point fort
   * a un titre court et une description. Affichés en grille 2 colonnes sur
   * la page produit pour mettre en valeur les bénéfices clés.
   */
  features?: Array<{ title: string; description: string }>;
  /**
   * Images additionnelles de la galerie (jusqu'à 8 dans Payload).
   * Affichées en thumbnails sous l'image principale sur la page produit.
   */
  galleryImages?: Array<{ url: string; alt?: string; focalX?: number; focalY?: number }>;
  /** Point focal de l'image principale (0-100 %), si défini dans l'admin Media. */
  imageFocalX?: number;
  imageFocalY?: number;
  /**
   * URL de la fiche technique PDF, si attachée au produit dans Payload.
   * Affichée comme lien de téléchargement sur la page produit.
   */
  technicalSheetUrl?: string;
  /**
   * Nom du fichier PDF (pour l'affichage du lien).
   */
  technicalSheetFilename?: string;
  /**
   * Déclinaisons de couleur disponibles. Chaque variante a son propre code
   * EAN (gtin) et peut surcharger la photo principale + galerie.
   * Le prix et les options techniques restent identiques entre variantes.
   */
  colorVariants?: ProductColorVariant[];
  /** Référence interne du produit (utilisée par le feed Google Merchant). */
  sku?: string;
  /** Code EAN au niveau produit — feed Merchant des produits sans variantes. */
  gtin?: string;
  /** Référence fabricant au niveau produit — feed Merchant. */
  mpn?: string;
  /** Catégorie Google Merchant (taxonomie officielle). */
  googleProductCategory?: string;
  /** Statut de stock au niveau produit (feed Merchant + page produit). */
  stockStatus?: VariantStockStatus;
  /**
   * Système de variantes générique multi-axes (matériau, sortie des fumées…).
   * Indépendant de colorVariants. Activé via la case « Ce produit a des
   * variantes » dans l'admin Payload.
   */
  hasVariants?: boolean;
  /** Axes de variation configurés pour ce produit. */
  variantOptions?: VariantOptionAxis[];
  /** Combinaisons réelles disponibles (un prix/SKU/stock par variante). */
  variants?: ProductVariantData[];
}

/** Variante de couleur d'un produit (cf. colorVariants ci-dessus). */
export interface ProductColorVariant {
  colorName: string;
  colorHex?: string;
  gtin?: string;
  /** Override de la photo principale, sinon on utilise celle du produit. */
  mainImage?: { url: string; alt?: string; focalX?: number; focalY?: number };
  /** Override de la galerie, sinon on utilise celle du produit. */
  galleryImages?: Array<{ url: string; alt?: string; focalX?: number; focalY?: number }>;
}

// =====================================================================
// SYSTÈME DE VARIANTES GÉNÉRIQUE (multi-axes)
// =====================================================================

export type VariantDisplayMode = "text" | "color" | "icon";

export type VariantStockStatus = "in_stock" | "on_order" | "out_of_stock" | "discontinued";

/** Une valeur possible d'un axe (ex: « Noir », « Acier », « 9 kW »). */
export interface VariantOptionValueData {
  id: number;
  label: string;
  slug: string;
  /** Code hex — utilisé si l'axe est en mode « color ». */
  colorHex?: string;
  /** URL de l'icône SVG — utilisée si l'axe est en mode « icon ». */
  iconUrl?: string;
}

/** Un axe de variation (ex: « Couleur ») et ses valeurs disponibles. */
export interface VariantOptionAxis {
  optionTypeId: number;
  label: string;
  slug: string;
  displayMode: VariantDisplayMode;
  sortOrder: number;
  values: VariantOptionValueData[];
}

/** Une combinaison réelle disponible à l'achat. */
export interface ProductVariantData {
  id: string;
  /** IDs des valeurs d'option qui composent cette combinaison. */
  optionValueIds: number[];
  sku?: string;
  gtin?: string;
  mpn?: string;
  /** Prix TTC de la variante. */
  price: number;
  /** Prix promo TTC, si défini. */
  salePrice?: number;
  stockStatus?: VariantStockStatus;
  leadTimeDays?: number;
  /** Image propre à la variante, si renseignée. */
  image?: { url: string; alt?: string };
}

export const PRODUCTS_DEMO: ProductDemo[] = [
  {
    slug: "edilkamin-blade-9kw",
    name: "Edilkamin Blade Plus 9 kW",
    brand: "Edilkamin",
    power: "9 kW",
    surface: "70-130 m²",
    priceTTC: 4290,
    isBestseller: true,
    type: "standard",
    isAirtight: true,
    isConnected: false,
    diffusion: "ventilation-forcee",
    color: "dark", // noir
    powerKw: 9,
  },
  {
    slug: "edilkamin-lena-11kw",
    name: "Edilkamin Lena 11 kW",
    brand: "Edilkamin",
    power: "11 kW",
    surface: "90-160 m²",
    priceTTC: 5490,
    type: "standard",
    isAirtight: true,
    isConnected: true,
    diffusion: "convection-naturelle",
    color: "light", // crème
    powerKw: 11,
  },
  {
    slug: "edilkamin-mood-plus-11kw",
    name: "Edilkamin Mood Plus Canalisable",
    brand: "Edilkamin",
    power: "11 kW",
    surface: "100-180 m²",
    priceTTC: 5990,
    type: "canalisable",
    isAirtight: true,
    isConnected: true,
    diffusion: "ventilation-forcee",
    color: "dark", // noir
    powerKw: 11,
  },
  {
    slug: "ek63-tweed-90",
    name: "EK63 Tweed 90+ Canalisable",
    brand: "EK63",
    power: "9 kW",
    surface: "80-140 m²",
    priceTTC: 2890,
    isBestseller: true,
    type: "canalisable",
    isAirtight: true,
    isConnected: true,
    diffusion: "ventilation-forcee",
    color: "dark", // gris anthracite
    powerKw: 9,
  },
  {
    slug: "ek63-like-80",
    name: "EK63 Like 80",
    brand: "EK63",
    power: "8 kW",
    surface: "60-100 m²",
    priceTTC: 1990,
    type: "standard",
    isAirtight: true,
    isConnected: true,
    diffusion: "ventilation-forcee",
    color: "light", // blanc
    powerKw: 8,
  },
  {
    slug: "ek63-spy-110",
    name: "EK63 Spy 110+ Canalisable",
    brand: "EK63",
    power: "11 kW",
    surface: "100-160 m²",
    priceTTC: 3290,
    isNew: true,
    type: "canalisable",
    isAirtight: true,
    isConnected: true,
    diffusion: "ventilation-forcee",
    color: "dark", // noir
    powerKw: 11,
  },
  {
    slug: "dielle-iride-22",
    name: "Dielle Iride 22 Hydro",
    brand: "Dielle",
    power: "22 kW",
    surface: "180-300 m²",
    priceTTC: 7290,
    type: "hydro",
    isAirtight: false,
    isConnected: false,
    diffusion: "convection-naturelle",
    color: "natural", // acier brossé
    powerKw: 22,
  },
  {
    slug: "dielle-iride-30",
    name: "Dielle Iride 30 Hydro",
    brand: "Dielle",
    power: "30 kW",
    surface: "250-400 m²",
    priceTTC: 8990,
    type: "hydro",
    isAirtight: false,
    isConnected: false,
    diffusion: "convection-naturelle",
    color: "natural", // acier brossé
    powerKw: 30,
  },
  {
    slug: "ferlux-pyl-7",
    name: "Ferlux Pyl-7",
    brand: "Ferlux",
    power: "7 kW",
    surface: "50-90 m²",
    priceTTC: 1690,
    type: "standard",
    isAirtight: false,
    isConnected: false,
    diffusion: "ventilation-forcee",
    color: "dark", // bordeaux
    powerKw: 7,
  },
  {
    slug: "ferlux-pyl-10",
    name: "Ferlux Pyl-10",
    brand: "Ferlux",
    power: "10 kW",
    surface: "80-130 m²",
    priceTTC: 1990,
    type: "standard",
    isAirtight: false,
    isConnected: false,
    diffusion: "ventilation-forcee",
    color: "natural", // fonte
    powerKw: 10,
  },
];

// =====================================================================
// FILTRES BOUTIQUE V1.3 (cf. doc V1.3 §P3+P4)
// =====================================================================

export const TYPE_LABELS: Record<ProductType, string> = {
  standard:    "Standard",
  canalisable: "Canalisable",
  hydro:       "Hydro",
  hybride:     "Hybride bois + pellets",
  insert:      "Insert encastrable",
};

/** Filtre « Combustible » (V1.4) — remplace une partie de l'ancien « Type ». */
export const COMBUSTIBLE_LABELS: Record<Combustible, string> = {
  pellet:  "Pellets",
  bois:    "Bois",
  hybride: "Hybride bois + pellets",
};

/** Filtre « Chauffage » (V1.4) — air ventilé vs raccordé à l'eau (thermo). */
export const CHAUFFAGE_LABELS: Record<Chauffage, string> = {
  ventile: "Air (ventilé)",
  hydro:   "Hydro (thermo)",
};

export const DIFFUSION_LABELS: Record<Diffusion, string> = {
  "ventilation-forcee":   "Ventilation forcée",
  "convection-naturelle": "Convection naturelle (silencieux)",
};

export const COLOR_LABELS: Record<ColorCategory, string> = {
  light:   "Tons clairs",
  dark:    "Tons foncés",
  natural: "Tons naturels",
};

export const POWER_TRANCHES = [
  { value: "6-9",   label: "6 à 9 kW",   min: 6,  max: 9,  desc: "Compacts, petites pièces" },
  { value: "9-12",  label: "9 à 12 kW",  min: 9,  max: 12, desc: "Standards, surfaces moyennes" },
  { value: "12-18", label: "12 à 18 kW", min: 12, max: 18, desc: "Puissants, grandes surfaces" },
  { value: "18+",   label: "18 kW et +", min: 18, max: 999, desc: "Hydros et installations spécifiques" },
] as const;

export function powerToTranche(powerKw: number): string | null {
  for (const t of POWER_TRANCHES) {
    if (powerKw >= t.min && powerKw < t.max) return t.value;
  }
  return null;
}

export function getProductBySlug(slug: string): ProductDemo | undefined {
  return PRODUCTS_DEMO.find((p) => p.slug === slug);
}
