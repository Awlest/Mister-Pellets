/**
 * Cohérence des parcours et des chiffres repris à plusieurs endroits du site.
 * Sans base ni réseau : lit le code et les textes du dépôt.
 *
 *   node --import tsx scripts/check-coherence.ts
 *
 * 1. Fiche sur devis : le bouton principal demande le prix du modèle, et
 *    l'estimation ouverte sur un modèle absent du catalogue chiffré l'explique
 *    au lieu de bloquer (vérification du 11/11/2026).
 * 2. Fourchettes de prix d'un poêle posé : une seule source
 *    (lib/price-ranges.ts) pour l'accueil, la FAQ, le guide d'achat, llms.txt
 *    et llms-full.txt ; aucun montant de fourchette écrit à la main à côté.
 * 3. Délai d'un projet : la constante de lib/services.ts, reprise par la FAQ,
 *    l'accueil, la page installation et les pages ville.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ACTION_LABELS } from "@/config/navigation";
import { brusselsMidnightISO } from "@/lib/availability";
import { requestedModel, type EstimateProduct } from "@/lib/estimate";
import { estimateOptions, isEstimable } from "@/lib/estimable";
import {
  PRICE_REQUEST_SUBJECT,
  priceRequestHref,
  priceRequestMessage,
  productPrimaryAction,
  readPriceRequest,
} from "@/lib/price-request";
import { PRICE_RANGES, RANGES_VAT_NOTE, rangeText } from "@/lib/price-ranges";
import { FAQS } from "@/lib/faqs";
import { getGuideBySlug } from "@/lib/guides";
import { NBSP, NNBSP } from "@/lib/typo";
import { PROJECT_LEAD_TIME } from "@/lib/services";
import { guaranteeLine, shownDeliveryDelay } from "@/lib/product-price";

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
const priced = productPrimaryAction({ slug: "cadel-zefiro-9", name: "Cadel Zefiro 9", priceTTC: 2990, isEstimable: true }, labels);
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
const quoteOnly = new Set(["mcz-ego-air-8-r"]);
check("estimation : modèle sur devis", requestedModel(catalogue, "?modele=mcz-ego-air-8-r", quoteOnly), {
  status: "quote-only",
  slug: "mcz-ego-air-8-r",
});
check("estimation : modèle chiffré absent de l'estimation", requestedModel(catalogue, "?modele=edilkamin-x", quoteOnly), {
  status: "not-estimable",
  slug: "edilkamin-x",
});

// Règle « dans l'estimation » partagée par la fiche et le catalogue (lib/estimable.ts).
check("estimable : prix et puissance", isEstimable({ priceTTC: 2990, power: 9 }), true);
check("estimable : prix sans puissance", isEstimable({ priceTTC: 2990, power: 0 }), false);
check("estimable : masquée", isEstimable({ priceTTC: 2990, power: 9, hiddenFromBoutique: true }), false);
check("estimable : sans prix", isEstimable({ power: 9 }), false);
check(
  "estimable : variantes chiffrées sans axe Puissance, parent vide",
  isEstimable({ power: 9, hasVariants: true, variants: [{ price: 3200, optionValues: [1] }] }),
  false,
);
check(
  "estimable : axe Puissance chiffré",
  estimateOptions({
    hasVariants: true,
    variantOptions: [{ optionType: { id: 1, slug: "puissance" }, values: [{ id: 7, label: "9 kW" }] }],
    variants: [{ price: 3630, optionValues: [7] }],
  }),
  [{ kw: 9, ttc: 3630, ht: 3000, fromVariant: true }],
);
// Fiche chiffrée hors estimation : elle garde l'estimation, sans modèle prérempli.
check(
  "fiche chiffrée hors estimation : estimation sans modèle",
  productPrimaryAction({ slug: "x", name: "X", priceTTC: 3200, isEstimable: false }, labels),
  { href: "/estimation", label: "Estimer", kind: "estimate" },
);
assert(
  "estimation : la page passe les fiches sur devis au configurateur",
  readFileSync("app/(frontend)/estimation/page.tsx", "utf8").includes("quoteOnlySlugs"),
);

// ---------------------------------------------------------------------------
// 2. Fourchettes de prix
// ---------------------------------------------------------------------------
check("source : canalisable", rangeText(PRICE_RANGES.canalisable), "5 500 à 8 000 €");
const canalFaq = FAQS.find((f) => f.id === "choisir-canalisable-vs-hydro")?.answer ?? "";
assert("FAQ canalisable ou hydro : fourchette canalisable de la source", canalFaq.includes(rangeText(PRICE_RANGES.canalisable)));
assert("FAQ canalisable ou hydro : fourchette hydro de la source", canalFaq.includes(rangeText(PRICE_RANGES.hydro)));
const achat = getGuideBySlug("guide-achat-poele-pellets-wallonie");
assert("guide d'achat : encadré sur la fourchette de la source", Boolean(achat?.excerpt.includes(rangeText(PRICE_RANGES.standard))));
assert("guide d'achat : encadré avec la TVA de l'hypothèse", Boolean(achat?.excerpt.includes(`${rangeText(PRICE_RANGES.standard)} TVAC, pose comprise, ${RANGES_VAT_NOTE}`)));
assert("accueil : TVA de l'hypothèse à côté de la fourchette", readFileSync("app/(frontend)/page.tsx", "utf8").includes("{typo(RANGES_VAT_NOTE)}"));
const achatFaq = achat?.faq?.find((q) => q.question.startsWith("Combien coûte"))?.answer ?? "";
for (const k of ["standard", "canalisable", "hydro"] as const) {
  assert(`guide d'achat, FAQ prix : ${k}`, achatFaq.includes(rangeText(PRICE_RANGES[k])));
}

/**
 * Fourchettes en euros écrites en dur dans les textes qui reprennent la
 * source. Seules restent permises celles qui décrivent autre chose qu'un
 * poêle posé (autres modes de chauffage, coût annuel, surcoût d'un matériel),
 * ou un cas distinct nommé dans sa phrase.
 */
