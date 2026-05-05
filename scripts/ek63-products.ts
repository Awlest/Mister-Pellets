/**
 * Catalogue EK63 — extraction depuis le PDF "EK63 listeprix tarif version
 * nov 2025 fr bmenergies.pdf" (catalogue distributeur officiel BM Energies).
 *
 * 21 produits pellet :
 *   - 16 poêles à air chaud
 *   - 2 inserts encastrables
 *   - 3 thermopoêles hydro (raccord chauffage central)
 *
 * Chaudières Kappa 200/240/270 NON incluses (segment B2B/grosses surfaces,
 * à ajouter sur demande équipe).
 *
 * Champs à compléter par l'équipe Awlest après import :
 *   - priceHT / priceTTC (le catalogue est en HT, conversion TVA 21% à appliquer)
 *   - GTIN (EAN-13) — pas dans le catalogue distributeur, à récupérer sur
 *     Edilkamin direct ou packaging produit
 *   - mainImage / galleryImages — photos officielles à demander à Edilkamin
 *     Mediahub
 *   - shortDescription, description — à rédiger en interne
 *   - features (les points forts par défaut sont pré-remplis ici)
 *   - colorVariants gtin — à compléter avec les SKU EK63 (cf. catalogue)
 */

export interface SeedColorVariant {
  colorName: string;
  colorHex: string;
  /** SKU distributeur EK63 (à remplacer par l'EAN-13 quand disponible) */
  mpn?: string;
}

export interface SeedFeature {
  title: string;
  description: string;
}

export interface SeedProduct {
  /** Identifiant unique pour les SKUs internes (ex: EK63_LIKE80_EVO) */
  sku: string;
  /** URL : /produit/{slug} */
  slug: string;
  /** Nom commercial complet */
  name: string;
  /** Modèle (sans la marque) */
  model: string;
  /** Marque */
  brand: "EK63" | "Edilkamin" | "Dielle" | "Ferlux";
  /** Type de poêle (taxonomie V1.3) */
  productType: "standard" | "canalisable" | "hydro" | "hybride" | "insert";
  /** Mode de diffusion */
  diffusion: "ventilation-forcee" | "convection-naturelle";
  /** Catégorie couleur de la finition par défaut */
  color: "light" | "dark" | "natural";
  /** Puissance nominale (max) en kW */
  power: number;
  /** Surface min en m² (basée sur volume × 0.4) */
  surfaceMin: number;
  /** Surface max en m² (basée sur volume × 0.65) */
  surfaceMax: number;
  /** Rendement % */
  efficiency: number;
  /** Étanche maison passive */
  isAirtight: boolean;
  /** Wi-Fi intégré (E-Smart pour EK63) */
  isConnected: boolean;
  /** Canalisable air chaud */
  isCanalizable: boolean;
  /** Hydro (raccord chauffage central) */
  isHydro: boolean;
  /** Capacité réservoir pellets en kg (max) */
  hopperCapacity?: number;
  /** Description courte (max 200 chars) */
  shortDescription: string;
  /** Points forts (3-6 par produit) */
  features: SeedFeature[];
  /** Variantes de couleur disponibles */
  colorVariants?: SeedColorVariant[];
  /** Stock par défaut */
  stockStatus: "in_stock" | "on_order" | "out_of_stock" | "discontinued";
  /** Délai de livraison */
  deliveryDelay: string;
}

/* -----------------------------------------------------------------------------
   Couleurs standards EK63 — réutilisées sur la plupart des modèles
   ----------------------------------------------------------------------------- */

const COLORS_STANDARD: SeedColorVariant[] = [
  { colorName: "Acier blanc perle", colorHex: "#F5F5F0" },
  { colorName: "Acier tourterelle", colorHex: "#B0A89A" },
  { colorName: "Acier noir mat", colorHex: "#1A1A1A" },
  { colorName: "Bordeaux", colorHex: "#722F37" },
];

const COLORS_GLASS: SeedColorVariant[] = [
  ...COLORS_STANDARD,
  { colorName: "Verre blanc", colorHex: "#FFFFFF" },
  { colorName: "Verre noir", colorHex: "#0A0A0A" },
];

const COLORS_CERAMIC: SeedColorVariant[] = [
  { colorName: "Céramique blanc opaque", colorHex: "#F8F4EC" },
  { colorName: "Céramique tourterelle", colorHex: "#B0A89A" },
  { colorName: "Céramique bordeaux", colorHex: "#722F37" },
  { colorName: "Acier noir mat", colorHex: "#1A1A1A" },
];

