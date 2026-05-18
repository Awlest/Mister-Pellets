/**
 * EK63 — Phase 5 : recréation des variantes 3 axes de Spy 110+ Evo et
 * Tweed 90+ Evo (brief `mister-pellets-variants-import-ek63.md`).
 *
 * Autorisé par Dorian le 2026-05-18 : exécution directe sur la base live,
 * recréation (suppression + création) des variantes de ces 2 produits.
 *
 * Dispositif de sécurité :
 *  1. SNAPSHOT — export JSON complet (depth 2) de Spy & Tweed AVANT écriture.
 *  2. ÉCRITURE LIMITÉE — `payload.update` ne porte que sur `variantOptions`
 *     et `variants` des 2 produits. Aucun autre champ, aucun autre produit.
 *  3. DIFF — relecture après écriture ; si un champ hors variants/
 *     variantOptions a changé → restauration immédiate depuis le snapshot.
 *
 * Rollback manuel : relancer avec l'argument `--rollback <fichier-snapshot>`.
 *
 * Exécution : ./node_modules/.bin/tsx scripts/ek63-phase5-write-variants.ts
 */
import fs from "fs";
import path from "path";

const OUT_DIR = path.resolve(process.cwd(), "imports/ek63-variants-mai2026");
const TVA = 1.21;
const ttc = (ht: number): number => Math.round(ht * TVA);

/* Valeurs d'options (IDs vérifiés en base, voir inspect-variant-options.ts) */
const SORTIE = 4, MATERIAU = 1, COULEUR = 2;
const V = {
  haute: 22, arriere: 23,            // Sortie des fumées
  acier: 1, verre: 5,                // Matériau / finition
  blanc: 8, noir: 7, bordeaux: 11, tourterelle: 14, // Couleur
};

interface VariantInput {
  optionValues: number[];
  sku: string;
  mpn: string;
  price: number; // TTC ; 0 = prix à compléter → affiché "Sur devis"
  stockStatus: "in_stock" | "on_order" | "out_of_stock";
}

/* --- Tweed 90+ Evo (id 4) — système A, finition Acier ---------------------- */
const TWEED_OPTIONS = [
  { optionType: SORTIE, values: [V.haute, V.arriere] },
  { optionType: MATERIAU, values: [V.acier] },
  { optionType: COULEUR, values: [V.blanc, V.tourterelle, V.bordeaux, V.noir] },
];
const TWEED_VARIANTS: VariantInput[] = [
  { optionValues: [V.haute, V.acier, V.blanc], sku: "EK63-TWEED-90-HAUTE-ACIER-BLANC", mpn: "817570", price: ttc(2360), stockStatus: "in_stock" },
  { optionValues: [V.haute, V.acier, V.tourterelle], sku: "EK63-TWEED-90-HAUTE-ACIER-TOURTERELLE", mpn: "817580", price: ttc(2360), stockStatus: "in_stock" },
  { optionValues: [V.haute, V.acier, V.bordeaux], sku: "EK63-TWEED-90-HAUTE-ACIER-BORDEAUX", mpn: "817590", price: ttc(2360), stockStatus: "in_stock" },
  { optionValues: [V.haute, V.acier, V.noir], sku: "EK63-TWEED-90-HAUTE-ACIER-NOIR", mpn: "817600", price: ttc(2360), stockStatus: "in_stock" },
  { optionValues: [V.arriere, V.acier, V.noir], sku: "EK63-TWEED-90-ARRIERE-ACIER-NOIR", mpn: "817630", price: ttc(2360), stockStatus: "in_stock" },
];

/* --- Spy 110+ Evo (id 6) — système B --------------------------------------
   Back : structure 817920 @ 2520 HT. Top : structure 817930, prix illisible
   au PDF → variantes Top à 0 (prix à compléter). Séries : acier 150, verre 560. */
