/**
 * Périmètre du catalogue : Mister Pellets ne vend pas d'appareil à bois bûche.
 *
 * Ce contrôle échoue si une fiche bois peut revenir sur le site par le code :
 * lecture de la collection `products` hors des fonctions filtrées, libellé
 * « à bois », redirection manquante, en chaîne ou en boucle, texte qui
 * présente un poêle, un insert ou un foyer à bois sans renvoyer vers
 * mister-bois.be. Il ne lit ni la base ni le réseau.
 *
 * pnpm check:catalogue
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";
import {
  FICHES_BOIS_SANS_EQUIVALENT,
  FICHES_BOIS_VERS_MISTER_BOIS,
  FICHES_HYBRIDES_SUR_MISTER_BOIS,
  MISTER_BOIS,
  MISTER_BOIS_URL,
} from "@/config/mister-bois";
import { REDIRECTED_PRODUCT_SLUGS, SITE_REDIRECTS, resolveRedirectChains } from "@/config/redirects";
import {
  COMBUSTIBLES_HORS_CATALOGUE,
  inCatalogueWhere,
  isHybrid,
  isOffCatalogue,
  misterBoisCanonical,
  misterBoisDestination,
} from "@/lib/catalog-scope";
import { productKindLabel } from "@/lib/product-kind";
import { COMBUSTIBLE_LABELS, type Appliance, type ProductDemo, type ProductType } from "@/lib/products-demo";
import { BRANDS, TOP_TIER_BRANDS } from "@/lib/brands";
import { CITIES } from "@/lib/cities";
import { CATEGORIES, categoriesOf } from "@/lib/categories";
import { PUBLISHED } from "@/config/navigation";
import {
  DESCRIPTION_MAX,
  TITLE_MAX,
  productDescription,
  productJsonLd,
  productOffers,
  productTitle,
  validGtin,
} from "@/lib/product-seo";

const ROOT = process.cwd();
const read = (file: string): string => readFileSync(join(ROOT, file), "utf8");

/** Fichiers .ts et .tsx d'un dossier, chemins relatifs à la racine, en « / ». */
function sources(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const path = posix.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...sources(path));
    else if (/\.tsx?$/.test(entry.name)) out.push(path);
  }
  return out;
}

const BOIS_SLUGS = [...Object.keys(FICHES_BOIS_VERS_MISTER_BOIS), ...Object.keys(FICHES_BOIS_SANS_EQUIVALENT)];
const HYBRID_SLUGS = Object.keys(FICHES_HYBRIDES_SUR_MISTER_BOIS);
const bySource = new Map(SITE_REDIRECTS.map((r) => [r.source, r]));

/** Source à motif (`/product-page/:slug`) en expression régulière. */
function patternToRegExp(source: string): RegExp | null {
  if (!/[:*(]/.test(source)) return null;
  const body = source
    .replace(/[.+?^${}|[\]\\]/g, "\\$&")
    .replace(/:[A-Za-z_]+\*/g, ".*")
    .replace(/:[A-Za-z_]+/g, "[^/]+");
  return new RegExp(`^${body}$`);
}

/**
 * Un texte qui nomme un appareil à bois bûche comme un produit. Les hybrides
 * (« poêle hybride bois et pellets », « mixte bois-pellets ») ne sont pas
 * visés : ils restent au catalogue.
 */
const WOOD_PRODUCT =
  /\b(?:po[êe]les?|inserts?|foyers?|chemin[ée]es?|cuisini[èe]res?)(?:\s+et\s+(?:des\s+)?(?:po[êe]les?|inserts?|foyers?))?\s+à\s+(?:bois|b[ûu]ches?)\b/i;
const ALLOW = /check-catalogue: allow \([^)]+\)/;
const RENVOI = /mister-bois\.be|Mister Bois/;

/** Dossiers et fichiers où un texte est servi au visiteur, à un moteur ou à une IA. */
const TEXT_ROOTS = ["app/(frontend)", "app/llms.txt", "app/api/feed", "components", "lib", "config"];
/** Socle légal commun aux quatre sites d'Awlest : il décrit toute la société. */
const TEXT_SKIP = /^lib\/legal\//;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Fiche d'essai pour les contrôles de titre et de données structurées. */
function sample(over: Partial<ProductDemo>): ProductDemo {
  return {
    slug: "marque-modele",
    name: "Marque Modèle 9",
    brand: "Marque",
    type: "standard",
    combustible: "pellet",
    isAirtight: true,
    isConnected: true,
    diffusion: "ventilation-forcee",
    color: "dark",
    powerKw: 9,
    power: "9 kW",
    sku: "MRQ-9",
    mpn: "123456",
    shortDescription: "Poêle à pellets de 9 kW pour 240 m³ max., étanche, Wi-Fi de série.",
    ...over,
  };
}