const COLORS_HYDRO: SeedColorVariant[] = [
  { colorName: "Céramique blanc crème", colorHex: "#F4EDD8" },
  { colorName: "Céramique bordeaux", colorHex: "#722F37" },
  { colorName: "Céramique gris foncé", colorHex: "#3D3D3D" },
];

/* -----------------------------------------------------------------------------
   Features mutualisés EK63
   ----------------------------------------------------------------------------- */

const FEATURE_BBC_AIRTIGHT: SeedFeature = {
  title: "Compatible maison passive",
  description:
    "Étanche, prélève l'air comburant directement de l'extérieur. Idéal BBC et logements basse consommation.",
};

const FEATURE_BBC_WIFI: SeedFeature = {
  title: "Wi-Fi E-Smart intégré",
  description:
    "Pilotage à distance via l'app SmartEK63 (iOS/Android). Programmation hebdomadaire et fonction Easy Timer.",
};

const FEATURES_BBC: SeedFeature[] = [FEATURE_BBC_AIRTIGHT, FEATURE_BBC_WIFI];

const FEATURE_VERMICULITE: SeedFeature = {
  title: "Foyer en vermiculite",
  description:
    "Matériau réfractaire haute température, restitution optimale de la chaleur et durabilité éprouvée.",
};

const FEATURE_BOUGIE_CERAMIQUE: SeedFeature = {
  title: "Bougie d'allumage céramique",
  description: "Allumage rapide et fiable, durée de vie supérieure aux résistances métalliques classiques.",
};

const FEATURE_VENTIL_FRONT: SeedFeature = {
  title: "Ventilation air chaud frontale",
  description: "Diffusion homogène et silencieuse de la chaleur dans la pièce de vie.",
};

const FEATURE_CANAL_1: SeedFeature = {
  title: "Canalisable vers une autre pièce",
  description:
    "1 sortie d'air chaud canalisable Ø 8 cm pour chauffer une pièce supplémentaire (kit en option).",
};

const FEATURE_CANAL_2: SeedFeature = {
  title: "Canalisable vers deux pièces",
  description:
    "2 sorties d'air chaud canalisables Ø 8 cm pour chauffer deux pièces supplémentaires (kit en option).",
};

const FEATURE_INSERT: SeedFeature = {
  title: "Encastrable dans une cheminée",
  description:
    "Conçu pour s'intégrer dans un foyer existant. Valorise une cheminée traditionnelle avec la performance des pellets.",
};

const FEATURE_HYDRO: SeedFeature = {
  title: "Raccordement chauffage central",
  description:
    "Connecté à votre circuit de radiateurs ou plancher chauffant. Idéal pour remplacer une chaudière au mazout ou au gaz.",
};

/* -----------------------------------------------------------------------------
   Catalogue produits EK63
   ----------------------------------------------------------------------------- */

