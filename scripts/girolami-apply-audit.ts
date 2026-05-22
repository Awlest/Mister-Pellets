/**
 * Girolami — applique l'audit du catalogue 2026 sur les 6 produits Payload.
 *
 * Source unique : imports/girolami-catalogue-2026/01-audit-girolami.json
 * (extrait par sous-agent, règle stricte "jamais d'invention" appliquée).
 *
 * Pour chaque produit :
 *  - Specs : power, efficiency, heatedVolumeM3, hopperCapacity, weight,
 *    dimensions — uniquement les valeurs non-null de l'audit.
 *  - Produit : gtin, mpn (code article principal), priceHT, priceTTC
 *    (entrée de gamme depuis les variants), hiddenFromBoutique=false,
 *    metaTitle et metaDescription (générés sur le modèle EK63/Edilkamin).
 *  - Variants : axe Couleur (et Matériau pour traçabilité finition).
 *    Si pas de couleur au catalogue (Biotec) → hasVariants=false.
 *
 * Crée la valeur d'option couleur "Ivoire" si elle n'existe pas (vue pour
 * Soft 14 Pellet AVORIO).
 *
 * Filtre marque Girolami strict. Snapshot + diff de contrôle.
 *
 * Exécution : ./node_modules/.bin/tsx scripts/girolami-apply-audit.ts
 */
import fs from "fs";
import path from "path";

const OUT_DIR = path.resolve(process.cwd(), "imports/girolami-catalogue-2026");
const AUDIT_PATH = path.join(OUT_DIR, "01-audit-girolami.json");
const TVA = 1.21;
const ttc = (ht: number): number => Math.round(ht * TVA);
const TARIFF_SOURCE = "Girolami Catalogue 2026";
const BATCH_ID = `girolami-audit-${Date.now()}`;

const OT_MATERIAU = 1, OT_COULEUR = 2;

/* Mapping finition (label audit normalisé) → ID matériau. */
function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}
const FINITION_ID: Record<string, number> = {
  "acier": 1, "ceramique": 2, "pierre ollaire": 3, "majolique": 4, "verre": 5, "fonte": 6,
};
function resolveFinitionId(label: string): number | null {
  return FINITION_ID[normalize(label)] ?? null;
}

/* Mapping couleur (label normalisé) → ID. Les IDs existants en DB.
   "Ivoire" n'existe pas — on le crée à runtime. */
const COULEUR_BASE_ID: Record<string, number> = {
  "blanc": 8, "blanc opaque": 8,
  "noir": 7, "noir opaque": 7, "noire opaque": 7, "noir mat": 7, "noir brillant": 7,
  "bordeaux": 11,
  "tourterelle": 14, "taupe": 14,
  "gris": 12, "gris fonce": 12, "gris anthracite": 12,
  "bronze": 39,
  "creme": 9, "blanc creme": 9, "beige": 9,
  "moka": 38, "parchemin": 40, "pierre ollaire": 41,
};

