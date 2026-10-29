/**
 * MOTEUR DE CHIFFRAGE DE LA POSE, COMMUN À MISTER PELLETS ET MISTER BOIS.
 *
 * Ce fichier est IDENTIQUE dans les deux dépôts (mister-pellets-next et
 * mister-bois) : toute modification se reporte dans l'autre, à l'octet près.
 * Il ne contient aucun montant. Les prix et les remises de chaque site sont
 * dans lib/pose/tarifs.ts, le seul fichier à toucher pour changer un tarif.
 *
 * Ce qui se décide ici, pour les deux sites :
 * - les types d'évacuation des fumées et la hauteur de conduit au mètre ;
 * - l'accès en hauteur au-delà de HAUTEUR.seuilAcces (nacelle ou échafaudage) ;
 * - la canalisation d'air chaud, posée seulement si le client la demande ;
 * - les remises par prestation (forfait ET ajustements au mètre) ;
 * - le besoin de chauffe, la TVA et l'arrondi des montants.
 *
 * Tous les montants sont HORS TVA. La TVA s'applique en fin de calcul, sur le
 * total net (6 % pour un logement privé de plus de 10 ans, 21 % sinon).
 */

// =====================================================================
// 1. TARIFS ET REMISES : la forme des données de lib/pose/tarifs.ts
// =====================================================================

/** Prestations qui peuvent porter une remise. */
export type Prestation = "ventouse" | "double-paroi" | "tubage";

export const PRESTATIONS: Record<Prestation, string> = {
  ventouse: "Sortie ventouse",
  "double-paroi": "Conduit double paroi",
  tubage: "Tubage de cheminée existante",
};

export interface Remise {
  /** Pourcentage déduit, 20 pour -20 %. */
  pourcent: number;
  /** false : la prestation repasse au plein tarif partout, sans rien d'autre à changer. */
  active: boolean;
  /** Prix plein barré et badge du pourcentage à côté du prix remisé. */
  afficherPrixBarre: boolean;
}

export type Remises = Partial<Record<Prestation, Remise>>;

/** Forfait chiffré pour une hauteur de référence, puis ajusté au mètre. */
export interface ForfaitHauteur {
  /** Prix HT pour `hauteurRefM` mètres, matériel et main d'œuvre. */
  baseHT: number;
  hauteurRefM: number;
  /** Retiré par mètre sous la hauteur de référence. */
  moinsParMetreHT: number;
  /** Ajouté par mètre au-dessus de la hauteur de référence. */
  plusParMetreHT: number;
}

export interface TarifsPose {
  /** Raccordement à un conduit déjà tubé et conforme. */
  raccordementHT: number;
  tubage: ForfaitHauteur;
  doubleParoi: ForfaitHauteur;
  ventouseHT: number;
  /** Mur épais, béton, pierre ; deux sont comptés pour un conduit par l'intérieur. */
  percementRenforceHT: number;
  /** Canalisation d'air chaud : gaine, grille et finition, par pièce desservie. */
  canalisationParPieceHT: number;
  canalisationPiecesMax: number;
  /** Manutention selon l'étage. */
  etages: Record<LevelKey, number>;
  /** Prix des options de l'étape « Options ». */
  options: Record<OptionKey, number>;
  /** Évacuations proposées au client, dans l'ordre d'affichage. */
  evacuationsProposees: readonly InstallType[];
  /** Options proposées au client, dans l'ordre d'affichage. */
  optionsProposees: readonly OptionKey[];
}

// =====================================================================
// 2. ÉVACUATION DES FUMÉES
// =====================================================================

