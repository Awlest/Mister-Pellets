import type { Remises, TarifsPose } from "./moteur";

/**
 * TARIFS DE POSE ET REMISES DE MISTER PELLETS : le seul fichier à modifier
 * pour changer un prix ou une remise. Montants HORS TVA, matériel de pose et
 * main d'œuvre compris. Le configurateur (/estimation), la page
 * /prix-poele-pellets et l'API d'estimation lisent tous ce fichier.
 *
 * Évacuations, remises et règle des 12 m : brief client du 29/10/2026.
 * Raccordement, percement, canalisation, options et étages : tarifs client du
 * 22/09/2026. Les étages restent « À CALIBRER ».
 *
 * Le calcul lui-même est dans lib/pose/moteur.ts, identique sur Mister Bois.
 */
export const TARIFS: TarifsPose = {
  raccordementHT: 950,
  // Tubage inox et main d'œuvre, forfait pour 10 m : -55 € par mètre en
  // moins, +75 € par mètre en plus.
  tubage: { baseHT: 2575, hauteurRefM: 10, moinsParMetreHT: 55, plusParMetreHT: 75 },
  // Conduit double paroi isolé, matériel et main d'œuvre, forfait pour 10 m :
  // 150 € par mètre en plus ou en moins. Même prix en façade ou par
  // l'intérieur, qui ajoute ses deux percements renforcés.
  doubleParoi: { baseHT: 3780, hauteurRefM: 10, moinsParMetreHT: 150, plusParMetreHT: 150 },
  // Sortie ventouse, pose tout compris.
  ventouseHT: 2150,
  percementRenforceHT: 180,
  canalisationParPieceHT: 300,
  canalisationPiecesMax: 2,
  etages: { rdc: 0, "1er": 150, "2e": 300 }, // À CALIBRER
  options: { depose: 250, carottage: 180, thermostat: 280, nacelle: 350 },
  evacuationsProposees: ["conduit-existant", "tubage", "ventouse-facade", "conduit-exterieur", "conduit-toiture"],
  optionsProposees: ["depose", "carottage", "thermostat", "nacelle"],
};

/**
 * Remises temporaires, par prestation. La remise couvre le forfait ET les
 * ajustements au mètre. `active: false` remet la prestation au plein tarif
 * partout (configurateur, page prix, API). Aucune autre prestation n'est remisée.
 */
export const REMISES: Remises = {
  ventouse: { pourcent: 20, active: true, afficherPrixBarre: true },
  "double-paroi": { pourcent: 20, active: true, afficherPrixBarre: true },
  tubage: { pourcent: 10, active: true, afficherPrixBarre: true },
};
