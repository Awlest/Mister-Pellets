/**
 * Edilkamin — remplit `weight` et `dimensions` pour les 30 produits avec
 * variantes. Source : `02-specs-techniques.json` (extrait du tarif mai 2026).
 *
 * Filtre marque strict. Aucun champ autre que `weight` et `dimensions` n'est
 * modifié. Snapshot + diff de contrôle.
 *
 * emissions et energyClass restent à null : le tarif ne les donne pas par
 * modèle, à compléter depuis les fiches techniques individuelles plus tard.
 *
 * Exécution : ./node_modules/.bin/tsx scripts/edilkamin-fill-tech-specs.ts
 */
import fs from "fs";
import path from "path";

const OUT_DIR = path.resolve(process.cwd(), "imports/edilkamin-variants-mai2026");
const JSON_PATH = path.join(OUT_DIR, "02-specs-techniques.json");

interface SpecEntry {
  slugPayload: string;
  nom: string;
  weight: number | null;
  dimensions: { width: number | null; height: number | null; depth: number | null } | null;
  emissions: number | null;
  energyClass: string | null;
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

/* Champs protégés : ne doivent pas bouger durant ce script. */
const GUARDED = [
  "sku", "slug", "name", "brand", "model", "productType", "diffusion", "color",
  "priceHT", "priceTTC", "promoPrice", "installationPrice", "power",
  "heatedVolumeM3", "efficiency", "energyClass", "emissions",
  "hopperCapacity",
  "isAirtight", "isCanalizable", "isHydro", "isConnected",
  "isBestseller", "isFeatured", "isNew",
  "shortDescription", "description", "features", "technicalSheet",
  "mainImage", "galleryImages", "colorVariants",
  "googleProductCategory", "gtin", "mpn",
  "stockStatus", "stock", "deliveryDelay",
  "hasVariants", "variantOptions", "variants",
  "metaTitle", "metaDescription", "hiddenFromBoutique",
];
function fingerprint(doc: Record<string, unknown>): string {
  const s: Record<string, unknown> = {};
  for (const f of GUARDED) s[f] = doc[f];
  return JSON.stringify(s);
}

async function main(): Promise<void> {
  loadEnv();
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  const data: { modeles: SpecEntry[] } = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
  console.log(`[specs] ${data.modeles.length} produits à mettre à jour.`);

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const snapPath = path.join(OUT_DIR, `_snapshot-specs-${stamp}.json`);
  const before: Record<string, unknown>[] = [];
  const fpBefore = new Map<string, string>();
  const docs = new Map<string, Record<string, unknown>>();

  for (const m of data.modeles) {
    const f = await payload.find({
      collection: "products", where: { slug: { equals: m.slugPayload } }, depth: 0, limit: 1,
    });
    const p = f.docs[0] as unknown as Record<string, unknown> | undefined;
    if (!p) { console.error(`[specs] INTROUVABLE: ${m.slugPayload}`); process.exit(1); }
    if (p.brand !== "Edilkamin") {
      console.error(`[specs] BRAND MISMATCH: ${m.slugPayload} brand=${p.brand}`); process.exit(1);
    }
    before.push(p);
    fpBefore.set(m.slugPayload, fingerprint(p));
    docs.set(m.slugPayload, p);
  }
  fs.writeFileSync(snapPath, JSON.stringify(before, null, 2));
  console.log(`[specs] Snapshot : ${path.relative(process.cwd(), snapPath)}`);

  for (const m of data.modeles) {
    const p = docs.get(m.slugPayload)!;
    const update: Record<string, unknown> = {};
    if (m.weight != null && (p.weight == null || Number(p.weight) === 0)) update.weight = m.weight;
    if (m.dimensions) {
      const existing = (p.dimensions as Record<string, unknown> | null) ?? {};
      const dim: Record<string, unknown> = { ...existing };
      if (m.dimensions.width != null && existing.width == null) dim.width = m.dimensions.width;
      if (m.dimensions.height != null && existing.height == null) dim.height = m.dimensions.height;
      if (m.dimensions.depth != null && existing.depth == null) dim.depth = m.dimensions.depth;
      if (JSON.stringify(dim) !== JSON.stringify(existing)) update.dimensions = dim;
    }
    if (Object.keys(update).length === 0) {
      console.log(`[specs] ${m.slugPayload} : rien à compléter, skip.`);
      continue;
    }
    await payload.update({
      collection: "products",
      id: Number(p.id),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: update as any,
    });
    const d = update.dimensions as Record<string, unknown> | undefined;
    console.log(`[specs] ${m.slugPayload} : weight=${update.weight ?? "—"} dim=${d ? `${d.width}x${d.depth}x${d.height}` : "—"}`);
  }

  // Diff hors weight/dimensions.
  let anomaly = false;
  const GUARDED_NO_DIM = GUARDED.filter((k) => k !== "dimensions");
  for (const m of data.modeles) {
    const f = await payload.find({
      collection: "products", where: { slug: { equals: m.slugPayload } }, depth: 0, limit: 1,
    });
    const p = f.docs[0] as unknown as Record<string, unknown>;
    const b = docs.get(m.slugPayload)!;
    const subB: Record<string, unknown> = {}; const subA: Record<string, unknown> = {};
    for (const k of GUARDED_NO_DIM) {
      if (k === "weight") continue; // permis de changer
      subB[k] = b[k]; subA[k] = p[k];
    }
    if (JSON.stringify(subB) !== JSON.stringify(subA)) {
      anomaly = true;
      const diffs: string[] = [];
      for (const k of GUARDED_NO_DIM) {
        if (k === "weight") continue;
        if (JSON.stringify(b[k]) !== JSON.stringify(p[k])) diffs.push(k);
      }
      console.error(`[specs] ⚠️ ANOMALIE ${m.slugPayload} : ${diffs.join(", ")}`);
    }
  }
  if (anomaly) { console.error(`[specs] ROLLBACK depuis ${snapPath}`); process.exit(1); }
  console.log(`[specs] Terminé sans anomalie.`);
  process.exit(0);
}

main().catch((e) => { console.error("[specs] Fatal:", e); process.exit(1); });
