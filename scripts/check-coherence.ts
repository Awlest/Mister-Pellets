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
import { DEFAULT_STATE, estimate, requestedModel, type EstimateProduct } from "@/lib/estimate";
import { estimateOptions, isEstimable, type EstimableRow } from "@/lib/estimable";
import {
  PRICE_REQUEST_SUBJECT,
  priceRequestHref,
  priceRequestMessage,
  productPrimaryAction,
  readModelParam,
} from "@/lib/price-request";
import { PRICE_RANGES, RANGES_VAT_NOTE, rangeText } from "@/lib/price-ranges";
import { FAQS } from "@/lib/faqs";
import { getGuideBySlug } from "@/lib/guides";
import { getArticleBySlug } from "@/lib/articles";
import { NBSP, NNBSP } from "@/lib/typo";
import { PROJECT_LEAD_TIME } from "@/lib/services";
import { fichePrices, guaranteeLine, reducedVatPrice, shownDeliveryDelay, shownPriceTTC, stoveListPrice } from "@/lib/product-price";

let ko = 0;
function check(label: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) ko++;
  console.log(`${ok ? "ok  " : "KO  "} ${label}${ok ? "" : `\n      attendu ${JSON.stringify(want)}\n      obtenu  ${JSON.stringify(got)}`}`);
}
function assert(label: string, cond: boolean) {
  check(label, cond, true);
}
/** Fichiers .ts et .tsx des dossiers donnés, récursivement. */
function sourceFiles(dirs: string[]): string[] {
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
      d.isDirectory() ? walk(join(dir, d.name)) : /\.tsx?$/.test(d.name) ? [join(dir, d.name)] : [],
    );
  return dirs.flatMap(walk);
}

// ---------------------------------------------------------------------------
// 1. Fiche sur devis et estimation
// ---------------------------------------------------------------------------
const labels = { estimate: "Estimer" };
const priced = productPrimaryAction({ slug: "cadel-zefiro-9", name: "Cadel Zefiro 9", priceTTC: 2990, isEstimable: true }, labels);
check("fiche chiffrée : estimation sur le modèle", [priced.kind, priced.href], ["estimate", "/estimation?modele=cadel-zefiro-9"]);
const quote = productPrimaryAction({ slug: "mcz-ego-air-8-r", name: "MCZ Ego Air 8 R" }, labels);
check("fiche sur devis : demande de prix", quote.kind, "price-request");
check("fiche sur devis : adresse sans nom", quote.href, "/contact?modele=mcz-ego-air-8-r");
check("fiche à 0 € : demande de prix", productPrimaryAction({ slug: "x", name: "X", priceTTC: 0 }, labels).kind, "price-request");

