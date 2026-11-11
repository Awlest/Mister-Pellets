/**
 * Ordres de grandeur d'un poêle à pellets posé, repris tels quels par
 * l'accueil (texte, FAQ et comparatif), la FAQ du site, le guide d'achat
 * (et son encadré sur /guides), /llms.txt et /llms-full.txt. Une seule
 * source : changer un montant ici le change partout, et
 * scripts/check-coherence.ts échoue si un de ces textes s'en écarte.
 *
 * Ce sont des fourchettes de projets courants, poêle et pose compris, TVA à
 * 6 % (logement de plus de 10 ans). Elles ne remplacent pas le prix de départ
 * de /prix-poele-pellets (« dès … »), calculé chaque jour sur le poêle le
 * moins cher du catalogue posé sur un conduit déjà tubé
 * (lib/price-examples.ts) : deux montants, deux cas, chacun nommé là où il
 * est écrit.
 *
 * Valeurs reprises des textes du site au 11/11/2026. Canalisable : le site
 * écrivait « 5 500 à 7 500 € » à deux endroits et « 5 500 à 8 000 € » à trois ;
 * la fourchette la plus large est retenue, à confirmer par le propriétaire.
 */

export interface PriceRange {
  min: number;
  max: number;
  /** Ce que couvre la fourchette, écrit à côté du montant. */
  hypothesis: string;
}

export const PRICE_RANGES = {
  /** Poêle à air ou étanche, conduit existant (déjà tubé ou à tuber). */
  standard: {
    min: 4000,
    max: 8000,
    hypothesis: "poêle à air sur un conduit existant, tubé ou à tuber, pose et raccordement compris",
  },
  /** Canalisable de 10 à 14 kW, gaines vers 1 ou 2 pièces. */
  canalisable: {
    min: 5500,
    max: 8000,
    hypothesis: "canalisable de 10 à 14 kW avec gaines vers 1 ou 2 pièces, pose comprise",
  },
  /** Hydro de 18 à 24 kW raccordé aux radiateurs existants. */
  hydro: {
    min: 8000,
    max: 14000,
    hypothesis:
      "hydro de 18 à 24 kW raccordé aux radiateurs existants, selon la puissance, le ballon tampon et la mise hors service éventuelle d'une cuve à mazout",
  },
} as const satisfies Record<string, PriceRange>;

/** « 4 000 », espaces ordinaires (la typographie se fait à l'affichage, lib/typo.ts). */
const plain = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

/** « 4 000 à 8 000 € », en espaces ordinaires. */
export const rangeText = (r: Pick<PriceRange, "min" | "max">): string => `${plain(r.min)} à ${plain(r.max)} €`;

/** « 4 000 € », le bas d'une fourchette. */
export const amountText = (n: number): string => `${plain(n)} €`;

/** Toute la gamme, du poêle à air au hydro : le comparatif des modes de chauffage. */
export const ALL_PELLET_RANGE = { min: PRICE_RANGES.standard.min, max: PRICE_RANGES.hydro.max };

/** Mention de la TVA qui accompagne toujours ces fourchettes. */
export const RANGES_VAT_NOTE = "TVA à 6 % (logement de plus de 10 ans)";
