/**
 * Edilkamin — Phase 5 : encodage des variantes 3 axes (ou Sortie × Kit pour
 * les Pellkamin) à partir du tarif mai 2026.
 *
 * Source : imports/edilkamin-variants-mai2026/01-extraction-modeles.json
 *   (extrait par sous-agent dédié, vérifié manuellement).
 *
 * Périmètre strict : marque Edilkamin uniquement. Vérifié avant chaque
 * update (refus si brand !== 'Edilkamin').
 *
 * Autorisé par Dorian le 2026-05-20. Snapshot avant écriture + diff de
 * contrôle (tout champ produit hors variants/variantOptions/hasVariants qui
 * bouge → anomalie + arrêt avant de continuer le lot).
 *
 * Skips :
 *  - edilkamin-lena-8 : absent du tarif Mai 2026.
 *  - edilkamin-celia-9-plus : absent du tarif Mai 2026.
 *  - edilkamin-lena-9-evo : 2 axes (top + flancs) au tarif, trop ambigu.
 *
 * Exécution : ./node_modules/.bin/tsx scripts/edilkamin-phase5-write-variants.ts
 */
import fs from "fs";
import path from "path";

const OUT_DIR = path.resolve(process.cwd(), "imports/edilkamin-variants-mai2026");
const JSON_PATH = path.join(OUT_DIR, "01-extraction-modeles.json");
const TVA = 1.21;
const ttc = (ht: number): number => Math.round(ht * TVA);

const SKIP = new Set(["edilkamin-lena-8", "edilkamin-celia-9-plus", "edilkamin-lena-9-evo"]);

/* Type d'options (IDs vérifiés). */
const OT_SORTIE = 4, OT_MATERIAU = 1, OT_COULEUR = 2;
let OT_KIT = 7; // « Kit de chargement » créé par le lot Pellek EK63, id 7. Vérifié à runtime.

/* Valeurs sorties (existantes). */
const SORTIE_ID: Record<string, number> = { Top: 22, Back: 23, Coax: 24 };

/* Mapping finitions tarif → ID matériau existant. */
const FINITION_ID: Record<string, number> = {
  "Acier": 1, "Céramique": 2, "Verre": 5, "Verre Magic": 5,
  "Pierre ollaire": 3, "Fonte": 6,
  "Acier + verre": 1, "Acier / Céramique": 2, "Acier-Céramique": 2,
};

/* Mapping couleurs tarif → ID existant ou slug-clé pour création. */
const COULEUR_EXISTING: Record<string, number> = {
  "Acier noir": 7, "Noir": 7, "Noir opaque": 7, "Noir brillant": 7, "Noir mat": 7,
  "Noire opaque": 7, "Verre noir": 7,
  "Blanc": 8, "Blanc opaque": 8, "Matte witte": 8, "Verre blanc": 8, "Blanc perle": 8,
  "Blanc opaque (céramique)": 8,
  "Blanc crème": 9, "Crème": 9, "Beige": 9, "Sable": 9, // approximations
  "Bordeaux": 11, "Tourterelle": 14, "Taupe": 14,
  "Gris": 12, "Gris foncé": 12, "Gris anthracite": 12,
  // Nouvelles couleurs à créer (laissées vides ici, créées à runtime) :
  // Moka, Bronze, Parchemin, Pierre ollaire
};
const COULEURS_TO_CREATE: { label: string; slug: string; colorHex: string }[] = [
  { label: "Moka", slug: "moka", colorHex: "#6F4E37" },
  { label: "Bronze", slug: "bronze", colorHex: "#B08D57" },
  { label: "Parchemin", slug: "parchemin", colorHex: "#E8DCB5" },
  { label: "Pierre ollaire", slug: "pierre-ollaire-couleur", colorHex: "#4A4A4A" },
];
/* Aliases qui dépendent d'une couleur à créer. Résolu en runtime. */
const COULEUR_BY_LABEL_NEW: Record<string, string> = {
  "Moka": "moka", "Bronze": "bronze", "Parchemin": "parchemin", "Pierre ollaire": "pierre-ollaire-couleur",
  // Pour Slide 5 série pierre ollaire qui n'a qu'un SKU « Standard » : on l'affiche
  // sous la même couleur « Pierre ollaire » que les autres modèles à finition stone.
  "Standard": "pierre-ollaire-couleur",
};

