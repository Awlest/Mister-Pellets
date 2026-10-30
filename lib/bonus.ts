/**
 * Bonus de saison : remise sur le prix des poêles (matériel uniquement, la pose
 * n'est pas remisée) pour toute commande passée entre BONUS.from et BONUS.to
 * inclus, jour civil de Bruxelles. Taux et périmètre fixés par le client le
 * 22/09/2026. Hors période, rien ne s'affiche nulle part.
 *
 * Une seule source pour tout le site : boutique (cartes, fiche produit, schéma
 * Product), flux Google Merchant et configurateur d'estimation. Le prix remisé
 * se calcule TOUJOURS côté serveur (lib/products.ts, API d'estimation) ou
 * après hydratation (configurateur) : le navigateur ne lit jamais la date
 * lui-même, sinon le HTML mis en cache pourrait différer du rendu client.
 *
 * Cadre légal vérifié le 22/09/2026 :
 * - la remise vaut autant pour le client qui paie comptant que pour celui qui
 *   finance à 0 %. Le SPF Economie considère qu'un avantage réservé au paiement
 *   comptant est un coût du crédit : un crédit annoncé « TAEG 0 % » ne serait
 *   alors plus à 0 % (commentaire des art. VII.64, § 1er et VII.65, § 2, 8°
 *   du Code de droit économique). La mensualité à 0 % se calcule donc sur le
 *   total remisé, et le bonus ne peut pas être « non cumulable » avec lui ;
 * - les textes de la promo ne parlent pas du financement (décision du client,
 *   01/10/2026) : citer un taux impose le slogan et l'exemple représentatif
 *   (art. VII.64, lib/financing.ts), que seul le configurateur affiche, à côté
 *   de la mensualité. Le bonus reste acquis au client qui finance ;
 * - annonce de réduction de prix (art. VI.18 CDE) : partout, le prix catalogue
 *   reste affiché (barré) à côté du prix remisé, ce qui donne le prix
 *   antérieur. Ne pas relever les prix du catalogue entre le 1er septembre
 *   2026 et la fin du bonus, sinon le prix affiché n'est plus le plus bas des
 *   30 jours précédents. La pose n'étant pas remisée, ses forfaits (relevés le
 *   22/09/2026) ne sont pas concernés.
 */
export const BONUS = {
  rate: 0.15,
  from: "2026-10-01",
  to: "2026-12-24",
  /**
   * Libellé des textes qui parlent du bonus en général (accueil, boutique,
   * page prix, configurateur) : « jusqu'à », parce que le taux dépend de la
   * marque (voir `reduced`). Chaque fiche, carte ou ligne d'estimation donne
   * son taux exact (bonusLabelFor, bonusBadgeFor) à côté du prix barré.
   * Le SPF Économie admet « jusqu'à X % » quand les taux varient, mais le
   * juge trompeur si le taux maximal ne vaut que pour quelques biens (lignes
   * directrices « Annonces de réductions de prix » du 09/02/2026, point 10).
   * Ici -15 % vaut pour toutes les marques sauf Austroflamm, Cadel et MCZ :
   * si l'exception venait à couvrir la plupart des poêles chiffrés, revoir
   * l'annonce (à surveiller quand les prix MCZ seront posés).
   */
  label: "Bonus de saison jusqu'à -15 % sur le poêle",
  /** Pastille courte pour les cartes et les fiches produit (taux plein). */
  badge: "-15 %",
  // « cumulable avec la prime Habitation » retiré le 03/10/2026 : la prime
  // s'est arrêtée le 30/09/2026, aucune commande du bonus ne peut y prétendre.
  conditions:
    "Pour toute commande passée entre le 1er octobre et le 24 décembre 2026, sur le prix du poêle seul (la pose suit ses propres tarifs).",
  /**
   * Plage `sale_price_effective_date` du flux Google Merchant, ISO 8601 avec
   * fuseau : heure d'été le 1er octobre, heure d'hiver le 24 décembre.
   */
  effectiveDate: "2026-10-01T00:00+02:00/2026-12-24T23:59+01:00",
  /**
   * Exception au taux : Austroflamm et Cadel à -10 % au lieu de -15 %
   * (décision du client, 18/10/2026), MCZ aussi (30/10/2026). Les autres
   * marques restent à -15 %.
   */
  reduced: {
    rate: 0.1,
    badge: "-10 %",
    brands: ["Austroflamm", "Cadel", "MCZ"] as readonly string[],
  },
} as const;

const isReduced = (brand?: string | null): boolean =>
  brand != null && BONUS.reduced.brands.includes(brand);

/** Taux du bonus pour une marque : -10 % pour Austroflamm, Cadel et MCZ, -15 % sinon. */
export const bonusRateFor = (brand?: string | null): number =>
  isReduced(brand) ? BONUS.reduced.rate : BONUS.rate;

/** Pastille du bonus pour une marque (« -15 % » ou « -10 % »). */
export const bonusBadgeFor = (brand?: string | null): string =>
  isReduced(brand) ? BONUS.reduced.badge : BONUS.badge;

/** « Bonus de saison -10 % sur le poêle » pour une fiche donnée. */
export const bonusLabelFor = (brand?: string | null): string =>
  `Bonus de saison ${bonusBadgeFor(brand)} sur le poêle`;

/** Jour civil à Bruxelles au format AAAA-MM-JJ, comparable aux bornes du bonus. */
export const brusselsDay = (d: Date): string => {
  const parts = new Intl.DateTimeFormat("fr-BE", {
    timeZone: "Europe/Brussels",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
};

export type BonusPhase = "before" | "during" | "after";

/** Où en est le bonus à l'instant donné : pas encore commencé, en cours, terminé. */
export const bonusPhase = (now: Date = new Date()): BonusPhase => {
  const day = brusselsDay(now);
  return day < BONUS.from ? "before" : day > BONUS.to ? "after" : "during";
};

/** Le bonus est-il en cours à l'instant donné (par défaut maintenant) ? */
export const isBonusPeriod = (now: Date = new Date()): boolean => bonusPhase(now) === "during";

/** Lendemain d'un jour AAAA-MM-JJ (calcul en UTC : pas d'effet d'heure d'été). */
const nextDay = (day: string): string => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

/**
 * Jour où les prix affichés changent à minuit, heure de Bruxelles : premier
 * jour du bonus, ou lendemain du dernier. Les pages en cache (ISR) gardent le
 * rendu de la veille tant qu'on ne les invalide pas, d'où le cron de
 * app/api/cron/bonus/route.ts.
 */
export const isBonusSwitchDay = (now: Date = new Date()): boolean => {
  const day = brusselsDay(now);
  return day === BONUS.from || day === nextDay(BONUS.to);
};

/**
 * Prix après bonus, arrondi à l'euro, au taux de la marque (bonusRateFor).
 * Ne regarde pas la date : c'est à l'appelant de ne s'en servir que pendant la
 * période (ou, pour le flux Google Merchant, avec la plage de dates).
 */
export const bonusPrice = (price: number, brand?: string | null): number =>
  Math.round(price * (1 - bonusRateFor(brand)));