export const INSTALL_TYPES = {
  "conduit-existant": {
    label: "Conduit existant, déjà tubé",
    desc: "Cheminée déjà équipée d'un tubage conforme, il n'y a qu'à raccorder",
    prestation: null,
    hauteur: false,
    percements: 0,
    roofWork: false,
  },
  tubage: {
    label: "Tubage d'une cheminée existante",
    desc: "Conduit maçonné en place, on y descend un tubage inox flexible",
    prestation: "tubage",
    hauteur: true,
    percements: 0,
    roofWork: true,
  },
  "ventouse-facade": {
    label: "Ventouse en façade",
    desc: "Pas de cheminée : sortie horizontale concentrique à travers le mur",
    prestation: "ventouse",
    hauteur: false,
    percements: 0,
    roofWork: false,
  },
  "conduit-exterieur": {
    label: "Conduit double paroi en façade",
    desc: "Pas de cheminée : conduit isolé qui remonte le long de la façade",
    prestation: "double-paroi",
    hauteur: true,
    percements: 0,
    roofWork: true,
  },
  "conduit-toiture": {
    label: "Conduit neuf par l'intérieur",
    desc: "Pas de cheminée : conduit double paroi qui traverse les étages et la toiture",
    prestation: "double-paroi",
    hauteur: true,
    // Traversée de plancher et de toiture, au tarif du percement renforcé.
    percements: 2,
    roofWork: true,
  },
} as const satisfies Record<
  string,
  {
    label: string;
    desc: string;
    prestation: Prestation | null;
    hauteur: boolean;
    percements: number;
    roofWork: boolean;
  }
>;

export type InstallType = keyof typeof INSTALL_TYPES;

/**
 * Hauteur de conduit, réglée au mètre. Au-delà de `seuilAcces`, le client
 * choisit la nacelle (forfait) ou l'échafaudage (sur devis) : sans ce choix,
 * l'estimation ne se termine pas.
 */
export const HAUTEUR = { min: 4, max: 20, pas: 1, defaut: 10, seuilAcces: 12 } as const;

export const ACCESS_MODES = {
  nacelle: { label: "Nacelle", desc: "Location d'une nacelle à la journée, ajoutée au total" },
  echafaudage: { label: "Échafaudage", desc: "Monté pour le chantier, prix sur devis" },
} as const;

export type AccessMode = keyof typeof ACCESS_MODES;

/** Réponse à « Voulez-vous la canalisation d'air chaud ? », vide tant qu'elle n'est pas donnée. */
export type DuctsChoice = "" | "oui" | "non";

// =====================================================================
// 3. ÉTAGE ET OPTIONS
// =====================================================================

export const LEVELS = {
  rdc: { label: "Rez-de-chaussée" },
  "1er": { label: "1ᵉʳ étage" },
  "2e": { label: "2ᵉ étage ou plus" },
} as const;

export type LevelKey = keyof typeof LEVELS;

/** `roofOnly` : proposée seulement si le chantier touche au toit. */
export const OPTIONS = {
  depose: {
    label: "Dépose de l'ancien appareil",
    desc: "Démontage et évacuation en déchetterie agréée",
    roofOnly: false,
  },
  carottage: {
    label: "Percement renforcé",
    desc: "Mur de plus de 40 cm, béton ou pierre de pays",
    roofOnly: false,
  },
  thermostat: {
    label: "Thermostat d'ambiance, portatif ou fixe",
    desc: "Modèle portatif ou fixé au mur, pour régler la température depuis la pièce",
    roofOnly: false,
  },
  nacelle: {
    label: "Location d'une nacelle (1 jour)",
    desc: "Toiture haute ou d'accès difficile, jusqu'à 21 m de hauteur",
    roofOnly: true,
  },
} as const;

export type OptionKey = keyof typeof OPTIONS;

// =====================================================================
// 4. BESOIN DE CHAUFFE
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

/** Surface à chauffer (m²) : bornes du curseur. */
export const SURFACE = { min: 20, max: 300, pas: 5, defaut: 100 } as const;

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

/** Les appareils dont la puissance colle au besoin d'abord, du plus proche au plus éloigné. */
export function rankByNeed<T extends { powerKw: number }>(products: T[], needKw: number): T[] {
  return [...products].sort((a, b) => {
    const aFit = isWellSized(a.powerKw, needKw) ? 0 : 1;
    const bFit = isWellSized(b.powerKw, needKw) ? 0 : 1;
    if (aFit !== bFit) return aFit - bFit;
    return Math.abs(a.powerKw - needKw) - Math.abs(b.powerKw - needKw);
  });
}

// =====================================================================
// 5. TVA ET ARRONDIS
// =====================================================================

/**
 * TVA 6 % pour la rénovation d'un logement privé de plus de 10 ans, appareil
 * fourni ET posé par l'entrepreneur ; 21 % pour un logement plus récent ou un
 * usage professionnel. Les appareils au bois et aux pellets gardent le 6 %.
 */
export const VAT = { reduced: 0.06, standard: 0.21 } as const;

export const vatRate = (housingOver10Years: boolean): number =>
  housingOver10Years ? VAT.reduced : VAT.standard;

