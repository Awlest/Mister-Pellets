/**
 * EK63 — Phase 5 (lot 2) : encodage des variantes 3 axes pour tous les autres
 * produits EK63 (hors Spy/Tweed déjà faits et hors Pellek).
 *
 * Autorisé par Dorian le 2026-05-19 : écriture directe sur la base live.
 * Source : imports/ek63-variants-mai2026/variantes-proposees.csv (proposition
 * déjà générée et validée). Le script lit ce CSV — aucune donnée tarif inline.
 *
 * Pour chaque produit ciblé :
 *   - hasVariants passe à true (activation décidée par Dorian) ;
 *   - variantOptions = les 3 axes (Sortie des fumées, Matériau, Couleur) ;
 *   - variants = une ligne par déclinaison.
 *
 * Sécurité : snapshot JSON avant écriture ; diff après (tout champ hors
 * variants/variantOptions/hasVariants qui bouge → anomalie + arrêt).
 *
 * Exécution : ./node_modules/.bin/tsx scripts/ek63-phase5-write-all.ts
 */
import fs from "fs";
import path from "path";

const OUT_DIR = path.resolve(process.cwd(), "imports/ek63-variants-mai2026");
const CSV_PATH = path.join(OUT_DIR, "variantes-proposees.csv");
const TVA = 1.21;
const ttc = (ht: number): number => Math.round(ht * TVA);

/* Produits déjà traités (lot 1) ou exclus (axe kit à arbitrer). */
const SKIP = new Set(["ek63-spy-110", "ek63-tweed-90", "ek63-pellek-80", "ek63-pellek-110"]);

/* Types d'options (IDs vérifiés en base). */
const OT_SORTIE = 4, OT_MATERIAU = 1, OT_COULEUR = 2;

/* Mapping libellé tarif → ID de valeur d'option existante. */
const SORTIE_ID: Record<string, number> = { Top: 22, Back: 23, Coax: 24 };
const FINITION_ID: Record<string, number> = {
  Acier: 1, Céramique: 2, Verre: 5, "Acier-Céramique": 2,
};
const COULEUR_ID: Record<string, number> = {
  "Blanc perle": 8, "Blanc opaque": 8, "Blanc crème": 9, Blanc: 8,
  Noir: 7, "Noire opaque": 7, Tourterelle: 14, Bordeaux: 11, "Gris foncé": 12,
};

interface CsvRow {
  slugPayload: string; produitId: string; sortie: string; finition: string;
  couleur: string; mpn: string; computedPriceHT: string; skuInterne: string;
}

interface VariantInput {
  optionValues: number[];
  sku: string;
  mpn: string;
  price: number;
  stockStatus: "in_stock";
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
  const header = lines[0]!.split(";");
  const idx = (name: string): number => header.indexOf(name);
  const iSlug = idx("slugPayload"), iPid = idx("produitId"), iSortie = idx("sortie"),
    iFin = idx("finition"), iCoul = idx("couleur"), iMpn = idx("mpn"),
    iPrice = idx("computedPriceHT"), iSku = idx("skuInterne");
  return lines.slice(1).map((l) => {
    const c = l.split(";");
    return {
      slugPayload: c[iSlug]!, produitId: c[iPid]!, sortie: c[iSortie]!,
      finition: c[iFin]!, couleur: c[iCoul]!, mpn: c[iMpn]!,
      computedPriceHT: c[iPrice]!, skuInterne: c[iSku]!,
    };
  });
}

/* Champs produit qui ne doivent PAS bouger. */
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

function uniq(nums: number[]): number[] {
  return [...new Set(nums)];
}

async function main(): Promise<void> {
  loadEnv();
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  // 1. Regrouper les lignes CSV par produit, hors SKIP.
  const rows = parseCsv();
  const byProduct = new Map<string, CsvRow[]>();
  for (const r of rows) {
    if (SKIP.has(r.slugPayload)) continue;
    if (!byProduct.has(r.slugPayload)) byProduct.set(r.slugPayload, []);
    byProduct.get(r.slugPayload)!.push(r);
  }
  console.log(`[write-all] ${byProduct.size} produits à encoder, ${[...byProduct.values()].reduce((a, v) => a + v.length, 0)} variantes.`);

  // 2. Snapshot AVANT.
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const snapPath = path.join(OUT_DIR, `_snapshot-lot2-${stamp}.json`);
  const before: Record<string, unknown>[] = [];
  const fpBefore = new Map<string, string>();
  for (const slug of byProduct.keys()) {
    const found = await payload.find({
      collection: "products", where: { slug: { equals: slug } }, depth: 2, limit: 1,
    });
    const doc = found.docs[0] as unknown as Record<string, unknown> | undefined;
    if (!doc) { console.error(`[write-all] INTROUVABLE: ${slug} — abandon.`); process.exit(1); }
    before.push(doc);
    fpBefore.set(slug, fingerprint(doc));
  }
  fs.writeFileSync(snapPath, JSON.stringify(before, null, 2));
  console.log(`[write-all] Snapshot : ${path.relative(process.cwd(), snapPath)}`);

  // 3. Écriture produit par produit.
  for (const [slug, prodRows] of byProduct) {
    const id = Number(prodRows[0]!.produitId);
    const variants: VariantInput[] = prodRows.map((r) => {
      const so = SORTIE_ID[r.sortie], fi = FINITION_ID[r.finition], co = COULEUR_ID[r.couleur];
      if (so == null || fi == null || co == null) {
        throw new Error(`Mapping option manquant: ${slug} ${r.sortie}/${r.finition}/${r.couleur}`);
      }
      const ht = Number(r.computedPriceHT);
      return {
        optionValues: [so, fi, co],
        sku: r.skuInterne,
        mpn: r.mpn,
        price: Number.isFinite(ht) && ht > 0 ? ttc(ht) : 0,
        stockStatus: "in_stock" as const,
      };
    });
    const variantOptions = [
      { optionType: OT_SORTIE, values: uniq(prodRows.map((r) => SORTIE_ID[r.sortie]!)) },
      { optionType: OT_MATERIAU, values: uniq(prodRows.map((r) => FINITION_ID[r.finition]!)) },
      { optionType: OT_COULEUR, values: uniq(prodRows.map((r) => COULEUR_ID[r.couleur]!)) },
    ];
    await payload.update({
      collection: "products",
      id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { hasVariants: true, variantOptions, variants } as any,
    });
    console.log(`[write-all] ${slug} (id ${id}) : ${variants.length} variantes, hasVariants=true.`);
  }

  // 4. Diff de contrôle.
  let anomaly = false;
  for (const slug of byProduct.keys()) {
    const found = await payload.find({
      collection: "products", where: { slug: { equals: slug } }, depth: 2, limit: 1,
    });
    const doc = found.docs[0] as unknown as Record<string, unknown>;
    if (fingerprint(doc) !== fpBefore.get(slug)) {
      anomaly = true;
      console.error(`[write-all] ⚠️ ANOMALIE — champ protégé modifié sur ${slug}`);
    }
  }
  if (anomaly) {
    console.error(`[write-all] ROLLBACK requis depuis ${snapPath}`);
    process.exit(1);
  }
  console.log(`[write-all] Terminé sans anomalie. Snapshot conservé : ${path.relative(process.cwd(), snapPath)}`);
  process.exit(0);
}

main().catch((e) => { console.error("[write-all] Fatal:", e); process.exit(1); });