interface AuditCouleur { couleur: string; code: string; prixHT: number | null; priceNote?: string }
interface AuditModele {
  slugPayload: string;
  nomCatalogue: string;
  power: number | null;
  efficiency: number | null;
  heatedVolumeM3: number | null;
  hopperCapacity: number | null;
  weight: number | null;
  dimensions: { width: number | null; height: number | null; depth: number | null };
  finitions: string[];
  couleurs: Record<string, AuditCouleur[]>;
  code?: string;
  prixHT?: number;
  found: boolean;
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

/* Champs strictement protégés (ne doivent PAS bouger). */
const GUARDED = [
  "sku", "slug", "name", "brand", "model", "productType", "diffusion", "color",
  "promoPrice", "installationPrice", "energyClass", "emissions",
  "isAirtight", "isCanalizable", "isHydro", "isConnected",
  "isBestseller", "isFeatured", "isNew",
  "shortDescription", "description", "features", "technicalSheet",
  "mainImage", "galleryImages", "colorVariants",
  "googleProductCategory",
  "stockStatus", "stock", "deliveryDelay",
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
  return up(slug.replace(/^girolami-/, ""));
}

function buildMeta(p: Record<string, unknown>, nomCatalogue: string): { metaTitle: string; metaDescription: string } {
  const name = String(p.name ?? "").trim();
  const power = p.power != null ? `${String(p.power).replace(".", ",")} kW` : "";
  const ptype = String(p.productType ?? "");
  const typeWord = ptype === "hydro" ? "hydro " : ptype === "canalisable" ? "canalisable " : ptype === "insert" ? "insert " : "";

  let title = `Poêle à pellets ${typeWord}${name}${power ? " " + power : ""}`.replace(/\s+/g, " ").trim();
  if (title.length > 67) title = title.slice(0, 67) + "...";
  if (title.length + 11 <= 70) title += " | Wallonie";

  const short = String(p.shortDescription ?? "").trim();
  const heatedVolume = p.heatedVolumeM3 != null ? `${p.heatedVolumeM3} m³` : "";
  let desc = short.length >= 80
    ? short
    : `${name}${power ? ", " + power : ""}${heatedVolume ? " pour " + heatedVolume : ""}. Made in Italy, pose par Mister Pellets, primes Wallonie 2026 deduites du devis.`;
  if (desc.length > 157) desc = desc.slice(0, 157) + "...";
  return { metaTitle: title, metaDescription: desc };
}

async function main(): Promise<void> {
  loadEnv();
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  const audit: { modeles: AuditModele[] } = JSON.parse(fs.readFileSync(AUDIT_PATH, "utf8"));
  console.log(`[girolami] ${audit.modeles.length} modèles à traiter.`);

  // 1. Création (idempotente) de la valeur couleur "Ivoire" si absente.
  const ivoireSearch = await payload.find({
    collection: "variant-option-values",
    where: { slug: { equals: "ivoire" }, optionType: { equals: OT_COULEUR } }, limit: 1,
  });
  let IVOIRE_ID: number;
  if (ivoireSearch.docs.length > 0) {
    IVOIRE_ID = Number(ivoireSearch.docs[0]!.id);
    console.log(`[girolami] couleur "Ivoire" déjà présente (id ${IVOIRE_ID})`);
  } else {
    const v = await payload.create({
      collection: "variant-option-values",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { label: "Ivoire", slug: "ivoire", colorHex: "#FFFFF0", optionType: OT_COULEUR } as any,
    });
    IVOIRE_ID = Number(v.id);
    console.log(`[girolami] couleur "Ivoire" créée (id ${IVOIRE_ID})`);
  }
  const COULEUR_ID: Record<string, number> = { ...COULEUR_BASE_ID, "ivoire": IVOIRE_ID };
  function resolveCouleurId(label: string): number | null {
    return COULEUR_ID[normalize(label)] ?? null;
  }

  // 2. Snapshot
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const snapPath = path.join(OUT_DIR, `_snapshot-girolami-${stamp}.json`);
  const before: Record<string, unknown>[] = [];
  const fpBefore = new Map<string, string>();
  const docs = new Map<string, Record<string, unknown>>();

  for (const m of audit.modeles) {
    if (!m.found) continue;
    const f = await payload.find({
      collection: "products", where: { slug: { equals: m.slugPayload } }, depth: 0, limit: 1,
    });
    const p = f.docs[0] as unknown as Record<string, unknown> | undefined;
    if (!p) { console.error(`[girolami] INTROUVABLE: ${m.slugPayload}`); process.exit(1); }
    if (p.brand !== "Girolami") {
      console.error(`[girolami] BRAND MISMATCH: ${m.slugPayload} brand=${p.brand}`); process.exit(1);
    }
    before.push(p);
    fpBefore.set(m.slugPayload, fingerprint(p));
    docs.set(m.slugPayload, p);
  }
  fs.writeFileSync(snapPath, JSON.stringify(before, null, 2));
  console.log(`[girolami] Snapshot : ${path.relative(process.cwd(), snapPath)}`);

  // 3. Updates
  type VariantInput = {
    optionValues: number[]; sku: string; mpn: string; price: number; stockStatus: "in_stock";
    manufacturerStructureSku?: string; codingSystem?: "A";
    computedPriceHT?: number | null; priceSource?: string;
    tariffSource?: string; importBatchId?: string;
  };

  for (const m of audit.modeles) {
    if (!m.found) continue;
    const p = docs.get(m.slugPayload)!;
    const id = Number(p.id);
    const tok = modelToken(m.slugPayload);

    // Construction du payload update
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update: Record<string, any> = {};

    // Specs (uniquement non-null de l'audit)
    if (m.power != null) update.power = m.power;
    if (m.efficiency != null) update.efficiency = m.efficiency;
    if (m.heatedVolumeM3 != null) update.heatedVolumeM3 = m.heatedVolumeM3;
    if (m.hopperCapacity != null) update.hopperCapacity = m.hopperCapacity;
    if (m.weight != null) update.weight = m.weight;
    if (m.dimensions && (m.dimensions.width != null || m.dimensions.height != null || m.dimensions.depth != null)) {
      const existing = (p.dimensions as Record<string, unknown> | null) ?? {};
      update.dimensions = {
        width: m.dimensions.width ?? existing.width ?? null,
        height: m.dimensions.height ?? existing.height ?? null,
        depth: m.dimensions.depth ?? existing.depth ?? null,
      };
    }

    // Visibilité boutique
    update.hiddenFromBoutique = false;

    // Variants + variantOptions + code/prix produit
    const variants: VariantInput[] = [];
    const couleurIds = new Set<number>();
    const finitionIds = new Set<number>();

    if (m.finitions.length > 0) {
      for (const finLabel of m.finitions) {
        const fi = resolveFinitionId(finLabel);
        if (fi == null) {
          console.warn(`[girolami] ${m.slugPayload}: finition '${finLabel}' non mappée — skip`);
          continue;
        }
        finitionIds.add(fi);
        const colours = m.couleurs[finLabel] ?? [];
        for (const c of colours) {
          const co = resolveCouleurId(c.couleur);
          if (co == null) {
            console.warn(`[girolami] ${m.slugPayload}: couleur '${c.couleur}' non mappée — skip`);
            continue;
          }
          couleurIds.add(co);
          const priceTTCv = c.prixHT != null && c.prixHT > 0 ? ttc(c.prixHT) : 0;
          variants.push({
            optionValues: [fi, co],
            sku: `GIR-${tok}-${up(finLabel)}-${up(c.couleur)}`,
            mpn: c.code,
            price: priceTTCv,
            stockStatus: "in_stock",
            manufacturerStructureSku: c.code,
            codingSystem: "A",
            computedPriceHT: c.prixHT,
            priceSource: c.prixHT != null ? `code complet ${c.code}` : "a verifier",
            tariffSource: TARIFF_SOURCE,
            importBatchId: BATCH_ID,
          });
        }
      }
    }

    if (variants.length > 0) {
      update.hasVariants = true;
      update.variantOptions = [
        { optionType: OT_MATERIAU, values: [...finitionIds] },
        { optionType: OT_COULEUR, values: [...couleurIds] },
      ];
      update.variants = variants;

      // Code produit principal : le premier code (entrée de gamme)
      const firstCode = variants[0]!.mpn;
      update.gtin = firstCode;
      update.mpn = firstCode;

      // Prix produit : min des HT (variant.computedPriceHT) → TTC
      const validPrices = variants
        .map((v) => v.computedPriceHT)
        .filter((x): x is number => x != null && x > 0);
      if (validPrices.length > 0) {
        const minHT = Math.min(...validPrices);
        update.priceHT = minHT;
        update.priceTTC = ttc(minHT);
      }
    } else {
      // Pas de couleur (Biotec) : pas de variants, mais code+prix produit depuis l'audit
      update.hasVariants = false;
      update.variantOptions = [];
      update.variants = [];
      if (m.code) {
        update.gtin = m.code;
        update.mpn = m.code;
      }
      if (m.prixHT != null && m.prixHT > 0) {
        update.priceHT = m.prixHT;
        update.priceTTC = ttc(m.prixHT);
      }
    }

    // Meta SEO (basé sur l'état mis à jour)
    const projected = { ...p, ...update };
    const meta = buildMeta(projected, m.nomCatalogue);
    if (!p.metaTitle) update.metaTitle = meta.metaTitle;
    if (!p.metaDescription) update.metaDescription = meta.metaDescription;

    await payload.update({
      collection: "products",
      id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: update as any,
    });
    console.log(
      `[girolami] ${m.slugPayload}: ${variants.length} variantes, prix entrée=${update.priceHT ?? "—"} HT, gtin=${update.gtin ?? "—"}`,
    );
  }

  // 4. Diff (champs protégés intacts)
  let anomaly = false;
  for (const m of audit.modeles) {
    if (!m.found) continue;
    const f = await payload.find({
      collection: "products", where: { slug: { equals: m.slugPayload } }, depth: 0, limit: 1,
    });
    const p = f.docs[0] as unknown as Record<string, unknown>;
    if (fingerprint(p) !== fpBefore.get(m.slugPayload)) {
      anomaly = true;
      const beforeDoc = docs.get(m.slugPayload)!;
      const changed: string[] = [];
      for (const k of GUARDED) {
        if (JSON.stringify(beforeDoc[k]) !== JSON.stringify(p[k])) changed.push(k);
      }
      console.error(`[girolami] ⚠️ ANOMALIE ${m.slugPayload} : champs protégés modifiés → ${changed.join(", ")}`);
    }
  }
  if (anomaly) { console.error(`[girolami] ROLLBACK depuis ${snapPath}`); process.exit(1); }
  console.log(`[girolami] Terminé sans anomalie.`);
  process.exit(0);
}

main().catch((e) => { console.error("[girolami] Fatal:", e); process.exit(1); });