/** Arrondi au cent : 2 575 × 0,9 tombe sur 2 317,50 et non sur 2 317,4999… */
export const roundCents = (n: number): number => Math.round(n * 100) / 100;

/** TVA et total TVAC à l'euro, à partir d'un net HT. */
export function withVat(netHT: number, rate: number): { vat: number; total: number } {
  const vat = Math.round(netHT * rate);
  return { vat, total: Math.round(netHT + vat) };
}

/** « 1 720 € » pour un montant rond, « 2 317,50 € » sinon. */
export function formatEur(n: number): string {
  const v = roundCents(n);
  const digits = Number.isInteger(v) ? 0 : 2;
  return `${v.toLocaleString("fr-BE", { minimumFractionDigits: digits, maximumFractionDigits: digits })} €`;
}

// =====================================================================
// 6. REMISES ET PRIX D'UNE ÉVACUATION
// =====================================================================

/** Remise en vigueur sur la prestation, null si aucune ou si elle est coupée. */
export function activeDiscount(prestation: Prestation | null, remises: Remises): Remise | null {
  if (!prestation) return null;
  const r = remises[prestation];
  return r && r.active && r.pourcent > 0 ? r : null;
}

/** Forfait ajusté à la hauteur réelle, avant remise. */
export function heightPriceHT(f: ForfaitHauteur, hauteurM: number): number {
  const delta = hauteurM - f.hauteurRefM;
  const adjust = delta >= 0 ? delta * f.plusParMetreHT : delta * f.moinsParMetreHT;
  return roundCents(f.baseHT + adjust);
}

export interface PriceWithDiscount {
  /** Prix plein HT, avant remise. */
  fullHT: number;
  /** Prix facturé HT. */
  amountHT: number;
  /** Pourcentage déduit, 0 sans remise. */
  discountPct: number;
  /** Prix plein à barrer à côté du prix remisé. */
  showStrike: boolean;
}

export function applyDiscount(fullHT: number, remise: Remise | null): PriceWithDiscount {
  if (!remise) return { fullHT, amountHT: fullHT, discountPct: 0, showStrike: false };
  return {
    fullHT,
    amountHT: roundCents(fullHT * (1 - remise.pourcent / 100)),
    discountPct: remise.pourcent,
    showStrike: remise.afficherPrixBarre,
  };
}

/**
 * Prix de l'évacuation seule (sans les percements du conduit intérieur), à la
 * hauteur donnée. La remise couvre le forfait et l'ajustement au mètre.
 */
export function evacuationPrice(
  type: InstallType,
  hauteurM: number,
  tarifs: TarifsPose,
  remises: Remises,
): PriceWithDiscount {
  const cfg = INSTALL_TYPES[type];
  const full =
    cfg.prestation === "tubage"
      ? heightPriceHT(tarifs.tubage, hauteurM)
      : cfg.prestation === "double-paroi"
        ? heightPriceHT(tarifs.doubleParoi, hauteurM)
        : cfg.prestation === "ventouse"
          ? tarifs.ventouseHT
          : tarifs.raccordementHT;
  return applyDiscount(full, activeDiscount(cfg.prestation, remises));
}

/** Forfait de hauteur de la prestation, pour les textes d'aide (« X m compris »). */
export function heightRule(type: InstallType, tarifs: TarifsPose): ForfaitHauteur | null {
  const p = INSTALL_TYPES[type].prestation;
  return p === "tubage" ? tarifs.tubage : p === "double-paroi" ? tarifs.doubleParoi : null;
}

// =====================================================================
// 7. ÉTAT DU CONFIGURATEUR ET LIGNES DE POSE
// =====================================================================

/** Réponses qui touchent à la pose, communes aux deux configurateurs. */
export interface PoseState {
  installType: InstallType;
  conduitM: number;
  /** Mode d'accès au-delà de HAUTEUR.seuilAcces, vide tant qu'il n'est pas choisi. */
  access: AccessMode | "";
  ducts: DuctsChoice;
  ductRooms: number;
  level: LevelKey;
  housingOver10Years: boolean;
  opt: Partial<Record<OptionKey, boolean>>;
}

export const DEFAULT_POSE: PoseState = {
  installType: "tubage",
  conduitM: HAUTEUR.defaut,
  access: "",
  ducts: "",
  ductRooms: 1,
  level: "rdc",
  housingOver10Years: true,
  opt: {},
};

