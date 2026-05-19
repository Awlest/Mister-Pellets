/**
 * EK63 — Phase 5 (lot 3) : Pellek 80 Evo² et Pellek 100+/110+ Evo².
 *
 * Ces 2 modèles n'ont ni couleur ni finition au tarif : la « série
 * obligatoire » est un kit de chargement. Solution retenue par Dorian
 * (2026-05-19) : créer un axe d'option dédié « Kit de chargement », et
 * encoder les variantes en 2 axes — Sortie des fumées × Kit de chargement.
 *
 * Le script :
 *  1. crée (idempotent) le type d'option « Kit de chargement » + ses 3 valeurs ;
 *  2. snapshot des 2 produits Pellek ;
 *  3. écrit hasVariants=true + variantOptions (2 axes) + variants ;
 *  4. diff de contrôle.
 *
 * Source des variantes : imports/ek63-variants-mai2026/variantes-proposees.csv.
 * Exécution : ./node_modules/.bin/tsx scripts/ek63-phase5-write-pellek.ts
 */
import fs from "fs";
import path from "path";

const OUT_DIR = path.resolve(process.cwd(), "imports/ek63-variants-mai2026");
const CSV_PATH = path.join(OUT_DIR, "variantes-proposees.csv");
const TVA = 1.21;
const ttc = (ht: number): number => Math.round(ht * TVA);

const OT_SORTIE = 4;
const SORTIE_ID: Record<string, number> = { Top: 22, Back: 23, Coax: 24 };

/* Valeurs de l'axe « Kit de chargement » — clé = libellé finition du CSV. */
const KIT_DEFS = [
  { label: "Kit tiroir rectangulaire", slug: "kit-tiroir-rectangulaire" },
  { label: "Kit tiroir carré", slug: "kit-tiroir-carre" },
  { label: "Kit trappe", slug: "kit-trappe" },
];

const PELLEK_SLUGS = new Set(["ek63-pellek-80", "ek63-pellek-110"]);

interface CsvRow {
  slugPayload: string; produitId: string; sortie: string; finition: string;
  mpn: string; computedPriceHT: string; skuInterne: string;
}

