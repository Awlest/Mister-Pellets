/**
 * Girolami — encodage complet du catalogue 2026 (coeur pellet), sur le modèle
 * Edilkamin. Crée/Met à jour les fiches `products` à partir de
 * imports/girolami-catalogue-2026/01-extraction-girolami.json.
 *
 * Principe (validé par Dorian) :
 *  - Périmètre STRICT marque Girolami. Toute fiche existante d'une autre marque
 *    bloque le script (refus + arrêt). Edilkamin / EK63 jamais touchés.
 *  - hiddenFromBoutique = true : rien n'apparaît en boutique tant que l'équipe
 *    n'a pas ajouté les photos et validé. Le site public n'est pas impacté.
 *  - Prix catalogue = HT. priceTTC = round(HT * 1,21).
 *  - Une fiche par (modèle, puissance, configuration). Couleurs encodées en
 *    variantes (système `variants`, axe Couleur), chacune avec son code Girolami
 *    en mpn et le prix TTC de sa ligne tarif. Métadonnées de traçabilité
 *    complètes (codingSystem, computedPriceHT, tariffSource, importBatchId).
 *  - Idempotent : upsert par slug. Snapshot avant écriture.
 *
 * Usage :
 *   tsx scripts/girolami-encode.ts --dry-run            # aperçu, n'écrit rien
 *   tsx scripts/girolami-encode.ts --cat AIR_STOVES     # un lot
 *   tsx scripts/girolami-encode.ts                      # tout le coeur pellet
 *   tsx scripts/girolami-encode.ts --text-only          # MAJ description (+ atouts) SEULE, aucune autre donnée
 */
import fs from "fs";
import path from "path";
import { FAMILY_CONTENT, DEFAULT_CONTENT, buildShortDescription, COLOR_HEX, FAMILY_GEOM } from "./girolami-content";

// Fiche vérifiée par l'équipe : on ne touche QUE sa description.
const VERIFIED_DESC_ONLY = new Set(["girolami-split-9"]);

const ROOT = process.cwd();
const fileIdx = process.argv.indexOf("--file");
const EXTRACTION = fileIdx !== -1
  ? path.resolve(ROOT, process.argv[fileIdx + 1]!)
  : path.join(ROOT, "imports/girolami-catalogue-2026/01-extraction-girolami.json");
const OUT_DIR = path.join(ROOT, "imports/girolami-catalogue-2026");
const TARIFF_SOURCE = "Girolami Catalistino 2026";

const DRY = process.argv.includes("--dry-run");
const catIdx = process.argv.indexOf("--cat");
const CAT_FILTER = catIdx !== -1 ? process.argv[catIdx + 1] : null;
const limIdx = process.argv.indexOf("--limit");
const LIMIT = limIdx !== -1 ? Number(process.argv[limIdx + 1]) : null;
// Mode "texte seul" : ne réécrit QUE la description générale (+ atouts), jamais
// les autres données (prix, specs, dimensions, variantes, couleurs, méta).
// split-9 (vérifiée équipe) reste en description seule. Demande Dorian juin 2026.
const TEXT_ONLY = process.argv.includes("--text-only");

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

/* Lexical richText minimal valide (paragraphes simples). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lexical(paras: string[]): any {
  return {
    root: {
      type: "root", format: "", indent: 0, version: 1, direction: "ltr",
      children: paras.map((txt) => ({
        type: "paragraph", format: "", indent: 0, version: 1, direction: "ltr", textFormat: 0,
        children: [{ type: "text", detail: 0, format: 0, mode: "normal", style: "", text: txt, version: 1 }],
      })),
    },
  };
}

/* Couleurs Girolami → slug + hex pour les valeurs d'axe (créées si absentes). */
const COLOR_DEF: Record<string, { slug: string; hex: string }> = {
  "Blanc": { slug: "blanc", hex: "#f5f3ee" },
  "Noir": { slug: "noir", hex: "#1a1a1a" },
  "Bordeaux": { slug: "bordeaux", hex: "#6b1f2e" },
  "Gris anthracite": { slug: "gris-anthracite", hex: "#3a3a3a" },
  "Bronze": { slug: "bronze", hex: "#b08d57" },
  "Vert": { slug: "vert", hex: "#2e6b3a" },
  "Ivoire": { slug: "ivoire", hex: "#efe6d0" },
  "Corten": { slug: "corten", hex: "#8a5a3c" },
};

