/**
 * Cohérence des parcours et des chiffres repris à plusieurs endroits du site.
 * Sans base ni réseau : lit le code et les textes du dépôt.
 *
 *   node --import tsx scripts/check-coherence.ts
 *
 * 1. Fiche sur devis : le bouton principal demande le prix du modèle, et
 *    l'estimation ouverte sur un modèle absent du catalogue chiffré l'explique
 *    au lieu de bloquer (vérification du 11/11/2026).
 */
import { requestedModel, type EstimateProduct } from "@/lib/estimate";
import {
  PRICE_REQUEST_SUBJECT,
  priceRequestHref,
  priceRequestMessage,
  productPrimaryAction,
  readPriceRequest,
} from "@/lib/price-request";

let ko = 0;
function check(label: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) ko++;
  console.log(`${ok ? "ok  " : "KO  "} ${label}${ok ? "" : `\n      attendu ${JSON.stringify(want)}\n      obtenu  ${JSON.stringify(got)}`}`);
}
function assert(label: string, cond: boolean) {
  check(label, cond, true);
}

// ---------------------------------------------------------------------------
// 1. Fiche sur devis et estimation
// ---------------------------------------------------------------------------
const labels = { estimate: "Estimer" };
const priced = productPrimaryAction({ slug: "cadel-zefiro-9", name: "Cadel Zefiro 9", priceTTC: 2990 }, labels);
check("fiche chiffrée : estimation sur le modèle", [priced.kind, priced.href], ["estimate", "/estimation?modele=cadel-zefiro-9"]);
const quote = productPrimaryAction({ slug: "mcz-ego-air-8-r", name: "MCZ Ego Air 8 R" }, labels);
check("fiche sur devis : demande de prix", quote.kind, "price-request");
check("fiche sur devis : adresse", quote.href, "/contact?modele=mcz-ego-air-8-r&nom=MCZ+Ego+Air+8+R");
check("fiche à 0 € : demande de prix", productPrimaryAction({ slug: "x", name: "X", priceTTC: 0 }, labels).kind, "price-request");

check("formulaire : modèle relu", readPriceRequest("?modele=mcz-ego-air-8-r&nom=MCZ+Ego+Air+8+R"), {
  slug: "mcz-ego-air-8-r",
  name: "MCZ Ego Air 8 R",
});
check("formulaire : slug invalide ignoré", readPriceRequest("?modele=../admin"), null);
check("formulaire : sans modèle", readPriceRequest(""), null);
check("formulaire : nom sur une ligne", readPriceRequest("?modele=a-b&nom=A%0AB")?.name, "A B");
assert("message : nomme le modèle", priceRequestMessage({ slug: "a-b", name: "MCZ Ego" }).includes("du modèle MCZ Ego"));
assert("message : lien de la fiche", priceRequestMessage({ slug: "a-b" }).includes("mister-pellets.be/produit/a-b"));
check("sujet présélectionné", PRICE_REQUEST_SUBJECT, "info-produit");
check("demande sans nom", priceRequestHref("a-b"), "/contact?modele=a-b");

const catalogue = [
  { key: "cadel-zefiro-9", slug: "cadel-zefiro-9", name: "Zefiro 9", brand: "Cadel", productType: "standard", powerKw: 9, priceHT: 2471 },
] as unknown as EstimateProduct[];
check("estimation : sans modèle", requestedModel(catalogue, "").status, "none");
check("estimation : modèle chiffré", requestedModel(catalogue, "?modele=cadel-zefiro-9").status, "priced");
check("estimation : modèle sur devis", requestedModel(catalogue, "?modele=mcz-ego-air-8-r"), {
  status: "unpriced",
  slug: "mcz-ego-air-8-r",
});

if (ko > 0) {
  console.error(`\n${ko} contrôle(s) en échec.`);
  process.exit(1);
}
console.log("\nTout est cohérent.");
