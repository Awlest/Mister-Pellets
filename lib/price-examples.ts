import "server-only";
import { getEstimateCatalog } from "./estimate-catalog";
import {
  CONDUIT_INCLUDED_M,
  DEFAULT_STATE,
  INSTALL_TYPES,
  VAT,
  estimate,
  type EstimateProduct,
  type EstimateState,
  type InstallType,
} from "./estimate";
import { isBonusPeriod } from "./bonus";

/**
 * Chiffres de la page /prix-poele-pellets, l'arrivée des annonces « prix » et
 * « devis ». Rien n'est saisi à la main : les prix viennent du catalogue
 * Payload et passent par le même moteur que le configurateur (lib/estimate.ts),
 * pour qu'un visiteur qui refait le calcul dans /estimation retombe sur le
 * même total.
 *
 * Hypothèses communes, affichées sur la page : particulier, maison de plus de
 * 10 ans (TVA 6 %), poêle classique au rez-de-chaussée, aucune option.
 */

/** Pose retenue pour les exemples : le cas le plus courant chez nos clients. */
const EXAMPLE_INSTALL: InstallType = "tubage";
/** Pose la moins chère, pour le prix d'appel « dès ». */
const FROM_INSTALL: InstallType = "conduit-existant";

/** Fourchette de puissance d'une pièce de vie ordinaire. */
const POWER_MIN_KW = 6;
const POWER_MAX_KW = 12;

export interface PriceExample {
  slug: string;
  name: string;
  /** Nom complet avec la marque, sans la répéter quand la fiche la porte déjà (« EK63 Zone 80 Evo »). */
  fullName: string;
  brand: string;
  powerKw: number;
  imageSrc?: string;
  /** Poêle, TVA 6 % comprise, avant bonus. */
  stoveTTC: number;
  /** Pose et raccordement, TVA 6 % comprise. */
  laborTTC: number;
  /** Bonus de saison déduit, TVA 6 % comprise (0 hors période). */
  bonusTTC: number;
  /** Total TVA 6 % comprise, identique au configurateur. */
  totalTTC: number;
}

export interface InstallPrice {
  key: InstallType;
  label: string;
  desc: string;
  /** Forfait de pose, TVA 6 % comprise. */
  laborTTC: number;
  /** Prix du mètre de conduit au-delà du forfait, TVA 6 % comprise (0 = sans objet). */
  perMeterTTC: number;
}

export interface PricePageData {
  bonus: boolean;
  /** Prix d'appel : poêle le moins cher, posé sur un conduit déjà tubé. */
  from: PriceExample | null;
  examples: PriceExample[];
  installs: InstallPrice[];
}

const withVat = (ht: number) => Math.round(ht * (1 + VAT.reduced));

function priceExample(
  product: EstimateProduct,
  installType: InstallType,
  bonus: boolean,
): PriceExample {
  const state: EstimateState = {
    ...DEFAULT_STATE,
    installType,
    conduitM: CONDUIT_INCLUDED_M,
    stoveKind: "standard",
    housingOver10Years: true,
    productKey: product.key,
  };
  const r = estimate(state, product, { bonus });
  const laborTTC = withVat(r.laborHT);
  const bonusTTC = withVat(r.bonusHT);
  return {
    slug: product.slug,
    name: product.name,
    fullName: product.name.toLowerCase().startsWith(product.brand.toLowerCase())
      ? product.name
      : `${product.brand} ${product.name}`,
    brand: product.brand,
    powerKw: product.powerKw,
    imageSrc: product.imageSrc,
    // Le poêle absorbe l'arrondi : les trois lignes retombent toujours
    // exactement sur le total du moteur.
    stoveTTC: r.totalTTC - laborTTC + bonusTTC,
    laborTTC,
    bonusTTC,
    totalTTC: r.totalTTC,
  };
}

/**
 * Un poêle par fiche : une fiche à plusieurs puissances donne plusieurs
 * options dans le catalogue, on garde la moins chère dans la fourchette.
 */
function cheapestPerSlug(products: EstimateProduct[]): EstimateProduct[] {
  const best = new Map<string, EstimateProduct>();
  for (const p of products) {
    const cur = best.get(p.slug);
    if (!cur || p.priceHT < cur.priceHT) best.set(p.slug, p);
  }
  return [...best.values()].sort((a, b) => a.priceHT - b.priceHT);
}

/**
 * Trois exemples répartis dans la gamme : le moins cher, le milieu et le haut
 * de gamme courant (85e centile, pour ne pas mettre en avant une pièce rare).
 */
function pickExamples(pool: EstimateProduct[]): EstimateProduct[] {
  if (pool.length <= 3) return pool;
  const idx = [0, Math.floor(pool.length / 2), Math.floor(pool.length * 0.85)];
  return [...new Set(idx)]
    .map((i) => pool[i])
    .filter((p): p is EstimateProduct => p !== undefined);
}

export async function getPricePageData(now: Date = new Date()): Promise<PricePageData> {
  const bonus = isBonusPeriod(now);
  const catalog = await getEstimateCatalog();

  // Poêles à pellets classiques seulement : ni bois, ni hybride, ni hydro, ni
  // appareil désigné autrement qu'en poêle (foyer, chaudière).
  const standard = catalog.filter(
    (p) =>
      p.productType === "standard" &&
      !p.isHydro &&
      (p.combustible ?? "pellet") === "pellet" &&
      (!p.appliance || p.appliance === "poele"),
  );
  const inRange = standard.filter((p) => p.powerKw >= POWER_MIN_KW && p.powerKw <= POWER_MAX_KW);
  const pool = cheapestPerSlug(inRange.length > 0 ? inRange : standard);

  const installs: InstallPrice[] = (Object.keys(INSTALL_TYPES) as InstallType[]).map((key) => {
    const t = INSTALL_TYPES[key];
    return {
      key,
      label: t.label,
      desc: t.desc,
      laborTTC: withVat(t.laborHT),
      perMeterTTC: t.perMeter > 0 ? withVat(t.perMeter) : 0,
    };
  });

  const cheapest = pool[0];
  return {
    bonus,
    from: cheapest ? priceExample(cheapest, FROM_INSTALL, bonus) : null,
    examples: pickExamples(pool).map((p) => priceExample(p, EXAMPLE_INSTALL, bonus)),
    installs,
  };
}

export const EXAMPLE_INSTALL_LABEL = INSTALL_TYPES[EXAMPLE_INSTALL].label;
export const FROM_INSTALL_LABEL = INSTALL_TYPES[FROM_INSTALL].label;
