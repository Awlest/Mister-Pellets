/**
 * Banc du chiffrage de pose (lib/pose/moteur.ts + lib/pose/tarifs.ts) et du
 * configurateur (lib/estimate.ts) : les cas de test du brief du 29/10/2026.
 * Le même moteur est testé côté Mister Bois (lib/pose/moteur.test.ts).
 *
 *   node --import tsx scripts/check-pose.ts
 */
import { DEFAULT_STATE, estimate, type EstimateProduct, type EstimateState } from "@/lib/estimate";
import {
  evacuationPrice,
  formatEur,
  missingAnswers,
  optionShown,
  poseLines,
  sanitizePose,
  type InstallType,
  type PoseContext,
} from "@/lib/pose/moteur";
import { REMISES, TARIFS } from "@/lib/pose/tarifs";

let ko = 0;
function check(label: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) ko++;
  console.log(`${ok ? "ok  " : "KO  "} ${label}${ok ? "" : `\n      attendu ${JSON.stringify(want)}\n      obtenu  ${JSON.stringify(got)}`}`);
}

const price = (t: InstallType, m: number) => {
  const p = evacuationPrice(t, m, TARIFS, REMISES);
  return [p.fullHT, p.amountHT, p.discountPct];
};
const state = (patch: Partial<EstimateState>): EstimateState => ({ ...DEFAULT_STATE, ...patch });
const ctx: PoseContext = { tarifs: TARIFS, remises: REMISES, canalisable: false };
const line = (s: EstimateState, key: string, c: PoseContext = ctx) => poseLines(s, c).find((l) => l.key === key);

// 1. Sortie ventouse : 2 150 € HTVA, -20 % = 1 720 €
check("ventouse : plein, net, remise", price("ventouse-facade", 10), [2150, 1720, 20]);
check("ventouse : la hauteur ne change rien", price("ventouse-facade", 16), [2150, 1720, 20]);

// 2. Double paroi extérieure : 3 780 € pour 10 m, ±150 €/m, -20 %
check("double paroi 8 m", price("conduit-exterieur", 8), [3480, 2784, 20]);
check("double paroi 10 m", price("conduit-exterieur", 10), [3780, 3024, 20]);
check("double paroi 12 m", price("conduit-exterieur", 12), [4080, 3264, 20]);
check("double paroi 13 m", price("conduit-exterieur", 13), [4230, 3384, 20]);
check("double paroi : 1 m de plus = 120 € net", price("conduit-exterieur", 11)[1]! - price("conduit-exterieur", 10)[1]!, 120);
check("double paroi 12 m : pas de choix d'accès", missingAnswers(state({ installType: "conduit-exterieur", conduitM: 12 }), false), []);
check("double paroi 13 m : accès à choisir", missingAnswers(state({ installType: "conduit-exterieur", conduitM: 13 }), false), ["access"]);
const dp13n = state({ installType: "conduit-exterieur", conduitM: 13, access: "nacelle" });
check("double paroi 13 m + nacelle : ligne de 350 €", line(dp13n, "acces")?.amountHT, 350);
check("double paroi 13 m + nacelle : total HT pose", estimate(dp13n, null).laborHT, 3384 + 350);
const dp13e = state({ installType: "conduit-exterieur", conduitM: 13, access: "echafaudage" });
check("double paroi 13 m + échafaudage : ligne sur devis à 0 €", [line(dp13e, "acces")?.onQuote, line(dp13e, "acces")?.amountHT], [true, 0]);
check("double paroi 13 m + échafaudage : total sans échafaudage", [estimate(dp13e, null).laborHT, estimate(dp13e, null).onQuote], [3384, true]);
check("double paroi 13 m + échafaudage : rien ne manque", missingAnswers(dp13e, false), []);

// Conduit neuf par l'intérieur : comme la double paroi, plus 2 percements non remisés
const inside = state({ installType: "conduit-toiture", conduitM: 10 });
check("conduit intérieur 10 m : conduit remisé", line(inside, "pose")?.amountHT, 3024);
check("conduit intérieur 10 m : 2 percements à 180 €", line(inside, "percements")?.amountHT, 360);

