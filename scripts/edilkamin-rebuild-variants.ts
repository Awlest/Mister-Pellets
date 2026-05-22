/**
 * Edilkamin — reconstruit proprement les variantes (variantOptions + variants)
 * à partir de l'audit du tarif Mai 2026.
 *
 * Source de vérité :
 *  - 03-audit-specs.json : finitions + couleurs VÉRIFIÉES au tarif (la règle
 *    "jamais d'invention" s'applique strictement).
 *  - 01-extraction-modeles.json : sorties Top/Back/Coax + prix structure et
 *    prix série par finition (était structurellement correct).
 *
 * Pour chaque produit Edilkamin :
 *  - audit.found=false (5 legacy/absents) → ne touche pas.
 *  - audit.finitions=[] + Pellkamin (insert) → garde variants Sortie × Kit
 *    existants (vérifiés au tarif via les kits 1167410/1194130/etc.).
 *  - audit.finitions=[] (Evia 8, Lena 9+ Evo) → vide variants + hasVariants=false.
 *  - sinon → reconstruit variants depuis (sorties extraction) × (finitions audit) ×
 *    (couleurs audit). Les colorSku/prix série sont récupérés depuis l'extraction
 *    par matching normalisé du libellé finition/couleur. Si non trouvable →
 *    null/0 (jamais d'invention).
 *
 * Filtre marque Edilkamin strict. Snapshot + diff (seuls variantOptions,
 * variants et hasVariants peuvent changer).
 *
 * Exécution : ./node_modules/.bin/tsx scripts/edilkamin-rebuild-variants.ts
 */
import fs from "fs";
import path from "path";

const OUT_DIR = path.resolve(process.cwd(), "imports/edilkamin-variants-mai2026");
const AUDIT_PATH = path.join(OUT_DIR, "03-audit-specs.json");
const EXTRACT_PATH = path.join(OUT_DIR, "01-extraction-modeles.json");
const TVA = 1.21;
const ttc = (ht: number): number => Math.round(ht * TVA);
const TARIFF_SOURCE = "Edilkamin Mai 2026";
const BATCH_ID = `edilkamin-rebuild-${Date.now()}`;

const PELLKAMIN_SLUGS = new Set(["edilkamin-pellkamin-8", "edilkamin-pellkamin-10-plus", "edilkamin-pellkamin-12-evo"]);

const OT_SORTIE = 4, OT_MATERIAU = 1, OT_COULEUR = 2;
const SORTIE_ID: Record<string, number> = { Top: 22, Back: 23, Coax: 24 };

/* Mapping finition (label audit ou extraction, normalisé) → ID matériau. */
function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}
const FINITION_ID: Record<string, number> = {
  "acier": 1, "ceramique": 2, "verre": 5, "verre magic": 5,
  "pierre ollaire": 3, "fonte": 6,
  "acier + verre": 1, "acier + ceramique": 2, "acier-ceramique": 2,
};
function resolveFinitionId(label: string): number | null {
  return FINITION_ID[normalize(label)] ?? null;
}

/* Mapping couleur (label normalisé) → ID. Couleurs créées précédemment :
   Moka=38, Bronze=39, Parchemin=40, Pierre ollaire (couleur)=41. */
const COULEUR_ID: Record<string, number> = {
  "blanc": 8, "blanc perle": 8, "blanc opaque": 8, "verre blanc": 8, "blanc opaque (ceramique)": 8,
  "matte witte": 8,
  "blanc creme": 9, "creme": 9, "beige": 9, "sable": 9, // approximations vers Crème
  "noir": 7, "noir brillant": 7, "noir mat": 7, "noire opaque": 7, "verre noir": 7, "acier noir": 7,
  "bordeaux": 11,
  "tourterelle": 14, "taupe": 14,
  "gris": 12, "gris fonce": 12, "gris anthracite": 12,
  "moka": 38,
  "bronze": 39,
  "parchemin": 40,
  "pierre ollaire": 41,
};
function resolveCouleurId(label: string): number | null {
  return COULEUR_ID[normalize(label)] ?? null;
}

