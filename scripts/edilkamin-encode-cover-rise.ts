/**
 * Edilkamin — encodage des 8 nouveautés Square du tarif Mai 2026 :
 *   Cover 7, Cover 9+, Rise 7, Rise 9+, Rise X 7, Rise X 9+,
 *   Rise 11+ Int, Rise 13++ Int  (pages 18 à 21 du tarif).
 *
 * Modèle de référence : fiches Libra 7 / 9+ / 11+ Int / 13++ Int (même gamme
 * Square, mêmes specs) et Sense 8 / Slide 7 Evo (encodage le plus récent).
 *
 * Règles :
 *  - Périmètre STRICT marque Edilkamin : un slug déjà pris par une autre marque
 *    bloque le script.
 *  - Prix tarif = HT. TTC = round(HT × 1,21). Prix fiche = entrée de gamme.
 *  - Cover (système A, code complet par sortie) : Sortie × Acier × Noir.
 *  - Rise  (système B, structure + série flancs obligatoire) : Sortie × Matériau
 *    (Pierre ollaire / Pierre Limestone). Pas d'axe Couleur : il dupliquerait
 *    l'axe Matériau (précédent : Pellkamin, Sortie × Kit).
 *  - Idempotent : upsert par slug. À la mise à jour, photos et visibilité déjà
 *    posées par l'équipe sont conservées.
 *  - Snapshot des fiches Edilkamin avant toute écriture.
 *
 * Usage :
 *   ./node_modules/.bin/tsx scripts/edilkamin-encode-cover-rise.ts            # DRY-RUN (n'écrit rien)
 *   ./node_modules/.bin/tsx scripts/edilkamin-encode-cover-rise.ts --apply    # écrit en base
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "imports/edilkamin-variants-mai2026");
const APPLY = process.argv.includes("--apply");
const TVA = 1.21;
const ttc = (ht: number): number => Math.round(ht * TVA);
const TARIFF_SOURCE = "Edilkamin Mai 2026";
const BATCH_ID = `edilkamin-cover-rise-${Date.now()}`;

/* IDs vérifiés en base (scripts/inspect-variant-options.ts, 2026-09-14). */
const OT_SORTIE = 4, OT_MATERIAU = 1, OT_COULEUR = 2;
const EXPECTED_VALUES: Record<number, { slug: string; optionType: number }> = {
  22: { slug: "haute", optionType: OT_SORTIE },
  23: { slug: "arriere", optionType: OT_SORTIE },
  24: { slug: "coaxial", optionType: OT_SORTIE },
  1: { slug: "acier", optionType: OT_MATERIAU },
  3: { slug: "pierre-ollaire", optionType: OT_MATERIAU },
  7: { slug: "noir", optionType: OT_COULEUR },
};
const SORTIE_ID: Record<Outlet["sortie"], number> = { Back: 23, Top: 22, Coax: 24 };
/* Valeur Matériau à créer si absente : « Pierre Limestone » (série flancs Limestone). */
const LIMESTONE_MATERIAU = { label: "Pierre Limestone", slug: "pierre-limestone" };

function loadEnv(): void {
  const envPath = path.resolve(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!(k in process.env)) process.env[k] = v;
  }
}

