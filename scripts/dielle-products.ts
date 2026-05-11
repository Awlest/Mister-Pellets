/**
 * Catalogue Dielle — extraction depuis "01 DIELLE_Catalogo2022_HD.pdf"
 * (catalogue distributeur officiel 2022/2023, 292 MB version HD).
 *
 * 22 produits pellet sélectionnés (sur une gamme totale de ~50+ modèles
 * avec extensions modulaires) :
 *   - 2 hybrides bois + pellets (Ghibli)
 *   - 12 poêles à air (Bump, Round, Levante, Maestrale, Zefiro, Scirocco,
 *     Ostro, Grecale)
 *   - 3 inserts encastrables (Bump Insert)
 *   - 5 thermopoêles hydro (Levante Idro, Scirocco Idro)
 *
 * Chaudières et thermo-cheminées NON incluses (segment B2B/grosses
 * installations).
 *
 * Note : Dielle utilise un système modulaire — la plupart des modèles à air
 * peuvent être étendus avec un module UP80 (canalisation 1 pièce) ou
 * UP130/80 (canalisation 2 pièces). Ces extensions sont mentionnées dans la
 * description plutôt que créées comme SKUs séparés (clarté commerciale).
 *
 * Champs à compléter par l'équipe Awlest :
 *   - priceHT / priceTTC
 *   - GTIN (EAN-13)
 *   - mainImage / galleryImages
 *   - efficiency, hopperCapacity (j'ai mis des valeurs typiques par segment,
 *     à valider avec les fiches techniques détaillées)
 *
 * IMPORTANT : ce catalogue date de 2022. La gamme Dielle a peu évolué mais
 * certains modèles peuvent avoir été remplacés. À valider avant publication.
 */

import type { SeedProduct, SeedColorVariant, SeedFeature } from "./ek63-products";

/* -----------------------------------------------------------------------------
   Couleurs Dielle — basées sur les codes SKU (B = Black, GB = Glass Black,
   C = Ceramic, S = Stone)
   ----------------------------------------------------------------------------- */

const COLORS_BASE: SeedColorVariant[] = [
  { colorName: "Acier noir", colorHex: "#1A1A1A" },
  { colorName: "Acier blanc", colorHex: "#F5F5F0" },
];

const COLORS_GLASS: SeedColorVariant[] = [
  { colorName: "Verre noir", colorHex: "#0A0A0A" },
  { colorName: "Verre blanc", colorHex: "#FFFFFF" },
  { colorName: "Acier noir", colorHex: "#1A1A1A" },
];

const COLORS_CERAMIC: SeedColorVariant[] = [
  { colorName: "Céramique blanc", colorHex: "#F4EDD8" },
  { colorName: "Céramique nature", colorHex: "#E5DCC9" },
  { colorName: "Céramique bordeaux", colorHex: "#722F37" },
  { colorName: "Céramique gris pierre", colorHex: "#7A7A7A" },
];

const COLORS_STONE: SeedColorVariant[] = [
  { colorName: "Pierre naturelle claire", colorHex: "#C8B89A" },
  { colorName: "Pierre noire", colorHex: "#2D2D2D" },
];

const COLORS_HYDRO: SeedColorVariant[] = [
  { colorName: "Acier noir", colorHex: "#1A1A1A" },
  { colorName: "Acier blanc", colorHex: "#F5F5F0" },
];

/* -----------------------------------------------------------------------------
   Features mutualisés Dielle
   ----------------------------------------------------------------------------- */

const FEATURE_FEEDING: SeedFeature = {
  title: "Alimentation par le bas",
  description:
    "Système d'alimentation par gravité, plus efficace, propre et silencieux que les vis sans fin classiques.",
};

const FEATURE_MADE_IN_ITALY: SeedFeature = {
  title: "Conception Made in Italy",
  description:
    "Fabrication italienne, recherche et développement intégrés. Garantie 5 ans constructeur.",
};

const FEATURE_VERMICULITE: SeedFeature = {
  title: "Foyer en vermiculite",
  description:
    "Restitution optimale de la chaleur et durabilité éprouvée du foyer haute température.",
};

const FEATURE_REMOTE: SeedFeature = {
  title: "Pilotage à distance",
  description:
    "Programmation hebdomadaire et contrôle à distance via l'app Dielle (iOS/Android) ou télécommande.",
};

