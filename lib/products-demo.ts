/**
 * Catalogue de démo pour Phase 3.
 * Phase 5 : remplacé par la collection Payload `Products` + import du CSV Wix (61 produits).
 */

import type { ProductCardData } from "@/components/product/ProductCard";

/**
 * Type de diffusion de chaleur (cf. doc corrections-mobile-v1 §2.3 b) :
 * - ventilation-forcee : poêle avec ventilateur (diffusion rapide et puissante)
 * - canalisable : diffusion vers plusieurs pièces via gaines
 * - convection-naturelle : sans ventilateur, chaleur douce et silencieuse
 * - hydro : raccordé aux radiateurs (chauffage central)
 */
export type Diffusion =
  | "ventilation-forcee"
  | "canalisable"
  | "convection-naturelle"
  | "hydro";

export type Color =
  | "noir"
  | "blanc"
  | "creme"
  | "bordeaux"
  | "gris-anthracite"
  | "beige"
  | "acier"
  | "fonte";

export interface ProductDemo extends ProductCardData {
  type: "air" | "canalisable" | "hydro" | "insert";
  isAirtight: boolean;
  isConnected: boolean;
  /** Type de diffusion de chaleur (cf. lib §filtre boutique) */
  diffusion: Diffusion;
  /** Couleur principale visible */
  color: Color;
  /** Puissance en kW (numérique, dérivable de power mais on stocke pour filtrage rapide) */
  powerKw: number;
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
    type: "air",
    isAirtight: true,
    isConnected: false,
    diffusion: "ventilation-forcee",
    color: "noir",
    powerKw: 9,
  },
  {
    slug: "edilkamin-lena-11kw",
    name: "Edilkamin Lena 11 kW",
    brand: "Edilkamin",
    power: "11 kW",
    surface: "90-160 m²",
    priceTTC: 5490,
    type: "air",
    isAirtight: true,
    isConnected: true,
    diffusion: "convection-naturelle",
    color: "creme",
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
    diffusion: "canalisable",
    color: "noir",
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
    diffusion: "canalisable",
    color: "gris-anthracite",
    powerKw: 9,
  },
  {
    slug: "ek63-like-80",
    name: "EK63 Like 80",
    brand: "EK63",
    power: "8 kW",
    surface: "60-100 m²",
    priceTTC: 1990,
    type: "air",
    isAirtight: true,
    isConnected: true,
    diffusion: "ventilation-forcee",
    color: "blanc",
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
    diffusion: "canalisable",
    color: "noir",
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
    diffusion: "hydro",
    color: "acier",
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
    diffusion: "hydro",
    color: "acier",
    powerKw: 30,
  },
  {
    slug: "ferlux-pyl-7",
    name: "Ferlux Pyl-7",
    brand: "Ferlux",
    power: "7 kW",
    surface: "50-90 m²",
    priceTTC: 1690,
    type: "air",
    isAirtight: false,
    isConnected: false,
    diffusion: "ventilation-forcee",
    color: "bordeaux",
    powerKw: 7,
  },
  {
    slug: "ferlux-pyl-10",
    name: "Ferlux Pyl-10",
    brand: "Ferlux",
    power: "10 kW",
    surface: "80-130 m²",
    priceTTC: 1990,
    type: "air",
    isAirtight: false,
    isConnected: false,
    diffusion: "ventilation-forcee",
    color: "fonte",
    powerKw: 10,
  },
];

// =====================================================================
// FILTRES BOUTIQUE, labels et helpers (cf. doc corrections-mobile-v1 §2.3)
// =====================================================================

export const POWER_TRANCHES = [
  { value: "6-9",   label: "6 à 9 kW",   min: 6,  max: 9,  desc: "Compacts, petites pièces" },
  { value: "9-12",  label: "9 à 12 kW",  min: 9,  max: 12, desc: "Standards, surfaces moyennes" },
  { value: "12-18", label: "12 à 18 kW", min: 12, max: 18, desc: "Puissants, grandes surfaces" },
  { value: "18+",   label: "18 kW et +", min: 18, max: 999, desc: "Hydros et installations spécifiques" },
] as const;

export const DIFFUSION_LABELS: Record<Diffusion, string> = {
  "ventilation-forcee":   "Ventilation forcée",
  "canalisable":          "Canalisable",
  "convection-naturelle": "Convection naturelle",
  "hydro":                "Hydro (radiateurs)",
};

export const COLOR_LABELS: Record<Color, string> = {
  "noir":            "Noir",
  "blanc":           "Blanc",
  "creme":           "Crème / ivoire",
  "bordeaux":        "Bordeaux / rouge",
  "gris-anthracite": "Gris anthracite",
  "beige":           "Beige / sable",
  "acier":           "Acier / inox",
  "fonte":           "Fonte (texture)",
};

export function powerToTranche(powerKw: number): string | null {
  for (const t of POWER_TRANCHES) {
    if (powerKw >= t.min && powerKw < t.max) return t.value;
  }
  return null;
}

export function getProductBySlug(slug: string): ProductDemo | undefined {
  return PRODUCTS_DEMO.find((p) => p.slug === slug);
}
