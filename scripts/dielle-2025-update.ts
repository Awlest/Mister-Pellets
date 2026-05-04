/**
 * Update Dielle 2024-25 — prix HT depuis catalogue 2024-25 + nouveaux modèles.
 *
 * Source : "01.pdf" = Dielle Catalogue 2024-25 (avec prix HT en €).
 *
 * 2 actions :
 * 1. PRICE_UPDATES : mapping slug → prix HT pour les 23 produits Dielle déjà
 *    importés depuis le catalogue 2022. Les prix TTC sont calculés × 1.21.
 * 2. NEW_PRODUCTS : nouveaux modèles Dielle 2024-25 absents du 2022
 *    (ETHESIA, PONENTE HYBRID, BOREA, GARBIN, FBX).
 */

import type { SeedProduct, SeedColorVariant, SeedFeature } from "./ek63-products";

/* -----------------------------------------------------------------------------
   Prix HT 2024-25 → mapping vers les slugs déjà importés
   Source : extraction PDF Dielle Catalogue 2024-25.
   ----------------------------------------------------------------------------- */

export const DIELLE_PRICE_UPDATES: Record<string, { priceHT: number }> = {
  // Hybrides Ghibli
  "dielle-ghibli-hybrid-50": { priceHT: 5990 }, // GHIBLI 50 base
  "dielle-ghibli-hybrid-80": { priceHT: 6680 }, // GHIBLI 80 base

  // Bump (entrée de gamme)
  "dielle-bump-50": { priceHT: 4500 },
  "dielle-bump-80": { priceHT: 4780 }, // estimation entre 50 et 100
  "dielle-bump-100": { priceHT: 5060 },

  // Round (design rond)
  "dielle-round-70": { priceHT: 4050 }, // ROUND 70 B
  "dielle-round-100": { priceHT: 4675 }, // ROUND 100 B

  // Levante (milieu de gamme)
  "dielle-levante-80": { priceHT: 4630 },
  "dielle-levante-100": { priceHT: 4950 },

  // Maestrale (premium)
  "dielle-maestrale-glass-100": { priceHT: 4960 }, // MAESTRALE 60 GB approximation

  // Zefiro (céramique)
  "dielle-zefiro-70": { priceHT: 4370 },

  // Scirocco
  "dielle-scirocco-100": { priceHT: 4105 },
  "dielle-scirocco-stone-80": { priceHT: 4540 }, // estimation segment Stone

  // Ostro
  "dielle-ostro-100": { priceHT: 4010 },

  // Grecale
  "dielle-grecale-100": { priceHT: 3410 },

  // Inserts Bump
  "dielle-bump-insert-t-50": { priceHT: 3940 }, // FBX S 50 approximation
  "dielle-bump-insert-r-50": { priceHT: 4140 },
  "dielle-bump-insert-r-80": { priceHT: 4480 },

  // Hydro Levante
  "dielle-levante-idro-14": { priceHT: 6450 }, // estimation LEVANTE IDRO 14
  "dielle-levante-idro-18": { priceHT: 6890 },
  "dielle-levante-idro-22": { priceHT: 7705 }, // LEVANTE IDRO 22 + ECS visible

  // Hydro Scirocco
  "dielle-scirocco-idro-25": { priceHT: 7990 }, // estimation
  "dielle-scirocco-idro-30": { priceHT: 8650 },
};

/* -----------------------------------------------------------------------------
   Nouveaux modèles Dielle 2024-25 (absents du catalogue 2022)
   ----------------------------------------------------------------------------- */

const FEATURE_FEEDING: SeedFeature = {
  title: "Alimentation par le bas (brevet Dielle)",
  description:
    "Système breveté d'alimentation par gravité, plus efficace, plus propre et plus silencieux que les vis sans fin.",
};

const FEATURE_AIRTIGHT_TECH: SeedFeature = {
  title: "Technologie étanche",
  description:
    "Prélève l'air comburant directement à l'extérieur sans soustraire d'oxygène à la pièce. Compatible maisons passives.",
};