// Espace ordinaire, insécable (U+00A0) ou fine insécable (U+202F), écrites
// par leur code (lib/typo.ts).
const SP = `[ ${NBSP}${NNBSP}]`;
const NUM = String.raw`\d{1,3}(?:` + SP + String.raw`\d{3})*`;
const RANGE_RE = new RegExp(`${NUM}${SP}?(?:€${SP})?(?:à|et)${SP}${NUM}${SP}€`, "g");
/** « autour de 4 000 € » : un prix d'appel approximatif, contredit par le prix calculé. */
const ABOUT_PRICE_RE = new RegExp(`autour${SP}de${SP}${NUM}${SP}?€`);
const ALLOWED: Record<string, string[]> = {
  "app/(frontend)/page.tsx": [
    // Comparatif : mazout, gaz, pompe à chaleur (investissement), coût annuel.
    "8 000 à 15 000 €", "5 000 à 12 000 €", "12 000 à 22 000 €",
    "700 à 1 100 €", "2 200 à 2 800 €", "1 600 à 2 200 €", "800 à 1 400 €",
  ],
  "app/llms.txt/route.ts": [],
  "app/llms-full.txt/route.ts": [],
  // Surcoût d'un poêle étanche ; coût annuel d'entretien.
  "lib/faqs.ts": ["200 à 400 €", "700 à 1 400 €"],
  // Conduit existant et conforme, sans tubage : cas nommé dans la phrase.
  "lib/guides.ts": ["4 000 à 5 500 €"],
};
for (const [file, allowed] of Object.entries(ALLOWED)) {
  const text = readFileSync(file, "utf8");
  const found = [...text.matchAll(RANGE_RE)].map((m) => m[0].replace(new RegExp(SP, "g"), " "));
  const stray = [...new Set(found)].filter((r) => !allowed.includes(r));
  check(`${file} : aucune fourchette en dur hors liste`, stray, []);
  assert(`${file} : pas de « autour de » devant un prix`, !ABOUT_PRICE_RE.test(text));
}
for (const file of ["app/(frontend)/page.tsx", "app/llms.txt/route.ts"]) {
  assert(`${file} : lit lib/price-ranges.ts`, readFileSync(file, "utf8").includes("@/lib/price-ranges"));
}

// ---------------------------------------------------------------------------
// 3. Délai d'un projet
// ---------------------------------------------------------------------------
const delayFaq = FAQS.find((f) => f.id === "general-delai")?.answer ?? "";
assert("FAQ délai : constante de lib/services.ts", delayFaq.includes(PROJECT_LEAD_TIME.range));
for (const file of [
  "app/(frontend)/page.tsx",
  "app/(frontend)/installation-poele-a-pellets/page.tsx",
  "app/(frontend)/poeles-pellets/[ville]/page.tsx",
]) {
  const text = readFileSync(file, "utf8");
  assert(`${file} : lit PROJECT_LEAD_TIME`, text.includes("PROJECT_LEAD_TIME.range"));
  assert(`${file} : aucun délai de pose écrit à la main`, !/(?:Pose|pose)[ \u00a0]+(?:en[ \u00a0]+)?\d+[-\u00a0 à]+\d+[ \u00a0]semaines/.test(text));
}

