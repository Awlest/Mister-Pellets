/**
 * Moteur de chiffrage du configurateur d'estimation (/estimation).
 *
 * Le MATÉRIEL vient du catalogue Payload (prix HT/TTC réels saisis dans
 * l'admin). La POSE (évacuation des fumées, hauteur au mètre, accès au-delà de
 * 12 m, canalisation, étage, options, remises) est calculée par le moteur
 * commun à Mister Pellets et Mister Bois, lib/pose/moteur.ts, avec les prix de
 * lib/pose/tarifs.ts. Ici ne restent que ce qui est propre à Mister Pellets :
 * les types de poêle du catalogue et le bonus de saison sur le poêle.
 *
 * Les postes encore marqués « À CALIBRER » (raccordement hydro, insert, étage)
 * restent des budgets approximatifs. Dans tous les cas le configurateur produit
 * une ESTIMATION : le prix ferme est établi après la visite technique.
 *
 * La TVA est appliquée en fin de calcul (6 % en rénovation privée d'un logement
 * de plus de 10 ans, 21 % sinon), sur le matériel comme sur la pose.
 */

import { bonusRateFor, isBonusPeriod } from "./bonus";
import {
  DEFAULT_POSE,
  SURFACE,
  isWellSized,
  poseLines,
  rankByNeed,
  recommendedKw,
  roundCents,
  sumLines,
  vatRate,
  withVat,
  type EstimateLine,
  type IsoKey,
  type PoseState,
} from "./pose/moteur";
import { REMISES, TARIFS } from "./pose/tarifs";

export {
  ACCESS_MODES,
  HAUTEUR,
  INSTALL_TYPES,
  ISO,
  LEVELS,
  OPTIONS,
  POWER_WINDOW,
  SURFACE,
  VAT,
  formatEur,
  isWellSized,
  recommendedKw,
  vatRate,
} from "./pose/moteur";
export type {
  AccessMode,
  DuctsChoice,
  EstimateLine,
  InstallType,
  IsoKey,
  LevelKey,
  OptionKey,
} from "./pose/moteur";
export { REMISES, TARIFS } from "./pose/tarifs";

// =====================================================================
// 1. TYPE DE POÊLE : supplément de main d'œuvre
// =====================================================================

/**
 * Ce que le poêle implique en plus du conduit. Un hydro, c'est un chantier de
 * chauffagiste (raccordement au circuit, vase d'expansion, circulateur, vanne
 * thermostatique) ; un canalisable peut envoyer l'air chaud dans d'autres
 * pièces, si le client le demande (question de l'étape 3).
 * `productTypes` fait le lien avec le champ `productType` de Payload.
 */
export const STOVE_KINDS = {
  standard: {
    label: "Poêle classique",
    desc: "Chauffe la pièce de vie et ce qui l'entoure",
    productTypes: ["standard"],
    extraHT: 0,
  },
  canalisable: {
    label: "Canalisable",
    desc: "Peut envoyer l'air chaud dans une ou deux autres pièces par des gaines",
    productTypes: ["canalisable"],
    extraHT: 0,
  },
  hydro: {
    label: "Hydro",
    desc: "Raccordé aux radiateurs ou au plancher chauffant, et à l'eau chaude",
    productTypes: ["hydro"],
    extraHT: 1600, // raccordement hydraulique complet, À CALIBRER
  },
  hybride: {
    label: "Hybride bois + pellets",
    desc: "Fonctionne aux bûches comme aux pellets",
    productTypes: ["hybride"],
    extraHT: 0,
  },
  // Bois + pellets ET raccordé à l'eau : même chantier de chauffagiste qu'un
  // hydro, donc même supplément de raccordement (validé par le client le
  // 19/09/2026, montant à revoir avec le reste des forfaits).
  "hybride-hydro": {
    label: "Hybride hydro",
    desc: "Brûle des bûches ou des pellets et alimente les radiateurs ou le plancher chauffant",
    productTypes: ["hybride-hydro"],
    extraHT: 1600, // raccordement hydraulique complet, À CALIBRER
  },
  insert: {
    label: "Insert encastrable",
    desc: "S'encastre dans une cheminée existante à la place du foyer ouvert",
    productTypes: ["insert"],
    extraHT: 550, // dépose du foyer + adaptation de l'habillage, À CALIBRER
  },
} as const;

