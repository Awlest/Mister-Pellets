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

import { isBonusPeriod } from "./bonus";
import { stoveNetHT } from "./product-price";
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
  type EstimateLine,
  type InstallType,
  type IsoKey,
  type PoseState,
} from "./pose/moteur";
import { REMISES, TARIFS } from "./pose/tarifs";
import { formatEuros } from "./typo";

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
  /** TVA au cent, sur le net hors TVA. */
  vatAmount: number;
  /** Total TVAC au cent : net hors TVA + TVA, la somme des lignes du détail. */
  totalCents: number;
  /** Total TVAC arrondi à l'euro : le montant mis en avant (barre, e-mails, conversion). */
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
  // Bonus : la différence entre le poêle au prix catalogue et le poêle au prix
  // affiché sur la fiche (lib/product-price.ts), pour que le net hors TVA soit
  // celui de la fiche et de la liste des modèles.
  const bonusHT = (opts?.bonus ?? isBonusPeriod()) && product ? material - stoveNetHT(product, true) : 0;
  const netHT = subtotalHT - bonusHT;
  const rate = vatRate(s.housingOver10Years);
  // TVA au cent, pour que sous-total + TVA = total du détail à l'œil ; le
  // grand total est ce total arrondi à l'euro (recette du lot 3 : 5 855,50 +
  // 351 affichés pour 6 207 €).
  const vat = roundCents(netHT * rate);
  const totalCents = roundCents(netHT + vat);
  const total = Math.round(totalCents);
  const needKw = recommendedKw(s.surface, s.iso);

  return {
    laborLines: lines,
    materialHT: material,
    laborHT: labor,
    subtotalHT,
    bonusHT,
    vatRate: rate,
    vatAmount: vat,
    totalCents,
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

/**
 * Le modèle demandé par l'adresse (`/estimation?modele=<slug>`) en tête de
 * liste, suivi de ses autres puissances ; le reste garde son rang. Sans cela,
 * le poêle choisi sur la fiche se retrouvait au milieu d'une liste dépliée en
 * entier (recette du 11/11/2026).
 */
export function pinModelFirst(
  products: EstimateProduct[],
  pinned: Pick<EstimateProduct, "key" | "slug"> | null | undefined,
): EstimateProduct[] {
  if (!pinned) return products;
  const rank = (p: EstimateProduct) => (p.key === pinned.key ? 0 : p.slug === pinned.slug ? 1 : 2);
  return products
    .map((p, i) => ({ p, i }))
    .sort((a, b) => rank(a.p) - rank(b.p) || a.i - b.i)
    .map(({ p }) => p);
}

/** Poêles compatibles avec le type d'installation choisi. */
export function filterByKind(products: EstimateProduct[], kind: StoveKind): EstimateProduct[] {
  const types = STOVE_KINDS[kind].productTypes as readonly string[];
  return products.filter((p) => types.includes(p.productType));
}

/**
 * Marques sans ventouse : les notices Edilkamin interdisent la sortie murale
 * directe, modèles étanches compris (relu le 09/11/2026), et EK63 est une
 * gamme Edilkamin. Avec elles, le conduit monte au-dessus du toit.
 */
export const MARQUES_SANS_VENTOUSE: readonly string[] = ["Edilkamin", "EK63"];

/** Le poêle accepte-t-il l'évacuation choisie ? */
export const acceptsInstall = (product: Pick<EstimateProduct, "brand">, installType: InstallType): boolean =>
  installType !== "ventouse-facade" || !MARQUES_SANS_VENTOUSE.includes(product.brand);

/** Montant arrondi à l'euro, insécable (lib/typo.ts). */
export const eur = (n: number) => formatEuros(n);
/** Le même, au cent quand le montant n'est pas rond : « 127,20 € ». */
export const eurCents = (n: number) => formatEuros(n, { cents: "auto" });

/**
 * Modèle demandé par l'adresse (`/estimation?modele=<slug>`) :
 * - `priced` : il est dans le catalogue chiffré, l'estimation s'ouvre dessus
 *   (une fiche à plusieurs puissances ouvre sur la plus petite) ;
 * - `quote-only` : fiche sans aucun prix (« Sur devis ») ; l'estimation écrit
 *   « Ce modèle est chiffré sur devis » ;
 * - `not-estimable` : tout autre modèle absent du catalogue chiffré (fiche
 *   sur devis, fiche masquée, lien ancien) ; l'estimation le dit et propose un
 *   modèle chiffré ou la demande de prix, au lieu de bloquer à l'étape du
 *   modèle sans explication (vérification du 11/11/2026) ;
 * - `none` : pas de modèle demandé.
 */
export type RequestedModel =
  | { status: "none" }
  | { status: "priced"; option: EstimateProduct; kind: StoveKind }
  | { status: "quote-only" | "not-estimable"; slug: string };

/**
 * `quoteOnly` : slugs des fiches visibles sans aucun prix ; `notEstimable` :
 * fiches visibles chiffrées mais absentes de l'estimation
 * (getEstimateCatalogData, lib/estimate-catalog.ts). Un slug inconnu des deux
 * listes (fiche retirée, faute de frappe) ne donne aucun message : pas de
 * demande de prix vers une fiche en 404 (recette du lot 3).
 */
export function requestedModel(
  products: EstimateProduct[],
  search: string,
  quoteOnly: ReadonlySet<string> = new Set(),
  notEstimable: ReadonlySet<string> = new Set(),
): RequestedModel {
  const slug = new URLSearchParams(search).get("modele")?.trim();
  if (!slug) return { status: "none" };
  const option = products.find((p) => p.slug === slug);
  const kind = option
    ? (Object.keys(STOVE_KINDS) as StoveKind[]).find((k) =>
        (STOVE_KINDS[k].productTypes as readonly string[]).includes(option.productType),
      )
    : undefined;
  if (option && kind) return { status: "priced", option, kind };
  if (quoteOnly.has(slug)) return { status: "quote-only", slug };
  if (notEstimable.has(slug)) return { status: "not-estimable", slug };
  return { status: "none" };
}