// 3. Tubage : 2 575 € pour 10 m, -55 €/m en dessous, +75 €/m au-dessus, -10 %
check("tubage 7 m", price("tubage", 7), [2410, 2169, 10]);
check("tubage 10 m", price("tubage", 10), [2575, 2317.5, 10]);
check("tubage 11 m", price("tubage", 11), [2650, 2385, 10]);
check("tubage 14 m", price("tubage", 14), [2875, 2587.5, 10]);
check("tubage 14 m : accès à choisir", missingAnswers(state({ installType: "tubage", conduitM: 14 }), false), ["access"]);
check("tubage 14 m + nacelle : total HT pose", estimate(state({ installType: "tubage", conduitM: 14, access: "nacelle" }), null).laborHT, 2587.5 + 350);
check("tubage 10 m : 2 317,50 € affiché", formatEur(2317.5).replace(/\s/g, " "), "2 317,50 €");
check("conduit existant : 950 €, sans remise", price("conduit-existant", 10), [950, 950, 0]);

// 4. Canalisation : seulement sur un poêle canalisable, et seulement sur « oui »
const canal: EstimateProduct = { key: "c", slug: "c", name: "Test canalisable", brand: "Test", productType: "canalisable", powerKw: 9, priceHT: 3000 };
const classique: EstimateProduct = { ...canal, key: "s", slug: "s", productType: "standard" };
const base = state({ installType: "conduit-existant", stoveKind: "canalisable", productKey: "c", ductRooms: 2 });
check("canalisable sans réponse : question obligatoire", missingAnswers(base, true), ["ducts"]);
check("canalisable, non : pas de canalisation", estimate({ ...base, ducts: "non" }, canal, { bonus: false }).laborHT, 950);
check("canalisable, oui 2 pièces : +600 €", estimate({ ...base, ducts: "oui" }, canal, { bonus: false }).laborHT, 950 + 600);
check(
  "canalisable : total TTC avec et sans",
  [estimate({ ...base, ducts: "non" }, canal, { bonus: false }).totalTTC, estimate({ ...base, ducts: "oui" }, canal, { bonus: false }).totalTTC],
  [Math.round((3000 + 950) * 1.06), Math.round((3000 + 1550) * 1.06)],
);
check("poêle classique : « oui » ignoré", estimate({ ...base, stoveKind: "standard", ducts: "oui" }, classique, { bonus: false }).laborHT, 950);
check("poêle classique : pas de question", missingAnswers(base, false), []);

// 5. Options : la nacelle de l'étape 4 disparaît quand l'accès est déjà choisi
check("option nacelle proposée à 10 m de tubage", optionShown("nacelle", state({ installType: "tubage", conduitM: 10 }), TARIFS), true);
check("option nacelle masquée à 14 m", optionShown("nacelle", state({ installType: "tubage", conduitM: 14 }), TARIFS), false);
check(
  "nacelle cochée à 10 m puis hauteur à 14 m + échafaudage : pas de nacelle comptée",
  estimate(state({ installType: "tubage", conduitM: 14, access: "echafaudage", opt: { nacelle: true } }), null).laborHT,
  2587.5,
);

// 6. Lecture par l'API
const raw = sanitizePose({ installType: "tubage", conduitM: 33, access: "grue", ducts: "peut-être", ductRooms: 9 }, TARIFS);
check("API : hauteur bornée, réponses inconnues vidées", [raw?.conduitM, raw?.access, raw?.ducts, raw?.ductRooms], [20, "", "", 2]);
check("API : évacuation inconnue refusée", sanitizePose({ installType: "fenetre" }, TARIFS), null);

// 7. Remises coupées : tout repasse au plein tarif
const saved = JSON.parse(JSON.stringify(REMISES));
for (const r of Object.values(REMISES)) if (r) r.active = false;
check("sans remise : ventouse", price("ventouse-facade", 10), [2150, 2150, 0]);
check("sans remise : double paroi 13 m", price("conduit-exterieur", 13), [4230, 4230, 0]);
check("sans remise : tubage 7 m", price("tubage", 7), [2410, 2410, 0]);
check("sans remise : ligne sans prix barré", line(state({ installType: "tubage", conduitM: 10 }), "pose")?.fullHT, undefined);
check("sans remise : estimation au plein tarif", estimate(state({ installType: "tubage", conduitM: 11 }), null).laborHT, 2650);
Object.assign(REMISES, saved);
check("remises rétablies", price("tubage", 10), [2575, 2317.5, 10]);

console.log(ko === 0 ? "\nTOUS OK" : `\n${ko} ECHEC(S)`);
process.exit(ko === 0 ? 0 : 1);
