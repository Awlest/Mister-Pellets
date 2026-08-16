/**
 * Financement à tempérament 0 % — simulateur du configurateur d'estimation.
 *
 * Grille du partenaire crédit (durée min. 12 mois ; durée max. selon le montant
 * financé) :
 *   200 à 1 000 €     → jusqu'à 36 mois
 *   1 000 à 3 000 €   → jusqu'à 36 mois (limite légale)
 *   3 000 à 5 000 €   → jusqu'à 60 mois (limite légale)
 *   5 000 à 10 000 €  → jusqu'à 84 mois
 *   10 000 à 50 000 € → jusqu'à 120 mois
 *
 * Grille et prêteur identiques à ceux de Mister Clim (Cofidis SA), confirmé par
 * le client le 16/08/2026. Pour faire évoluer l'offre, il suffit d'adapter FIN
 * et FIN_TIERS : le configurateur et les mentions légales s'alignent.
 *
 * La mensualité affichée est INDICATIVE : le prix ferme est établi après la
 * visite technique, et tout crédit reste soumis à l'acceptation du prêteur.
 */
export const FIN = {
  minAmount: 200,
  maxAmount: 50000,
  minMonths: 12,
  lender: "Cofidis SA",
} as const;

// Durée maximale (en mois) selon le montant financé. Le 1er palier dont le
// plafond couvre le montant donne la durée max applicable.
export const FIN_TIERS = [
  { upTo: 1000, maxMonths: 36 },
  { upTo: 3000, maxMonths: 36 },
  { upTo: 5000, maxMonths: 60 },
  { upTo: 10000, maxMonths: 84 },
  { upTo: 50000, maxMonths: 120 },
] as const;

/** Palier le plus haut : sert de repli au-delà du montant maximal finançable. */
const TOP_TIER = { upTo: 50000, maxMonths: 120 } as const;

export const maxMonthsFor = (amount: number): number =>
  (FIN_TIERS.find((t) => amount <= t.upTo) ?? TOP_TIER).maxMonths;

/** Durées proposées dans le simulateur, filtrées sur ce que le montant autorise. */
export const DURATIONS = [12, 24, 36, 48, 60, 84, 120] as const;

export const durationsFor = (amount: number): number[] => {
  const max = maxMonthsFor(amount);
  return DURATIONS.filter((m) => m >= FIN.minMonths && m <= max);
};

/**
 * Mensualité à 0 % (sans intérêt) : montant ÷ durée. Sans durée précisée, on
 * prend la durée maximale autorisée pour le montant (mensualité la plus basse).
 * Renvoie null en dessous du montant minimum finançable.
 */
export const monthly0 = (amount: number, months?: number): number | null => {
  if (!amount || amount < FIN.minAmount) return null;
  const a = Math.min(amount, FIN.maxAmount);
  const m = Math.min(Math.max(months ?? maxMonthsFor(a), FIN.minMonths), maxMonthsFor(a));
  return Math.round(a / m);
};

/** Le montant est-il finançable en l'état (ni trop petit, ni au-delà du plafond) ? */
export const isFinanceable = (amount: number): boolean =>
  amount >= FIN.minAmount && amount <= FIN.maxAmount;

/**
 * Message obligatoire dans TOUTE publicité pour un crédit à la consommation en
 * Belgique (art. VII.64, § 2, CDE) : à afficher, bien lisible, partout où le
 * financement est évoqué (configurateur, page produit, bandeau…).
 */
export const SLOGAN_CREDIT = "Attention, emprunter de l'argent coûte aussi de l'argent.";

/**
 * Mention légale crédit (Belgique) avec exemple représentatif (art. VII.64, § 1ᵉʳ,
 * CDE : obligatoire dès qu'un taux ou une mensualité est affiché). Doit
 * accompagner SLOGAN_CREDIT partout où une mensualité apparaît.
 */
export const FIN_LEGAL =
  "Exemple représentatif : vente à tempérament de 5 000 € remboursable en 60 mensualités de 83,33 €, " +
  "taux débiteur annuel fixe 0 %, TAEG 0 %, montant total dû : 5 000 €. Montants finançables de 200 € " +
  "à 50 000 €, durée de 12 à 120 mois selon le montant. Sous réserve d'acceptation de votre dossier " +
  "par Cofidis SA, prêteur. Mister Pellets (Awlest SRL) intervient comme intermédiaire de crédit à " +
  "titre accessoire.";

export const FIN_NOTE =
  "Mensualité indicative, sous réserve d'acceptation de votre dossier. Le prix ferme est confirmé après la visite technique.";
