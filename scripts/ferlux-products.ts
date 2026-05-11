/**
 * Catalogue Ferlux — extraction depuis :
 *   - "05 Ferlux 2025 - 06 PRICELIST.pdf" (price list officielle 06/2025
 *     distribuée par LECOQ S.A., 4950 Faymonville Belgique)
 *   - "05 FERLUX Catalogo Pellet ok.pdf" (catalogue technique général 2024)
 *
 * 25 produits pellet sélectionnés couvrant toute la gamme Ferlux distribuée
 * en Belgique :
 *   - 4 monoblock 6 kW (Milena, Perla, Odin, Venus)
 *   - 8 polyvalents (versions 8 kW prises par défaut, 6/10 kW dispos en option)
 *   - 4 grande puissance 10/12 kW
 *   - 4 canalisables (Osiris, Lyra, Ikaro, Phoenix)
 *   - 5 hydro (Selena, Iris, F, Silo, Hidromatic)
 *
 * Note : Ferlux a une logique modulaire — chaque modèle est dispo en plusieurs
 * puissances. La fiche produit présente la puissance la plus représentative
 * (typiquement 8 ou 10 kW) avec mention des autres puissances disponibles
 * dans la description et les features.
 *
 * Prix HT issus de la price list 06/2025. TTC calculé à TVA 21%.
 */

import type { SeedProduct, SeedColorVariant, SeedFeature } from "./ek63-products";

const COLORS_FERLUX_ACIER: SeedColorVariant[] = [
  { colorName: "Acier noir", colorHex: "#1A1A1A" },
  { colorName: "Acier blanc", colorHex: "#F5F5F0" },
  { colorName: "Acier bordeaux", colorHex: "#722F37" },
];

const COLORS_FERLUX_DUO: SeedColorVariant[] = [
  { colorName: "Acier", colorHex: "#1A1A1A" },
  { colorName: "Pierre naturelle", colorHex: "#C8B89A" },
];

const COLORS_FERLUX_GLASS: SeedColorVariant[] = [
  { colorName: "Verre noir", colorHex: "#0A0A0A" },
  { colorName: "Verre blanc", colorHex: "#FFFFFF" },
  { colorName: "Acier", colorHex: "#1A1A1A" },
];

const COLORS_HYDRO: SeedColorVariant[] = [
  { colorName: "Acier noir", colorHex: "#1A1A1A" },
  { colorName: "Acier blanc", colorHex: "#F5F5F0" },
];

/* -----------------------------------------------------------------------------
   Features Ferlux mutualisés
   ----------------------------------------------------------------------------- */

const FEATURE_QUALITY_SPAIN: SeedFeature = {
  title: "Conception espagnole Ferlux",
  description:
    "Fabrication espagnole, savoir-faire historique. Distribution officielle en Belgique par LECOQ S.A.",
};

const FEATURE_VERMICULITE: SeedFeature = {
  title: "Foyer en vermiculite",
  description:
    "Restitution optimale de la chaleur et durabilité éprouvée du foyer haute température.",
};

const FEATURE_PROGRAM: SeedFeature = {
  title: "Programmation hebdomadaire",
  description:
    "Programmation horaire et hebdomadaire, fonction Easy Timer, télécommande sans fil incluse.",
};

const FEATURE_MULTI_POWER: SeedFeature = {
  title: "Plusieurs puissances disponibles",
  description:
    "Modèle décliné en 6, 8 ou 10 kW selon la surface à chauffer. À choisir au moment du devis.",
};

const FEATURE_CANALIZABLE: SeedFeature = {
  title: "Canalisable air chaud",
  description:
    "Sortie d'air chaud canalisable vers une autre pièce via gaines isolées (kit en option).",
};

const FEATURE_HYDRO: SeedFeature = {
  title: "Raccordement chauffage central",
  description:
    "Connecté au circuit radiateurs ou plancher chauffant. Idéal pour remplacer une chaudière au mazout ou au gaz.",
};

