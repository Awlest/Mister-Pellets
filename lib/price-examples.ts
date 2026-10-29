import "server-only";
import { getEstimateCatalog } from "./estimate-catalog";
import {
  DEFAULT_STATE,
  HAUTEUR,
  INSTALL_TYPES,
  VAT,
  estimate,
  type EstimateProduct,
  type EstimateState,
  type InstallType,
} from "./estimate";
import { isBonusPeriod } from "./bonus";
import { activeDiscount, applyDiscount, evacuationPrice, heightRule, roundCents } from "./pose/moteur";
import { REMISES, TARIFS } from "./pose/tarifs";

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
  /** Pose et raccordement, TVA 6 % comprise, remise de pose déduite. */
  laborTTC: number;
  /** Pose au plein tarif, TVA 6 % comprise, quand une remise s'applique. */
  laborFullTTC?: number;
  laborDiscountPct: number;
  laborShowStrike: boolean;
  /** Bonus de saison déduit, TVA 6 % comprise (0 hors période). */
  bonusTTC: number;
  /** Total TVA 6 % comprise, identique au configurateur. */
  totalTTC: number;
}

export interface InstallPrice {
  key: InstallType;
  label: string;
  desc: string;
  /** Forfait de pose, TVA 6 % et remise comprises. */
  laborTTC: number;
  /** Forfait au plein tarif, TVA 6 % comprise, quand une remise s'applique. */
  fullTTC?: number;
  discountPct: number;
  showStrike: boolean;
  /** Hauteur comprise dans le forfait (0 = sans objet). */
  heightM: number;
  /** Retiré par mètre sous la hauteur du forfait, TVA 6 % et remise comprises. */
  lessPerMeterTTC: number;
  /** Ajouté par mètre au-dessus, TVA 6 % et remise comprises. */
  morePerMeterTTC: number;
  /** Percements renforcés compris dans le forfait (conduit par l'intérieur), non remisés. */
  percements: number;
}

export interface PricePageData {
  bonus: boolean;
  /** Prix d'appel : poêle le moins cher, posé sur un conduit déjà tubé. */
  from: PriceExample | null;
  examples: PriceExample[];
  installs: InstallPrice[];
}

const withVat = (ht: number) => Math.round(ht * (1 + VAT.reduced));
/** Au cent près : sert aux ajustements au mètre, qui tombent rarement juste. */
const withVatCents = (ht: number) => roundCents(ht * (1 + VAT.reduced));

function priceExample(
  product: EstimateProduct,
  installType: InstallType,
  bonus: boolean,
): PriceExample {
  const state: EstimateState = {
    ...DEFAULT_STATE,
    installType,
    conduitM: HAUTEUR.defaut,
    stoveKind: "standard",
    housingOver10Years: true,
    productKey: product.key,
  };
  const r = estimate(state, product, { bonus });
  const laborTTC = withVat(r.laborHT);
  const discounted = r.laborLines.filter((l) => l.fullHT !== undefined);
  const laborFullHT = r.laborHT + discounted.reduce((a, l) => a + (l.fullHT! - l.amountHT), 0);
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
    laborFullTTC: discounted.length > 0 ? withVat(laborFullHT) : undefined,
    laborDiscountPct: discounted[0]?.discountPct ?? 0,
    laborShowStrike: discounted.some((l) => l.showStrike),
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

  // Forfaits de pose : mêmes prix et mêmes remises que le configurateur, à la
  // hauteur de référence du forfait.
  const installs: InstallPrice[] = TARIFS.evacuationsProposees.map((key) => {
    const t = INSTALL_TYPES[key];
    const rule = heightRule(key, TARIFS);
    const price = evacuationPrice(key, rule?.hauteurRefM ?? HAUTEUR.defaut, TARIFS, REMISES);
    const percementsHT = t.percements * TARIFS.percementRenforceHT;
    const remise = activeDiscount(t.prestation, REMISES);
    const perMeter = (ht: number) => withVatCents(applyDiscount(ht, remise).amountHT);
    return {
      key,
      label: t.label,
      desc: t.desc,
      laborTTC: withVat(price.amountHT + percementsHT),
      fullTTC: price.discountPct > 0 ? withVat(price.fullHT + percementsHT) : undefined,
      discountPct: price.discountPct,
      showStrike: price.showStrike,
      heightM: rule?.hauteurRefM ?? 0,
      lessPerMeterTTC: rule ? perMeter(rule.moinsParMetreHT) : 0,
      morePerMeterTTC: rule ? perMeter(rule.plusParMetreHT) : 0,
      percements: t.percements,
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