// ---------------------------------------------------------------------------
// 4. Estimation : « TVAC » partout, détail en HTVA
// ---------------------------------------------------------------------------
{
  const conf = readFileSync("components/forms/EstimateConfigurator.tsx", "utf8");
  // Texte affiché seulement : les noms de variables (totalTTC) ne comptent pas.
  assert("estimation : aucun « TTC » affiché", !/[ "]TTC\b(?!\()/.test(conf.replace(/\b\w+TTC\b/g, "")));
  assert("estimation : détail marqué HTVA", conf.includes("Montants HTVA") && conf.includes("Sous-total HTVA"));
}

// 5. Fiche : garantie légale, délai seulement s'il est saisi
{
  const priced = { priceTTC: 2990, stockStatus: "in_stock" };
  check("fiche : garantie seule sans délai", shownDeliveryDelay({ ...priced }), undefined);
  check("fiche : délai vide ignoré", shownDeliveryDelay({ ...priced, deliveryDelay: "  " }), undefined);
  check("fiche : valeur par défaut « 48-72h » ignorée", shownDeliveryDelay({ ...priced, deliveryDelay: "48-72h" }), undefined);
  check("fiche : valeur par défaut, autre écriture", shownDeliveryDelay({ ...priced, deliveryDelay: "48-72H " }), undefined);
  check("fiche sur devis : pas de délai", shownDeliveryDelay({ deliveryDelay: "4-6 sem." }), undefined);
  check("fiche en commande : pas de délai", shownDeliveryDelay({ ...priced, stockStatus: "on_order", deliveryDelay: "4-6 sem." }), undefined);
  check("fiche chiffrée en stock : délai saisi", shownDeliveryDelay({ ...priced, deliveryDelay: "4-6 sem." }), "4-6 sem.");
  assert("fiche : la ligne commence par la garantie", guaranteeLine({}).startsWith("Garantie légale de 2 ans"));
  assert("fiche : la page affiche la ligne de garantie", readFileSync("app/(frontend)/produit/[slug]/page.tsx", "utf8").includes("guaranteeLine(product)"));
}

// ---------------------------------------------------------------------------
// 6. Libellés d'action : un par action, liens de rendez-vous indexables
// ---------------------------------------------------------------------------
{
  const OLD_LABELS = /Chiffrer mon installation|Chiffrer la pose|Estimer mon installation|Choisir (?:un|mon) créneau|Réserver (?:une|la) visite (?:en ligne|technique)/;
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
      d.isDirectory() ? walk(join(dir, d.name)) : /\.tsx?$/.test(d.name) ? [join(dir, d.name)] : [],
    );
  const files = [...walk("app"), ...walk("components")];
  const stale = files.filter((f) => OLD_LABELS.test(readFileSync(f, "utf8")));
  check("libellés : aucun ancien libellé d'action", stale, []);
  // /visite-technique est en noindex : seule sa propre page y renvoie.
  const toVisit = files.filter(
    (f) => !f.includes("visite-technique") && /href=["{](?:"\/visite-technique"|ROUTES\.visit\b)|href="\/visite-technique"/.test(readFileSync(f, "utf8")),
  );
  check("rendez-vous : aucun lien vers /visite-technique (noindex)", toVisit, []);
  check("en-tête : libellé de référence de l'estimation", ACTION_LABELS.estimate, "Estimer mon projet");
}

// 7. Flux Merchant : availability_date au décalage de Bruxelles de la date
check("Bruxelles : hiver", brusselsMidnightISO(new Date("2026-11-11T20:00:00Z"), 35), "2026-12-16T00:00:00+01:00");
check("Bruxelles : été", brusselsMidnightISO(new Date("2026-06-01T10:00:00Z")), "2026-06-01T00:00:00+02:00");
check("Bruxelles : jour du passage à l'heure d'été", brusselsMidnightISO(new Date("2027-03-28T10:00:00Z")), "2027-03-28T00:00:00+01:00");
check("Bruxelles : lendemain du passage", brusselsMidnightISO(new Date("2027-03-29T10:00:00Z")), "2027-03-29T00:00:00+02:00");
check("Bruxelles : jour du retour à l'heure d'hiver", brusselsMidnightISO(new Date("2026-10-25T10:00:00Z")), "2026-10-25T00:00:00+02:00");
check("Bruxelles : date civile locale, pas UTC", brusselsMidnightISO(new Date("2026-12-31T23:30:00Z")), "2027-01-01T00:00:00+01:00");
assert("flux : plus de décalage écrit en dur", !/T00:00:00\+0[12]:00/.test(readFileSync("app/api/feed/google-merchant/route.ts", "utf8")));

if (ko > 0) {
  console.error(`\n${ko} contrôle(s) en échec.`);
  process.exit(1);
}
console.log("\nTout est cohérent.");
