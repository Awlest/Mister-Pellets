/**
 * Moteur de chiffrage du configurateur d'estimation (/estimation).
 *
 * Le MATÉRIEL vient du catalogue Payload (prix HT/TTC réels saisis dans
 * l'admin). Tout ce qui est ici, c'est la MAIN D'ŒUVRE et les fournitures de
 * pose.
 *
 * Les forfaits d'évacuation, les options et la canalisation d'air chaud sont
 * les tarifs communiqués par Mister Pellets le 22/09/2026 (montants HORS TVA).
 * Les postes encore marqués « À CALIBRER » (raccordement hydro, insert, étage)
 * restent des budgets approximatifs. Dans tous les cas le configurateur produit
 * une ESTIMATION : le prix ferme est établi après la visite technique. Pour
 * ajuster un montant, il suffit de modifier les constantes ci-dessous, l'UI et
 * les totaux suivent.
 *
 * La TVA est appliquée en fin de calcul (6 % en rénovation privée d'un logement
 * de plus de 10 ans, 21 % sinon), sur le matériel comme sur la pose.
 */

import { BONUS, isBonusPeriod } from "./bonus";

// =====================================================================
// 1. ÉVACUATION DES FUMÉES : le poste de main d'œuvre principal
// =====================================================================

/**
 * Percement renforcé (mur de plus de 40 cm, béton, pierre de pays) : proposé en
 * option à l'unité, et compris deux fois dans le conduit neuf par l'intérieur
 * (traversée de plancher et de toiture). Tarif client 22/09/2026.
 */
export const PERCEMENT_RENFORCE_HT = 180;

/**
 * Conduit neuf double paroi isolé : forfait pour les CONDUIT_INCLUDED_M premiers
 * mètres, puis au mètre. Même tarif que le conduit parte en façade ou traverse
 * la maison, le conduit intérieur ajoute seulement ses deux percements.
 */
const CONDUIT_NEUF_HT = 2650;
const CONDUIT_NEUF_PER_M_HT = 200;

/**
 * Type de sortie des fumées. C'est ce qui fait varier le plus la pose : un
 * conduit déjà tubé et conforme se raccorde en une demi-journée, un conduit
 * neuf traversant deux étages et la toiture, c'est deux jours à deux.
 * Forfaits HT communiqués par le client le 22/09/2026.
 */
export const INSTALL_TYPES = {
  "conduit-existant": {
    label: "Conduit existant, déjà tubé",
    desc: "Cheminée déjà équipée d'un tubage conforme, il n'y a qu'à raccorder",
    laborHT: 950,
    perMeter: 0,
    roofWork: false,
  },
  tubage: {
    label: "Tubage d'une cheminée existante",
    desc: "Conduit maçonné en place, on y descend un tubage inox flexible",
    laborHT: 1625, // tubage de CONDUIT_INCLUDED_M mètres compris
    perMeter: 75, // €/m HT au-delà de CONDUIT_INCLUDED_M
    roofWork: true,
  },
  "ventouse-facade": {
    label: "Ventouse en façade",
    desc: "Pas de cheminée : sortie horizontale concentrique à travers le mur",
    laborHT: 1300,
    perMeter: 0,
    roofWork: false,
  },
  "conduit-exterieur": {
    label: "Conduit extérieur en façade",
    desc: "Pas de cheminée : conduit double paroi qui remonte le long de la façade",
    laborHT: CONDUIT_NEUF_HT,
    perMeter: CONDUIT_NEUF_PER_M_HT,
    roofWork: true,
  },
  "conduit-toiture": {
    label: "Conduit neuf par l'intérieur",
    desc: "Pas de cheminée : conduit isolé qui traverse les étages et la toiture, deux percements renforcés compris",
    laborHT: CONDUIT_NEUF_HT + 2 * PERCEMENT_RENFORCE_HT,
    perMeter: CONDUIT_NEUF_PER_M_HT,
    roofWork: true,
  },
} as const;

