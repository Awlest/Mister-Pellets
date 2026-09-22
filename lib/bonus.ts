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
  label: "Bonus de saison -15 % sur le poêle",
  /** Pastille courte pour les cartes et les fiches produit. */
  badge: "-15 %",
  conditions:
    "Pour toute commande passée entre le 1er octobre et le 24 décembre 2026, sur le prix du poêle, pose non remisée, cumulable avec la prime Habitation et le financement à 0 %.",
  /**
   * Plage `sale_price_effective_date` du flux Google Merchant, ISO 8601 avec
   * fuseau : heure d'été le 1er octobre, heure d'hiver le 24 décembre.
   */
  effectiveDate: "2026-10-01T00:00+02:00/2026-12-24T23:59+01:00",
} as const;

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

/**
 * Prix après bonus, arrondi à l'euro. Ne regarde pas la date : c'est à
 * l'appelant de ne s'en servir que pendant la période (ou, pour le flux
 * Google Merchant, avec la plage de dates).
 */
export const bonusPrice = (price: number): number => Math.round(price * (1 - BONUS.rate));