const FEATURE_UP80: SeedFeature = {
  title: "Canalisable en option (UP80)",
  description:
    "Module UP80 disponible sur demande pour transformer le poêle en canalisable vers une autre pièce.",
};

const FEATURE_UP130: SeedFeature = {
  title: "Canalisable double en option (UP130/80)",
  description:
    "Module UP130/80 pour canaliser l'air chaud vers deux pièces supplémentaires en plus de la pièce de vie.",
};

const FEATURE_HYDRO: SeedFeature = {
  title: "Raccordement chauffage central",
  description:
    "Connecté au circuit radiateurs ou plancher chauffant. Idéal pour remplacer une chaudière au mazout ou au gaz.",
};

const FEATURE_HYDRO_ACS: SeedFeature = {
  title: "Production eau chaude sanitaire (ACS)",
  description:
    "Version ACS disponible pour produire l'eau chaude sanitaire en plus du chauffage central.",
};

const FEATURE_HYBRID: SeedFeature = {
  title: "Bois bûches + pellets",
  description:
    "Fonctionne aussi bien au pellet automatique qu'au bois bûche traditionnel. Polyvalence maximale.",
};

const FEATURE_INSERT: SeedFeature = {
  title: "Encastrable dans une cheminée",
  description:
    "Conçu pour s'intégrer dans un foyer existant. Restauration moderne d'une cheminée traditionnelle.",
};

/* -----------------------------------------------------------------------------
   Catalogue produits Dielle
   ----------------------------------------------------------------------------- */