export type InstallType = keyof typeof INSTALL_TYPES;

/** Mètres de conduit compris dans le forfait, au-delà on compte au mètre. */
export const CONDUIT_INCLUDED_M = 6;
/** Hauteur de conduit maximale proposée au curseur. */
export const CONDUIT_MAX_M = 14;

// =====================================================================
// 2. TYPE DE POÊLE — supplément de main d'œuvre
// =====================================================================

/**
 * Ce que le poêle implique en plus du conduit. Un hydro, c'est un chantier de
 * chauffagiste (raccordement au circuit, vase d'expansion, circulateur, vanne
 * thermostatique) ; un canalisable demande des gaines dans les cloisons.
 * `productTypes` fait le lien avec le champ `productType` de Payload.
 */
export const STOVE_KINDS = {
  standard: {
    label: "Poêle classique",
    desc: "Chauffe la pièce de vie et ce qui l'entoure",
    productTypes: ["standard"],
    extraHT: 0,
    ducts: false,
  },
  canalisable: {
    label: "Canalisable",
    desc: "Envoie l'air chaud dans une ou plusieurs autres pièces par des gaines",
    productTypes: ["canalisable"],
    extraHT: 0,
    ducts: true, // le coût dépend du nombre de pièces à desservir
  },
  hydro: {
    label: "Hydro",
    desc: "Raccordé aux radiateurs ou au plancher chauffant, et à l'eau chaude",
    productTypes: ["hydro"],
    extraHT: 1600, // raccordement hydraulique complet — À CALIBRER
    ducts: false,
  },
  hybride: {
    label: "Hybride bois + pellets",
    desc: "Fonctionne aux bûches comme aux pellets",
    productTypes: ["hybride"],
    extraHT: 0,
    ducts: false,
  },
  // Bois + pellets ET raccordé à l'eau : même chantier de chauffagiste qu'un
  // hydro, donc même supplément de raccordement (validé par le client le
  // 19/09/2026, montant à revoir avec le reste des forfaits).
  "hybride-hydro": {
    label: "Hybride hydro",
    desc: "Brûle des bûches ou des pellets et alimente les radiateurs ou le plancher chauffant",
    productTypes: ["hybride-hydro"],
    extraHT: 1600, // raccordement hydraulique complet — À CALIBRER
    ducts: false,
  },
  insert: {
    label: "Insert encastrable",
    desc: "S'encastre dans une cheminée existante à la place du foyer ouvert",
    productTypes: ["insert"],
    extraHT: 550, // dépose du foyer + adaptation de l'habillage — À CALIBRER
    ducts: false,
  },
} as const;

export type StoveKind = keyof typeof STOVE_KINDS;

/**
 * Canalisation d'air chaud : gaine, grille et finition, par pièce desservie.
 * Une ou deux pièces au maximum. Tarif client 22/09/2026.
 */
export const DUCT_PER_ROOM_HT = 300;
export const DUCT_ROOMS_MAX = 2;

// =====================================================================
// 3. ACCÈS ET OPTIONS
// =====================================================================

/** Majoration de manutention selon l'étage (un poêle pèse 90 à 250 kg). */
export const LEVELS = {
  rdc: { label: "Rez-de-chaussée", extraHT: 0 },
  "1er": { label: "1ᵉʳ étage", extraHT: 150 }, // À CALIBRER
  "2e": { label: "2ᵉ étage ou plus", extraHT: 300 }, // À CALIBRER
} as const;

export type LevelKey = keyof typeof LEVELS;

/**
 * Options de pose, tarifs client 22/09/2026. `roofOnly` = proposée seulement si
 * le chantier touche au toit.
 */