check("formulaire : slug relu", readModelParam("?modele=mcz-ego-air-8-r"), "mcz-ego-air-8-r");
check("formulaire : slug invalide ignoré", readModelParam("?modele=../admin"), null);
check("formulaire : texte libre ignoré", readModelParam("?modele=Remboursement%20:%20appelez%20le%2004"), null);
check("formulaire : majuscules refusées, pas corrigées", readModelParam("?modele=MCZ-Ego"), null);
check("formulaire : 80 caractères au plus", readModelParam(`?modele=${"a".repeat(81)}`), null);
check("formulaire : 80 caractères acceptés", readModelParam(`?modele=${"a".repeat(80)}`), "a".repeat(80));
check("formulaire : sans modèle", readModelParam(""), null);
{
  // /contact reste statique (CDN, aucune lecture de la base) : pas d'API dynamique.
  const contact = readFileSync("app/(frontend)/contact/page.tsx", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  check(
    "contact : page statique, aucune API dynamique",
    ["searchParams", "headers(", "cookies(", "getProductBySlug", "async function ContactPage"].filter((t) => contact.includes(t)),
    [],
  );
  // Le formulaire n'affiche aucun texte venu de l'adresse : seulement le slug validé, dans un lien.
  const form = readFileSync("components/forms/ContactForm.tsx", "utf8");
  assert("formulaire : lit l'adresse par readModelParam seulement", form.includes("readModelParam(search)") && !/searchParams|URLSearchParams|location\.search\)\.get/.test(form));
}
check(
  "message : cite l'adresse de la fiche",
  priceRequestMessage("a-b").split("\n")[0],
  "Bonjour, je souhaite connaître le prix de ce modèle, pose comprise : https://mister-pellets.be/produit/a-b",
);
check("sujet présélectionné", PRICE_REQUEST_SUBJECT, "info-produit");
check("demande sans nom", priceRequestHref("a-b"), "/contact?modele=a-b");
assert("fiche : bloc final de la demande de prix en nofollow", readFileSync("app/(frontend)/produit/[slug]/page.tsx", "utf8").includes('href: primary.href, rel: "nofollow"'));

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
/**
 * Tout app/ et lib/ : une fourchette écrite à la main qui ressemble à une de
 * la source (même bas de fourchette, haut à 2 000 € près) doit passer par
 * lib/price-ranges.ts. Exception nommée : l'investissement d'une chaudière
 * mazout dans le comparatif de l'accueil (8 000 à 15 000 €).
 */
{
  const EXCEPTIONS = new Set([`${join("app", "(frontend)", "page.tsx")} : 8 000 à 15 000 €`]);
  const amounts = (r: string) => (r.match(/\d{1,3}(?: \d{3})*/g) ?? []).map((n) => Number(n.replace(/ /g, "")));
  const stray: string[] = [];
  for (const file of sourceFiles(["app", "lib"])) {
    if (file === join("lib", "price-ranges.ts")) continue;
    for (const m of readFileSync(file, "utf8").matchAll(RANGE_RE)) {
      const text = m[0].replace(new RegExp(SP, "g"), " ");
      const [min, max] = amounts(text);
      const lookalike = Object.values(PRICE_RANGES).some(
        (r) => min === r.min && max != null && Math.abs(max - r.max) <= 2000,
      );
      const id = `${file} : ${text}`;
      if (lookalike && !EXCEPTIONS.has(id)) stray.push(id);
    }
  }
  check("app/ et lib/ : aucune fourchette de poêle posé écrite à la main", stray, []);
  const mazout = getArticleBySlug("remplacer-chaudiere-mazout-poele-hydro")?.tldr ?? "";
  assert("article mazout : fourchette et puissances hydro de la source", mazout.includes(`${rangeText(PRICE_RANGES.hydro)} TVAC posé, selon la puissance (${PRICE_RANGES.hydro.power})`));
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
  "app/(frontend)/zones-d-intervention/page.tsx",
]) {
  assert(`${file} : lit PROJECT_LEAD_TIME`, readFileSync(file, "utf8").includes("PROJECT_LEAD_TIME.range"));
}
/**
 * Tout app/ et lib/ : une fourchette de semaines dans une phrase qui parle de
 * la pose, du projet ou d'un total est écrite à la main (« Pose 2-3 semaines »,
 * « 2 à 3 semaines entre le devis signé et la pose »). Seule lib/services.ts
 * porte le délai. Les autres délais (matériel en commande, livraison des CGV,
 * entretien) ne sont pas visés.
 */
{
  const WEEKS = new RegExp(`\\d+${SP}*(?:-|à)${SP}*\\d+${SP}+semaines`, "g");
  const ABOUT_PROJECT = /\bpose\b|\bprojet\b|au total|mise en service|premier contact/i;
  const stray: string[] = [];
  for (const file of sourceFiles(["app", "lib"])) {
    if (file === join("lib", "services.ts")) continue;
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(WEEKS)) {
      // La phrase autour : jusqu'au point, au guillemet ou à la fin de ligne.
      const before = text.slice(0, m.index).split(/[.!?"`\n]/).pop() ?? "";
      const after = text.slice(m.index + m[0].length).split(/[.!?"`\n]/)[0] ?? "";
      if (ABOUT_PROJECT.test(before + m[0] + after)) stray.push(`${file} : ${m[0]}`);
    }
  }
  check("app/ et lib/ : aucun délai de projet écrit à la main", stray, []);
}
for (const file of ["app/(frontend)/page.tsx"]) {
  const text = readFileSync(file, "utf8");
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
  assert("estimation : sous-total = somme des lignes HTVA", conf.includes("eurCents(r.subtotalHT - r.bonusHT)"));
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
  check("fiche : garantie de l'appareil seul", guaranteeLine({}), "Garantie légale de 2 ans sur le poêle");
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

// ---------------------------------------------------------------------------
// 8. Prix du poêle : fiche et estimation au même montant, bonus compris
// ---------------------------------------------------------------------------
{
  // Instantané du catalogue du dépôt (sans base), plus des cas construits :
  // promo plus basse, promo plus haute (ignorée), prix HT seul.
  const snapshot = (
    JSON.parse(readFileSync("backups/products-before-2026-05-15T16-50-07-583Z.json", "utf8")) as {
      products: (EstimableRow & { slug: string; brand: string; productType: string })[];
    }
  ).products;
  const rows = [
    ...snapshot,
    { slug: "cas-zefiro", brand: "Cadel", productType: "insert", power: 9, priceTTC: 4017 },
    { slug: "cas-promo", brand: "EK63", productType: "standard", power: 8, priceTTC: 2990, promoPrice: 2690 },
    { slug: "cas-promo-haute", brand: "EK63", productType: "standard", power: 8, priceTTC: 2990, promoPrice: 3190 },
  ];
  const gaps: string[] = [];
  let compared = 0;
  for (const row of rows) {
    if (row.hiddenFromBoutique) continue;
    for (const opt of estimateOptions(row)) {
      // Fiche simple seulement : sur une fiche à puissances, la fiche affiche
      // « à partir de » et l'estimation le prix de chaque puissance.
      if (opt.fromVariant) continue;
      const product = { key: row.slug, slug: row.slug, name: row.slug, brand: row.brand, productType: row.productType, powerKw: opt.kw, priceHT: opt.ht, priceTTC: opt.ttc ?? undefined } as EstimateProduct;
      for (const bonus of [false, true]) {
        const shown = shownPriceTTC({ brand: row.brand, ...fichePrices(row, bonus) });
        if (!shown) continue;
        compared++;
        const fiche6 = reducedVatPrice(shown);
        const list6 = stoveListPrice(product, { bonus, reduced: true });
        const list21 = stoveListPrice(product, { bonus, reduced: false });
        // Récapitulatif : poêle moins la ligne de bonus = hors TVA du prix affiché.
        const r = estimate({ ...DEFAULT_STATE, housingOver10Years: true, productKey: product.key }, product, { bonus });
        const netHT = r.materialHT - r.bonusHT;
        if (fiche6 !== list6 || shown !== list21 || netHT !== Math.round(shown / 1.21) || Math.round(netHT * 1.06) !== list6)
          gaps.push(`${row.slug}${bonus ? " (bonus)" : ""} : fiche ${shown}/${fiche6}, liste ${list21}/${list6}, net HT ${netHT}`);
      }
    }
  }
  assert(`prix : ${compared} comparaisons fiche / estimation (instantané + cas)`, compared > 150);
  check("prix : fiche et liste de l'estimation identiques, récapitulatif cohérent", gaps, []);
  // Le cas relevé à la recette : Cadel Zefiro 9, bonus -10 %, TVA 6 %.
  const zef = { key: "z", slug: "z", name: "z", brand: "Cadel", productType: "insert", powerKw: 9, priceHT: 3320, priceTTC: 4017 } as EstimateProduct;
  check("prix : Zefiro 9 à 6 %, bonus déduit", stoveListPrice(zef, { bonus: true, reduced: true }), 3167);
  assert("estimation : la liste des modèles passe par stoveListPrice", readFileSync("components/forms/EstimateConfigurator.tsx", "utf8").includes("stoveListPrice(p, { bonus: bonusActive"));
}

if (ko > 0) {
  console.error(`\n${ko} contrôle(s) en échec.`);
  process.exit(1);
}
console.log("\nTout est cohérent.");