export const DIELLE_PRODUCTS: SeedProduct[] = [
  // ============================================================================
  // HYBRIDES BOIS + PELLETS (Ghibli)
  // ============================================================================
  {
    sku: "DIE_GHIBLI_HYBRID_50",
    slug: "dielle-ghibli-hybrid-50",
    name: "Dielle Ghibli Hybrid 50",
    model: "Ghibli Hybrid 50",
    brand: "Dielle",
    productType: "hybride",
    diffusion: "convection-naturelle",
    color: "dark",
    power: 8.0,
    heatedVolumeM3: 180,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 18,
    shortDescription:
      "Poêle hybride 8 kW — fonctionne au pellet ET au bois bûche. Polyvalence maximale, finition italienne.",
    features: [FEATURE_HYBRID, FEATURE_FEEDING, FEATURE_MADE_IN_ITALY, FEATURE_VERMICULITE],
    colorVariants: COLORS_BASE,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_GHIBLI_HYBRID_80",
    slug: "dielle-ghibli-hybrid-80",
    name: "Dielle Ghibli Hybrid 80",
    model: "Ghibli Hybrid 80",
    brand: "Dielle",
    productType: "hybride",
    diffusion: "convection-naturelle",
    color: "dark",
    power: 11.0,
    heatedVolumeM3: 230,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 22,
    shortDescription:
      "Poêle hybride 11 kW pour grandes pièces — pellet ou bois bûche au choix. Made in Italy, garantie 5 ans.",
    features: [FEATURE_HYBRID, FEATURE_FEEDING, FEATURE_MADE_IN_ITALY, FEATURE_VERMICULITE],
    colorVariants: COLORS_BASE,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },

  // ============================================================================
  // POÊLES À AIR — Gamme Bump (entrée de gamme moderne)
  // ============================================================================
  {
    sku: "DIE_BUMP_50",
    slug: "dielle-bump-50",
    name: "Dielle Bump 50",
    model: "Bump 50",
    brand: "Dielle",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 6.0,
    heatedVolumeM3: 170,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 15,
    shortDescription:
      "Poêle 6 kW au design urbain compact. Entrée de gamme moderne, option canalisation UP80/UP130 disponible.",
    features: [FEATURE_FEEDING, FEATURE_REMOTE, FEATURE_UP80, FEATURE_VERMICULITE],
    colorVariants: COLORS_BASE,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_BUMP_80",
    slug: "dielle-bump-80",
    name: "Dielle Bump 80",
    model: "Bump 80",
    brand: "Dielle",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 10.0,
    heatedVolumeM3: 230,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 18,
    shortDescription:
      "Poêle 10 kW pour pièces de vie spacieuses. Canalisation 1 ou 2 pièces possible (modules UP80, UP130/80).",
    features: [FEATURE_FEEDING, FEATURE_REMOTE, FEATURE_UP130, FEATURE_VERMICULITE],
    colorVariants: COLORS_BASE,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_BUMP_100",
    slug: "dielle-bump-100",
    name: "Dielle Bump 100",
    model: "Bump 100",
    brand: "Dielle",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 12.0,
    heatedVolumeM3: 300,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 22,
    shortDescription:
      "Poêle 12 kW grande puissance, gamme Bump moderne. Canalisation double en option pour 2 pièces.",
    features: [FEATURE_FEEDING, FEATURE_REMOTE, FEATURE_UP130, FEATURE_VERMICULITE],
    colorVariants: COLORS_BASE,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },

  // ============================================================================
  // POÊLES À AIR — Gamme Round (design rond)
  // ============================================================================
  {
    sku: "DIE_ROUND_70",
    slug: "dielle-round-70",
    name: "Dielle Round 70",
    model: "Round 70",
    brand: "Dielle",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 9.0,
    heatedVolumeM3: 210,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 18,
    shortDescription:
      "Poêle 9 kW au design rond emblématique de Dielle. Disponible en acier ou verre, finition Made in Italy.",
    features: [FEATURE_FEEDING, FEATURE_REMOTE, FEATURE_UP80, FEATURE_MADE_IN_ITALY],
    colorVariants: COLORS_GLASS,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_ROUND_100",
    slug: "dielle-round-100",
    name: "Dielle Round 100",
    model: "Round 100",
    brand: "Dielle",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 12.0,
    heatedVolumeM3: 290,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 22,
    shortDescription:
      "Poêle 12 kW gamme Round. Cylindrique pur, canalisation double en option (UP130/80) pour 2 pièces.",
    features: [FEATURE_FEEDING, FEATURE_REMOTE, FEATURE_UP130, FEATURE_MADE_IN_ITALY],
    colorVariants: COLORS_GLASS,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },

  // ============================================================================
  // POÊLES À AIR — Gamme Levante (milieu de gamme)
  // ============================================================================
  {
    sku: "DIE_LEVANTE_80",
    slug: "dielle-levante-80",
    name: "Dielle Levante 80",
    model: "Levante 80",
    brand: "Dielle",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 10.0,
    heatedVolumeM3: 240,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 20,
    shortDescription:
      "Poêle 10 kW gamme Levante (vent levant). Format vertical élégant, canalisation UP80 en option.",
    features: [FEATURE_FEEDING, FEATURE_REMOTE, FEATURE_UP80, FEATURE_VERMICULITE],
    colorVariants: COLORS_BASE,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_LEVANTE_100",
    slug: "dielle-levante-100",
    name: "Dielle Levante 100",
    model: "Levante 100",
    brand: "Dielle",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 12.0,
    heatedVolumeM3: 300,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 22,
    shortDescription:
      "Poêle 12 kW gamme Levante grande puissance. Idéal pour pièces de vie ouvertes jusqu'à 190 m².",
    features: [FEATURE_FEEDING, FEATURE_REMOTE, FEATURE_UP80, FEATURE_VERMICULITE],
    colorVariants: COLORS_BASE,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },

  // ============================================================================
  // POÊLES À AIR — Gammes premium (Maestrale, Zefiro, Scirocco, Ostro, Grecale)
  // ============================================================================
  {
    sku: "DIE_MAESTRALE_GLASS_100",
    slug: "dielle-maestrale-glass-100",
    name: "Dielle Maestrale Glass 100",
    model: "Maestrale Glass 100",
    brand: "Dielle",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 12.0,
    heatedVolumeM3: 300,
    efficiency: 90.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 22,
    shortDescription:
      "Poêle premium 12 kW finition verre intégral. Canalisation jusqu'à 2 pièces (UP130/80), Made in Italy.",
    features: [FEATURE_FEEDING, FEATURE_REMOTE, FEATURE_UP130, FEATURE_MADE_IN_ITALY],
    colorVariants: COLORS_GLASS,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_ZEFIRO_70",
    slug: "dielle-zefiro-70",
    name: "Dielle Zefiro 70",
    model: "Zefiro 70 Ceramic",
    brand: "Dielle",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "natural",
    power: 9.0,
    heatedVolumeM3: 210,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 18,
    shortDescription:
      "Poêle 9 kW finition céramique haut de gamme (zéphyr italien). 4 coloris au choix, canalisation UP80 en option.",
    features: [FEATURE_FEEDING, FEATURE_REMOTE, FEATURE_UP80, FEATURE_MADE_IN_ITALY],
    colorVariants: COLORS_CERAMIC,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_SCIROCCO_100",
    slug: "dielle-scirocco-100",
    name: "Dielle Scirocco 100",
    model: "Scirocco 100",
    brand: "Dielle",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 12.0,
    heatedVolumeM3: 300,
    efficiency: 90.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 22,
    shortDescription:
      "Poêle premium 12 kW gamme Scirocco. Disponible en acier, céramique ou pierre naturelle, canalisation double.",
    features: [FEATURE_FEEDING, FEATURE_REMOTE, FEATURE_UP130, FEATURE_MADE_IN_ITALY],
    colorVariants: COLORS_BASE,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_SCIROCCO_STONE_80",
    slug: "dielle-scirocco-stone-80",
    name: "Dielle Scirocco Stone 80",
    model: "Scirocco Stone 80",
    brand: "Dielle",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "natural",
    power: 10.0,
    heatedVolumeM3: 240,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 20,
    shortDescription:
      "Poêle 10 kW finition pierre naturelle. Habillage durable et chaleureux, restitue la chaleur même éteint.",
    features: [FEATURE_FEEDING, FEATURE_REMOTE, FEATURE_UP130, FEATURE_MADE_IN_ITALY],
    colorVariants: COLORS_STONE,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_OSTRO_100",
    slug: "dielle-ostro-100",
    name: "Dielle Ostro 100",
    model: "Ostro 100",
    brand: "Dielle",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 12.0,
    heatedVolumeM3: 300,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 22,
    shortDescription:
      "Poêle 12 kW gamme Ostro (vent du sud). Lignes pures, finition acier ou verre, canalisation UP130/80 en option.",
    features: [FEATURE_FEEDING, FEATURE_REMOTE, FEATURE_UP130, FEATURE_MADE_IN_ITALY],
    colorVariants: COLORS_GLASS,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_GRECALE_100",
    slug: "dielle-grecale-100",
    name: "Dielle Grecale 100",
    model: "Grecale 100",
    brand: "Dielle",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 12.0,
    heatedVolumeM3: 300,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 22,
    shortDescription:
      "Poêle 12 kW gamme Grecale (vent grec). Disponible en acier, verre ou céramique. Italian design.",
    features: [FEATURE_FEEDING, FEATURE_REMOTE, FEATURE_UP130, FEATURE_MADE_IN_ITALY],
    colorVariants: COLORS_CERAMIC,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },

  // ============================================================================
  // INSERTS BUMP
  // ============================================================================
  {
    sku: "DIE_BUMP_INSERT_T_50",
    slug: "dielle-bump-insert-t-50",
    name: "Dielle Bump Insert T 50",
    model: "Bump Insert T 50",
    brand: "Dielle",
    productType: "insert",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 6.0,
    heatedVolumeM3: 170,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 12,
    shortDescription:
      "Insert à pellets 6 kW format Tunnel (T) — visible des 2 côtés. Idéal cloison entre deux pièces.",
    features: [FEATURE_INSERT, FEATURE_FEEDING, FEATURE_REMOTE, FEATURE_MADE_IN_ITALY],
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_BUMP_INSERT_R_50",
    slug: "dielle-bump-insert-r-50",
    name: "Dielle Bump Insert R 50",
    model: "Bump Insert R 50",
    brand: "Dielle",
    productType: "insert",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 10.0,
    heatedVolumeM3: 230,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 15,
    shortDescription:
      "Insert à pellets 10 kW format Rectangulaire (R) classique. Pour cheminée existante mur droit.",
    features: [FEATURE_INSERT, FEATURE_FEEDING, FEATURE_REMOTE, FEATURE_MADE_IN_ITALY],
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_BUMP_INSERT_R_80",
    slug: "dielle-bump-insert-r-80",
    name: "Dielle Bump Insert R 80",
    model: "Bump Insert R 80",
    brand: "Dielle",
    productType: "insert",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 10.0,
    heatedVolumeM3: 240,
    efficiency: 89.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: true,
    isHydro: false,
    hopperCapacity: 18,
    shortDescription:
      "Insert canalisable 10 kW format Rectangulaire 80. Diffusion étendue vers une seconde pièce.",
    features: [FEATURE_INSERT, FEATURE_FEEDING, FEATURE_UP80, FEATURE_MADE_IN_ITALY],
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },

  // ============================================================================
  // THERMOPOÊLES HYDRO (Levante Idro et Scirocco Idro)
  // ============================================================================
  {
    sku: "DIE_LEVANTE_IDRO_14",
    slug: "dielle-levante-idro-14",
    name: "Dielle Levante Idro 14",
    model: "Levante Idro 14",
    brand: "Dielle",
    productType: "hydro",
    diffusion: "convection-naturelle",
    color: "dark",
    power: 14.0,
    heatedVolumeM3: 360,
    efficiency: 90.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: true,
    hopperCapacity: 25,
    shortDescription:
      "Thermopoêle hydro 14 kW pour chauffage central. Version ACS disponible pour eau chaude sanitaire.",
    features: [FEATURE_HYDRO, FEATURE_HYDRO_ACS, FEATURE_FEEDING, FEATURE_MADE_IN_ITALY],
    colorVariants: COLORS_HYDRO,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_LEVANTE_IDRO_18",
    slug: "dielle-levante-idro-18",
    name: "Dielle Levante Idro 18",
    model: "Levante Idro 18",
    brand: "Dielle",
    productType: "hydro",
    diffusion: "convection-naturelle",
    color: "dark",
    power: 18.0,
    heatedVolumeM3: 420,
    efficiency: 90.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: true,
    hopperCapacity: 25,
    shortDescription:
      "Thermopoêle hydro 18 kW. Idéal maison familiale jusqu'à 270 m², version ACS en option.",
    features: [FEATURE_HYDRO, FEATURE_HYDRO_ACS, FEATURE_FEEDING, FEATURE_MADE_IN_ITALY],
    colorVariants: COLORS_HYDRO,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_LEVANTE_IDRO_22",
    slug: "dielle-levante-idro-22",
    name: "Dielle Levante Idro 22",
    model: "Levante Idro 22",
    brand: "Dielle",
    productType: "hydro",
    diffusion: "convection-naturelle",
    color: "dark",
    power: 22.0,
    heatedVolumeM3: 480,
    efficiency: 90.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: true,
    hopperCapacity: 25,
    shortDescription:
      "Thermopoêle hydro 22 kW pour grandes maisons. Remplace efficacement chaudière mazout/gaz, version ACS dispo.",
    features: [FEATURE_HYDRO, FEATURE_HYDRO_ACS, FEATURE_FEEDING, FEATURE_MADE_IN_ITALY],
    colorVariants: COLORS_HYDRO,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_SCIROCCO_IDRO_25",
    slug: "dielle-scirocco-idro-25",
    name: "Dielle Scirocco Idro 25",
    model: "Scirocco Idro 25",
    brand: "Dielle",
    productType: "hydro",
    diffusion: "convection-naturelle",
    color: "dark",
    power: 25.0,
    heatedVolumeM3: 550,
    efficiency: 90.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: true,
    hopperCapacity: 30,
    shortDescription:
      "Thermopoêle hydro 25 kW haute capacité. Versions ACS et 5 Stelle disponibles, finition céramique en option.",
    features: [FEATURE_HYDRO, FEATURE_HYDRO_ACS, FEATURE_FEEDING, FEATURE_MADE_IN_ITALY],
    colorVariants: COLORS_HYDRO,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "DIE_SCIROCCO_IDRO_30",
    slug: "dielle-scirocco-idro-30",
    name: "Dielle Scirocco Idro 30",
    model: "Scirocco Idro 30",
    brand: "Dielle",
    productType: "hydro",
    diffusion: "convection-naturelle",
    color: "dark",
    power: 30.0,
    heatedVolumeM3: 700,
    efficiency: 90.0,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: true,
    hopperCapacity: 30,
    shortDescription:
      "Thermopoêle hydro 30 kW pour très grandes surfaces. Pour maisons grand volume ou petits collectifs.",
    features: [FEATURE_HYDRO, FEATURE_HYDRO_ACS, FEATURE_FEEDING, FEATURE_MADE_IN_ITALY],
    colorVariants: COLORS_HYDRO,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
];
