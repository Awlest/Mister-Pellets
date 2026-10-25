/**
 * Identité d'AWLEST SRL, telle qu'elle figure dans les pages légales des
 * quatre sites.
 *
 * ⚠️ FICHIER COMMUN aux quatre sites d'AWLEST SRL (voir types.ts).
 *
 * Sources : Banque-Carrefour des Entreprises (situation au 18/10/2026) pour le
 * siège à Braives depuis le 17/03/2026 et l'unité d'établissement à
 * Fernelmont ; tribunal de l'entreprise du siège (CSA art. 2:20) relevé sur
 * competence-territoriale.just.fgov.be : 4260 Braives relève de Liège,
 * division Huy. La BCE inscrit un administrateur, pas un gérant.
 */
export const COMPANY = {
  name: "AWLEST SRL",
  /** Forme écrite en toutes lettres, pour les mentions légales. */
  legalForm: "société à responsabilité limitée de droit belge",
  seat: "Rue Saint-Pierre 29, 4260 Braives, Belgique",
  establishment: "Rue des Fagotis 3A, 5380 Fernelmont, Belgique",
  enterpriseNumber: "0656.514.212",
  vat: "BE 0656.514.212",
  register: "RPM Liège, division Huy",
  /** Ligne du bureau d'Awlest (OVH). */
  phone: "081 13 80 78",
  phoneHref: "+3281138078",
  email: "contact@awlest.com",
  website: "www.awlest.com",
} as const;

/** Les quatre marques d'AWLEST SRL et leur site, dans l'ordre des pages légales. */
export const BRANDS = [
  { brand: "Awlest", domain: "awlest.com" },
  { brand: "Mister Pellets", domain: "mister-pellets.be" },
  { brand: "Mister Clim", domain: "mister-clim.be" },
  { brand: "Mister Bois", domain: "mister-bois.be" },
] as const;

/**
 * Version des pages légales, commune aux quatre sites : le même jour, la même
 * date partout. À changer à chaque modification d'un fichier commun.
 */
export const LEGAL_UPDATED_ON = "25 octobre 2026";

/** Autorité de protection des données (adresse vérifiée sur son site). */
export const DATA_AUTHORITY = {
  name: "Autorité de protection des données",
  address: "rue de la Presse 35, 1000 Bruxelles",
  email: "contact@apd-gba.be",
  url: "https://www.autoriteprotectiondonnees.be",
} as const;

/** Service de médiation pour le consommateur (SPF Économie). */
export const CONSUMER_MEDIATION = {
  name: "Service de médiation pour le consommateur",
  address: "North Gate II, boulevard du Roi Albert II 8 boîte 1, 1000 Bruxelles",
  url: "https://www.mediationconsommateur.be",
} as const;

/** Hébergeur commun aux quatre sites (vercel.com/legal/privacy-notice, version du 01/06/2026). */
export const VERCEL = "Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis";