export const OPTIONS = {
  depose: {
    label: "Dépose de l'ancien appareil",
    desc: "Démontage et évacuation en déchetterie agréée",
    priceHT: 250,
    roofOnly: false,
  },
  carottage: {
    label: "Percement renforcé",
    desc: "Mur de plus de 40 cm, béton ou pierre de pays",
    priceHT: PERCEMENT_RENFORCE_HT,
    roofOnly: false,
  },
  thermostat: {
    label: "Thermostat d'ambiance, portatif ou fixe",
    desc: "Modèle portatif ou fixé au mur, pour régler la température depuis la pièce",
    priceHT: 280,
    roofOnly: false,
  },
  nacelle: {
    label: "Location d'une nacelle (1 jour)",
    desc: "Toiture haute ou d'accès difficile, jusqu'à 21 m de hauteur",
    priceHT: 350,
    roofOnly: true,
  },
} as const;

export type OptionKey = keyof typeof OPTIONS;

// =====================================================================
// 4. DIMENSIONNEMENT
// =====================================================================

/**
 * Besoin de chauffage approximatif, en W par m². Ordres de grandeur usuels en
 * Wallonie selon l'état du bâti ; la puissance exacte se valide sur place
 * (hauteur sous plafond, orientation, volumes ouverts…).
 */
export const ISO = {
  recent: { label: "Récente ou bien isolée", desc: "PEB A ou B", wattsPerM2: 70 },
  bonne: { label: "Correctement isolée", desc: "PEB C ou D", wattsPerM2: 100 },
  moyenne: { label: "Isolation partielle", desc: "PEB E", wattsPerM2: 120 },
  ancienne: { label: "Peu ou pas isolée", desc: "PEB F ou G", wattsPerM2: 150 },
} as const;

export type IsoKey = keyof typeof ISO;

/** Correspondance PEB → niveau d'isolation, pour réutiliser une réponse PEB. */
export const PEB_TO_ISO: Record<string, IsoKey> = {
  A: "recent",
  B: "recent",
  C: "bonne",
  D: "bonne",
  E: "moyenne",
  F: "ancienne",
  G: "ancienne",
};

/** Puissance conseillée en kW, arrondie à 0,1 kW. */
export const recommendedKw = (surfaceM2: number, iso: IsoKey): number =>
  +((surfaceM2 * ISO[iso].wattsPerM2) / 1000).toFixed(1);

/**
 * Fenêtre de puissance acceptable autour du besoin. Un poêle très surdimensionné
 * tourne au ralenti, s'encrasse et chauffe mal ; sous-dimensionné, il tourne à
 * fond en permanence.
 */
export const POWER_WINDOW = { min: 0.75, max: 1.45 } as const;

export const isWellSized = (powerKw: number, needKw: number): boolean =>
  powerKw >= needKw * POWER_WINDOW.min && powerKw <= needKw * POWER_WINDOW.max;

// =====================================================================
// 5. TVA
// =====================================================================

/**
 * TVA 6 % pour la rénovation d'un logement privé de plus de 10 ans (travaux
 * facturés par l'entrepreneur, mention obligatoire sur la facture) ; 21 % pour
 * un logement plus récent ou un usage professionnel.
 */
export const VAT = { reduced: 0.06, standard: 0.21 } as const;

export const vatRate = (housingOver10Years: boolean): number =>
  housingOver10Years ? VAT.reduced : VAT.standard;

// =====================================================================
// 6. PRIME HABITATION WALLONIE
// =====================================================================

/**
 * Prime « poêle à pellets » : base 160 € multipliée par le coefficient de la
 * catégorie de revenus, plafonnée à un pourcentage du coût total TVAC.
 * Source : page /primes-energie-wallonie-2026 du site (régime en vigueur depuis
 * le 14 février 2025). Un audit logement préalable est obligatoire.
 */
export const PRIME_BASE = 160;

export const PRIME_CATEGORIES = {
  R1: { label: "R1 — jusqu'à 24 600 €", coef: 6, capRatio: 0.7 },
  R2: { label: "R2 — de 24 601 à 39 300 €", coef: 4, capRatio: 0.7 },
  R3: { label: "R3 — de 39 301 à 58 900 €", coef: 2, capRatio: 0.5 },
  R4: { label: "R4 — au-delà de 58 900 €", coef: 1, capRatio: 0.5 },
  inconnu: { label: "Je ne sais pas encore", coef: 0, capRatio: 0 },
} as const;