export interface EstimateLine {
  key: string;
  label: string;
  /** Montant HT facturé ; 0 pour une ligne sur devis. */
  amountHT: number;
  /** Prix plein HT quand une remise s'applique. */
  fullHT?: number;
  discountPct?: number;
  /** Afficher le prix plein barré et le badge. */
  showStrike?: boolean;
  /** Ligne sans prix : chiffrée sur devis. */
  onQuote?: boolean;
}

export interface PoseContext {
  tarifs: TarifsPose;
  remises: Remises;
  /** Le poêle choisi est canalisable : la question de la canalisation est posée. */
  canalisable: boolean;
  /** Supplément propre au type d'appareil (hydro, insert), déjà libellé. */
  supplement?: { label: string; amountHT: number } | null;
  /** Pose saisie sur la fiche du produit (HT) : remplace le forfait d'évacuation. */
  productPose?: { label: string; amountHT: number } | null;
}

/** La hauteur demande un choix d'accès (nacelle ou échafaudage). */
export const needsAccess = (s: Pick<PoseState, "installType" | "conduitM">): boolean =>
  INSTALL_TYPES[s.installType].hauteur && s.conduitM > HAUTEUR.seuilAcces;

export type MissingAnswer = "access" | "ducts";

/** Réponses obligatoires encore vides : l'estimation ne peut pas se terminer sans elles. */
export function missingAnswers(s: PoseState, canalisable: boolean): MissingAnswer[] {
  const out: MissingAnswer[] = [];
  if (needsAccess(s) && !s.access) out.push("access");
  if (canalisable && !s.ducts) out.push("ducts");
  return out;
}

/** L'échafaudage est retenu : une partie du prix viendra du devis. */
export const hasQuoteOnly = (s: PoseState): boolean => needsAccess(s) && s.access === "echafaudage";

/** Option affichée à l'étape « Options » pour cet état. */
export function optionShown(key: OptionKey, s: PoseState, tarifs: TarifsPose): boolean {
  if (!tarifs.optionsProposees.includes(key)) return false;
  if (OPTIONS[key].roofOnly && !INSTALL_TYPES[s.installType].roofWork) return false;
  // Au-delà du seuil, l'accès se choisit à l'étape de l'évacuation.
  if (key === "nacelle" && needsAccess(s)) return false;
  return true;
}

/** Main d'œuvre et fournitures de pose, ligne par ligne (montants HT). */
export function poseLines(s: PoseState, ctx: PoseContext): EstimateLine[] {
  const { tarifs } = ctx;
  const cfg = INSTALL_TYPES[s.installType];
  const lines: EstimateLine[] = [];

  if (ctx.productPose && ctx.productPose.amountHT > 0) {
    lines.push({ key: "pose", label: ctx.productPose.label, amountHT: ctx.productPose.amountHT });
  } else {
    const price = evacuationPrice(s.installType, s.conduitM, tarifs, ctx.remises);
    lines.push({
      key: "pose",
      label: `Pose et raccordement · ${cfg.label}${cfg.hauteur ? `, ${s.conduitM} m` : ""}`,
      amountHT: price.amountHT,
      ...(price.discountPct > 0
        ? { fullHT: price.fullHT, discountPct: price.discountPct, showStrike: price.showStrike }
        : {}),
    });
    if (cfg.percements > 0) {
      lines.push({
        key: "percements",
        label: `Percements renforcés du plancher et de la toiture (${cfg.percements})`,
        amountHT: cfg.percements * tarifs.percementRenforceHT,
      });
    }
  }

  if (needsAccess(s) && s.access === "nacelle") {
    lines.push({
      key: "acces",
      label: `Location d'une nacelle (conduit de plus de ${HAUTEUR.seuilAcces} m)`,
      amountHT: tarifs.options.nacelle,
    });
  } else if (needsAccess(s) && s.access === "echafaudage") {
    lines.push({
      key: "acces",
      label: `Échafaudage (conduit de plus de ${HAUTEUR.seuilAcces} m)`,
      amountHT: 0,
      onQuote: true,
    });
  }

  if (ctx.supplement && ctx.supplement.amountHT > 0) {
    lines.push({ key: "kind", label: ctx.supplement.label, amountHT: ctx.supplement.amountHT });
  }

  if (ctx.canalisable && s.ducts === "oui") {
    const rooms = Math.min(Math.max(1, s.ductRooms), tarifs.canalisationPiecesMax);
    lines.push({
      key: "ducts",
      label: `Canalisation d'air chaud (${rooms} pièce${rooms > 1 ? "s" : ""})`,
      amountHT: rooms * tarifs.canalisationParPieceHT,
    });
  }

  const levelHT = tarifs.etages[s.level];
  if (levelHT > 0) {
    lines.push({ key: "level", label: `Manutention · ${LEVELS[s.level].label}`, amountHT: levelHT });
  }

  for (const key of tarifs.optionsProposees) {
    if (!s.opt[key] || !optionShown(key, s, tarifs)) continue;
    lines.push({ key, label: OPTIONS[key].label, amountHT: tarifs.options[key] });
  }

  return lines;
}

