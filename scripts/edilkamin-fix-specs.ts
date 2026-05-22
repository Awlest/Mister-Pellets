/**
 * Edilkamin — corrige les specs techniques (power, efficiency,
 * heatedVolumeM3, hopperCapacity) à partir de 03-audit-specs.json.
 *
 * L'audit a été fait contre le tarif Mai 2026 ligne par ligne. La règle :
 * jamais d'invention. Les valeurs `null` dans l'audit indiquent une donnée
 * non vérifiable au tarif — on ne touche PAS la valeur en base dans ce cas.
 *
 * Filtre marque Edilkamin strict. Snapshot + diff (seuls les 4 champs
 * ci-dessus peuvent changer, plus updatedAt).
 *
 * Exécution : ./node_modules/.bin/tsx scripts/edilkamin-fix-specs.ts
 */
import fs from "fs";
import path from "path";

const OUT_DIR = path.resolve(process.cwd(), "imports/edilkamin-variants-mai2026");
const AUDIT_PATH = path.join(OUT_DIR, "03-audit-specs.json");

interface AuditEntry {
  slugPayload: string;
  nomTarif: string | null;
  power: number | null;
  efficiency: number | null;
  heatedVolumeM3: number | null;
  hopperCapacity: number | null;
  noteSpecs?: string;
  found: boolean;
}

const ALLOWED = new Set(["power", "efficiency", "heatedVolumeM3", "hopperCapacity"]);

/* Champs protégés (ne doivent PAS bouger). */
const GUARDED = [
  "sku", "slug", "name", "brand", "model", "productType", "diffusion", "color",
  "priceHT", "priceTTC", "promoPrice", "installationPrice",
  "energyClass", "emissions", "weight",
  "isAirtight", "isCanalizable", "isHydro", "isConnected",
  "isBestseller", "isFeatured", "isNew",
  "shortDescription", "description", "features", "technicalSheet",
  "mainImage", "galleryImages", "colorVariants", "dimensions",
  "googleProductCategory", "gtin", "mpn",
  "stockStatus", "stock", "deliveryDelay",
  "hasVariants", "variantOptions", "variants",
  "metaTitle", "metaDescription", "hiddenFromBoutique",
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

  const data: { modeles: AuditEntry[] } = JSON.parse(fs.readFileSync(AUDIT_PATH, "utf8"));
  const found = data.modeles.filter((m) => m.found);
  console.log(`[edk-specs] ${found.length} produits Edilkamin avec audit (sur ${data.modeles.length}).`);

  // Snapshot
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const snapPath = path.join(OUT_DIR, `_snapshot-fix-specs-${stamp}.json`);
  const before: Record<string, unknown>[] = [];
  const fpBefore = new Map<string, string>();
  const docs = new Map<string, Record<string, unknown>>();

  for (const m of found) {
    const f = await payload.find({
      collection: "products", where: { slug: { equals: m.slugPayload } }, depth: 0, limit: 1,
    });
    const p = f.docs[0] as unknown as Record<string, unknown> | undefined;
    if (!p) { console.error(`[edk-specs] INTROUVABLE: ${m.slugPayload}`); process.exit(1); }
    if (p.brand !== "Edilkamin") {
      console.error(`[edk-specs] BRAND MISMATCH: ${m.slugPayload} brand=${p.brand}`); process.exit(1);
    }
    before.push(p);
    fpBefore.set(m.slugPayload, fingerprint(p));
    docs.set(m.slugPayload, p);
  }
  fs.writeFileSync(snapPath, JSON.stringify(before, null, 2));
  console.log(`[edk-specs] Snapshot : ${path.relative(process.cwd(), snapPath)}`);

  // Diff + update
  let totalChanges = 0;
  for (const m of found) {
    const p = docs.get(m.slugPayload)!;
    const update: Record<string, number> = {};
    const changes: string[] = [];

    for (const field of ALLOWED) {
      const auditVal = (m as unknown as Record<string, number | null>)[field];
      const dbVal = p[field] as number | null | undefined;
      if (auditVal == null) continue; // pas de valeur vérifiée → ne touche pas
      const dbNum = dbVal == null ? null : Number(dbVal);
      if (dbNum === auditVal) continue; // déjà bon
      update[field] = auditVal;
      changes.push(`${field}:${dbNum}→${auditVal}`);
    }

    if (Object.keys(update).length === 0) {
      // rien à corriger
      continue;
    }

    await payload.update({
      collection: "products",
      id: Number(p.id),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: update as any,
    });
    totalChanges += changes.length;
    console.log(`[edk-specs] ${m.slugPayload} : ${changes.join(", ")}`);
  }

  console.log(`[edk-specs] ${totalChanges} corrections appliquées au total.`);

  // Diff
  let anomaly = false;
  for (const m of found) {
    const f = await payload.find({
      collection: "products", where: { slug: { equals: m.slugPayload } }, depth: 0, limit: 1,
    });
    const p = f.docs[0] as unknown as Record<string, unknown>;
    if (fingerprint(p) !== fpBefore.get(m.slugPayload)) {
      anomaly = true;
      console.error(`[edk-specs] ⚠️ ANOMALIE ${m.slugPayload} : champ protégé modifié`);
    }
  }
  if (anomaly) { console.error(`[edk-specs] ROLLBACK depuis ${snapPath}`); process.exit(1); }
  console.log(`[edk-specs] Terminé sans anomalie.`);
  process.exit(0);
}

main().catch((e) => { console.error("[edk-specs] Fatal:", e); process.exit(1); });