const FEATURE_DOUBLE_BOUGIE: SeedFeature = {
  title: "Double bougie quartz",
  description:
    "Allumage rapide via résistance cristal de quartz. La 2ème bougie garantit l'allumage en cas de défaillance de l'une.",
};

const FEATURE_SILENT: SeedFeature = {
  title: "Système Silent",
  description:
    "Chargement extrêmement silencieux. À basse puissance, le motoréducteur tourne en continu pour un meilleur confort.",
};

const FEATURE_DIELLE_CONNECT: SeedFeature = {
  title: "Dielle Connect (Wi-Fi inclus)",
  description:
    "Pilotage à distance via app Dielle Connect (iOS/Android). Programmation hebdomadaire et notifications.",
};

const FEATURE_HYBRID: SeedFeature = {
  title: "Bois bûches + pellets",
  description:
    "Fonctionne aussi bien au pellet automatique qu'au bois bûche traditionnel. Polyvalence maximale.",
};

const FEATURE_HYDRO: SeedFeature = {
  title: "Raccordement chauffage central",
  description:
    "Connecté au circuit radiateurs ou plancher chauffant. Idéal pour remplacer une chaudière mazout ou gaz.",
};

const COLORS_DIELLE_BASE: SeedColorVariant[] = [
  { colorName: "Acier noir", colorHex: "#1A1A1A" },
  { colorName: "Acier blanc", colorHex: "#F5F5F0" },
];

const COLORS_DIELLE_GLASS: SeedColorVariant[] = [
  { colorName: "Verre noir", colorHex: "#0A0A0A" },
  { colorName: "Verre blanc", colorHex: "#FFFFFF" },
  { colorName: "Acier noir", colorHex: "#1A1A1A" },
];

const COLORS_DIELLE_CERAMIC: SeedColorVariant[] = [
  { colorName: "Céramique blanc", colorHex: "#F4EDD8" },
  { colorName: "Céramique nature", colorHex: "#E5DCC9" },
  { colorName: "Céramique bordeaux", colorHex: "#722F37" },
  { colorName: "Céramique gris pierre", colorHex: "#7A7A7A" },
];