export const EK63_PRODUCTS: SeedProduct[] = [
  // ============================================================================
  // POÊLES À AIR CHAUD STANDARD (sans canalisation)
  // ============================================================================
  {
    sku: "EK63_GOTHA70_EVO",
    slug: "ek63-gotha-70",
    name: "EK63 Gotha 70 Evo",
    model: "Gotha 70 Evo",
    brand: "EK63",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 6.7,
    surfaceMin: 70,
    surfaceMax: 114,
    efficiency: 88.4,
    isAirtight: true,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 20,
    shortDescription:
      "Poêle à pellets compact 6,7 kW pour pièces jusqu'à 114 m². Étanche, Wi-Fi E-Smart, idéal BBC.",
    features: [...FEATURES_BBC, FEATURE_VERMICULITE, FEATURE_BOUGIE_CERAMIQUE, FEATURE_VENTIL_FRONT],
    colorVariants: COLORS_STANDARD,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "EK63_LIKE80_EVO",
    slug: "ek63-like-80",
    name: "EK63 Like 80 Evo",
    model: "Like 80 Evo",
    brand: "EK63",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "light",
    power: 7.6,
    surfaceMin: 80,
    surfaceMax: 130,
    efficiency: 90.8,
    isAirtight: true,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 19,
    shortDescription:
      "Poêle à pellets 7,6 kW jusqu'à 130 m². Finition céramique ou acier, étanche maison passive, Wi-Fi.",
    features: [...FEATURES_BBC, FEATURE_VERMICULITE, FEATURE_BOUGIE_CERAMIQUE, FEATURE_VENTIL_FRONT],
    colorVariants: COLORS_CERAMIC,
    stockStatus: "in_stock",
    deliveryDelay: "48-72h",
  },
  {
    sku: "EK63_ZONE80_EVO",
    slug: "ek63-zone-80",
    name: "EK63 Zone 80 Evo",
    model: "Zone 80 Evo",
    brand: "EK63",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 7.6,
    surfaceMin: 80,
    surfaceMax: 130,
    efficiency: 90.8,
    isAirtight: true,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 19,
    shortDescription:
      "Poêle à pellets 7,6 kW pour pièces jusqu'à 130 m². Esthétique sobre, étanche, Wi-Fi E-Smart.",
    features: [...FEATURES_BBC, FEATURE_VERMICULITE, FEATURE_BOUGIE_CERAMIQUE, FEATURE_VENTIL_FRONT],
    colorVariants: COLORS_STANDARD,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "EK63_MAISON80",
    slug: "ek63-maison-80",
    name: "EK63 Maison 80",
    model: "Maison 80",
    brand: "EK63",
    productType: "standard",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 8.2,
    surfaceMin: 86,
    surfaceMax: 140,
    efficiency: 88.7,
    isAirtight: true,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 25,
    shortDescription:
      "Poêle à pellets 8,2 kW jusqu'à 140 m². Grande capacité réservoir 25 kg, autonomie prolongée.",
    features: [...FEATURES_BBC, FEATURE_VERMICULITE, FEATURE_BOUGIE_CERAMIQUE, FEATURE_VENTIL_FRONT],
    colorVariants: COLORS_STANDARD,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },

  // ============================================================================
  // POÊLES CANALISABLES SIMPLES (1 pièce supplémentaire — modèles "+")
  // ============================================================================
  {
    sku: "EK63_CELL80_PLUS",
    slug: "ek63-cell-80",
    name: "EK63 Cell 80+ Evo",
    model: "Cell 80+ Evo",
    brand: "EK63",
    productType: "canalisable",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 7.7,
    surfaceMin: 80,
    surfaceMax: 130,
    efficiency: 90.5,
    isAirtight: true,
    isConnected: true,
    isCanalizable: true,
    isHydro: false,
    hopperCapacity: 25,
    shortDescription:
      "Poêle à pellets canalisable 7,7 kW. Diffuse aussi vers une seconde pièce. Étanche, Wi-Fi E-Smart.",
    features: [...FEATURES_BBC, FEATURE_VERMICULITE, FEATURE_CANAL_1, FEATURE_VENTIL_FRONT],
    colorVariants: COLORS_STANDARD,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "EK63_BERRY90_PLUS",
    slug: "ek63-berry-90",
    name: "EK63 Berry 90+ Evo",
    model: "Berry 90+ Evo",
    brand: "EK63",
    productType: "canalisable",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 9.2,
    surfaceMin: 96,
    surfaceMax: 156,
    efficiency: 90.9,
    isAirtight: true,
    isConnected: true,
    isCanalizable: true,
    isHydro: false,
    hopperCapacity: 25,
    shortDescription:
      "Poêle à pellets canalisable 9,2 kW jusqu'à 156 m². Polyvalent, étanche, pilotage Wi-Fi E-Smart.",
    features: [...FEATURES_BBC, FEATURE_VERMICULITE, FEATURE_CANAL_1, FEATURE_VENTIL_FRONT],
    colorVariants: COLORS_STANDARD,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "EK63_LIKE90_PLUS",
    slug: "ek63-like-90",
    name: "EK63 Like 90+ Evo",
    model: "Like 90+ Evo",
    brand: "EK63",
    productType: "canalisable",
    diffusion: "ventilation-forcee",
    color: "light",
    power: 9.2,
    surfaceMin: 96,
    surfaceMax: 156,
    efficiency: 90.9,
    isAirtight: true,
    isConnected: true,
    isCanalizable: true,
    isHydro: false,
    hopperCapacity: 19,
    shortDescription:
      "Version canalisable 9,2 kW du Like 80, jusqu'à 156 m². Finition céramique premium, étanche, Wi-Fi.",
    features: [...FEATURES_BBC, FEATURE_VERMICULITE, FEATURE_CANAL_1, FEATURE_VENTIL_FRONT],
    colorVariants: COLORS_CERAMIC,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "EK63_TWEED90_PLUS",
    slug: "ek63-tweed-90",
    name: "EK63 Tweed 90+ Evo",
    model: "Tweed 90+ Evo",
    brand: "EK63",
    productType: "canalisable",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 9.2,
    surfaceMin: 96,
    surfaceMax: 156,
    efficiency: 90.9,
    isAirtight: true,
    isConnected: true,
    isCanalizable: true,
    isHydro: false,
    hopperCapacity: 19,
    shortDescription:
      "Poêle à pellets canalisable 9,2 kW. Disponible en acier ou verre, étanche, pilotage Wi-Fi.",
    features: [...FEATURES_BBC, FEATURE_VERMICULITE, FEATURE_CANAL_1, FEATURE_VENTIL_FRONT],
    colorVariants: COLORS_GLASS,
    stockStatus: "in_stock",
    deliveryDelay: "48-72h",
  },
  {
    sku: "EK63_MAISON80_PLUS",
    slug: "ek63-maison-80-plus",
    name: "EK63 Maison 80+ Evo",
    model: "Maison 80+ Evo",
    brand: "EK63",
    productType: "canalisable",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 8.0,
    surfaceMin: 84,
    surfaceMax: 137,
    efficiency: 91.5,
    isAirtight: true,
    isConnected: true,
    isCanalizable: true,
    isHydro: false,
    hopperCapacity: 25,
    shortDescription:
      "Poêle canalisable 8 kW haute efficacité (91,5%). Réservoir 25 kg, autonomie record, étanche, Wi-Fi.",
    features: [...FEATURES_BBC, FEATURE_VERMICULITE, FEATURE_CANAL_1, FEATURE_VENTIL_FRONT],
    colorVariants: COLORS_STANDARD,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "EK63_ENTITY90_PLUS",
    slug: "ek63-entity-90",
    name: "EK63 Entity 90+ Evo",
    model: "Entity 90+ Evo",
    brand: "EK63",
    productType: "canalisable",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 8.7,
    surfaceMin: 90,
    surfaceMax: 146,
    efficiency: 88.1,
    isAirtight: true,
    isConnected: true,
    isCanalizable: true,
    isHydro: false,
    hopperCapacity: 19,
    shortDescription:
      "Poêle à pellets canalisable 8,7 kW. Design urbain, étanche, pilotage Wi-Fi E-Smart.",
    features: [...FEATURES_BBC, FEATURE_VERMICULITE, FEATURE_CANAL_1, FEATURE_VENTIL_FRONT],
    colorVariants: COLORS_STANDARD,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "EK63_SPY110_PLUS",
    slug: "ek63-spy-110",
    name: "EK63 Spy 110+ Evo",
    model: "Spy 110+ Evo",
    brand: "EK63",
    productType: "canalisable",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 10.5,
    surfaceMin: 110,
    surfaceMax: 179,
    efficiency: 91.9,
    isAirtight: true,
    isConnected: true,
    isCanalizable: true,
    isHydro: false,
    hopperCapacity: 28,
    shortDescription:
      "Poêle à pellets canalisable 10,5 kW jusqu'à 179 m². Vitre Magic noire éteinte, étanche, Wi-Fi.",
    features: [
      ...FEATURES_BBC,
      FEATURE_VERMICULITE,
      FEATURE_CANAL_1,
      {
        title: "Vitre Magic noire éteinte",
        description:
          "La vitre devient totalement noire à l'arrêt, esthétique épurée qui s'intègre à tout intérieur.",
      },
    ],
    colorVariants: COLORS_GLASS,
    stockStatus: "in_stock",
    deliveryDelay: "48-72h",
  },
  {
    sku: "EK63_METRO110_PLUS",
    slug: "ek63-metro-110",
    name: "EK63 Metro 110+ Evo",
    model: "Metro 110+ Evo",
    brand: "EK63",
    productType: "canalisable",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 10.5,
    surfaceMin: 110,
    surfaceMax: 179,
    efficiency: 91.9,
    isAirtight: true,
    isConnected: true,
    isCanalizable: true,
    isHydro: false,
    hopperCapacity: 29,
    shortDescription:
      "Poêle à pellets canalisable 10,5 kW. Réservoir 29 kg, étanche, pilotage Wi-Fi E-Smart.",
    features: [...FEATURES_BBC, FEATURE_VERMICULITE, FEATURE_CANAL_1, FEATURE_VENTIL_FRONT],
    colorVariants: COLORS_STANDARD,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },

  // ============================================================================
  // POÊLES CANALISABLES DOUBLES (2 pièces supplémentaires — modèles "++")
  // ============================================================================
  {
    sku: "EK63_DUB100_DOUBLE",
    slug: "ek63-dub-100",
    name: "EK63 Dub 100++ Evo",
    model: "Dub 100++ Evo",
    brand: "EK63",
    productType: "canalisable",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 10.1,
    surfaceMin: 106,
    surfaceMax: 172,
    efficiency: 88.1,
    isAirtight: true,
    isConnected: true,
    isCanalizable: true,
    isHydro: false,
    hopperCapacity: 19,
    shortDescription:
      "Poêle à pellets double canalisable 10,1 kW. Diffuse vers deux pièces supplémentaires. Étanche, Wi-Fi.",
    features: [...FEATURES_BBC, FEATURE_VERMICULITE, FEATURE_CANAL_2, FEATURE_VENTIL_FRONT],
    colorVariants: COLORS_STANDARD,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "EK63_DAILY130_DOUBLE",
    slug: "ek63-daily-130",
    name: "EK63 Daily 130++ Evo",
    model: "Daily 130++ Evo",
    brand: "EK63",
    productType: "canalisable",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 12.5,
    surfaceMin: 130,
    surfaceMax: 211,
    efficiency: 90.2,
    isAirtight: true,
    isConnected: true,
    isCanalizable: true,
    isHydro: false,
    hopperCapacity: 29,
    shortDescription:
      "Poêle à pellets double canalisable 12,5 kW jusqu'à 211 m². Idéal grandes surfaces avec circulation.",
    features: [...FEATURES_BBC, FEATURE_VERMICULITE, FEATURE_CANAL_2, FEATURE_VENTIL_FRONT],
    colorVariants: COLORS_STANDARD,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "EK63_YUNG130_DOUBLE",
    slug: "ek63-yung-130",
    name: "EK63 Yung 130++ Evo",
    model: "Yung 130++ Evo",
    brand: "EK63",
    productType: "canalisable",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 12.5,
    surfaceMin: 130,
    surfaceMax: 211,
    efficiency: 90.2,
    isAirtight: true,
    isConnected: true,
    isCanalizable: true,
    isHydro: false,
    hopperCapacity: 28,
    shortDescription:
      "Poêle à pellets double canalisable 12,5 kW. Design contemporain, étanche, Wi-Fi E-Smart.",
    features: [...FEATURES_BBC, FEATURE_VERMICULITE, FEATURE_CANAL_2, FEATURE_VENTIL_FRONT],
    colorVariants: COLORS_STANDARD,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "EK63_MONDAY130_DOUBLE",
    slug: "ek63-monday-130",
    name: "EK63 Monday 130++ Evo",
    model: "Monday 130++ Evo",
    brand: "EK63",
    productType: "canalisable",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 12.6,
    surfaceMin: 132,
    surfaceMax: 215,
    efficiency: 90.9,
    isAirtight: true,
    isConnected: true,
    isCanalizable: true,
    isHydro: false,
    hopperCapacity: 29,
    shortDescription:
      "Poêle à pellets double canalisable 12,6 kW jusqu'à 215 m². Premium, étanche, Wi-Fi E-Smart.",
    features: [...FEATURES_BBC, FEATURE_VERMICULITE, FEATURE_CANAL_2, FEATURE_VENTIL_FRONT],
    colorVariants: COLORS_STANDARD,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },

  // ============================================================================
  // INSERTS ENCASTRABLES
  // ============================================================================
  {
    sku: "EK63_PELLEK80_EVO2",
    slug: "ek63-pellek-80",
    name: "EK63 Pellek 80 Evo²",
    model: "Pellek 80 Evo²",
    brand: "EK63",
    productType: "insert",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 8.0,
    surfaceMin: 84,
    surfaceMax: 137,
    efficiency: 91.9,
    isAirtight: false,
    isConnected: true,
    isCanalizable: false,
    isHydro: false,
    hopperCapacity: 12,
    shortDescription:
      "Insert à pellets 8 kW pour cheminée existante. Allie esthétique traditionnelle et performance pellets.",
    features: [FEATURE_INSERT, FEATURE_VERMICULITE, FEATURE_BOUGIE_CERAMIQUE, FEATURE_BBC_WIFI],
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "EK63_PELLEK100_EVO2",
    slug: "ek63-pellek-100",
    name: "EK63 Pellek 100+ Evo²",
    model: "Pellek 100+ Evo²",
    brand: "EK63",
    productType: "insert",
    diffusion: "ventilation-forcee",
    color: "dark",
    power: 10.0,
    surfaceMin: 104,
    surfaceMax: 169,
    efficiency: 90.9,
    isAirtight: false,
    isConnected: true,
    isCanalizable: true,
    isHydro: false,
    hopperCapacity: 12,
    shortDescription:
      "Insert à pellets 10 kW canalisable, jusqu'à 169 m². Pour cheminée existante avec diffusion étendue.",
    features: [FEATURE_INSERT, FEATURE_VERMICULITE, FEATURE_CANAL_1, FEATURE_BBC_WIFI],
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },

  // ============================================================================
  // THERMOPOÊLES HYDRO (raccord chauffage central)
  // ============================================================================
  {
    sku: "EK63_SPOT100H_EVO",
    slug: "ek63-spot-100h",
    name: "EK63 Spot 100 H Evo",
    model: "Spot 100 H Evo",
    brand: "EK63",
    productType: "hydro",
    diffusion: "convection-naturelle",
    color: "light",
    power: 10.1,
    surfaceMin: 106,
    surfaceMax: 172,
    efficiency: 91.2,
    isAirtight: true,
    isConnected: true,
    isCanalizable: false,
    isHydro: true,
    hopperCapacity: 16,
    shortDescription:
      "Thermopoêle hydro 10,1 kW (6,5 kW eau). Raccord chauffage central, étanche, finition céramique.",
    features: [
      FEATURE_HYDRO,
      FEATURE_BBC_AIRTIGHT,
      FEATURE_VERMICULITE,
      {
        title: "Kit hydraulique intégré",
        description:
          "Vase d'expansion fermé, circulateur et groupe de sécurité pré-câblés, installation simplifiée.",
      },
    ],
    colorVariants: COLORS_HYDRO,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "EK63_MONDAY190H_EVO",
    slug: "ek63-monday-190h",
    name: "EK63 Monday H 190 Evo",
    model: "Monday H 190 Evo",
    brand: "EK63",
    productType: "hydro",
    diffusion: "convection-naturelle",
    color: "natural",
    power: 19.2,
    surfaceMin: 200,
    surfaceMax: 325,
    efficiency: 91.7,
    isAirtight: false,
    isConnected: false,
    isCanalizable: false,
    isHydro: true,
    hopperCapacity: 25,
    shortDescription:
      "Thermopoêle hydro 19,2 kW (15,5 kW eau). Pour grande surface, remplacement chaudière mazout/gaz.",
    features: [
      FEATURE_HYDRO,
      FEATURE_VERMICULITE,
      {
        title: "Vase d'expansion fermé inclus",
        description:
          "Sécurité hydraulique pré-installée. Plusieurs kits R/RW disponibles selon présence eau chaude sanitaire.",
      },
    ],
    colorVariants: COLORS_HYDRO,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
  {
    sku: "EK63_MONDAY230H_EVO",
    slug: "ek63-monday-230h",
    name: "EK63 Monday H 230 Evo",
    model: "Monday H 230 Evo",
    brand: "EK63",
    productType: "hydro",
    diffusion: "convection-naturelle",
    color: "natural",
    power: 22.8,
    surfaceMin: 238,
    surfaceMax: 387,
    efficiency: 91.6,
    isAirtight: false,
    isConnected: false,
    isCanalizable: false,
    isHydro: true,
    hopperCapacity: 25,
    shortDescription:
      "Thermopoêle hydro 22,8 kW (19 kW eau). Le plus puissant de la gamme, pour très grandes surfaces.",
    features: [
      FEATURE_HYDRO,
      FEATURE_VERMICULITE,
      {
        title: "Production eau chaude sanitaire (kit RW)",
        description:
          "Avec le kit RW-FX optionnel, production instantanée d'eau chaude sanitaire en plus du chauffage.",
      },
    ],
    colorVariants: COLORS_HYDRO,
    stockStatus: "on_order",
    deliveryDelay: "4-6 sem.",
  },
];