interface Variant { color: string | null; code: string; priceHT: number | null; priceTTC: number | null }
interface Product {
  base: string; slug: string; sku: string; name: string; family: string; model: string;
  powerClass: number | null; power: number | null; productType: string; category: string;
  combustible: string | null; isCanalizable: boolean; isCoassiale: boolean; isHydro: boolean;
  isAirtight: boolean; isInsert: boolean; powerMaxKW: number | null; powerNomKW: number | null;
  efficiency: number | null; heatedVolumeM3: number | null; hopperCapacity: number | null;
  weight: number | null; smokeOutletMm: number | null; waterL: number | null;
  priceHT: number | null; priceTTC: number | null; variants: Variant[];
}

function famKey(family: string): string { return family.toLowerCase().trim(); }

function buildMeta(p: Product, shortDesc: string): { metaTitle: string; metaDescription: string } {
  const isWood = p.combustible === "wood";
  const suffix = isWood
    ? (p.isHydro ? "Cheminée bois Wallonie" : "Insert à bois Wallonie")
    : (p.isHydro ? "Poêle hydro Wallonie" : p.isInsert ? "Insert pellets Wallonie" : "Poêle à pellets Wallonie");
  let title = `${p.name} | ${suffix}`;
  if (title.length > 70) title = `${p.name} | Wallonie`;
  if (title.length > 70) {
    let n = p.name;
    while ((n + " | Wallonie").length > 70 && n.includes(" ")) n = n.slice(0, n.lastIndexOf(" "));
    title = `${n} | Wallonie`;
  }
  // metaDescription : shortDesc + accroche locale, coupée proprement <=160.
  let desc = `${shortDesc} Pose par Mister Pellets, primes Wallonie, devis gratuit.`;
  if (desc.length > 158) {
    let base = shortDesc;
    const tail = " Devis gratuit, Wallonie.";
    while ((base + tail).length > 158 && base.includes(" ")) base = base.slice(0, base.lastIndexOf(" "));
    desc = base + tail;
  }
  return { metaTitle: title, metaDescription: desc };
}