export type PrimeCategory = keyof typeof PRIME_CATEGORIES;

/** Prime estimée, plafond compris. 0 si la catégorie n'est pas renseignée. */
export const primeEstimate = (category: PrimeCategory, totalTTC: number): number => {
  const c = PRIME_CATEGORIES[category];
  if (!c || c.coef === 0) return 0;
  return Math.min(PRIME_BASE * c.coef, Math.round(totalTTC * c.capRatio));
};

// =====================================================================
// 7. ÉTAT DU CONFIGURATEUR ET CALCUL
// =====================================================================

/**
 * Une option chiffrable du catalogue : un poêle à une puissance donnée.
 *
 * Une fiche produit qui regroupe plusieurs puissances en variantes (ex. Girolami
 * Sharp en 14, 18, 22 et 26 kW) donne donc PLUSIEURS options, chacune avec le
 * prix de sa variante. `key` identifie l'option, `slug` reste celui de la fiche.
 */
export interface EstimateProduct {
  key: string;
  slug: string;
  name: string;
  brand: string;
  productType: string;
  powerKw: number;
  /** true si la puissance vient d'une variante et non du champ principal. */
  fromVariant?: boolean;
  /** Prix matériel HT (€) — source du calcul, la TVA est appliquée ensuite. */
  priceHT: number;
  priceTTC?: number;
  /** Pose propre au produit saisie dans l'admin (HT), sinon forfait par type. */
  installationHT?: number;
  imageSrc?: string;
  isHydro?: boolean;
  heatedVolumeM3?: number;
}

export interface EstimateState {
  installType: InstallType;
  conduitM: number;
  stoveKind: StoveKind;
  ductRooms: number;
  surface: number;
  iso: IsoKey;
  level: LevelKey;
  housingOver10Years: boolean;
  /** Clé de l'option chiffrable choisie (cf. EstimateProduct.key). */
  productKey: string | null;
  opt: Partial<Record<OptionKey, boolean>>;
  primeCategory: PrimeCategory;
  financeMonths: number | null;
}

export const DEFAULT_STATE: EstimateState = {
  installType: "tubage",
  conduitM: CONDUIT_INCLUDED_M,
  stoveKind: "standard",
  ductRooms: 2,
  surface: 100,
  iso: "bonne",
  level: "rdc",
  housingOver10Years: true,
  productKey: null,
  opt: {},
  primeCategory: "inconnu",
  financeMonths: null,
};

export interface EstimateLine {
  key: string;
  label: string;
  amountHT: number;
}

export interface EstimateResult {
  /** Détail de la main d'œuvre et des fournitures de pose. */
  laborLines: EstimateLine[];
  materialHT: number;
  laborHT: number;
  subtotalHT: number;
  /** Bonus de saison déduit du prix HT du poêle (la pose n'est pas remisée), 0 hors période. */
  bonusHT: number;
  vatRate: number;
  vatAmount: number;
  totalTTC: number;
  prime: number;
  netAfterPrime: number;
  needKw: number;
  wellSized: boolean | null;
}