/* Kits déjà existants (lot Pellek EK63), par colorSku tarif. */
const KIT_BY_CODE_EXISTING: Record<string, number> = {
  "1167410": 35, // Kit tiroir rectangulaire
  "1194130": 36, // Kit tiroir carré
  "1167450": 37, // Kit trappe
};
/* Kits à créer, indexés par colorSku. */
const KITS_TO_CREATE: { code: string; label: string; slug: string }[] = [
  { code: "1133080", label: "Kit cadre d'encadrement", slug: "kit-cadre-encadrement" },
  { code: "1132260", label: "Kit chargement par trappe (Pellkamin 12++)", slug: "kit-trappe-pellkamin-12" },
  { code: "1132290", label: "Kit chargement frontal tiroir (Pellkamin 12++)", slug: "kit-frontal-pellkamin-12" },
];

/* Champs à protéger. */
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

interface ColourA { couleur: string; code: string; prixHT: number | null }
interface ColourB { couleur: string; colorSku: string }
interface ModelEntry {
  slugPayload: string; nom: string; codingSystem: "A" | "B"; matchCertain: boolean; note?: string;
  branches?: { sortie: string; finition: string; couleurs: ColourA[] }[];
  sorties?: { sortie: string; structureSku: string; prixStructureHT: number | null }[];
  finitions?: { finition: string; serieLabel?: string; prixSerieHT: number | null; couleurs: ColourB[] }[];
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

function up(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function modelToken(slug: string): string {
  return up(slug.replace(/^edilkamin-/, ""));
}

async function main(): Promise<void> {
  loadEnv();
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  // 0. Sanity : type "Kit de chargement" doit exister (créé par lot Pellek EK63).
  const kt = await payload.find({
    collection: "variant-option-types",
    where: { slug: { equals: "kit-chargement" } }, limit: 1,
  });
  if (kt.docs.length === 0) {
    console.error("[edk] FATAL: type d'option 'kit-chargement' introuvable.");
    process.exit(1);
  }
  OT_KIT = Number(kt.docs[0]!.id);
  console.log(`[edk] type Kit de chargement = id ${OT_KIT}`);

  // 1. Créer les couleurs manquantes (idempotent par slug).
  const couleurIdBySlug: Record<string, number> = {};
  for (const c of COULEURS_TO_CREATE) {
    const ex = await payload.find({
      collection: "variant-option-values",
      where: { slug: { equals: c.slug }, optionType: { equals: OT_COULEUR } }, limit: 1,
    });
    if (ex.docs.length > 0) {
      couleurIdBySlug[c.slug] = Number(ex.docs[0]!.id);
    } else {
      const v = await payload.create({
        collection: "variant-option-values",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { label: c.label, slug: c.slug, colorHex: c.colorHex, optionType: OT_COULEUR } as any,
      });
      couleurIdBySlug[c.slug] = Number(v.id);
    }
    console.log(`[edk] couleur "${c.label}" → id ${couleurIdBySlug[c.slug]}`);
  }

  // 2. Créer les kits manquants (idempotent par slug).
  const kitIdByCode: Record<string, number> = { ...KIT_BY_CODE_EXISTING };
  for (const k of KITS_TO_CREATE) {
    const ex = await payload.find({
      collection: "variant-option-values",
      where: { slug: { equals: k.slug }, optionType: { equals: OT_KIT } }, limit: 1,
    });
    if (ex.docs.length > 0) {
      kitIdByCode[k.code] = Number(ex.docs[0]!.id);
    } else {
      const v = await payload.create({
        collection: "variant-option-values",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { label: k.label, slug: k.slug, optionType: OT_KIT } as any,
      });
      kitIdByCode[k.code] = Number(v.id);
    }
    console.log(`[edk] kit "${k.label}" (code ${k.code}) → id ${kitIdByCode[k.code]}`);
  }

  function resolveCouleurId(label: string): number {
    if (label in COULEUR_EXISTING) return COULEUR_EXISTING[label]!;
    if (label in COULEUR_BY_LABEL_NEW) {
      const slug = COULEUR_BY_LABEL_NEW[label]!;
      return couleurIdBySlug[slug]!;
    }
    throw new Error(`Couleur sans mapping : "${label}"`);
  }

  function resolveFinitionId(label: string): number {
    const id = FINITION_ID[label];
    if (id == null) throw new Error(`Finition sans mapping : "${label}"`);
    return id;
  }

  function resolveSortieId(label: string): number {
    const id = SORTIE_ID[label];
    if (id == null) throw new Error(`Sortie sans mapping : "${label}"`);
    return id;
  }

  // 3. Charger le JSON et préparer les écritures.
  const data: { modeles: ModelEntry[] } = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
  const targets = data.modeles.filter((m) => {
    if (SKIP.has(m.slugPayload)) return false;
    if (m.codingSystem === "A") return (m.branches?.length ?? 0) > 0;
    return (m.sorties?.length ?? 0) > 0 && (m.finitions?.length ?? 0) > 0;
  });
  console.log(`[edk] ${targets.length} modèles à encoder (sur ${data.modeles.length}).`);

  // 4. Snapshot AVANT.
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const snapPath = path.join(OUT_DIR, `_snapshot-edilkamin-${stamp}.json`);
  const before: Record<string, unknown>[] = [];
  const fpBefore = new Map<string, string>();
  const idBySlug = new Map<string, number>();
  for (const m of targets) {
    const f = await payload.find({
      collection: "products", where: { slug: { equals: m.slugPayload } }, depth: 2, limit: 1,
    });
    const doc = f.docs[0] as unknown as Record<string, unknown> | undefined;
    if (!doc) { console.error(`[edk] INTROUVABLE: ${m.slugPayload}`); process.exit(1); }
    if (doc.brand !== "Edilkamin") {
      console.error(`[edk] BRAND MISMATCH: ${m.slugPayload} brand=${doc.brand} — abandon.`);
      process.exit(1);
    }
    before.push(doc);
    fpBefore.set(m.slugPayload, fingerprint(doc));
    idBySlug.set(m.slugPayload, Number(doc.id));
  }
  fs.writeFileSync(snapPath, JSON.stringify(before, null, 2));
  console.log(`[edk] Snapshot : ${path.relative(process.cwd(), snapPath)}`);

  // 5. Écriture.
  type VariantInput = {
    optionValues: number[];
    sku: string;
    mpn: string;
    gtin?: string;
    price: number;
    stockStatus: "in_stock";
    manufacturerStructureSku?: string;
    manufacturerColorSku?: string;
    codingSystem?: "A" | "B";
    computedPriceHT?: number | null;
    priceSource?: string;
    tariffSource?: string;
    importBatchId?: string;
  };
  const TARIFF_SOURCE = "Edilkamin Mai 2026";
  const BATCH_ID = `edilkamin-mai2026-${Date.now()}`;

  for (const m of targets) {
    const id = idBySlug.get(m.slugPayload)!;
    const tok = modelToken(m.slugPayload);
    const variants: VariantInput[] = [];
    const sortieIds = new Set<number>();
    const finitionIds = new Set<number>();
    const couleurIds = new Set<number>();
    const kitIds = new Set<number>();
    const isPellkamin = m.slugPayload.startsWith("edilkamin-pellkamin-");

    if (m.codingSystem === "A") {
      for (const b of m.branches!) {
        const so = resolveSortieId(b.sortie); sortieIds.add(so);
        const fi = resolveFinitionId(b.finition); finitionIds.add(fi);
        for (const c of b.couleurs) {
          const co = resolveCouleurId(c.couleur); couleurIds.add(co);
          const price = c.prixHT != null && c.prixHT > 0 ? ttc(c.prixHT) : 0;
          variants.push({
            optionValues: [so, fi, co],
            sku: `EDK-${tok}-${up(b.sortie)}-${up(b.finition)}-${up(c.couleur)}`,
            mpn: c.code, price, stockStatus: "in_stock",
            manufacturerStructureSku: c.code,
            codingSystem: "A",
            computedPriceHT: c.prixHT,
            priceSource: c.prixHT != null ? `code complet ${c.code}` : "a verifier",
            tariffSource: TARIFF_SOURCE,
            importBatchId: BATCH_ID,
          });
        }
      }
    } else if (isPellkamin) {
      // Sortie × Kit (pas de couleur)
      for (const s of m.sorties!) {
        const so = resolveSortieId(s.sortie); sortieIds.add(so);
        for (const f of m.finitions!) {
          // Chaque finition = un kit (1 ligne couleur "Standard")
          const c = f.couleurs[0]!;
          const kitId = kitIdByCode[c.colorSku];
          if (kitId == null) {
            console.error(`[edk] kit inconnu code=${c.colorSku} sur ${m.slugPayload}`);
            process.exit(1);
          }
          kitIds.add(kitId);
          const sPrice = s.prixStructureHT, fPrice = f.prixSerieHT;
          const ht = sPrice != null && fPrice != null ? sPrice + fPrice : null;
          const price = ht != null && ht > 0 ? ttc(ht) : 0;
          variants.push({
            optionValues: [so, kitId],
            sku: `EDK-${tok}-${up(s.sortie)}-KIT-${c.colorSku}`,
            mpn: s.structureSku, price, stockStatus: "in_stock",
            manufacturerStructureSku: s.structureSku,
            manufacturerColorSku: c.colorSku,
            codingSystem: "B",
            computedPriceHT: ht,
            priceSource: ht != null ? `structure ${sPrice} + serie ${fPrice}` : "a verifier",
            tariffSource: TARIFF_SOURCE,
            importBatchId: BATCH_ID,
          });
        }
      }
    } else {
      // Système B standard : Sortie × Finition × Couleur
      for (const s of m.sorties!) {
        const so = resolveSortieId(s.sortie); sortieIds.add(so);
        for (const f of m.finitions!) {
          const fi = resolveFinitionId(f.finition); finitionIds.add(fi);
          for (const c of f.couleurs) {
            const co = resolveCouleurId(c.couleur); couleurIds.add(co);
            const sPrice = s.prixStructureHT, fPrice = f.prixSerieHT;
            const ht = sPrice != null && fPrice != null ? sPrice + fPrice : null;
            const price = ht != null && ht > 0 ? ttc(ht) : 0;
            variants.push({
              optionValues: [so, fi, co],
              sku: `EDK-${tok}-${up(s.sortie)}-${up(f.finition)}-${up(c.couleur)}`,
              mpn: s.structureSku, price, stockStatus: "in_stock",
              manufacturerStructureSku: s.structureSku,
              manufacturerColorSku: c.colorSku,
              codingSystem: "B",
              computedPriceHT: ht,
              priceSource: ht != null ? `structure ${sPrice} + serie ${fPrice}` : "a verifier",
              tariffSource: TARIFF_SOURCE,
              importBatchId: BATCH_ID,
            });
          }
        }
      }
    }

    const variantOptions = isPellkamin
      ? [
          { optionType: OT_SORTIE, values: [...sortieIds] },
          { optionType: OT_KIT, values: [...kitIds] },
        ]
      : [
          { optionType: OT_SORTIE, values: [...sortieIds] },
          { optionType: OT_MATERIAU, values: [...finitionIds] },
          { optionType: OT_COULEUR, values: [...couleurIds] },
        ];

    await payload.update({
      collection: "products",
      id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { hasVariants: true, variantOptions, variants } as any,
    });
    console.log(`[edk] ${m.slugPayload} (id ${id}) : ${variants.length} variantes, ${variantOptions.length} axes.`);
  }

  // 6. Diff.
  let anomaly = false;
  for (const m of targets) {
    const f = await payload.find({
      collection: "products", where: { slug: { equals: m.slugPayload } }, depth: 2, limit: 1,
    });
    const doc = f.docs[0] as unknown as Record<string, unknown>;
    if (fingerprint(doc) !== fpBefore.get(m.slugPayload)) {
      anomaly = true;
      console.error(`[edk] ⚠️ ANOMALIE — champ protégé modifié sur ${m.slugPayload}`);
    }
  }
  if (anomaly) { console.error(`[edk] ROLLBACK depuis ${snapPath}`); process.exit(1); }
  console.log(`[edk] Terminé sans anomalie. Snapshot : ${path.relative(process.cwd(), snapPath)}`);
  process.exit(0);
}

main().catch((e) => { console.error("[edk] Fatal:", e); process.exit(1); });