const FEATURE_HYDROMATIC: SeedFeature = {
  title: "Système Hidromatic",
  description:
    "Régulation hydraulique automatique avec gestion intelligente du circuit. Adaptable au ballon tampon ou ECS.",
};

/* -----------------------------------------------------------------------------
   Catalogue produits Ferlux 2025
   ----------------------------------------------------------------------------- */

export const FERLUX_PRODUCTS: SeedProduct[] = [
  // ============================================================================
  // POÊLES MONOBLOCK 6 kW (entrée de gamme)
  // ============================================================================
  {
    sku: "FRX_MILENA",
    slug: "ferlux-milena",
    name: "Ferlux Milena",
    model: "Milena (Acier ou Pierre)",
    brand: "Ferlux",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "natural",
    power: 6.0,
    heatedVolumeM3: 150,
    efficiency: 88.0,
    isAirtight: false,
    isConnected: false,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 15,
    shortDescription:
      "Poêle 6 kW entrée de gamme Ferlux — disponible en acier ou pierre. Compact pour pièce de vie 60-100 m².",
    features: [FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_PROGRAM],
    colorVariants: COLORS_FERLUX_DUO,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "FRX_PERLA",
    slug: "ferlux-perla",
    name: "Ferlux Perla",
    model: "Perla (Acier ou Pierre)",
    brand: "Ferlux",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "natural",
    power: 6.0,
    heatedVolumeM3: 150,
    efficiency: 88.0,
    isAirtight: false,
    isConnected: false,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 16,
    shortDescription:
      "Poêle 6 kW Perla — finition haut de gamme acier ou pierre, lignes raffinées et compactes.",
    features: [FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_PROGRAM],
    colorVariants: COLORS_FERLUX_DUO,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "FRX_ODIN",
    slug: "ferlux-odin",
    name: "Ferlux Odin",
    model: "Odin (Acier ou Pierre)",
    brand: "Ferlux",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 6.0,
    heatedVolumeM3: 150,
    efficiency: 88.0,
    isAirtight: false,
    isConnected: false,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 15,
    shortDescription:
      "Poêle 6 kW Odin — design moderne acier ou pierre. Excellent rapport qualité-prix.",
    features: [FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_PROGRAM],
    colorVariants: COLORS_FERLUX_DUO,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "FRX_VENUS",
    slug: "ferlux-venus",
    name: "Ferlux Venus",
    model: "Venus (Acier ou Pierre)",
    brand: "Ferlux",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "light",
    power: 6.0,
    heatedVolumeM3: 150,
    efficiency: 88.0,
    isAirtight: false,
    isConnected: false,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 15,
    shortDescription:
      "Poêle 6 kW Venus — design élégant et compact, finition pierre naturelle ou acier.",
    features: [FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_PROGRAM],
    colorVariants: COLORS_FERLUX_DUO,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },

  // ============================================================================
  // POÊLES POLYVALENTS 6/8/10 kW (8 kW par défaut)
  // ============================================================================
  {
    sku: "FRX_ARES",
    slug: "ferlux-ares-8",
    name: "Ferlux Ares 8 kW",
    model: "Ares (6/8/10 kW)",
    brand: "Ferlux",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 8.0,
    heatedVolumeM3: 200,
    efficiency: 88.5,
    isAirtight: false,
    isConnected: false,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 20,
    shortDescription:
      "Poêle 8 kW gamme Ares — disponible aussi en 6 ou 10 kW selon surface à chauffer (60-150 m²).",
    features: [FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_MULTI_POWER, FEATURE_PROGRAM],
    colorVariants: COLORS_FERLUX_ACIER,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "FRX_SHARA",
    slug: "ferlux-shara-8",
    name: "Ferlux Shara 8 kW",
    model: "Shara (6/8/10 kW)",
    brand: "Ferlux",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 8.0,
    heatedVolumeM3: 200,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: false,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 22,
    shortDescription:
      "Poêle 8 kW gamme Shara — design moderne, dispo en 6/8/10 kW pour s'adapter à toutes les surfaces.",
    features: [FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_MULTI_POWER, FEATURE_PROGRAM],
    colorVariants: COLORS_FERLUX_ACIER,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "FRX_HELEN_ACIER",
    slug: "ferlux-helen-acier-8",
    name: "Ferlux Helen Acier 8 kW",
    model: "Helen Acier (6/8/10 kW)",
    brand: "Ferlux",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 8.0,
    heatedVolumeM3: 200,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: false,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 20,
    shortDescription:
      "Poêle 8 kW Helen finition acier. Lignes verticales élégantes, dispo en 6/8/10 kW.",
    features: [FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_MULTI_POWER, FEATURE_PROGRAM],
    colorVariants: COLORS_FERLUX_ACIER,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "FRX_HELEN_GLASS",
    slug: "ferlux-helen-glass-8",
    name: "Ferlux Helen Glass 8 kW",
    model: "Helen Glass (6/8/10 kW)",
    brand: "Ferlux",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 8.0,
    heatedVolumeM3: 200,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: false,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 20,
    shortDescription:
      "Poêle 8 kW Helen finition verre — version premium de la gamme Helen avec habillage verre.",
    features: [FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_MULTI_POWER, FEATURE_PROGRAM],
    colorVariants: COLORS_FERLUX_GLASS,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "FRX_ELISA",
    slug: "ferlux-elisa-8",
    name: "Ferlux Elisa 8 kW",
    model: "Elisa (6/8/10 kW)",
    brand: "Ferlux",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "natural",
    power: 8.0,
    heatedVolumeM3: 200,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: false,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 20,
    shortDescription:
      "Poêle 8 kW gamme Elisa — esthétique chaleureuse, finition céramique nature, dispo 6/8/10 kW.",
    features: [FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_MULTI_POWER, FEATURE_PROGRAM],
    colorVariants: COLORS_FERLUX_ACIER,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "FRX_NEREA",
    slug: "ferlux-nerea-8",
    name: "Ferlux Nerea 8 kW",
    model: "Nerea (6/8/10 kW)",
    brand: "Ferlux",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 8.0,
    heatedVolumeM3: 200,
    efficiency: 89.5,
    isAirtight: false,
    isConnected: false,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 22,
    shortDescription:
      "Poêle 8 kW gamme Nerea — segment premium, design contemporain, dispo en 6/8/10 kW.",
    features: [FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_MULTI_POWER, FEATURE_PROGRAM],
    colorVariants: COLORS_FERLUX_ACIER,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "FRX_NATALIA",
    slug: "ferlux-natalia-8",
    name: "Ferlux Natalia 8 kW",
    model: "Natalia (6/8/10 kW)",
    brand: "Ferlux",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 8.0,
    heatedVolumeM3: 200,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: false,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 20,
    shortDescription:
      "Poêle 8 kW gamme Natalia — design moderne et finition soignée. Dispo en 6/8/10 kW selon surface.",
    features: [FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_MULTI_POWER, FEATURE_PROGRAM],
    colorVariants: COLORS_FERLUX_ACIER,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "FRX_ULYSES",
    slug: "ferlux-ulyses-8",
    name: "Ferlux Ulyses 8 kW",
    model: "Ulyses (6/8/10 kW)",
    brand: "Ferlux",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 8.0,
    heatedVolumeM3: 200,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: false,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 20,
    shortDescription:
      "Poêle 8 kW gamme Ulyses — silhouette équilibrée, dispo en 6/8/10 kW pour adaptation à la surface.",
    features: [FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_MULTI_POWER, FEATURE_PROGRAM],
    colorVariants: COLORS_FERLUX_ACIER,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },

  // ============================================================================
  // POÊLES PUISSANTS (10-15 kW)
  // ============================================================================
  {
    sku: "FRX_FANNY",
    slug: "ferlux-fanny-10",
    name: "Ferlux Fanny 10 kW",
    model: "Fanny (8/10/12/15 kW)",
    brand: "Ferlux",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 10.0,
    heatedVolumeM3: 250,
    efficiency: 88.0,
    isAirtight: false,
    isConnected: false,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 25,
    shortDescription:
      "Poêle 10 kW Fanny — entrée de gamme grande puissance. Dispo en 8/10/12/15 kW pour grandes surfaces.",
    features: [FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_MULTI_POWER, FEATURE_PROGRAM],
    colorVariants: COLORS_FERLUX_ACIER,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "FRX_FLORA",
    slug: "ferlux-flora-10",
    name: "Ferlux Flora 10 kW",
    model: "Flora (8/10 kW)",
    brand: "Ferlux",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "natural",
    power: 10.0,
    heatedVolumeM3: 250,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: false,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 22,
    shortDescription:
      "Poêle 10 kW Flora — finition habillée, dispo en 8 ou 10 kW. Variante S/V (sortie verticale) sur demande.",
    features: [FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_PROGRAM],
    colorVariants: COLORS_FERLUX_ACIER,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "FRX_ESTELA",
    slug: "ferlux-estela-10",
    name: "Ferlux Estela 10 kW",
    model: "Estela (8/10 kW)",
    brand: "Ferlux",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 10.0,
    heatedVolumeM3: 250,
    efficiency: 89.5,
    isAirtight: false,
    isConnected: false,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 22,
    shortDescription:
      "Poêle 10 kW Estela — segment premium grande puissance. Dispo aussi en 8 kW.",
    features: [FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_PROGRAM],
    colorVariants: COLORS_FERLUX_ACIER,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "FRX_MAIA",
    slug: "ferlux-maia-10",
    name: "Ferlux Maia 10 kW",
    model: "Maia (8/10 kW)",
    brand: "Ferlux",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 10.0,
    heatedVolumeM3: 250,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: false,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 20,
    shortDescription:
      "Poêle 10 kW Maia — design contemporain, idéal grande pièce de vie. Dispo en 8 ou 10 kW.",
    features: [FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_PROGRAM],
    colorVariants: COLORS_FERLUX_ACIER,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },

  // ============================================================================
  // POÊLES CANALISABLES
  // ============================================================================
  {
    sku: "FRX_OSIRIS_CANAL",
    slug: "ferlux-osiris-canalisable",
    name: "Ferlux Osiris Canalisable",
    model: "Osiris Canalisable (7/8 kW)",
    brand: "Ferlux",
    productType: "canalisable",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 8.0,
    heatedVolumeM3: 200,
    efficiency: 88.5,
    isAirtight: false,
    isConnected: false,
    isCanalizable: true,
    isHydro: false,
    hopperCapacity: 20,
    shortDescription:
      "Poêle canalisable 8 kW Osiris — entrée gamme canalisable Ferlux. Dispo aussi en 7 kW.",
    features: [FEATURE_CANALIZABLE, FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_PROGRAM],
    colorVariants: COLORS_FERLUX_ACIER,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "FRX_LYRA_CANAL",
    slug: "ferlux-lyra-canalisable",
    name: "Ferlux Lyra Canalisable 10 kW",
    model: "Lyra Canalisable (8/10 kW)",
    brand: "Ferlux",
    productType: "canalisable",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 10.0,
    heatedVolumeM3: 250,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: false,
    isCanalizable: true,
    isHydro: false,
    hopperCapacity: 22,
    shortDescription:
      "Poêle canalisable 10 kW Lyra — milieu de gamme canalisable. Dispo en 8 ou 10 kW selon besoin.",
    features: [FEATURE_CANALIZABLE, FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_MULTI_POWER],
    colorVariants: COLORS_FERLUX_ACIER,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "FRX_IKARO_CANAL",
    slug: "ferlux-ikaro-canalisable",
    name: "Ferlux Ikaro Canalisable 10 kW",
    model: "Ikaro Canalisable (6/8/10/12 kW)",
    brand: "Ferlux",
    productType: "canalisable",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 10.0,
    heatedVolumeM3: 250,
    efficiency: 89.5,
    isAirtight: false,
    isConnected: false,
    isCanalizable: true,
    isHydro: false,
    hopperCapacity: 22,
    shortDescription:
      "Poêle canalisable 10 kW Ikaro — gamme polyvalente, dispo en 6/8/10/12 kW pour s'adapter à la surface.",
    features: [FEATURE_CANALIZABLE, FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_MULTI_POWER],
    colorVariants: COLORS_FERLUX_ACIER,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "FRX_PHOENIX_ACIER_CANAL",
    slug: "ferlux-phoenix-acier-canalisable",
    name: "Ferlux Phoenix Acier Canalisable 12 kW",
    model: "Phoenix Acier Canalisable (12/15 kW)",
    brand: "Ferlux",
    productType: "canalisable",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 12.0,
    heatedVolumeM3: 300,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: false,
    isCanalizable: true,
    isHydro: false,
    hopperCapacity: 25,
    shortDescription:
      "Poêle canalisable 12 kW Phoenix finition acier — grande puissance. Dispo en 12 ou 15 kW.",
    features: [FEATURE_CANALIZABLE, FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_PROGRAM],
    colorVariants: COLORS_FERLUX_ACIER,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "FRX_PHOENIX_GLASS_CANAL",
    slug: "ferlux-phoenix-glass-canalisable",
    name: "Ferlux Phoenix Glass Canalisable 12 kW",
    model: "Phoenix Glass Canalisable (12/15 kW)",
    brand: "Ferlux",
    productType: "canalisable",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 12.0,
    heatedVolumeM3: 300,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: false,
    isCanalizable: true,
    isHydro: false,
    hopperCapacity: 25,
    shortDescription:
      "Poêle canalisable 12 kW Phoenix finition verre — version premium avec habillage verre. Dispo 12/15 kW.",
    features: [FEATURE_CANALIZABLE, FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_PROGRAM],
    colorVariants: COLORS_FERLUX_GLASS,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },

  // ============================================================================
  // THERMOPOÊLES HYDRO
  // ============================================================================
  {
    sku: "FRX_F_HIDRO",
    slug: "ferlux-f-hidro",
    name: "Ferlux F Hidro 10 kW",
    model: "F Hidro (8/10 kW)",
    brand: "Ferlux",
    productType: "hydro",
    diffusion: "convection-naturelle",
    color: "dark",
    power: 10.0,
    heatedVolumeM3: 250,
    efficiency: 88.5,
    isAirtight: false,
    isConnected: false,
    isCanalizable: false,
    isHydro: true,
    hopperCapacity: 22,
    shortDescription:
      "Thermopoêle hydro 10 kW gamme F — entrée gamme hydro Ferlux. Dispo aussi en 8 kW.",
    features: [FEATURE_HYDRO, FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_PROGRAM],
    colorVariants: COLORS_HYDRO,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "FRX_SILO_HIDRO",
    slug: "ferlux-silo-hidro",
    name: "Ferlux Silo Hidro 10 kW",
    model: "Silo Hidro (8/10 kW)",
    brand: "Ferlux",
    productType: "hydro",
    diffusion: "convection-naturelle",
    color: "dark",
    power: 10.0,
    heatedVolumeM3: 250,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: false,
    isCanalizable: false,
    isHydro: true,
    hopperCapacity: 25,
    shortDescription:
      "Thermopoêle hydro 10 kW Silo — réservoir intégré XXL. Dispo en 8 ou 10 kW.",
    features: [FEATURE_HYDRO, FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_PROGRAM],
    colorVariants: COLORS_HYDRO,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "FRX_IRIS_HIDRO",
    slug: "ferlux-iris-hidro",
    name: "Ferlux Iris Hidro 12 kW",
    model: "Iris Hidro (10/12 kW)",
    brand: "Ferlux",
    productType: "hydro",
    diffusion: "convection-naturelle",
    color: "dark",
    power: 12.0,
    heatedVolumeM3: 300,
    efficiency: 89.5,
    isAirtight: false,
    isConnected: false,
    isCanalizable: false,
    isHydro: true,
    hopperCapacity: 25,
    shortDescription:
      "Thermopoêle hydro 12 kW Iris — milieu de gamme hydro. Dispo en 10 ou 12 kW.",
    features: [FEATURE_HYDRO, FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_PROGRAM],
    colorVariants: COLORS_HYDRO,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "FRX_SELENA_HIDRO",
    slug: "ferlux-selena-hidro",
    name: "Ferlux Selena Hidro 12 kW",
    model: "Selena Hidro (10/12 kW)",
    brand: "Ferlux",
    productType: "hydro",
    diffusion: "convection-naturelle",
    color: "dark",
    power: 12.0,
    heatedVolumeM3: 300,
    efficiency: 89.5,
    isAirtight: false,
    isConnected: false,
    isCanalizable: false,
    isHydro: true,
    hopperCapacity: 30,
    shortDescription:
      "Thermopoêle hydro 12 kW Selena — segment premium hydro Ferlux. Dispo en 10 ou 12 kW.",
    features: [FEATURE_HYDRO, FEATURE_QUALITY_SPAIN, FEATURE_VERMICULITE, FEATURE_PROGRAM],
    colorVariants: COLORS_HYDRO,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "FRX_HIDROMATIC_18",
    slug: "ferlux-hidromatic-18",
    name: "Ferlux Hidromatic 18 kW",
    model: "Hidromatic (15/18/27 kW)",
    brand: "Ferlux",
    productType: "hydro",
    diffusion: "convection-naturelle",
    color: "dark",
    power: 18.0,
    heatedVolumeM3: 450,
    efficiency: 90.0,
    isAirtight: false,
    isConnected: false,
    isCanalizable: false,
    isHydro: true,
    hopperCapacity: 35,
    shortDescription:
      "Thermopoêle hydro 18 kW Hidromatic — grande puissance avec régulation hydraulique automatique. Dispo en 15/18/27 kW.",
    features: [FEATURE_HYDROMATIC, FEATURE_HYDRO, FEATURE_QUALITY_SPAIN, FEATURE_MULTI_POWER],
    colorVariants: COLORS_HYDRO,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
];

/* -----------------------------------------------------------------------------
   Prix HT 2025 (price list 06/2025 LECOQ S.A.)
   ----------------------------------------------------------------------------- */

export const FERLUX_PRICES: Record<string, number> = {
  // Monoblock 6 kW
  "ferlux-milena": 1690,
  "ferlux-perla": 2150,
  "ferlux-odin": 1690,
  "ferlux-venus": 1690, // estimation, prix non visible

  // Polyvalents 8 kW (par défaut)
  "ferlux-ares-8": 2300,
  "ferlux-shara-8": 2600,
  "ferlux-helen-acier-8": 2470,
  "ferlux-helen-glass-8": 3000,
  "ferlux-elisa-8": 2550,
  "ferlux-nerea-8": 2950,
  "ferlux-natalia-8": 2850,
  "ferlux-ulyses-8": 2400,

  // Grande puissance
  "ferlux-fanny-10": 2050,
  "ferlux-flora-10": 2400,
  "ferlux-estela-10": 2750,
  "ferlux-maia-10": 2400,

  // Canalisables
  "ferlux-osiris-canalisable": 1980,
  "ferlux-lyra-canalisable": 2600,
  "ferlux-ikaro-canalisable": 2850,
  "ferlux-phoenix-acier-canalisable": 2400,
  "ferlux-phoenix-glass-canalisable": 2700,

  // Hydro
  "ferlux-f-hidro": 2700,
  "ferlux-silo-hidro": 2990,
  "ferlux-iris-hidro": 3100,
  "ferlux-selena-hidro": 3400,
  "ferlux-hidromatic-18": 3600,
};