/* ─── Types ────────────────────────────────────────────────────────────── */

interface AuditEntry {
  slugPayload: string;
  nomTarif: string | null;
  finitions: string[];
  couleurs: Record<string, string[]>;
  found: boolean;
}

interface ExtractColourB { couleur: string; colorSku: string }
interface ExtractSortieB { sortie: string; structureSku: string; prixStructureHT: number | null }
interface ExtractFinitionB { finition: string; prixSerieHT: number | null; couleurs: ExtractColourB[] }
interface ExtractModelB {
  slugPayload: string; codingSystem: "B";
  sorties: ExtractSortieB[];
  finitions: ExtractFinitionB[];
}
interface ExtractColourA { couleur: string; code: string; prixHT: number | null }
interface ExtractBranchA { sortie: string; finition: string; couleurs: ExtractColourA[] }
interface ExtractModelA {
  slugPayload: string; codingSystem: "A";
  branches: ExtractBranchA[];
}
type ExtractModel = ExtractModelA | ExtractModelB;

/* ─── Loadenv ──────────────────────────────────────────────────────────── */
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

/* Champs strictement protégés — leur modification est une anomalie. */
const GUARDED = [
  "sku", "slug", "name", "brand", "model", "productType", "diffusion", "color",
  "priceHT", "priceTTC", "promoPrice", "installationPrice",
  "power", "heatedVolumeM3", "efficiency", "energyClass", "emissions",
  "hopperCapacity", "weight",
  "isAirtight", "isCanalizable", "isHydro", "isConnected",
  "isBestseller", "isFeatured", "isNew",
  "shortDescription", "description", "features", "technicalSheet",
  "mainImage", "galleryImages", "colorVariants", "dimensions",
  "googleProductCategory", "gtin", "mpn",
  "stockStatus", "stock", "deliveryDelay",
  "metaTitle", "metaDescription", "hiddenFromBoutique",
];
function fingerprint(doc: Record<string, unknown>): string {
  const s: Record<string, unknown> = {};
  for (const f of GUARDED) s[f] = doc[f];
  return JSON.stringify(s);
}