export const DIELLE_NEW_PRODUCTS: SeedProduct[] = [
  // ============================================================================
  // ETHESIA — nouvelle gamme premium 2024-25
  // ============================================================================
  {
    sku: "DIE_ETHESIA_50",
    slug: "dielle-ethesia-50",
    name: "Dielle Ethesia 50",
    model: "Ethesia 50",
    brand: "Dielle",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "natural",
    power: 6.0,
    surfaceMin: 70,
    surfaceMax: 110,
    efficiency: 90.0,
    isAirtight: true,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 18,
    shortDescription:
      "Nouveauté 2025 — Poêle 6 kW finition céramique premium. Étanche, classe A++, double bougie quartz, Dielle Connect.",
    features: [FEATURE_FEEDING, FEATURE_AIRTIGHT_TECH, FEATURE_DOUBLE_BOUGIE, FEATURE_DIELLE_CONNECT],
    colorVariants: COLORS_DIELLE_CERAMIC,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_ETHESIA_70",
    slug: "dielle-ethesia-70",
    name: "Dielle Ethesia 70",
    model: "Ethesia 70",
    brand: "Dielle",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "natural",
    power: 9.0,
    surfaceMin: 90,
    surfaceMax: 145,
    efficiency: 90.5,
    isAirtight: true,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 20,
    shortDescription:
      "Nouveauté 2025 — Poêle 9 kW pour 135 m³. Étanche, finition céramique, classe A++, technologie Dielle Connect.",
    features: [FEATURE_FEEDING, FEATURE_AIRTIGHT_TECH, FEATURE_DOUBLE_BOUGIE, FEATURE_SILENT],
    colorVariants: COLORS_DIELLE_CERAMIC,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_ETHESIA_100",
    slug: "dielle-ethesia-100",
    name: "Dielle Ethesia 100",
    model: "Ethesia 100",
    brand: "Dielle",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "natural",
    power: 12.0,
    surfaceMin: 120,
    surfaceMax: 195,
    efficiency: 90.5,
    isAirtight: true,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 25,
    shortDescription:
      "Nouveauté 2025 — Poêle 12 kW pour 200 m³ (A++). Étanche, finition céramique, double bougie quartz inclus.",
    features: [FEATURE_FEEDING, FEATURE_AIRTIGHT_TECH, FEATURE_DOUBLE_BOUGIE, FEATURE_DIELLE_CONNECT],
    colorVariants: COLORS_DIELLE_CERAMIC,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_ETHESIA_GLASS_50",
    slug: "dielle-ethesia-glass-50",
    name: "Dielle Ethesia Glass 50",
    model: "Ethesia Glass 50",
    brand: "Dielle",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 6.0,
    surfaceMin: 70,
    surfaceMax: 110,
    efficiency: 90.0,
    isAirtight: true,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 18,
    shortDescription:
      "Nouveauté 2025 — Version Glass de l'Ethesia 50. Habillage verre intégral, étanche, double bougie quartz.",
    features: [FEATURE_FEEDING, FEATURE_AIRTIGHT_TECH, FEATURE_DOUBLE_BOUGIE, FEATURE_DIELLE_CONNECT],
    colorVariants: COLORS_DIELLE_GLASS,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_ETHESIA_GLASS_70",
    slug: "dielle-ethesia-glass-70",
    name: "Dielle Ethesia Glass 70",
    model: "Ethesia Glass 70",
    brand: "Dielle",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 9.0,
    surfaceMin: 90,
    surfaceMax: 145,
    efficiency: 90.5,
    isAirtight: true,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 20,
    shortDescription:
      "Nouveauté 2025 — Version Glass de l'Ethesia 70. Esthétique noir verre, étanche, classe A++.",
    features: [FEATURE_FEEDING, FEATURE_AIRTIGHT_TECH, FEATURE_DOUBLE_BOUGIE, FEATURE_SILENT],
    colorVariants: COLORS_DIELLE_GLASS,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_ETHESIA_GLASS_100",
    slug: "dielle-ethesia-glass-100",
    name: "Dielle Ethesia Glass 100",
    model: "Ethesia Glass 100",
    brand: "Dielle",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 12.0,
    surfaceMin: 120,
    surfaceMax: 195,
    efficiency: 90.5,
    isAirtight: true,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 25,
    shortDescription:
      "Nouveauté 2025 — Ethesia Glass 12 kW (200 m³). Habillage verre intégral, étanche, double bougie quartz.",
    features: [FEATURE_FEEDING, FEATURE_AIRTIGHT_TECH, FEATURE_DOUBLE_BOUGIE, FEATURE_DIELLE_CONNECT],
    colorVariants: COLORS_DIELLE_GLASS,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },

  // ============================================================================
  // PONENTE HYBRID — nouveaux hybrides bois+pellets 2024-25
  // ============================================================================
  {
    sku: "DIE_PONENTE_HYBRID_EASY_50",
    slug: "dielle-ponente-hybrid-easy-50",
    name: "Dielle Ponente Hybrid Easy 50",
    model: "Ponente Hybrid Easy 50",
    brand: "Dielle",
    productType: "hybride",
    diffusion: "convection-naturelle",
    color: "dark",
    power: 6.0,
    surfaceMin: 70,
    surfaceMax: 110,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 18,
    shortDescription:
      "Nouveauté 2025 — Hybride bois+pellets 6 kW version Easy. Polyvalence maximale, tarification accessible.",
    features: [FEATURE_HYBRID, FEATURE_FEEDING, FEATURE_DIELLE_CONNECT, FEATURE_DOUBLE_BOUGIE],
    colorVariants: COLORS_DIELLE_BASE,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_PONENTE_HYBRID_EASY_80",
    slug: "dielle-ponente-hybrid-easy-80",
    name: "Dielle Ponente Hybrid Easy 80",
    model: "Ponente Hybrid Easy 80",
    brand: "Dielle",
    productType: "hybride",
    diffusion: "convection-naturelle",
    color: "dark",
    power: 10.0,
    surfaceMin: 95,
    surfaceMax: 135,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 20,
    shortDescription:
      "Nouveauté 2025 — Hybride bois+pellets 10 kW (135 m³ A++) version Easy. Pellet ou bois bûche au choix.",
    features: [FEATURE_HYBRID, FEATURE_FEEDING, FEATURE_DIELLE_CONNECT, FEATURE_DOUBLE_BOUGIE],
    colorVariants: COLORS_DIELLE_BASE,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_PONENTE_HYBRID_50",
    slug: "dielle-ponente-hybrid-50",
    name: "Dielle Ponente Hybrid 50",
    model: "Ponente Hybrid 50",
    brand: "Dielle",
    productType: "hybride",
    diffusion: "convection-naturelle",
    color: "dark",
    power: 6.0,
    surfaceMin: 70,
    surfaceMax: 110,
    efficiency: 90.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 20,
    shortDescription:
      "Nouveauté 2025 — Hybride premium 6 kW. Pellet ou bois, finition haut de gamme, équipement complet.",
    features: [FEATURE_HYBRID, FEATURE_FEEDING, FEATURE_DIELLE_CONNECT, FEATURE_DOUBLE_BOUGIE, FEATURE_SILENT],
    colorVariants: COLORS_DIELLE_BASE,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_PONENTE_HYBRID_80",
    slug: "dielle-ponente-hybrid-80",
    name: "Dielle Ponente Hybrid 80",
    model: "Ponente Hybrid 80",
    brand: "Dielle",
    productType: "hybride",
    diffusion: "convection-naturelle",
    color: "dark",
    power: 10.0,
    surfaceMin: 100,
    surfaceMax: 165,
    efficiency: 89.5,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 22,
    shortDescription:
      "Nouveauté 2025 — Hybride premium 10 kW (220 m³ A+). Pellet ou bois bûche, équipement complet, Dielle Connect.",
    features: [FEATURE_HYBRID, FEATURE_FEEDING, FEATURE_DIELLE_CONNECT, FEATURE_DOUBLE_BOUGIE, FEATURE_SILENT],
    colorVariants: COLORS_DIELLE_BASE,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },

  // ============================================================================
  // BOREA — nouveau canalisable 2024-25
  // ============================================================================
  {
    sku: "DIE_BOREA_60",
    slug: "dielle-borea-60",
    name: "Dielle Borea 60",
    model: "Borea 60",
    brand: "Dielle",
    productType: "canalisable",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 10.0,
    surfaceMin: 95,
    surfaceMax: 150,
    efficiency: 90.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: true,
    isHydro: false,
    hopperCapacity: 22,
    shortDescription:
      "Nouveauté 2025 — Poêle canalisable 10 kW (185 m³ A++). Modules UP80/UP130 disponibles pour 1 ou 2 pièces.",
    features: [FEATURE_FEEDING, FEATURE_DIELLE_CONNECT, FEATURE_DOUBLE_BOUGIE, FEATURE_SILENT],
    colorVariants: COLORS_DIELLE_BASE,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_BOREA_80",
    slug: "dielle-borea-80",
    name: "Dielle Borea 80",
    model: "Borea 80",
    brand: "Dielle",
    productType: "canalisable",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 12.0,
    surfaceMin: 115,
    surfaceMax: 185,
    efficiency: 90.5,
    isAirtight: false,
    isConnected: true,
    isCanalizable: true,
    isHydro: false,
    hopperCapacity: 24,
    shortDescription:
      "Nouveauté 2025 — Poêle canalisable 12 kW (185 m³). Canalisation UP80 ou double UP130/80 en option.",
    features: [FEATURE_FEEDING, FEATURE_DIELLE_CONNECT, FEATURE_DOUBLE_BOUGIE, FEATURE_SILENT],
    colorVariants: COLORS_DIELLE_BASE,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },

  // ============================================================================
  // GARBIN — nouveau modèle 2024-25
  // ============================================================================
  {
    sku: "DIE_GARBIN_100",
    slug: "dielle-garbin-100",
    name: "Dielle Garbin 100",
    model: "Garbin 100",
    brand: "Dielle",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 12.0,
    surfaceMin: 118,
    surfaceMax: 192,
    efficiency: 90.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 22,
    shortDescription:
      "Nouveauté 2025 — Poêle 12 kW gamme Garbin. Design contemporain, alimentation par le bas brevetée Dielle.",
    features: [FEATURE_FEEDING, FEATURE_DIELLE_CONNECT, FEATURE_DOUBLE_BOUGIE, FEATURE_SILENT],
    colorVariants: COLORS_DIELLE_BASE,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },

  // ============================================================================
  // FBX — nouvelle gamme insertable 2024-25
  // ============================================================================
  {
    sku: "DIE_FBX_S_50",
    slug: "dielle-fbx-s-50",
    name: "Dielle FBX S 50",
    model: "FBX S 50",
    brand: "Dielle",
    productType: "insert",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 6.0,
    surfaceMin: 70,
    surfaceMax: 110,
    efficiency: 89.5,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 12,
    shortDescription:
      "Nouveauté 2025 — Insert encastrable 6 kW gamme FBX. Pour cheminée existante, double bougie quartz.",
    features: [
      {
        title: "Encastrable dans une cheminée",
        description:
          "Conçu pour s'intégrer dans un foyer existant. Restauration moderne d'une cheminée traditionnelle.",
      },
      FEATURE_FEEDING,
      FEATURE_DOUBLE_BOUGIE,
      FEATURE_DIELLE_CONNECT,
    ],
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_FBX_S_70",
    slug: "dielle-fbx-s-70",
    name: "Dielle FBX S 70",
    model: "FBX S 70",
    brand: "Dielle",
    productType: "insert",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 9.0,
    surfaceMin: 90,
    surfaceMax: 145,
    efficiency: 90.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 14,
    shortDescription:
      "Nouveauté 2025 — Insert 9 kW (135 m³ A+) gamme FBX. Plus puissant que le S 50, idéal grande cheminée.",
    features: [
      {
        title: "Encastrable dans une cheminée",
        description:
          "Conçu pour s'intégrer dans un foyer existant. Restauration moderne d'une cheminée traditionnelle.",
      },
      FEATURE_FEEDING,
      FEATURE_DOUBLE_BOUGIE,
      FEATURE_DIELLE_CONNECT,
    ],
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
];

/* -----------------------------------------------------------------------------
   Prix HT pour les nouveautés (à appliquer au seed)
   ----------------------------------------------------------------------------- */

export const DIELLE_NEW_PRICES: Record<string, number> = {
  "dielle-ethesia-50": 3470,
  "dielle-ethesia-70": 3700,
  "dielle-ethesia-100": 4270,
  "dielle-ethesia-glass-50": 3590,
  "dielle-ethesia-glass-70": 3820,
  "dielle-ethesia-glass-100": 4400,
  "dielle-ponente-hybrid-easy-50": 5450,
  "dielle-ponente-hybrid-easy-80": 5550,
  "dielle-ponente-hybrid-50": 5850,
  "dielle-ponente-hybrid-80": 5950,
  "dielle-borea-60": 4210,
  "dielle-borea-80": 4560,
  "dielle-garbin-100": 4570,
  "dielle-fbx-s-50": 3940,
  "dielle-fbx-s-70": 4140,
};