export type StoveKind = keyof typeof STOVE_KINDS;

/** Pièces desservies au maximum par la canalisation. */
export const DUCT_ROOMS_MAX = TARIFS.canalisationPiecesMax;

// =====================================================================
// 2. ÉTAT DU CONFIGURATEUR ET CALCUL
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
  /** Combustible de la fiche (pellet, bois, hybride), pour les filtres hors configurateur. */
  combustible?: string;
  /** Nature de l'appareil saisie dans l'admin (poele, insert, foyer, chaudiere), vide = déduite du type. */
  appliance?: string;
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

export interface EstimateState extends PoseState {
  stoveKind: StoveKind;
  surface: number;
  iso: IsoKey;
  /** Clé de l'option chiffrable choisie (cf. EstimateProduct.key). */
  productKey: string | null;
  financeMonths: number | null;
}

export const DEFAULT_STATE: EstimateState = {
  ...DEFAULT_POSE,
  stoveKind: "standard",
  surface: SURFACE.defaut,
  iso: "bonne",
  productKey: null,
  financeMonths: null,
};

export interface EstimateResult {
  /** Détail de la main d'œuvre et des fournitures de pose. */
  laborLines: EstimateLine[];
  materialHT: number;
  laborHT: number;
  subtotalHT: number;
  /** Bonus de saison déduit du prix HT du poêle (le bonus ne touche pas la pose), 0 hors période. */
  bonusHT: number;
  vatRate: number;
  vatAmount: number;
  totalTTC: number;
  /** Une ligne reste sur devis (échafaudage) : le total ne la comprend pas. */
  onQuote: boolean;
  needKw: number;
  wellSized: boolean | null;
}

/** Le poêle choisi est canalisable : la question de la canalisation s'affiche. */
export const isCanalisable = (product?: EstimateProduct | null): boolean =>
  product?.productType === "canalisable";

/** Main d'œuvre + fournitures de pose, ligne par ligne (montants HT). */
export function laborLines(s: EstimateState, product?: EstimateProduct | null): EstimateLine[] {
  const kind = STOVE_KINDS[s.stoveKind];
  return poseLines(s, {
    tarifs: TARIFS,
    remises: REMISES,
    canalisable: isCanalisable(product),
    supplement: kind.extraHT > 0 ? { label: `Supplément ${kind.label.toLowerCase()}`, amountHT: kind.extraHT } : null,
    // Une pose saisie sur le produit dans l'admin prime sur le forfait d'évacuation.
    productPose:
      product?.installationHT && product.installationHT > 0
        ? { label: `Pose ${product.name}`, amountHT: product.installationHT }
        : null,
  });
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
  const labor = sumLines(lines);
  const material = product?.priceHT ?? 0;
  const subtotalHT = roundCents(material + labor);
  const bonusHT = (opts?.bonus ?? isBonusPeriod()) ? Math.round(material * bonusRateFor(product?.brand)) : 0;
  const netHT = subtotalHT - bonusHT;
  const rate = vatRate(s.housingOver10Years);
  const { vat, total } = withVat(netHT, rate);
  const needKw = recommendedKw(s.surface, s.iso);

  return {
    laborLines: lines,
    materialHT: material,
    laborHT: labor,
    subtotalHT,
    bonusHT,
    vatRate: rate,
    vatAmount: vat,
    totalTTC: total,
    onQuote: lines.some((l) => l.onQuote),
    needKw,
    wellSized: product ? isWellSized(product.powerKw, needKw) : null,
  };
}

/**
 * Classe les poêles du catalogue pour le besoin exprimé : d'abord ceux dont la
 * puissance tombe dans la fenêtre acceptable (du plus proche du besoin au plus
 * éloigné), ensuite les autres.
 */
export const rankProducts = (products: EstimateProduct[], needKw: number): EstimateProduct[] =>
  rankByNeed(products, needKw);

/** Poêles compatibles avec le type d'installation choisi. */
export function filterByKind(products: EstimateProduct[], kind: StoveKind): EstimateProduct[] {
  const types = STOVE_KINDS[kind].productTypes as readonly string[];
  return products.filter((p) => types.includes(p.productType));
}

export const eur = (n: number) => Math.round(n).toLocaleString("fr-BE") + " €";