function up(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function modelToken(slug: string): string {
  return up(slug.replace(/^edilkamin-/, ""));
}

/* Rapproche extract couleur par label normalisé. Retourne colorSku si trouvé. */
function findExtractColorSku(ext: ExtractFinitionB | undefined, couleurLabel: string): string | null {
  if (!ext) return null;
  const target = normalize(couleurLabel);
  const m = ext.couleurs.find((c) => normalize(c.couleur) === target);
  return m?.colorSku ?? null;
}

/* Rapproche extract finition par label normalisé. */
function findExtractFinition(model: ExtractModelB | undefined, finLabel: string): ExtractFinitionB | undefined {
  if (!model) return undefined;
  const target = normalize(finLabel);
  return model.finitions.find((f) => normalize(f.finition) === target);
}

async function main(): Promise<void> {
  loadEnv();
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  const auditData: { modeles: AuditEntry[] } = JSON.parse(fs.readFileSync(AUDIT_PATH, "utf8"));
  const extractData: { modeles: ExtractModel[] } = JSON.parse(fs.readFileSync(EXTRACT_PATH, "utf8"));
  const extractBySlug = new Map<string, ExtractModel>();
  for (const m of extractData.modeles) extractBySlug.set(m.slugPayload, m);

  const targets = auditData.modeles.filter((m) => m.found);
  console.log(`[edk-rebuild] ${targets.length} produits Edilkamin trouvés à traiter.`);

  // Snapshot
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const snapPath = path.join(OUT_DIR, `_snapshot-rebuild-${stamp}.json`);
  const before: Record<string, unknown>[] = [];
  const fpBefore = new Map<string, string>();
  const docs = new Map<string, Record<string, unknown>>();
  for (const m of targets) {
    const f = await payload.find({
      collection: "products", where: { slug: { equals: m.slugPayload } }, depth: 0, limit: 1,
    });
    const p = f.docs[0] as unknown as Record<string, unknown> | undefined;
    if (!p) { console.error(`[edk-rebuild] INTROUVABLE: ${m.slugPayload}`); process.exit(1); }
    if (p.brand !== "Edilkamin") {
      console.error(`[edk-rebuild] BRAND MISMATCH: ${m.slugPayload} brand=${p.brand}`); process.exit(1);
    }
    before.push(p);
    fpBefore.set(m.slugPayload, fingerprint(p));
    docs.set(m.slugPayload, p);
  }
  fs.writeFileSync(snapPath, JSON.stringify(before, null, 2));
  console.log(`[edk-rebuild] Snapshot : ${path.relative(process.cwd(), snapPath)}`);

  type VariantInput = {
    optionValues: number[]; sku: string; mpn: string; price: number;
    stockStatus: "in_stock";
    manufacturerStructureSku?: string;
    manufacturerColorSku?: string;
    codingSystem?: "A" | "B";
    computedPriceHT?: number | null;
    priceSource?: string;
    tariffSource?: string;
    importBatchId?: string;
  };

  const summary: string[] = [];

  for (const m of targets) {
    const p = docs.get(m.slugPayload)!;
    const id = Number(p.id);

    // Cas Pellkamin (insert) : on ne touche pas — variants Sortie × Kit OK.
    if (PELLKAMIN_SLUGS.has(m.slugPayload)) {
      summary.push(`${m.slugPayload}: inchangé (insert Pellkamin avec axe Kit)`);
      continue;
    }

    // Cas finitions vides → vider variants + hasVariants=false
    if (m.finitions.length === 0) {
      await payload.update({
        collection: "products", id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { hasVariants: false, variantOptions: [], variants: [] } as any,
      });
      summary.push(`${m.slugPayload}: vidé (finitions non vérifiables au tarif)`);
      continue;
    }

    const ext = extractBySlug.get(m.slugPayload);
    if (!ext) {
      console.warn(`[edk-rebuild] ${m.slugPayload}: pas dans 01-extraction — variants vidés`);
      await payload.update({
        collection: "products", id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { hasVariants: false, variantOptions: [], variants: [] } as any,
      });
      summary.push(`${m.slugPayload}: vidé (pas dans extraction sorties)`);
      continue;
    }

    const tok = modelToken(m.slugPayload);
    const variants: VariantInput[] = [];
    const sortieIds = new Set<number>();
    const finitionIds = new Set<number>();
    const couleurIds = new Set<number>();

    if (ext.codingSystem === "A") {
      // Système A : pour chaque sortie de l'extraction, croiser avec finitions audit.
      for (const branch of ext.branches) {
        const so = SORTIE_ID[branch.sortie];
        if (so == null) continue;
        for (const finLabel of m.finitions) {
          const fi = resolveFinitionId(finLabel);
          if (fi == null) continue;
          const couleurs = m.couleurs[finLabel] ?? [];
          for (const couLabel of couleurs) {
            const co = resolveCouleurId(couLabel);
            if (co == null) continue;
            // Tentative de retrouver le code+prix exact depuis l'extraction
            const extColors = branch.finition && normalize(branch.finition) === normalize(finLabel)
              ? branch.couleurs : [];
            const extMatch = extColors.find((c) => normalize(c.couleur) === normalize(couLabel));
            const code = extMatch?.code ?? "";
            const priceHT = extMatch?.prixHT ?? null;
            sortieIds.add(so); finitionIds.add(fi); couleurIds.add(co);
            variants.push({
              optionValues: [so, fi, co],
              sku: `EDK-${tok}-${up(branch.sortie)}-${up(finLabel)}-${up(couLabel)}`,
              mpn: code,
              price: priceHT != null && priceHT > 0 ? ttc(priceHT) : 0,
              stockStatus: "in_stock",
              ...(code ? { manufacturerStructureSku: code } : {}),
              codingSystem: "A",
              computedPriceHT: priceHT,
              priceSource: priceHT != null ? `code complet ${code}` : "a verifier",
              tariffSource: TARIFF_SOURCE,
              importBatchId: BATCH_ID,
            });
          }
        }
      }
    } else {
      // Système B : sorties × finitions audit × couleurs audit
      for (const s of ext.sorties) {
        const so = SORTIE_ID[s.sortie];
        if (so == null) continue;
        for (const finLabel of m.finitions) {
          const fi = resolveFinitionId(finLabel);
          if (fi == null) continue;
          const extFin = findExtractFinition(ext, finLabel);
          const prixSerieHT = extFin?.prixSerieHT ?? null;
          const couleurs = m.couleurs[finLabel] ?? [];
          for (const couLabel of couleurs) {
            const co = resolveCouleurId(couLabel);
            if (co == null) continue;
            const colorSku = findExtractColorSku(extFin, couLabel);
            const ht = s.prixStructureHT != null && prixSerieHT != null
              ? s.prixStructureHT + prixSerieHT : null;
            const price = ht != null && ht > 0 ? ttc(ht) : 0;
            sortieIds.add(so); finitionIds.add(fi); couleurIds.add(co);
            variants.push({
              optionValues: [so, fi, co],
              sku: `EDK-${tok}-${up(s.sortie)}-${up(finLabel)}-${up(couLabel)}`,
              mpn: s.structureSku,
              price,
              stockStatus: "in_stock",
              manufacturerStructureSku: s.structureSku,
              ...(colorSku ? { manufacturerColorSku: colorSku } : {}),
              codingSystem: "B",
              computedPriceHT: ht,
              priceSource: ht != null ? `structure ${s.prixStructureHT} + serie ${prixSerieHT}` : "a verifier",
              tariffSource: TARIFF_SOURCE,
              importBatchId: BATCH_ID,
            });
          }
        }
      }
    }

    if (variants.length === 0) {
      // Aucune variante constructible → on vide aussi
      await payload.update({
        collection: "products", id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { hasVariants: false, variantOptions: [], variants: [] } as any,
      });
      summary.push(`${m.slugPayload}: vidé (croisement audit×extraction donne 0 variante)`);
      continue;
    }

    const variantOptions = [
      { optionType: OT_SORTIE, values: [...sortieIds] },
      { optionType: OT_MATERIAU, values: [...finitionIds] },
      { optionType: OT_COULEUR, values: [...couleurIds] },
    ];

    await payload.update({
      collection: "products", id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { hasVariants: true, variantOptions, variants } as any,
    });
    summary.push(`${m.slugPayload}: ${variants.length} variantes reconstruites`);
  }

  console.log("[edk-rebuild] Récap :");
  for (const s of summary) console.log("  " + s);

  // Diff
  let anomaly = false;
  for (const m of targets) {
    const f = await payload.find({
      collection: "products", where: { slug: { equals: m.slugPayload } }, depth: 0, limit: 1,
    });
    const p = f.docs[0] as unknown as Record<string, unknown>;
    if (fingerprint(p) !== fpBefore.get(m.slugPayload)) {
      anomaly = true;
      console.error(`[edk-rebuild] ⚠️ ANOMALIE ${m.slugPayload} : champ protégé modifié`);
    }
  }
  if (anomaly) { console.error(`[edk-rebuild] ROLLBACK depuis ${snapPath}`); process.exit(1); }
  console.log(`[edk-rebuild] Terminé sans anomalie.`);
  process.exit(0);
}

main().catch((e) => { console.error("[edk-rebuild] Fatal:", e); process.exit(1); });