async function main(): Promise<void> {
  loadEnv();
  const data: { products: Product[] } = JSON.parse(fs.readFileSync(EXTRACTION, "utf8"));
  let products = data.products;
  if (CAT_FILTER) products = products.filter((p) => p.category === CAT_FILTER);
  if (LIMIT) products = products.slice(0, LIMIT);
  console.log(`[gir] ${products.length} produit(s) à encoder${CAT_FILTER ? ` (lot ${CAT_FILTER})` : ""}${DRY ? " — DRY RUN" : ""}.`);

  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  // 0. Axe Couleur + valeurs (création idempotente des couleurs manquantes).
  const ct = await payload.find({ collection: "variant-option-types", where: { slug: { equals: "couleur" } }, limit: 1 });
  if (ct.docs.length === 0) { console.error("[gir] FATAL: type d'option 'couleur' introuvable. Lance d'abord seed-variant-options.ts"); process.exit(1); }
  const OT_COULEUR = Number(ct.docs[0]!.id);
  console.log(`[gir] axe Couleur = id ${OT_COULEUR}`);

  const colorId: Record<string, number> = {};
  for (const [label, def] of Object.entries(COLOR_DEF)) {
    const ex = await payload.find({ collection: "variant-option-values", where: { and: [{ slug: { equals: def.slug } }, { optionType: { equals: OT_COULEUR } }] }, limit: 1 });
    if (ex.docs.length > 0) { colorId[label] = Number(ex.docs[0]!.id); continue; }
    if (DRY) { colorId[label] = -1; console.log(`[gir]   (dry) couleur "${label}" serait créée`); continue; }
    const v = await payload.create({ collection: "variant-option-values",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { label, slug: def.slug, colorHex: def.hex, optionType: OT_COULEUR } as any });
    colorId[label] = Number(v.id);
    console.log(`[gir]   couleur "${label}" créée → id ${colorId[label]}`);
  }

  // 1. Snapshot des fiches Girolami existantes (avant écriture).
  if (!DRY) {
    const existing = await payload.find({ collection: "products", where: { brand: { equals: "Girolami" } }, depth: 0, limit: 500 });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const snap = path.join(OUT_DIR, `_snapshot-encode-${stamp}.json`);
    fs.writeFileSync(snap, JSON.stringify(existing.docs, null, 2));
    console.log(`[gir] Snapshot ${existing.docs.length} fiches Girolami → ${path.relative(ROOT, snap)}`);
  }

  const BATCH_ID = `girolami-cat2026-${CAT_FILTER ?? "all"}`;
  const preview: unknown[] = [];
  let created = 0, updated = 0, errored = 0;

  for (const p of products) {
    try {
      const c = FAMILY_CONTENT[famKey(p.family)] ?? DEFAULT_CONTENT;
      const shortDesc = buildShortDescription({
        family: p.family, tagline: c.tagline, power: p.power, powerMaxKW: p.powerMaxKW,
        isCanalizable: p.isCanalizable, isCoassiale: p.isCoassiale, combustible: p.combustible, isHydro: p.isHydro, priceTTC: p.priceTTC,
      });
      const meta = buildMeta(p, shortDesc);

      // Variantes couleur (système `variants`, axe Couleur).
      const hasColors = p.variants.some((v) => v.color);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const variants: any[] = [];
      const usedColorIds = new Set<number>();
      if (hasColors) {
        for (const v of p.variants) {
          if (!v.color) continue;
          const cid = colorId[v.color];
          if (cid == null) { throw new Error(`couleur sans mapping: ${v.color}`); }
          usedColorIds.add(cid);
          variants.push({
            optionValues: [cid],
            sku: `GIR-${v.code}`.replace(/\//g, "-"),
            mpn: v.code,
            price: v.priceTTC,
            stockStatus: "on_order",
            manufacturerStructureSku: p.base,
            manufacturerColorSku: v.code,
            codingSystem: "A",
            computedPriceHT: v.priceHT,
            priceSource: `code complet ${v.code}`,
            tariffSource: TARIFF_SOURCE,
            importBatchId: BATCH_ID,
          });
        }
      }

      // Géométrie + classe énergie par famille (réf. Split vérifié).
      const geom = FAMILY_GEOM[famKey(p.family)];
      // colorVariants (déclinaisons couleur = pastilles + photos) : couleurs
      // distinctes, dans l'ordre, avec le hex réel.
      const distinctColors: string[] = [];
      for (const v of p.variants) if (v.color && !distinctColors.includes(v.color)) distinctColors.push(v.color);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const colorVariants: any[] = distinctColors.map((name) => ({
        colorName: name,
        ...(COLOR_HEX[name] ? { colorHex: COLOR_HEX[name] } : {}),
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc: Record<string, any> = {
        sku: p.sku, slug: p.slug, name: p.name, brand: "Girolami", model: p.model || p.family,
        productType: p.productType, diffusion: "ventilation-forcee", color: "dark",
        power: p.power ?? p.powerClass ?? 0,
        heatedVolumeM3: p.heatedVolumeM3 ?? undefined,
        efficiency: p.efficiency ?? undefined,
        energyClass: geom?.energyClass ?? undefined,
        hopperCapacity: p.hopperCapacity ?? undefined,
        weight: (geom?.weight ?? p.weight) ?? undefined,
        dimensions: geom && (geom.w || geom.h || geom.d)
          ? { width: geom.w ?? undefined, height: geom.h ?? undefined, depth: geom.d ?? undefined }
          : undefined,
        isAirtight: p.isAirtight,
        isCanalizable: p.isCanalizable,
        isHydro: p.isHydro,
        isConnected: false,
        priceHT: p.priceHT ?? undefined,
        priceTTC: p.priceTTC ?? undefined,
        mpn: p.base,
        googleProductCategory: "Home & Garden > Household Appliances > Heating > Pellet Stoves",
        shortDescription: shortDesc,
        description: lexical(c.paras),
        features: c.features.map((f) => ({ title: f.title, description: f.description })),
        metaTitle: meta.metaTitle,
        metaDescription: meta.metaDescription,
        stockStatus: "on_order",
        deliveryDelay: "4-6 sem.",
        hasVariants: hasColors,
      };
      if (colorVariants.length) doc.colorVariants = colorVariants;
      if (hasColors) {
        doc.variantOptions = [{ optionType: OT_COULEUR, values: [...usedColorIds] }];
        doc.variants = variants;
      }

      if (DRY) {
        preview.push({ slug: p.slug, name: p.name, productType: p.productType, power: doc.power,
          priceTTC: p.priceTTC, energyClass: doc.energyClass, weight: doc.weight, dimensions: doc.dimensions,
          hasVariants: hasColors, variantCount: variants.length,
          colorVariants: doc.colorVariants, shortDescription: shortDesc,
          metaTitle: meta.metaTitle, descParas: c.paras.length, descFirst: c.paras[0]?.slice(0, 70),
          features: doc.features.map((f: {title:string}) => f.title) });
        continue;
      }

      // Upsert par slug, garde-fou marque.
      const found = await payload.find({ collection: "products", where: { slug: { equals: p.slug } }, depth: 0, limit: 1 });
      if (found.docs.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ex = found.docs[0] as any;
        if (ex.brand !== "Girolami") { console.error(`[gir] BRAND MISMATCH ${p.slug} (brand=${ex.brand}) — abandon.`); process.exit(1); }
        if (TEXT_ONLY) {
          // Texte seul : description (+ atouts pour les non vérifiées). Aucune autre donnée touchée.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data: Record<string, any> = { description: doc.description };
          if (!VERIFIED_DESC_ONLY.has(p.slug)) data.features = doc.features;
          await payload.update({ collection: "products", id: Number(ex.id), data: data as any });
          updated++;
          console.log(`[gir]   ✓ TEXTE ${p.slug}  (${VERIFIED_DESC_ONLY.has(p.slug) ? "description seule" : "description + atouts"})`);
        } else if (VERIFIED_DESC_ONLY.has(p.slug)) {
          // Fiche validée par l'équipe : on ne réécrit QUE la description.
          await payload.update({ collection: "products", id: Number(ex.id), data: { description: doc.description } as any });
          updated++;
          console.log(`[gir]   ✓ MAJ(desc) ${p.slug}  (vérifiée équipe : description seule)`);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const upd: Record<string, any> = { ...doc };
          delete upd.hiddenFromBoutique; // préserve le choix de visibilité de l'équipe
          // mainImage / galleryImages produit non inclus → inchangés (photos équipe)
          // colorVariants : préserve les images déjà posées par l'équipe (par couleur)
          if (upd.colorVariants && Array.isArray(ex.colorVariants)) {
            const byName = new Map<string, any>(ex.colorVariants.map((c: any) => [c.colorName, c]));
            upd.colorVariants = upd.colorVariants.map((cv: any) => {
              const old = byName.get(cv.colorName);
              if (old?.mainImage) cv.mainImage = typeof old.mainImage === "object" ? old.mainImage.id : old.mainImage;
              if (old?.galleryImages?.length) cv.galleryImages = old.galleryImages.map((g: any) => ({ image: typeof g.image === "object" ? g.image.id : g.image }));
              return cv;
            });
          }
          await payload.update({ collection: "products", id: Number(ex.id), data: upd as any });
          updated++;
          console.log(`[gir]   ✓ MAJ  ${p.slug}  (${colorVariants.length} couleurs, ${variants.length} variantes)`);
        }
      } else if (TEXT_ONLY) {
        console.warn(`[gir]   ⚠ ${p.slug} absent en base, ignoré en mode --text-only (on ne crée pas de fiche partielle).`);
      } else {
        await payload.create({ collection: "products", data: { ...doc, hiddenFromBoutique: true } as any });
        created++;
        console.log(`[gir]   ✓ NEW  ${p.slug}  (${colorVariants.length} couleurs, ${variants.length} variantes)`);
      }
    } catch (err) {
      errored++;
      console.error(`[gir]   ✗ ${p.slug} :`, err instanceof Error ? err.message : err);
    }
  }

  if (DRY) {
    const pf = path.join(OUT_DIR, `_preview-encode${CAT_FILTER ? "-" + CAT_FILTER : ""}.json`);
    fs.writeFileSync(pf, JSON.stringify(preview, null, 2));
    console.log(`[gir] DRY RUN : aperçu de ${preview.length} fiches → ${path.relative(ROOT, pf)}`);
  } else {
    console.log(`\n[gir] Terminé : ${created} créées, ${updated} mises à jour, ${errored} erreurs.`);
  }
  process.exit(errored > 0 ? 1 : 0);
}

main().catch((e) => { console.error("[gir] Fatal:", e); process.exit(1); });
