/**
 * Aides au chauffage en Wallonie : SOURCE UNIQUE des chiffres et des liens
 * officiels affichés sur /primes-energie-wallonie-2026, dans le bloc
 * PrimesBlock (accueil, pages ville) et dans llms.txt.
 *
 * Situation vérifiée le 03/10/2026 :
 * - la prime Habitation (régime temporaire du 14/02/2025 au 30/09/2026), qui
 *   couvrait le poêle à pellets, est terminée : travaux finis ET demande
 *   introduite au plus tard le 30/09/2026 à 23 h 59 (UVCW, 20/05/2026) ;
 * - depuis le 01/10/2026, la Région soutient la rénovation par deux prêts,
 *   Rénopack et Rénoprêt (SWCS et Fonds du Logement de Wallonie), réservés aux
 *   logements PEB E, F ou G, avec audit de moins d'un an et saut de label
 *   (wallonie.be, publié le 17/07/2026, mis à jour le 25/09/2026) ;
 * - mesure transitoire : un devis daté et signé avant le 14/02/2025 permet de
 *   demander la prime aux anciennes conditions jusqu'au 30/09/2027 (décision
 *   du Gouvernement wallon du 24/09/2026, applicable après publication au
 *   Moniteur belge) ;
 * - MEBAR (petits revenus, via le CPAS) : jusqu'à 2 000 €, installation d'un
 *   poêle comprise (démarche mise à jour le 23/07/2026) ;
 * - TVA 6 % : inchangée pour les appareils 100 % non fossiles (SPF Finances).
 *
 * Quand les règles bougent, on met à jour ce fichier, la date ci-dessous, puis
 * les textes de la page, de la FAQ (lib/faqs.ts) et de l'article primes.
 */

/** Date de la dernière vérification sur les sites officiels, telle qu'affichée. */
export const AIDES_VERIFIED_AT = "3 octobre 2026";

export interface RenopackCategory {
  category: "C1" | "C2" | "C3" | "C4";
  income: string;
  loan: string;
  /** Part du prêt que le ménage ne rembourse pas. */
  forgiven: string;
}

/**
 * Catégories de revenus du nouveau régime, montants indexés au 01/01/2026,
 * diminués de 5 000 € par personne à charge (wallonie.be).
 */
export const RENOPACK_CATEGORIES: RenopackCategory[] = [
  { category: "C1", income: "Jusqu'à 28 900 €", loan: "Rénopack à 0 %", forgiven: "50 %" },
  { category: "C2", income: "De 28 900 à 41 100 €", loan: "Rénopack à 0 %", forgiven: "40 %" },
  { category: "C3", income: "De 41 100 à 67 100 €", loan: "Rénopack à 0 %", forgiven: "15 %" },
  {
    category: "C4",
    income: "De 67 100 à 122 800 €",
    loan: "Rénoprêt, taux zéro ou préférentiel",
    forgiven: "Aucune",
  },
];

/** Plafonds d'emprunt du nouveau régime (wallonie.be). */
export const LOAN_MAX = { house: "75 000 €", apartment: "60 000 €" } as const;

export const MEBAR_MAX = "2 000 €";

/** Liens officiels cités sur le site (tous contrôlés en HTTP 200 le 03/10/2026). */
export const AIDES_SOURCES = {
  regime:
    "https://wallonie.be/fr/actualites/renovation-energetique-le-nouveau-regime-de-soutien-entre-en-vigueur-le-1er-octobre",
  transitoire:
    "https://energie.wallonie.be/actualite/primes-a-la-renovation-nouvelles-mesures-transitoires",
  swcs: "https://www.swcs.be/actualites/reforme-des-aides-a-la-renovation-ce-qui-change",
  swcsTravaux: "https://www.swcs.be/travaux",
  swcsPreinscription: "https://appicredit.swcs.be/preinscription",
  flw: "https://www.flw.be",
  mebar:
    "https://www.wallonie.be/fr/demarches/demander-une-subvention-energie-en-tant-que-menage-revenu-modeste-prime-mebar",
  guichets: "https://energie.wallonie.be/home/contacts/guichets-energie-wallonie.html",
  numero1718: "https://www.wallonie.be/fr/demarches/prendre-contact-avec-le-1718",
  tva: "https://fin.belgium.be/fr/particuliers/habitation/construire-renover/renover/renover-taux-de-tva",
  tvaFossiles:
    "https://fin.belgium.be/fr/particuliers/habitation/construire-renover/renover/modification-taux-tva-installations-combustibles",
} as const;