function up(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function modelToken(slug: string): string {
  return up(slug.replace(/^edilkamin-/, ""));
}

/* ---------------------------------------------------------------------------
   Atouts — textes repris tels quels des fiches Edilkamin existantes quand ils
   existent (The Mind, Relax, canalisable, maison passive), complétés par ce que
   le tarif dit de ces modèles (foyer en fonte, vitre, DCS, flancs pierre).
   --------------------------------------------------------------------------- */
interface Feature { title: string; description: string }
const F = {
  THE_MIND: {
    title: "Wi-Fi The Mind intégré",
    description: "Pilotage à distance via la radiocommande Mind Remote ou l'app The Mind (iOS/Android). Bluetooth en backup hors connexion.",
  },
  PASSIVE: {
    title: "Compatible maison passive",
    description: "Étanche, prélève l'air comburant directement de l'extérieur. Idéal habitat BBC et basse consommation.",
  },
  RELAX: {
    title: "Mode Relax silencieux",
    description: "Désactive la ventilation forcée d'un seul geste pour profiter de la chaleur en convection naturelle, en silence absolu.",
  },
  CANAL_1: {
    title: "Canalisable vers une autre pièce",
    description: "1 sortie d'air chaud canalisable Ø 6 ou 8 cm pour chauffer une pièce supplémentaire (kit en option).",
  },
  CANAL_2: {
    title: "Canalisable vers deux pièces",
    description: "2 sorties d'air chaud canalisables pour chauffer deux pièces supplémentaires (kit en option).",
  },
  FONTE: {
    title: "Foyer en fonte",
    description: "Chambre de combustion en fonte, bougie d'allumage en céramique et double porte de fermeture du foyer.",
  },
  MAGIC: {
    title: "Vitre Magic",
    description: "Poêle éteint, la vitre reste entièrement noire et masque le foyer. La flamme n'apparaît qu'à l'allumage.",
  },
  NIGHTFLAME: {
    title: "Vitre ROBAX Nightflame",
    description: "Vitrocéramique teintée : sombre quand le poêle est à l'arrêt, elle laisse voir la flamme une fois allumé.",
  },
  DCS: {
    title: "Creuset autonettoyant + DCS",
    description: "Nettoyage automatique du creuset et Dynamic Combustion System, qui ajuste la combustion en continu.",
  },
  STONE: {
    title: "Flancs en pierre naturelle",
    description: "Habillage latéral en pierre ollaire (gris) ou pierre Limestone (beige clair), au choix, compris dans le prix affiché.",
  },
} satisfies Record<string, Feature>;

/* --------------------------------------------------------------------------- */
interface Outlet { sortie: "Back" | "Top" | "Coax"; code: string; priceHT: number }
interface Finish { label: "Acier" | "Pierre ollaire" | "Pierre Limestone"; serieSku?: string; serieHT?: number }
interface Model {
  sku: string; slug: string; name: string; model: string;
  productType: "standard" | "canalisable";
  color: "dark" | "natural";
  power: number; heatedVolumeM3: number; efficiency: number; hopperCapacity: number; weight: number;
  dimensions: { width: number; height: number; depth: number };
  codingSystem: "A" | "B";
  outlets: Outlet[];
  finishes: Finish[];
  colorVariants: { colorName: string; colorHex: string }[];
  shortDescription: string;
  features: Feature[];
}

const COVER_COLORS = [{ colorName: "Acier noir", colorHex: "#1A1A1A" }];
const RISE_COLORS = [
  { colorName: "Pierre ollaire", colorHex: "#5A5852" },
  { colorName: "Pierre Limestone", colorHex: "#D9CFBF" },
];
const RISE_FINISHES_550: Finish[] = [
  { label: "Pierre ollaire", serieSku: "1194380", serieHT: 550 },
  { label: "Pierre Limestone", serieSku: "1191100", serieHT: 550 },
];
const RISE_INT_FINISHES_590: Finish[] = [
  { label: "Pierre ollaire", serieSku: "1194920", serieHT: 590 },
  { label: "Pierre Limestone", serieSku: "1194910", serieHT: 590 },
];

/* Données tarif Edilkamin Mai 2026, pages 18-21 (relues sur le PDF rendu). */
const MODELS: Model[] = [
  {
    sku: "EDI_COVER_7", slug: "edilkamin-cover-7", name: "Edilkamin Cover 7", model: "Cover 7",
    productType: "standard", color: "dark",
    power: 7.4, heatedVolumeM3: 195, efficiency: 90.7, hopperCapacity: 15, weight: 136,
    dimensions: { width: 50, height: 110, depth: 56 },
    codingSystem: "A",
    outlets: [{ sortie: "Back", code: "815870", priceHT: 3710 }, { sortie: "Top", code: "818530", priceHT: 3710 }],
    finishes: [{ label: "Acier" }],
    colorVariants: COVER_COLORS,
    shortDescription: "Poêle étanche 7,4 kW en acier noir, vitre Magic qui reste noire à l'arrêt. Sortie des fumées arrière ou haute au choix, pilotage Wi-Fi The Mind.",
    features: [F.THE_MIND, F.PASSIVE, F.MAGIC, F.FONTE, F.RELAX],
  },
  {
    sku: "EDI_COVER_9_PLUS", slug: "edilkamin-cover-9-plus", name: "Edilkamin Cover 9+", model: "Cover 9+",
    productType: "canalisable", color: "dark",
    power: 9.2, heatedVolumeM3: 240, efficiency: 90.4, hopperCapacity: 15, weight: 136,
    dimensions: { width: 50, height: 110, depth: 56 },
    codingSystem: "A",
    outlets: [{ sortie: "Back", code: "815880", priceHT: 3960 }, { sortie: "Top", code: "818540", priceHT: 3960 }],
    finishes: [{ label: "Acier" }],
    colorVariants: COVER_COLORS,
    shortDescription: "Poêle étanche canalisable 9,2 kW pour 240 m³, acier noir et vitre Magic. Une sortie d'air chaud Ø 8 cm pour chauffer une pièce voisine.",
    features: [F.THE_MIND, F.CANAL_1, F.DCS, F.PASSIVE, F.MAGIC, F.FONTE],
  },
  {
    sku: "EDI_RISE_7", slug: "edilkamin-rise-7", name: "Edilkamin Rise 7", model: "Rise 7",
    productType: "standard", color: "natural",
    power: 7.4, heatedVolumeM3: 195, efficiency: 90.7, hopperCapacity: 15, weight: 150,
    dimensions: { width: 47, height: 111, depth: 56 },
    codingSystem: "B",
    outlets: [{ sortie: "Back", code: "815850", priceHT: 3310 }],
    finishes: RISE_FINISHES_550,
    colorVariants: RISE_COLORS,
    shortDescription: "Poêle étanche 7,4 kW, flancs en pierre ollaire ou pierre Limestone, foyer en fonte et vitre ROBAX Nightflame. Sortie des fumées à l'arrière.",
    features: [F.THE_MIND, F.STONE, F.PASSIVE, F.NIGHTFLAME, F.FONTE, F.RELAX],
  },
  {
    sku: "EDI_RISE_9_PLUS", slug: "edilkamin-rise-9-plus", name: "Edilkamin Rise 9+", model: "Rise 9+",
    productType: "canalisable", color: "natural",
    power: 9.2, heatedVolumeM3: 240, efficiency: 90.4, hopperCapacity: 15, weight: 160,
    dimensions: { width: 47, height: 111, depth: 56 },
    codingSystem: "B",
    outlets: [{ sortie: "Back", code: "815860", priceHT: 3560 }],
    finishes: RISE_FINISHES_550,
    colorVariants: RISE_COLORS,
    shortDescription: "Poêle étanche canalisable 9,2 kW, flancs en pierre ollaire ou Limestone. Une sortie d'air chaud Ø 8 cm, creuset autonettoyant, Wi-Fi The Mind.",
    features: [F.THE_MIND, F.CANAL_1, F.DCS, F.STONE, F.PASSIVE, F.NIGHTFLAME],
  },
  {
    sku: "EDI_RISE_X_7", slug: "edilkamin-rise-x-7", name: "Edilkamin Rise X 7", model: "Rise X 7",
    productType: "standard", color: "natural",
    power: 7.4, heatedVolumeM3: 195, efficiency: 90.7, hopperCapacity: 15, weight: 150,
    dimensions: { width: 47, height: 125, depth: 56 },
    codingSystem: "B",
    outlets: [{ sortie: "Top", code: "818640", priceHT: 3570 }, { sortie: "Coax", code: "818510", priceHT: 3770 }],
    finishes: RISE_FINISHES_550,
    colorVariants: RISE_COLORS,
    shortDescription: "Version haute (125 cm) du Rise 7 : 7,4 kW, flancs en pierre ollaire ou Limestone, sortie des fumées vers le haut ou coaxiale Ø 8/13 cm.",
    features: [F.THE_MIND, F.STONE, F.PASSIVE, F.NIGHTFLAME, F.FONTE, F.RELAX],
  },
  {
    sku: "EDI_RISE_X_9_PLUS", slug: "edilkamin-rise-x-9-plus", name: "Edilkamin Rise X 9+", model: "Rise X 9+",
    productType: "canalisable", color: "natural",
    power: 9.2, heatedVolumeM3: 240, efficiency: 90.4, hopperCapacity: 15, weight: 160,
    dimensions: { width: 47, height: 125, depth: 56 },
    codingSystem: "B",
    outlets: [{ sortie: "Top", code: "818650", priceHT: 3820 }, { sortie: "Coax", code: "818520", priceHT: 4020 }],
    finishes: RISE_FINISHES_550,
    colorVariants: RISE_COLORS,
    shortDescription: "Version haute (125 cm) du Rise 9+ : 9,2 kW canalisable, flancs en pierre ollaire ou Limestone, sortie des fumées vers le haut ou coaxiale Ø 8/13 cm.",
    features: [F.THE_MIND, F.CANAL_1, F.DCS, F.STONE, F.PASSIVE, F.NIGHTFLAME],
  },
  {
    sku: "EDI_RISE_11_INT", slug: "edilkamin-rise-11-plus-int", name: "Edilkamin Rise 11+ Int", model: "Rise 11+ Int",
    productType: "canalisable", color: "natural",
    power: 10.5, heatedVolumeM3: 275, efficiency: 88.1, hopperCapacity: 21, weight: 196,
    dimensions: { width: 54.5, height: 119, depth: 51 },
    codingSystem: "B",
    outlets: [{ sortie: "Back", code: "818280", priceHT: 4000 }],
    finishes: RISE_INT_FINISHES_590,
    colorVariants: RISE_COLORS,
    shortDescription: "Poêle étanche canalisable 10,5 kW pour 275 m³, réservoir 21 kg, flancs en pierre ollaire ou Limestone. Une sortie d'air chaud Ø 8 cm à l'arrière.",
    features: [F.THE_MIND, F.CANAL_1, F.DCS, F.STONE, F.PASSIVE, F.NIGHTFLAME],
  },
  {
    sku: "EDI_RISE_13_INT", slug: "edilkamin-rise-13-int", name: "Edilkamin Rise 13++ Int", model: "Rise 13++ Int",
    productType: "canalisable", color: "natural",
    power: 12.4, heatedVolumeM3: 325, efficiency: 88.1, hopperCapacity: 21, weight: 198,
    dimensions: { width: 54.5, height: 119, depth: 51 },
    codingSystem: "B",
    outlets: [{ sortie: "Back", code: "818290", priceHT: 4200 }],
    finishes: RISE_INT_FINISHES_590,
    colorVariants: RISE_COLORS,
    shortDescription: "Poêle étanche double canalisable 12,4 kW pour 325 m³, réservoir 21 kg, flancs en pierre ollaire ou Limestone. Deux sorties d'air chaud Ø 8 cm.",
    features: [F.THE_MIND, F.CANAL_2, F.DCS, F.STONE, F.PASSIVE, F.NIGHTFLAME],
  },
];

/* Meta SEO : même patron que scripts/edilkamin-fill-product-fields.ts. */
function buildMeta(m: Model): { metaTitle: string; metaDescription: string } {
  const power = `${String(m.power).replace(".", ",")} kW`;
  const typeWord = m.productType === "canalisable" ? "canalisable " : "";
  let title = `Poêle à pellets ${typeWord}${m.name} ${power}`.replace(/\s+/g, " ").trim();
  if (title.length > 67) title = title.slice(0, 67) + "...";
  if (title.length + 11 <= 70) title += " | Wallonie";
  let desc = m.shortDescription;
  if (desc.length > 157) desc = desc.slice(0, 157) + "...";
  return { metaTitle: title, metaDescription: desc };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VariantInput = Record<string, any>;

function buildVariants(m: Model, materiauId: (label: Finish["label"]) => number) {
  const tok = modelToken(m.slug);
  const variants: VariantInput[] = [];
  const sortieIds: number[] = [], materiauIds: number[] = [];
  for (const o of m.outlets) {
    const so = SORTIE_ID[o.sortie];
    if (!sortieIds.includes(so)) sortieIds.push(so);
    for (const f of m.finishes) {
      const fi = materiauId(f.label);
      if (!materiauIds.includes(fi)) materiauIds.push(fi);
      if (m.codingSystem === "A") {
        variants.push({
          optionValues: [so, fi, 7],
          sku: `EDK-${tok}-${up(o.sortie)}-${up(f.label)}-NOIR`,
          mpn: o.code, price: ttc(o.priceHT), stockStatus: "on_order",
          manufacturerStructureSku: o.code, codingSystem: "A",
          computedPriceHT: o.priceHT, priceSource: `code complet ${o.code}`,
          tariffSource: TARIFF_SOURCE, importBatchId: BATCH_ID,
        });
      } else {
        const ht = o.priceHT + (f.serieHT ?? 0);
        variants.push({
          optionValues: [so, fi],
          sku: `EDK-${tok}-${up(o.sortie)}-${up(f.label)}`,
          mpn: o.code, price: ttc(ht), stockStatus: "on_order",
          manufacturerStructureSku: o.code, manufacturerColorSku: f.serieSku, codingSystem: "B",
          computedPriceHT: ht, priceSource: `structure ${o.priceHT} + serie ${f.serieHT}`,
          tariffSource: TARIFF_SOURCE, importBatchId: BATCH_ID,
        });
      }
    }
  }
  const variantOptions = [
    { optionType: OT_SORTIE, values: sortieIds },
    { optionType: OT_MATERIAU, values: materiauIds },
    ...(m.codingSystem === "A" ? [{ optionType: OT_COULEUR, values: [7] }] : []),
  ];
  return { variants, variantOptions };
}

async function main(): Promise<void> {
  loadEnv();
  console.log(`[cover-rise] ${MODELS.length} modèles Edilkamin — ${APPLY ? "ÉCRITURE EN BASE" : "DRY-RUN (n'écrit rien)"}`);
  console.log(`[cover-rise] DB host : ${process.env.DATABASE_URI?.split("@")[1]?.split("/")[0] ?? "?"}`);

  // Contrôles de longueur avant tout accès base.
  for (const m of MODELS) {
    if (m.shortDescription.length > 200) throw new Error(`${m.slug}: shortDescription ${m.shortDescription.length} > 200`);
    if (m.features.length > 6) throw new Error(`${m.slug}: ${m.features.length} atouts > 6`);
    const meta = buildMeta(m);
    if (meta.metaTitle.length > 70 || meta.metaDescription.length > 160) throw new Error(`${m.slug}: meta trop longue`);
  }

  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  // 0. Sanity : les valeurs d'options attendues existent, avec le bon slug/axe.
  for (const [id, exp] of Object.entries(EXPECTED_VALUES)) {
    const v = await payload.findByID({ collection: "variant-option-values", id: Number(id), depth: 0 });
    const ot = typeof v.optionType === "object" ? Number((v.optionType as { id: number }).id) : Number(v.optionType);
    if (v.slug !== exp.slug || ot !== exp.optionType) {
      throw new Error(`Valeur d'option id ${id} inattendue (slug=${v.slug}, axe=${ot}) — attendu ${exp.slug}/${exp.optionType}. Abandon.`);
    }
  }

  // 1. Matériau « Pierre Limestone » (création idempotente).
  let limestoneId = -1;
  {
    const ex = await payload.find({
      collection: "variant-option-values",
      where: { and: [{ slug: { equals: LIMESTONE_MATERIAU.slug } }, { optionType: { equals: OT_MATERIAU } }] },
      limit: 1,
    });
    if (ex.docs.length > 0) {
      limestoneId = Number(ex.docs[0]!.id);
      console.log(`[cover-rise] matériau « ${LIMESTONE_MATERIAU.label} » existe → id ${limestoneId}`);
    } else if (APPLY) {
      const v = await payload.create({
        collection: "variant-option-values",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { label: LIMESTONE_MATERIAU.label, slug: LIMESTONE_MATERIAU.slug, optionType: OT_MATERIAU } as any,
      });
      limestoneId = Number(v.id);
      console.log(`[cover-rise] matériau « ${LIMESTONE_MATERIAU.label} » créé → id ${limestoneId}`);
    } else {
      console.log(`[cover-rise] (dry) matériau « ${LIMESTONE_MATERIAU.label} » serait créé sur l'axe Matériau`);
    }
  }
  const materiauId = (label: Finish["label"]): number =>
    label === "Acier" ? 1 : label === "Pierre ollaire" ? 3 : limestoneId;

  // 2. Snapshot des fiches Edilkamin existantes avant écriture.
  if (APPLY) {
    const existing = await payload.find({ collection: "products", where: { brand: { equals: "Edilkamin" } }, depth: 0, limit: 500 });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const snap = path.join(OUT_DIR, `_snapshot-cover-rise-${stamp}.json`);
    fs.writeFileSync(snap, JSON.stringify(existing.docs, null, 2));
    console.log(`[cover-rise] Snapshot ${existing.docs.length} fiches Edilkamin → ${path.relative(ROOT, snap)}`);
  }

  // 3. Construction + upsert.
  const preview: unknown[] = [];
  let created = 0, updated = 0, errored = 0;
  for (const m of MODELS) {
    try {
      const { variants, variantOptions } = buildVariants(m, materiauId);
      const minHT = Math.min(...variants.map((v) => v.computedPriceHT as number));
      const meta = buildMeta(m);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc: Record<string, any> = {
        sku: m.sku, slug: m.slug, name: m.name, brand: "Edilkamin", model: m.model,
        productType: m.productType, combustible: "pellet", diffusion: "ventilation-forcee", color: m.color,
        priceHT: minHT, priceTTC: ttc(minHT),
        power: m.power, heatedVolumeM3: m.heatedVolumeM3, efficiency: m.efficiency,
        energyClass: "A+", hopperCapacity: m.hopperCapacity, weight: m.weight,
        dimensions: m.dimensions,
        // Tarif : icône AT + « Adapté pour les maisons passives » sur les 4 pages.
        isAirtight: true,
        isCanalizable: m.productType === "canalisable",
        isHydro: false,
        isConnected: true,
        // Code structure fabricant = MPN. Pas de GTIN : ce n'est pas un EAN-13.
        mpn: m.outlets[0]!.code,
        googleProductCategory: "Home & Garden > Household Appliances > Heating > Pellet Stoves",
        shortDescription: m.shortDescription,
        features: m.features.map((f) => ({ title: f.title, description: f.description })),
        metaTitle: meta.metaTitle, metaDescription: meta.metaDescription,
        stock: 0, stockStatus: "on_order", deliveryDelay: "4-6 sem.",
        isNew: true, // « NEW » au tarif Mai 2026
        colorVariants: m.colorVariants.map((c) => ({ colorName: c.colorName, colorHex: c.colorHex })),
        hasVariants: true, variantOptions, variants,
      };

      preview.push({
        slug: m.slug, name: m.name, sku: m.sku, productType: m.productType, color: m.color,
        power: m.power, priceHT: minHT, priceTTC: doc.priceTTC, mpn: doc.mpn,
        dimensions: m.dimensions, weight: m.weight,
        shortDescription: `${m.shortDescription} (${m.shortDescription.length})`,
        metaTitle: `${meta.metaTitle} (${meta.metaTitle.length})`,
        metaDescription: `${meta.metaDescription} (${meta.metaDescription.length})`,
        features: m.features.map((f) => f.title),
        colorVariants: m.colorVariants.map((c) => c.colorName),
        variantOptions,
        variants: variants.map((v) => `${v.sku} | mpn ${v.mpn} | serie ${v.manufacturerColorSku ?? "-"} | HT ${v.computedPriceHT} → TTC ${v.price}`),
      });
      if (!APPLY) continue;

      const found = await payload.find({ collection: "products", where: { slug: { equals: m.slug } }, depth: 0, limit: 1 });
      if (found.docs.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ex = found.docs[0] as any;
        if (ex.brand !== "Edilkamin") { console.error(`[cover-rise] BRAND MISMATCH ${m.slug} (brand=${ex.brand}) — abandon.`); process.exit(1); }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const upd: Record<string, any> = { ...doc };
        delete upd.isNew; // choix équipe conservé à la mise à jour
        // Photos posées par l'équipe : conservées (produit et par couleur).
        if (Array.isArray(ex.colorVariants)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const byName = new Map<string, any>(ex.colorVariants.map((c: any) => [c.colorName, c]));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          upd.colorVariants = upd.colorVariants.map((cv: any) => {
            const old = byName.get(cv.colorName);
            if (old?.gtin) cv.gtin = old.gtin;
            if (old?.mainImage) cv.mainImage = typeof old.mainImage === "object" ? old.mainImage.id : old.mainImage;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (old?.galleryImages?.length) cv.galleryImages = old.galleryImages.map((g: any) => ({ image: typeof g.image === "object" ? g.image.id : g.image }));
            return cv;
          });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await payload.update({ collection: "products", id: Number(ex.id), data: upd as any });
        updated++;
        console.log(`[cover-rise]   ↻ MAJ ${m.slug} (${variants.length} variantes)`);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const c = await payload.create({ collection: "products", data: { ...doc, hiddenFromBoutique: false } as any });
        created++;
        console.log(`[cover-rise]   ✓ NEW ${m.slug} → id ${c.id} (${variants.length} variantes)`);
      }
    } catch (err) {
      errored++;
      console.error(`[cover-rise]   ✗ ${m.slug} :`, err instanceof Error ? err.message : err);
    }
  }

  const pf = path.join(OUT_DIR, `_preview-cover-rise.json`);
  fs.writeFileSync(pf, JSON.stringify(preview, null, 2));
  console.log(`[cover-rise] Aperçu des ${preview.length} fiches → ${path.relative(ROOT, pf)}`);

  if (!APPLY) { console.log(`[cover-rise] DRY-RUN terminé. Relancer avec --apply pour écrire.`); process.exit(0); }

  // 4. Vérification après écriture (relecture depth 2).
  console.log(`\n[cover-rise] Vérification après écriture :`);
  let bad = 0;
  for (const m of MODELS) {
    const f = await payload.find({ collection: "products", where: { slug: { equals: m.slug } }, depth: 2, limit: 1 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = f.docs[0] as any;
    const problems: string[] = [];
    if (!d) { console.error(`  ✗ ${m.slug} : INTROUVABLE après écriture`); bad++; continue; }
    const expected = buildVariants(m, materiauId);
    if (d.brand !== "Edilkamin") problems.push(`brand=${d.brand}`);
    if (d.hiddenFromBoutique) problems.push("masqué de la boutique");
    if (!d.hasVariants) problems.push("hasVariants=false");
    if ((d.variants?.length ?? 0) !== expected.variants.length) problems.push(`variants=${d.variants?.length} ≠ ${expected.variants.length}`);
    const prices = (d.variants ?? []).map((v: { price: number }) => v.price);
    if (prices.some((p: number) => !(p > 0))) problems.push("variante sans prix");
    if (Math.min(...prices) !== d.priceTTC) problems.push(`priceTTC ${d.priceTTC} ≠ min variantes ${Math.min(...prices)}`);
    for (const v of d.variants ?? []) {
      const ids = (v.optionValues ?? []).map((o: { id: number } | number) => (typeof o === "object" ? o.id : o));
      if (ids.length !== expected.variantOptions.length) problems.push(`${v.sku}: ${ids.length} valeurs pour ${expected.variantOptions.length} axes`);
    }
    if ((d.variantOptions?.length ?? 0) !== expected.variantOptions.length) problems.push(`axes=${d.variantOptions?.length}`);
    if ((d.features?.length ?? 0) !== m.features.length) problems.push(`atouts=${d.features?.length}`);
    if ((d.colorVariants?.length ?? 0) !== m.colorVariants.length) problems.push(`couleurs=${d.colorVariants?.length}`);
    if (!d.metaTitle || !d.metaDescription || !d.shortDescription) problems.push("meta/short manquante");
    if (d.power !== m.power || d.heatedVolumeM3 !== m.heatedVolumeM3 || d.efficiency !== m.efficiency) problems.push("specs ≠ attendu");
    if (d.dimensions?.width !== m.dimensions.width || d.dimensions?.height !== m.dimensions.height || d.dimensions?.depth !== m.dimensions.depth) problems.push("dimensions ≠ attendu");
    if (problems.length) { bad++; console.error(`  ✗ ${m.slug} (id ${d.id}) : ${problems.join(" ; ")}`); }
    else console.log(`  ✓ ${m.slug} (id ${d.id}) : ${d.variants.length} variantes, ${d.variantOptions.length} axes, ${d.priceTTC} € TTC, ${d.features.length} atouts, visible=${!d.hiddenFromBoutique}`);
  }
  console.log(`\n[cover-rise] Terminé : ${created} créées, ${updated} mises à jour, ${errored} erreurs, ${bad} anomalies à la relecture.`);
  process.exit(errored > 0 || bad > 0 ? 1 : 0);
}

main().catch((e) => { console.error("[cover-rise] Fatal:", e); process.exit(1); });
