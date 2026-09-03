import {
  shippingCostFor,
  declaredShippingFor,
  FREE_ZONE_POSTAL_CODES,
} from "@/lib/shipping";

/**
 * Contrôle du barème de livraison.
 *
 * Le même barème est affiché sur la fiche produit, appliqué au checkout et
 * déclaré dans le flux Google Merchant. Un écart entre les trois est le motif
 * exact qui a fait suspendre le compte Merchant : ces assertions verrouillent
 * la table de vérité.
 */

let ko = 0;
function check(label: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) ko++;
  console.log(
    `${ok ? "ok  " : "KO  "} ${label}${ok ? "" : ` — attendu ${JSON.stringify(want)}, obtenu ${JSON.stringify(got)}`}`,
  );
}

// Zone offerte
check("5380 Fernelmont -> 0", shippingCostFor("5380"), 0);
check("5000 Namur -> 0", shippingCostFor(5000), 0);
check("4219 Wasseiges -> 0", shippingCostFor("4219"), 0);

// Wallonie hors zone offerte
check("4000 Liege -> 50", shippingCostFor("4000"), 50);
check("6000 Charleroi -> 50", shippingCostFor("6000"), 50);
check("7000 Mons -> 50", shippingCostFor("7000"), 50);
check("1300 Wavre -> 50", shippingCostFor("1300"), 50);
check("1490 Court-Saint-Etienne -> 50", shippingCostFor("1490"), 50);

// Bruxelles et Flandre
check("1000 Bruxelles -> 100", shippingCostFor("1000"), 100);
check("1200 Woluwe -> 100", shippingCostFor("1200"), 100);
check("1500 Halle -> 100", shippingCostFor("1500"), 100);
check("2000 Anvers -> 100", shippingCostFor("2000"), 100);
check("3000 Louvain -> 100", shippingCostFor("3000"), 100);
check("8000 Bruges -> 100", shippingCostFor("8000"), 100);
check("9000 Gand -> 100", shippingCostFor("9000"), 100);

// Saisies invalides : jamais de sous-facturation
check("vide -> tarif max", shippingCostFor(""), 100);
check("indefini -> tarif max", shippingCostFor(undefined), 100);
check("3 chiffres -> tarif max", shippingCostFor("538"), 100);
check("hors Belgique -> tarif max", shippingCostFor("75001"), 100);

// Cohérence de la liste offerte
const outOfRange = [...FREE_ZONE_POSTAL_CODES].filter((c) => c < 1000 || c > 9999);
check("aucun code offert hors 1000-9999", outOfRange, []);
const notFree = [...FREE_ZONE_POSTAL_CODES].filter((c) => shippingCostFor(c) !== 0);
check("tous les codes offerts facturent 0", notFree, []);

// Le contrôle qui compte pour Google : sur les 9000 codes possibles, le prix
// DÉCLARÉ dans le flux doit être exactement celui qui sera DÉBITÉ au checkout.
const mismatches: string[] = [];
const uncovered: number[] = [];
for (let code = 1000; code <= 9999; code++) {
  const declared = declaredShippingFor(code);
  if (declared === null) {
    uncovered.push(code);
    continue;
  }
  const charged = shippingCostFor(code);
  if (declared !== charged) mismatches.push(`${code}: declare ${declared}, debite ${charged}`);
}
check("tous les codes 1000-9999 sont couverts par un prefixe", uncovered.length, 0);
check("prix declare = prix debite sur les 9000 codes", mismatches.slice(0, 5), []);

console.log(ko === 0 ? "\nTOUS OK" : `\n${ko} ECHEC(S)`);
process.exit(ko === 0 ? 0 : 1);
