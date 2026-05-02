/**
 * Catalogue de démo pour Phase 3.
 * Phase 5 : remplacé par la collection Payload `Products` + import du CSV Wix (61 produits).
 */

import type { ProductCardData } from "@/components/product/ProductCard";

export interface ProductDemo extends ProductCardData {
  type: "air" | "canalisable" | "hydro" | "insert";
  isAirtight: boolean;
  isConnected: boolean;
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
  },
];

export function getProductBySlug(slug: string): ProductDemo | undefined {
  return PRODUCTS_DEMO.find((p) => p.slug === slug);
}