/** Main d'œuvre + fournitures de pose, ligne par ligne (montants HT). */
export function laborLines(s: EstimateState, product?: EstimateProduct | null): EstimateLine[] {
  const cfg = INSTALL_TYPES[s.installType];
  const lines: EstimateLine[] = [];

  // Une pose saisie sur le produit dans l'admin prime sur le forfait par type.
  if (product?.installationHT && product.installationHT > 0) {
    lines.push({ key: "pose", label: `Pose ${product.name}`, amountHT: product.installationHT });
  } else {
    lines.push({ key: "pose", label: `Pose et raccordement · ${cfg.label}`, amountHT: cfg.laborHT });
  }

  if (cfg.perMeter > 0) {
    const extra = Math.max(0, s.conduitM - CONDUIT_INCLUDED_M);
    if (extra > 0) {
      lines.push({
        key: "conduit",
        label: `Conduit supplémentaire (+${extra} m)`,
        amountHT: extra * cfg.perMeter,
      });
    }
  }

  const kind = STOVE_KINDS[s.stoveKind];
  if (kind.extraHT > 0) {
    lines.push({ key: "kind", label: `Supplément ${kind.label.toLowerCase()}`, amountHT: kind.extraHT });
  }
  if (kind.ducts) {
    const rooms = Math.min(Math.max(1, s.ductRooms), DUCT_ROOMS_MAX);
    lines.push({
      key: "ducts",
      label: `Canalisation d'air chaud (${rooms} pièce${rooms > 1 ? "s" : ""})`,
      amountHT: rooms * DUCT_PER_ROOM_HT,
    });
  }

  const level = LEVELS[s.level];
  if (level.extraHT > 0) {
    lines.push({ key: "level", label: `Manutention · ${level.label}`, amountHT: level.extraHT });
  }

  for (const key of Object.keys(OPTIONS) as OptionKey[]) {
    if (!s.opt[key]) continue;
    if (OPTIONS[key].roofOnly && !cfg.roofWork) continue;
    lines.push({ key, label: OPTIONS[key].label, amountHT: OPTIONS[key].priceHT });
  }

  return lines;
}

/**
 * Chiffrage complet à partir de l'état du configurateur et du poêle choisi.
 * `opts.bonus` force l'application (ou non) du bonus de saison ; par défaut il
 * suit la date du jour. Le navigateur le calcule après hydratation pour que le
 * HTML rendu côté serveur (mis en cache jusqu'à 60 s) ne diffère pas du rendu client.
 */
export function estimate(
  s: EstimateState,
  product?: EstimateProduct | null,
  opts?: { bonus?: boolean },
): EstimateResult {
  const lines = laborLines(s, product);
  const labor = lines.reduce((a, l) => a + l.amountHT, 0);
  const material = product?.priceHT ?? 0;
  const subtotalHT = material + labor;
  const bonusHT = (opts?.bonus ?? isBonusPeriod()) ? Math.round(material * BONUS.rate) : 0;
  const netHT = subtotalHT - bonusHT;
  const rate = vatRate(s.housingOver10Years);
  const vat = Math.round(netHT * rate);
  const totalTTC = Math.round(netHT + vat);
  const prime = primeEstimate(s.primeCategory, totalTTC);
  const needKw = recommendedKw(s.surface, s.iso);

  return {
    laborLines: lines,
    materialHT: material,
    laborHT: labor,
    subtotalHT,
    bonusHT,
    vatRate: rate,
    vatAmount: vat,
    totalTTC,
    prime,
    netAfterPrime: Math.max(0, totalTTC - prime),
    needKw,
    wellSized: product ? isWellSized(product.powerKw, needKw) : null,
  };
}

/**
 * Classe les poêles du catalogue pour le besoin exprimé : d'abord ceux dont la
 * puissance tombe dans la fenêtre acceptable (du plus proche du besoin au plus
 * éloigné), ensuite les autres.
 */
export function rankProducts(products: EstimateProduct[], needKw: number): EstimateProduct[] {
  return [...products].sort((a, b) => {
    const aFit = isWellSized(a.powerKw, needKw) ? 0 : 1;
    const bFit = isWellSized(b.powerKw, needKw) ? 0 : 1;
    if (aFit !== bFit) return aFit - bFit;
    return Math.abs(a.powerKw - needKw) - Math.abs(b.powerKw - needKw);
  });
}

/** Poêles compatibles avec le type d'installation choisi. */
export function filterByKind(products: EstimateProduct[], kind: StoveKind): EstimateProduct[] {
  const types = STOVE_KINDS[kind].productTypes as readonly string[];
  return products.filter((p) => types.includes(p.productType));
}

export const eur = (n: number) => Math.round(n).toLocaleString("fr-BE") + " €";