function loadEnv(): void {
  const envPath = path.resolve(process.cwd(), ".env.local");
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

function parseCsv(): CsvRow[] {
  const lines = fs.readFileSync(CSV_PATH, "utf8").split(/\r?\n/).filter(Boolean);
  const h = lines[0]!.split(";");
  const i = (n: string): number => h.indexOf(n);
  return lines.slice(1).map((l) => {
    const c = l.split(";");
    return {
      slugPayload: c[i("slugPayload")]!, produitId: c[i("produitId")]!,
      sortie: c[i("sortie")]!, finition: c[i("finition")]!, mpn: c[i("mpn")]!,
      computedPriceHT: c[i("computedPriceHT")]!, skuInterne: c[i("skuInterne")]!,
    };
  });
}

const GUARDED = [
  "sku", "slug", "name", "brand", "model", "productType", "diffusion", "color",
  "priceHT", "priceTTC", "promoPrice", "installationPrice", "power",
  "heatedVolumeM3", "efficiency", "energyClass", "shortDescription", "description",
  "metaTitle", "metaDescription", "stockStatus", "stock", "deliveryDelay",
  "hiddenFromBoutique", "mainImage", "galleryImages", "colorVariants", "features",
  "gtin", "mpn",
];
function fingerprint(doc: Record<string, unknown>): string {
  const s: Record<string, unknown> = {};
  for (const f of GUARDED) s[f] = doc[f];
  return JSON.stringify(s);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function main(): Promise<void> {
  loadEnv();
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  // 1. Type d'option « Kit de chargement » (idempotent par slug).
  const existingType = await payload.find({
    collection: "variant-option-types",
    where: { slug: { equals: "kit-chargement" } }, limit: 1,
  });
  let kitTypeId: number | string;
  if (existingType.docs.length > 0) {
    kitTypeId = existingType.docs[0]!.id;
    console.log(`[pellek] Type « Kit de chargement » déjà présent (id ${kitTypeId}).`);
  } else {
    const created = await payload.create({
      collection: "variant-option-types",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { label: "Kit de chargement", slug: "kit-chargement", displayMode: "text", sortOrder: 45 } as any,
    });
    kitTypeId = created.id;
    console.log(`[pellek] Type « Kit de chargement » créé (id ${kitTypeId}).`);
  }

  // 2. Valeurs du kit (idempotent par slug + type).
  const kitValueId: Record<string, number | string> = {};
  for (const def of KIT_DEFS) {
    const ex = await payload.find({
      collection: "variant-option-values",
      where: { slug: { equals: def.slug }, optionType: { equals: kitTypeId } }, limit: 1,
    });
    if (ex.docs.length > 0) {
      kitValueId[def.label] = ex.docs[0]!.id;
    } else {
      const v = await payload.create({
        collection: "variant-option-values",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { label: def.label, slug: def.slug, optionType: kitTypeId } as any,
      });
      kitValueId[def.label] = v.id;
    }
    console.log(`[pellek] Valeur kit « ${def.label} » → id ${kitValueId[def.label]}`);
  }

  // 3. Lignes CSV Pellek, groupées par produit.
  const byProduct = new Map<string, CsvRow[]>();
  for (const r of parseCsv()) {
    if (!PELLEK_SLUGS.has(r.slugPayload)) continue;
    if (!byProduct.has(r.slugPayload)) byProduct.set(r.slugPayload, []);
    byProduct.get(r.slugPayload)!.push(r);
  }

  // 4. Snapshot.
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const snapPath = path.join(OUT_DIR, `_snapshot-pellek-${stamp}.json`);
  const before: Record<string, unknown>[] = [];
  const fpBefore = new Map<string, string>();
  for (const slug of byProduct.keys()) {
    const f = await payload.find({
      collection: "products", where: { slug: { equals: slug } }, depth: 2, limit: 1,
    });
    const doc = f.docs[0] as unknown as Record<string, unknown> | undefined;
    if (!doc) { console.error(`[pellek] INTROUVABLE: ${slug}`); process.exit(1); }
    before.push(doc);
    fpBefore.set(slug, fingerprint(doc));
  }
  fs.writeFileSync(snapPath, JSON.stringify(before, null, 2));
  console.log(`[pellek] Snapshot : ${path.relative(process.cwd(), snapPath)}`);

  // 5. Écriture.
  for (const [slug, rows] of byProduct) {
    const id = Number(rows[0]!.produitId);
    const variants = rows.map((r) => {
      const so = SORTIE_ID[r.sortie];
      const kit = kitValueId[r.finition];
      if (so == null || kit == null) throw new Error(`Mapping manquant ${slug} ${r.sortie}/${r.finition}`);
      const ht = Number(r.computedPriceHT);
      return {
        optionValues: [so, kit],
        sku: r.skuInterne,
        mpn: r.mpn,
        price: Number.isFinite(ht) && ht > 0 ? ttc(ht) : 0,
        stockStatus: "in_stock" as const,
      };
    });
    const variantOptions = [
      { optionType: OT_SORTIE, values: [...new Set(rows.map((r) => SORTIE_ID[r.sortie]!))] },
      { optionType: kitTypeId, values: KIT_DEFS.map((d) => kitValueId[d.label]!) },
    ];
    await payload.update({
      collection: "products",
      id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { hasVariants: true, variantOptions, variants } as any,
    });
    console.log(`[pellek] ${slug} (id ${id}) : ${variants.length} variantes, hasVariants=true.`);
  }

  // 6. Diff.
  let anomaly = false;
  for (const slug of byProduct.keys()) {
    const f = await payload.find({
      collection: "products", where: { slug: { equals: slug } }, depth: 2, limit: 1,
    });
    const doc = f.docs[0] as unknown as Record<string, unknown>;
    if (fingerprint(doc) !== fpBefore.get(slug)) {
      anomaly = true;
      console.error(`[pellek] ⚠️ ANOMALIE — champ protégé modifié sur ${slug}`);
    }
  }
  if (anomaly) { console.error(`[pellek] ROLLBACK depuis ${snapPath}`); process.exit(1); }
  console.log(`[pellek] Terminé sans anomalie.`);
  process.exit(0);
}

main().catch((e) => { console.error("[pellek] Fatal:", e); process.exit(1); });