const SPY_OPTIONS = [
  { optionType: SORTIE, values: [V.arriere, V.haute] },
  { optionType: MATERIAU, values: [V.acier, V.verre] },
  { optionType: COULEUR, values: [V.blanc, V.tourterelle, V.noir] },
];
const SPY_VARIANTS: VariantInput[] = [
  // Back — prix connus
  { optionValues: [V.arriere, V.acier, V.blanc], sku: "EK63-SPY-110-ARRIERE-ACIER-BLANC", mpn: "817920", price: ttc(2670), stockStatus: "in_stock" },
  { optionValues: [V.arriere, V.acier, V.tourterelle], sku: "EK63-SPY-110-ARRIERE-ACIER-TOURTERELLE", mpn: "817920", price: ttc(2670), stockStatus: "in_stock" },
  { optionValues: [V.arriere, V.acier, V.noir], sku: "EK63-SPY-110-ARRIERE-ACIER-NOIR", mpn: "817920", price: ttc(2670), stockStatus: "in_stock" },
  { optionValues: [V.arriere, V.verre, V.blanc], sku: "EK63-SPY-110-ARRIERE-VERRE-BLANC", mpn: "817920", price: ttc(3080), stockStatus: "in_stock" },
  { optionValues: [V.arriere, V.verre, V.noir], sku: "EK63-SPY-110-ARRIERE-VERRE-NOIR", mpn: "817920", price: ttc(3080), stockStatus: "in_stock" },
  // Top — prix structure manquant → 0 (à compléter)
  { optionValues: [V.haute, V.acier, V.blanc], sku: "EK63-SPY-110-HAUTE-ACIER-BLANC", mpn: "817930", price: 0, stockStatus: "in_stock" },
  { optionValues: [V.haute, V.acier, V.tourterelle], sku: "EK63-SPY-110-HAUTE-ACIER-TOURTERELLE", mpn: "817930", price: 0, stockStatus: "in_stock" },
  { optionValues: [V.haute, V.acier, V.noir], sku: "EK63-SPY-110-HAUTE-ACIER-NOIR", mpn: "817930", price: 0, stockStatus: "in_stock" },
  { optionValues: [V.haute, V.verre, V.blanc], sku: "EK63-SPY-110-HAUTE-VERRE-BLANC", mpn: "817930", price: 0, stockStatus: "in_stock" },
  { optionValues: [V.haute, V.verre, V.noir], sku: "EK63-SPY-110-HAUTE-VERRE-NOIR", mpn: "817930", price: 0, stockStatus: "in_stock" },
];

const TARGETS = [
  { id: 4, slug: "ek63-tweed-90", variantOptions: TWEED_OPTIONS, variants: TWEED_VARIANTS },
  { id: 6, slug: "ek63-spy-110", variantOptions: SPY_OPTIONS, variants: SPY_VARIANTS },
];

/* Champs produit qui ne doivent PAS bouger (tout sauf variants/variantOptions). */
const GUARDED_FIELDS = [
  "sku", "slug", "name", "brand", "model", "productType", "diffusion", "color",
  "priceHT", "priceTTC", "promoPrice", "installationPrice", "power",
  "heatedVolumeM3", "efficiency", "energyClass", "shortDescription",
  "description", "metaTitle", "metaDescription", "stockStatus", "stock",
  "deliveryDelay", "hasVariants", "hiddenFromBoutique", "mainImage",
  "galleryImages", "colorVariants", "features", "gtin", "mpn",
];

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

function fieldFingerprint(doc: Record<string, unknown>): string {
  const subset: Record<string, unknown> = {};
  for (const f of GUARDED_FIELDS) subset[f] = doc[f];
  return JSON.stringify(subset);
}

async function main(): Promise<void> {
  loadEnv();
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const snapPath = path.join(OUT_DIR, `_snapshot-spy-tweed-${stamp}.json`);

  // 1. SNAPSHOT --------------------------------------------------------------
  const before: Record<string, unknown>[] = [];
  for (const t of TARGETS) {
    const doc = await payload.findByID({ collection: "products", id: t.id, depth: 2 });
    before.push(doc as Record<string, unknown>);
  }
  fs.writeFileSync(snapPath, JSON.stringify(before, null, 2));
  console.log(`[phase5] Snapshot écrit : ${path.relative(process.cwd(), snapPath)}`);
  const fingerprintBefore = new Map(before.map((d) => [Number(d.id), fieldFingerprint(d)]));

  // 2. ÉCRITURE --------------------------------------------------------------
  for (const t of TARGETS) {
    await payload.update({
      collection: "products",
      id: t.id,
      data: {
        variantOptions: t.variantOptions,
        variants: t.variants,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });
    console.log(`[phase5] ${t.slug} : ${t.variants.length} variantes écrites, ${t.variantOptions.length} axes.`);
  }

  // 3. DIFF ------------------------------------------------------------------
  let anomaly = false;
  for (const t of TARGETS) {
    const after = await payload.findByID({ collection: "products", id: t.id, depth: 2 });
    const fpBefore = fingerprintBefore.get(t.id);
    const fpAfter = fieldFingerprint(after as Record<string, unknown>);
    if (fpBefore !== fpAfter) {
      anomaly = true;
      console.error(`[phase5] ⚠️ ANOMALIE — un champ protégé de ${t.slug} a changé !`);
      console.error(`  avant : ${fpBefore}`);
      console.error(`  après : ${fpAfter}`);
    } else {
      const vn = Array.isArray((after as Record<string, unknown>).variants)
        ? ((after as Record<string, unknown>).variants as unknown[]).length : 0;
      console.log(`[phase5] ${t.slug} : OK — champs protégés intacts, ${vn} variantes en base.`);
    }
  }

  if (anomaly) {
    console.error(`\n[phase5] ROLLBACK requis. Restaurer depuis : ${snapPath}`);
    process.exit(1);
  }
  console.log(`\n[phase5] Terminé sans anomalie. Snapshot conservé : ${path.relative(process.cwd(), snapPath)}`);
  process.exit(0);
}

main().catch((e) => { console.error("[phase5] Fatal:", e); process.exit(1); });