/** Total HT des lignes (les lignes sur devis comptent pour 0). */
export const sumLines = (lines: EstimateLine[]): number =>
  roundCents(lines.reduce((a, l) => a + l.amountHT, 0));

/** Ce que la remise fait gagner sur la pose, HT. */
export const discountTotal = (lines: EstimateLine[]): number =>
  roundCents(lines.reduce((a, l) => a + (l.fullHT !== undefined ? l.fullHT - l.amountHT : 0), 0));

// =====================================================================
// 8. LECTURE DES RÉPONSES REÇUES PAR L'API
// =====================================================================

const has = (o: object, k: unknown): boolean =>
  typeof k === "string" && Object.prototype.hasOwnProperty.call(o, k);

/**
 * Réponses de pose envoyées par le navigateur : listes blanches et bornes.
 * Retourne null si l'évacuation n'est pas proposée sur le site.
 */
export function sanitizePose(raw: Record<string, unknown>, tarifs: TarifsPose): PoseState | null {
  const installType = has(INSTALL_TYPES, raw.installType) ? (raw.installType as InstallType) : null;
  if (!installType || !tarifs.evacuationsProposees.includes(installType)) return null;

  const m = Number(raw.conduitM);
  const conduitM = Number.isFinite(m)
    ? Math.min(HAUTEUR.max, Math.max(HAUTEUR.min, Math.round(m)))
    : HAUTEUR.defaut;
  const rooms = Number(raw.ductRooms);
  const ductRooms = Number.isFinite(rooms)
    ? Math.min(tarifs.canalisationPiecesMax, Math.max(1, Math.round(rooms)))
    : 1;

  const opt: Partial<Record<OptionKey, boolean>> = {};
  if (raw.opt && typeof raw.opt === "object") {
    for (const k of tarifs.optionsProposees) {
      if ((raw.opt as Record<string, unknown>)[k] === true) opt[k] = true;
    }
  }

  return {
    installType,
    conduitM,
    access: has(ACCESS_MODES, raw.access) ? (raw.access as AccessMode) : "",
    ducts: raw.ducts === "oui" || raw.ducts === "non" ? raw.ducts : "",
    ductRooms,
    level: has(LEVELS, raw.level) ? (raw.level as LevelKey) : "rdc",
    housingOver10Years: raw.housingOver10Years !== false,
    opt,
  };
}

/** « Tubage d'une cheminée existante, 14 m, accès par nacelle » : récap et e-mails. */
export function describeEvacuation(s: PoseState): string {
  const cfg = INSTALL_TYPES[s.installType];
  const access = !needsAccess(s)
    ? ""
    : s.access === "nacelle"
      ? ", accès par nacelle"
      : s.access === "echafaudage"
        ? ", échafaudage sur devis"
        : ", accès à préciser";
  return `${cfg.label}${cfg.hauteur ? `, ${s.conduitM} m` : ""}${access}`;
}

/** Lignes de pose en clair, pour la fiche admin et l'e-mail interne. */
export function describePose(s: PoseState, canalisable: boolean): string[] {
  return [
    `Évacuation : ${describeEvacuation(s)}`,
    canalisable
      ? `Canalisation d'air chaud : ${s.ducts === "oui" ? `oui, ${s.ductRooms} pièce${s.ductRooms > 1 ? "s" : ""}` : s.ducts === "non" ? "non" : "non précisée"}`
      : "",
    `Emplacement : ${LEVELS[s.level].label} · Logement de plus de 10 ans : ${s.housingOver10Years ? "oui" : "non"}`,
  ].filter(Boolean);
}
