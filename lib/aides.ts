/**
 * Aides au chauffage en Wallonie : SOURCE UNIQUE des chiffres et des liens
 * officiels affichés sur /primes-energie-wallonie-2026, dans le bloc
 * PrimesBlock (accueil, pages ville) et dans llms.txt.
 *
 * Situation vérifiée le 03/10/2026, revérifiée le 25/10/2026 (wallonie.be,
 * logement.wallonie.be, swcs.be, flw.be, fin.belgium.be, Moniteur belge) :
 * - la prime Habitation (régime temporaire du 14/02/2025 au 30/09/2026), qui
 *   couvrait le poêle à pellets, est terminée : travaux finis ET demande
 *   introduite au plus tard le 30/09/2026 à 23 h 59 (UVCW, 20/05/2026). Depuis
 *   le 01/10/2026, la Région n'accorde plus de prime par poste pour un nouveau
 *   projet ;
 * - la Région soutient la rénovation par deux prêts, Rénopack et Rénoprêt (SWCS
 *   et Fonds du Logement de Wallonie), réservés aux logements PEB E, F ou G,
 *   avec audit de moins d'un an et saut de label (wallonie.be, publié le
 *   17/07/2026, mis à jour le 25/09/2026) ;
 * - arrêté du Gouvernement wallon du 24/09/2026 sur la réduction du Rénopack
 *   (Moniteur belge du 30/09/2026, numac 2026007096) : bâtiment de plus de
 *   15 ans, demandeur qui n'est propriétaire que d'un seul logement, réduction
 *   de 45, 35 ou 10 %, majorée de 5 % si toute l'isolation de l'enveloppe est
 *   en écomatériaux (art. 11), sur les travaux éligibles seulement. La liste de
 *   l'article 6 parle de « systèmes de chauffage et/ou eau chaude performants,
 *   décarbonés » et NE NOMME PAS les poêles. Pas de cumul avec une autre aide
 *   wallonne pour le même investissement (art. 13) ;
 * - la demande de prêt passe avant tout engagement : aucun devis signé, aucun
 *   acompte, aucun début de travaux avant la signature du contrat de crédit
 *   (FAQ de la SWCS ; Fonds du Logement, « Appel à la vigilance » du
 *   12/10/2026). Selon la SWCS, le dispositif devrait être pleinement
 *   opérationnel au début de 2027 ;
 * - Rénoprêt en C4 : taux préférentiel (0 % seulement pour l'adaptation au
 *   handicap ou après une calamité naturelle reconnue) ;
 * - mesure transitoire, adoptée définitivement par l'arrêté du 24/09/2026 : un
 *   devis signé ou un bon de commande définitif datant au plus tard du
 *   13/02/2025 permet de demander la prime aux anciennes conditions jusqu'au
 *   30/09/2027, sans acompte exigé (logement.wallonie.be) ;
 * - MEBAR (petits revenus, via le CPAS) : jusqu'à 2 000 €, installation d'un
 *   poêle comprise (démarche mise à jour le 23/07/2026) ;
 * - TVA 6 % : inchangée pour les appareils 100 % non fossiles (SPF Finances) ;
 * - Fonds du Logement de Wallonie : 071 20 77 11 (flw.be). L'actualité de
 *   wallonie.be donne 071 20 77 00, que le FLW n'affiche nulle part.
 *
 * Le site ne promet jamais qu'un poêle est finançable par un prêt régional :
 * il ne l'est que si l'audit le retient et que l'organisme prêteur l'accepte.
 * La page « travaux » de la SWCS décrit encore l'ancien système : ne pas s'en
 * servir.
 *
 * Quand les règles bougent, on met à jour ce fichier, la date ci-dessous, puis
 * les textes de la page, de la FAQ (lib/faqs.ts) et de l'article primes.
 */

/** Date de la dernière vérification sur les sites officiels, telle qu'affichée. */
export const AIDES_VERIFIED_AT = "25 octobre 2026";

export interface RenopackCategory {
  category: "C1" | "C2" | "C3" | "C4";
  income: string;
  loan: string;
  /** Part du prêt que le ménage ne rembourse pas. */
  forgiven: string;
  /** Même part quand toute l'isolation de l'enveloppe est en écomatériaux. */
  forgivenEco?: string;
}

/**
 * Catégories de revenus du nouveau régime, montants indexés au 01/01/2026,
 * diminués de 5 000 € par personne à charge (wallonie.be). Parts non
 * remboursées : article 11 de l'arrêté du 24/09/2026.
 */
export const RENOPACK_CATEGORIES: RenopackCategory[] = [
  { category: "C1", income: "Jusqu'à 28 900 €", loan: "Rénopack à 0 %", forgiven: "45 %", forgivenEco: "50 %" },
  { category: "C2", income: "De 28 900 à 41 100 €", loan: "Rénopack à 0 %", forgiven: "35 %", forgivenEco: "40 %" },
  { category: "C3", income: "De 41 100 à 67 100 €", loan: "Rénopack à 0 %", forgiven: "10 %", forgivenEco: "15 %" },
  {
    category: "C4",
    income: "De 67 100 à 122 800 €",
    loan: "Rénoprêt à taux préférentiel",
    forgiven: "Aucune",
  },
];

/** Plafonds d'emprunt du nouveau régime (wallonie.be). */
export const LOAN_MAX = { house: "75 000 €", apartment: "60 000 €" } as const;

export const MEBAR_MAX = "2 000 €";

/** Liens officiels cités sur le site (tous contrôlés en HTTP 200 le 25/10/2026). */
export const AIDES_SOURCES = {
  regime:
    "https://wallonie.be/fr/actualites/renovation-energetique-le-nouveau-regime-de-soutien-entre-en-vigueur-le-1er-octobre",
  /** Arrêté du 24/09/2026 sur la réduction du Rénopack, texte coordonné (Justel). */
  arreteRenopack: "https://www.ejustice.just.fgov.be/eli/arrete/2026/09/24/2026007096/justel",
  transitoire:
    "https://logement.wallonie.be/fr/aide/primes-travaux-les-nouvelles-mesures-transitoires",
  swcs: "https://www.swcs.be/actualites/reforme-des-aides-a-la-renovation-ce-qui-change",
  swcsPreinscription: "https://appicredit.swcs.be/preinscription",
  flw: "https://www.flw.be",
  /** Avertissement du Fonds du Logement : demande de prêt avant tout engagement (12/10/2026). */
  flwVigilance: "https://www.flw.be/appel-a-la-vigilance/",
  mebar:
    "https://www.wallonie.be/fr/demarches/demander-une-subvention-energie-en-tant-que-menage-revenu-modeste-prime-mebar",
  guichets: "https://energie.wallonie.be/home/contacts/guichets-energie-wallonie.html",
  numero1718: "https://www.wallonie.be/fr/demarches/prendre-contact-avec-le-1718",
  tva: "https://fin.belgium.be/fr/particuliers/habitation/construire-renover/renover/renover-taux-de-tva",
  tvaFossiles:
    "https://fin.belgium.be/fr/particuliers/habitation/construire-renover/renover/modification-taux-tva-installations-combustibles",
} as const;

/** Numéros officiels, affichés et composés tels quels. */
export const AIDES_PHONES = {
  swcs: { label: "078 15 80 08", tel: "+3278158008" },
  flw: { label: "071 20 77 11", tel: "+3271207711" },
} as const;
