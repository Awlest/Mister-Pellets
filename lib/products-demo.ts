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

export interface ProductDemo extends ProductCardData {
  /** Type de poêle (5 valeurs taxonomie V1.3) */
  type: ProductType;
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