const checks: [string, () => void][] = [
  [
    "slugs cités dans les pages marque et ville : forme, marque, jamais une fiche redirigée",
    () => {
      // Le dépôt n'a pas d'instantané du catalogue : le contrôle porte sur la
      // forme. La page marque ne lie de toute façon qu'une fiche visible, et la
      // page ville n'affiche que les fiches trouvées.
      for (const brand of Object.values(BRANDS))
        for (const model of brand.modelsTable ?? []) {
          if (!model.slug) continue;
          assert.match(model.slug, SLUG, model.slug);
          assert.ok(model.slug.startsWith(`${brand.slug}-`), `${model.slug} n'est pas une fiche ${brand.name}`);
          assert.ok(!REDIRECTED_PRODUCT_SLUGS.has(model.slug), `${brand.slug} lie une fiche redirigée : ${model.slug}`);
        }
      const brandSlugs = TOP_TIER_BRANDS.map((b) => b.slug);
      for (const city of CITIES) {
        assert.equal(city.recommendedModels.length, 3, `${city.slug} : 3 fiches attendues`);
        assert.equal(new Set(city.recommendedModels).size, 3, `${city.slug} : fiche en double`);
        assert.ok(city.recommendedModels.some((slug) => slug.startsWith("mcz-")), `${city.slug} : aucune fiche MCZ`);
        for (const slug of city.recommendedModels) {
          assert.match(slug, SLUG, slug);
          assert.ok(brandSlugs.some((b) => slug.startsWith(`${b}-`)), `${city.slug} : ${slug} n'est pas d'une marque affichée`);
          assert.ok(!REDIRECTED_PRODUCT_SLUGS.has(slug), `${city.slug} recommande une fiche redirigée : ${slug}`);
          assert.ok(!(slug in FICHES_HYBRIDES_SUR_MISTER_BOIS), `${city.slug} recommande un hybride : ${slug}`);
        }
      }
    },
  ],
  [
    "catégories : pages publiées, chapô de 80 à 120 mots, hybrides exclus",
    () => {
      for (const category of CATEGORIES) {
        assert.equal(category.path, `/${category.slug}`);
        assert.ok(PUBLISHED.has(category.path), `${category.path} absente de PUBLISHED`);
        const words = category.intro.trim().split(/\s+/).length;
        assert.ok(words >= 80 && words <= 120, `${category.slug} : chapô de ${words} mots`);
        assert.ok(category.metaDescription.length >= 120 && category.metaDescription.length <= 158, `${category.slug} : description de ${category.metaDescription.length} caractères`);
        assert.ok(category.metaTitle.length <= TITLE_MAX, category.metaTitle);
        assert.ok(!/[—–]/.test(category.intro + category.metaDescription), `${category.slug} : tiret long`);
      }
      assert.deepEqual(categoriesOf(sample({ combustible: "hybride", type: "hybride-hydro", isHydro: true })), []);
      assert.deepEqual(categoriesOf(sample({ type: "canalisable", isCanalizable: true })).map((c) => c.slug), [
        "poeles-a-pellets-canalisables",
        "poeles-a-pellets-etanches",
      ]);
    },
  ],
  [
    "fiche produit : titre de 60 caractères au plus, description de 158 au plus",
    () => {
      const long = sample({ name: "Girolami TI Slim Panorama Maiolica Canalisable", type: "hybride-hydro", combustible: "hybride", appliance: "insert", isHydro: true, powers: [18.1, 22.1, 24.1] });
      for (const p of [sample({}), sample({ type: "canalisable", isCanalizable: true }), sample({ type: "hydro", isHydro: true }), long]) {
        const title = productTitle(p);
        assert.ok(title.length <= TITLE_MAX, `${title.length} caractères : ${title}`);
        assert.ok(title.includes(p.name), title);
        for (const price of ["Prix sur devis.", "Dès 12 345 € TVAC, hors pose."]) {
          const description = productDescription({ ...p, shortDescription: "x ".repeat(120) + "fin." }, price);
          assert.ok(description.length <= DESCRIPTION_MAX, `${description.length} caractères`);
          assert.ok(description.endsWith(price));
        }
      }
      assert.equal(productTitle(sample({})), "Poêle à pellets Marque Modèle 9 9 kW");
      assert.ok(productDescription(sample({}), "Prix sur devis.").startsWith("Marque Modèle 9 : poêle à pellets de 9 kW"));
    },
  ],
  [
    "fiche produit : jamais de prix à 0, pas de Product sans offre, pas de politique de retour",
    () => {
      const variant = (price: number, extra = {}) => ({ id: String(price), optionValueIds: [], price, ...extra });
      const quote = sample({ hasVariants: true, variants: [variant(0), variant(0)] });
      assert.deepEqual(productOffers(quote), []);
      const page = productJsonLd(quote, "Description.");
      assert.equal(page["@type"], "WebPage");
      assert.ok(page.name && page.description && page.about && !("offers" in page));

      const mixed = sample({ hasVariants: true, priceTTC: 2856, variants: [variant(0), variant(2856, { sku: "A", mpn: "817570", gtin: "816300" }), variant(3100, { salePrice: 2990 })] });
      const product = productJsonLd(mixed, "Description.");
      assert.equal(product["@type"], "Product");
      assert.ok(product.sku && product.mpn && product.brand && product.category);
      const offers = product.offers as Record<string, unknown>[];
      assert.deepEqual(offers.map((o) => o.price), [2856, 2990]);
      assert.ok(!("gtin" in offers[0]!), "une référence à 6 chiffres n'est pas un GTIN");
      const json = JSON.stringify(product);
      assert.ok(!/"price":0[,}]/.test(json) && !json.includes("AggregateOffer") && !json.includes("MerchantReturnPolicy"));
      assert.ok(!/aggregateRating|"review"/.test(json));
      assert.ok(json.includes("OfferShippingDetails") && json.includes(`"seller":{"@id":"https://mister-pellets.be/#organization"}`));

      const simple = productJsonLd(sample({ priceTTC: 2105 }), "Description.");
      assert.equal((simple.offers as Record<string, unknown>).price, 2105);
      assert.equal(validGtin("816300"), undefined);
      assert.equal(validGtin("8012345678901"), "8012345678901");
    },
  ],
  [
    "le bois bûche est hors catalogue, l'hybride y reste",
    () => {
      assert.ok(COMBUSTIBLES_HORS_CATALOGUE.includes("bois"));
      assert.ok(isOffCatalogue("bois"));
      assert.ok(!isOffCatalogue("pellet") && !isOffCatalogue("hybride") && !isOffCatalogue(null));
      assert.deepEqual(inCatalogueWhere(), [{ combustible: { not_equals: "bois" } }]);
      assert.ok(isHybrid({ combustible: "hybride" }) && isHybrid({ type: "hybride-hydro" }));
      assert.ok(!isHybrid({ combustible: "pellet", type: "standard" }));
    },
  ],
  [
    "aucun libellé de fiche ne dit « à bois »",
    () => {
      const appliances: (Appliance | undefined)[] = [undefined, "poele", "insert", "foyer", "chaudiere"];
      const types: ProductType[] = ["standard", "canalisable", "hydro", "hybride", "hybride-hydro", "insert"];
      for (const appliance of appliances)
        for (const type of types)
          for (const isHydro of [false, true])
            for (const combustible of ["pellet", "bois", "hybride"] as const) {
              const label = productKindLabel({ type, combustible, appliance, isHydro });
              assert.ok(!/à bois/.test(label), `${combustible}/${type}/${appliance} : « ${label} »`);
              if (combustible === "bois" && type !== "hybride" && type !== "hybride-hydro")
                assert.ok(!/bois/.test(label), `fiche bois : « ${label} »`);
            }
      assert.ok(!("bois" in COMBUSTIBLE_LABELS), "option « Bois » dans le filtre de la boutique");
      const badges = read("components/product/ProductFeatureBadges.tsx");
      assert.ok(!/label:\s*"Bois/.test(badges), "pastille « Bois » sur les cartes");
      const feed = read("app/api/feed/google-merchant/route.ts");
      assert.ok(!/Po[êe]les à bois/.test(feed), "famille « Poêles à bois » dans le flux Merchant");
    },
  ],
  [
    "tables de renvoi vers Mister Bois : forme et cohérence",
    () => {
      assert.ok(BOIS_SLUGS.length >= 43, `${BOIS_SLUGS.length} fiches bois`);
      assert.equal(new Set(BOIS_SLUGS).size, BOIS_SLUGS.length, "slug bois en double");
      for (const slug of HYBRID_SLUGS) assert.ok(!BOIS_SLUGS.includes(slug), `${slug} est bois ET hybride`);
      const all = { ...FICHES_BOIS_VERS_MISTER_BOIS, ...FICHES_BOIS_SANS_EQUIVALENT, ...FICHES_HYBRIDES_SUR_MISTER_BOIS };
      for (const [slug, url] of Object.entries(all)) {
        assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, slug);
        assert.ok(url.startsWith(`${MISTER_BOIS_URL}/`), `${slug} : ${url}`);
        assert.ok(!/[?#\s]|\/$/.test(url), `${slug} : adresse non canonique ${url}`);
      }
      for (const url of Object.values(FICHES_HYBRIDES_SUR_MISTER_BOIS))
        assert.ok(url.startsWith(`${MISTER_BOIS.hybrids}/`), url);
    },
  ],
  [
    "chaque fiche bois est redirigée en permanent vers mister-bois.be, pas les hybrides",
    () => {
      for (const slug of BOIS_SLUGS)
        for (const prefix of ["/produit", "/product-page"]) {
          const rule = bySource.get(`${prefix}/${slug}`);
          assert.ok(rule, `pas de redirection pour ${prefix}/${slug}`);
          assert.ok(rule.permanent, `${rule.source} n'est pas permanente`);
          assert.ok(rule.destination.startsWith(`${MISTER_BOIS_URL}/`), `${rule.source} → ${rule.destination}`);
          assert.equal(rule.destination, misterBoisDestination({ slug }), rule.source);
        }
      for (const slug of BOIS_SLUGS) assert.ok(REDIRECTED_PRODUCT_SLUGS.has(slug), `${slug} serait encore construite`);
      for (const slug of HYBRID_SLUGS) {
        assert.ok(!bySource.has(`/produit/${slug}`), `l'hybride ${slug} est redirigé`);
        assert.equal(misterBoisCanonical(slug), FICHES_HYBRIDES_SUR_MISTER_BOIS[slug]);
      }
    },
  ],
  [
    "filet de sécurité : une fiche bois inconnue part sur sa catégorie de Mister Bois",
    () => {
      assert.equal(misterBoisDestination({ slug: "nouveau-poele", appliance: "poele" }), MISTER_BOIS.stoves);
      assert.equal(misterBoisDestination({ slug: "nouvel-insert", appliance: "insert" }), MISTER_BOIS.inserts);
      assert.equal(misterBoisDestination({ slug: "nouveau-foyer", appliance: "foyer", type: "hydro" }), MISTER_BOIS.inserts);
      assert.equal(misterBoisDestination({ slug: "sans-appareil", type: "insert" }), MISTER_BOIS.inserts);
      assert.equal(misterBoisDestination({ slug: "sans-rien" }), MISTER_BOIS.stoves);
      assert.equal(misterBoisDestination({ slug: "chaudiere", appliance: "chaudiere" }), MISTER_BOIS.home);
      assert.equal(misterBoisCanonical("hybride-inconnu"), undefined);
      const page = read("app/(frontend)/produit/[slug]/page.tsx");
      assert.ok(page.includes("getOffCatalogueRedirect(slug)") && page.includes("permanentRedirect("));
    },
  ],
  [
    "redirections : ni source en double, ni chaîne, ni boucle",
    () => {
      assert.equal(bySource.size, SITE_REDIRECTS.length, "source en double");
      const patterns = SITE_REDIRECTS.map((r) => ({ rule: r, re: patternToRegExp(r.source) })).filter(
        (p): p is { rule: (typeof SITE_REDIRECTS)[number]; re: RegExp } => p.re !== null,
      );
      for (const rule of SITE_REDIRECTS) {
        assert.notEqual(rule.source, rule.destination, `${rule.source} se redirige vers elle-même`);
        if (!rule.destination.startsWith("/")) continue;
        const path = rule.destination.split(/[?#]/)[0]!;
        // Une destination à paramètre (`/produit/:slug`) n'est pas une adresse : la
        // règle qui la porte passe après les adresses exactes (config/redirects.ts).
        if (/[:*(]/.test(path)) continue;
        assert.ok(!bySource.has(path), `chaîne : ${rule.source} → ${path} → ${bySource.get(path)?.destination}`);
        for (const p of patterns)
          assert.ok(!p.re.test(path), `chaîne : ${rule.source} → ${path}, repris par ${p.rule.source}`);
      }
      // Les règles à motif passent après les adresses exactes qu'elles recouvrent.
      SITE_REDIRECTS.forEach((rule, index) => {
        for (const p of patterns) {
          if (p.rule === rule || !p.re.test(rule.source)) continue;
          assert.ok(index < SITE_REDIRECTS.indexOf(p.rule), `${rule.source} est masquée par ${p.rule.source}`);
        }
      });
      assert.throws(() =>
        resolveRedirectChains([
          { source: "/a", destination: "/b", permanent: true },
          { source: "/b", destination: "/a", permanent: true },
        ]),
      );
      assert.deepEqual(
        resolveRedirectChains([
          { source: "/a", destination: "/b", permanent: true },
          { source: "/b", destination: "https://mister-bois.be/c", permanent: true },
        ]).map((r) => r.destination),
        ["https://mister-bois.be/c", "https://mister-bois.be/c"],
      );
    },
  ],
  [
    "la collection products n'est lue que par les fonctions qui écartent le bois",
    () => {
      const READ = /collection:\s*["']products["']/;
      const allowedFiles = ["lib/products.ts", "lib/estimate-catalog.ts"];
      const files = [...sources("app"), ...sources("components"), ...sources("lib")].filter(
        (f) => !f.startsWith("app/(payload)/"),
      );
      for (const file of files) {
        if (!READ.test(read(file))) continue;
        assert.ok(allowedFiles.includes(file), `${file} lit la collection products hors de lib/products.ts`);
      }
      // getAllProductSlugs ne renvoie que des slugs, pour construire les pages :
      // celle d'une fiche bois est une redirection (getOffCatalogueRedirect).
      const slugsOnly = new Set(["getAllProductSlugs"]);
      for (const file of allowedFiles) {
        const parts = read(file).split(/^export (?:async )?function /m).slice(1);
        for (const part of parts) {
          if (!READ.test(part)) continue;
          const name = part.match(/^\w+/)?.[0] ?? "?";
          if (slugsOnly.has(name)) continue;
          assert.ok(
            /isOffCatalogue\(|inCatalogueWhere\(/.test(part),
            `${file} : ${name} lit products sans écarter les combustibles hors catalogue`,
          );
        }
      }
    },
  ],
  [
    "aucun texte ne présente un appareil à bois sans renvoyer vers Mister Bois",
    () => {
      const failures: string[] = [];
      const files = TEXT_ROOTS.flatMap(sources).filter((f) => !TEXT_SKIP.test(f));
      for (const file of files) {
        const lines = read(file).split("\n");
        lines.forEach((line, i) => {
          const trimmed = line.trim();
          // Commentaires de code : jamais servis.
          if (/^(\*|\/\/|\/\*|\{\/\*)/.test(trimmed)) return;
          if (!WOOD_PRODUCT.test(line)) return;
          if (RENVOI.test(line)) return;
          if (lines.slice(Math.max(0, i - 3), i + 1).some((l) => ALLOW.test(l))) return;
          failures.push(`${file}:${i + 1} ${trimmed.slice(0, 140)}`);
        });
      }
      assert.deepEqual(
        failures,
        [],
        "Un poêle, insert ou foyer à bois est cité comme produit. Renvoyez vers mister-bois.be dans la même phrase, ou marquez une comparaison par « check-catalogue: allow (raison) » sur la ligne du dessus.",
      );
      // Le contrôle lui-même reconnaît les formes visées.
      for (const sample of ["Insert à bois 8 kW", "inserts et poêles à bois", "un poêle à bûches", "Foyer à bois hydro"])
        assert.ok(WOOD_PRODUCT.test(sample), sample);
      for (const sample of ["poêle hybride bois et pellets", "mixte bois-pellets", "poêles à pellets et à bois"])
        assert.ok(!WOOD_PRODUCT.test(sample), sample);
    },
  ],
];

let failed = 0;
for (const [name, run] of checks) {
  try {
    run();
    console.log(`ok    ${name}`);
  } catch (e) {
    failed++;
    console.error(`ÉCHEC ${name}\n      ${(e as Error).message}`);
  }
}
if (failed > 0) {
  console.error(`\n${failed} contrôle(s) en échec : une fiche ou un texte hors catalogue peut revenir sur le site.`);
  process.exit(1);
}
console.log(`\nCatalogue dans son périmètre (${checks.length} contrôles).`);
