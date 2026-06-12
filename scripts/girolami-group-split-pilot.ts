/**
 * PILOTE — regroupe la famille « Split » Girolami en UN produit à variantes,
 * sur le modèle Edilkamin (produit parent + axes + prix par combinaison).
 * Ne touche QUE Girolami. N'affecte ni Edilkamin ni EK63.
 *
 *   npx tsx scripts/girolami-group-split-pilot.ts           # DRY-RUN (défaut, lecture seule)
 *   npx tsx scripts/girolami-group-split-pilot.ts --apply   # écrit en prod (snapshot avant)
 *
 * Ce que ça fait (en --apply) :
 *  1. Garantit les valeurs d'axe Puissance (id=6) : 9, 12, 14 kW (crée 14 si absent).
 *  2. Crée l'axe « Canalisation » {Standard, Canalisable} s'il n'existe pas.
 *  3. Transforme la fiche `girolami-split-9` en PARENT « Girolami Split »
 *     (slug `girolami-split`, hasVariants, 2 axes, 5 combinaisons avec prix).
 *  4. Masque les 4 autres fiches Split (elles deviennent des combinaisons du parent).
 *  Les prix de chaque combinaison sont LUS sur les fiches actuelles (rien d'inventé).
 *  La couleur reste gérée par les colorVariants existants (images, sans impact prix).
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const APPLY = process.argv.includes("--apply");

function loadEnv(): void {
  const p = path.resolve(ROOT, ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
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

const PUISSANCE_AXIS_ID = 6; // axe existant « Puissance » (NE PAS recréer)

// Famille Split : combinaisons réelles -> fiche source d'où vient le prix.
const PARENT_SRC_SLUG = "girolami-split-9";
const PARENT_NEW_SLUG = "girolami-split";
const PARENT_NAME = "Girolami Split";
const COMBOS = [
  { power: "9 kW",  canal: "Standard",    src: "girolami-split-9" },
  { power: "12 kW", canal: "Standard",    src: "girolami-split-12" },
  { power: "14 kW", canal: "Standard",    src: "girolami-split-14" },
  { power: "12 kW", canal: "Canalisable", src: "girolami-split-12-canalisable" },
  { power: "14 kW", canal: "Canalisable", src: "girolami-split-14-canalisable" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Payload = any;

async function findValue(payload: Payload, optionTypeId: number, label: string) {
  const r = await payload.find({
    collection: "variant-option-values",
    where: { and: [{ optionType: { equals: optionTypeId } }, { label: { equals: label } }] },
    limit: 1,
    depth: 0,
  });
  return r.docs[0] ?? null;
}

async function getOrCreateValue(payload: Payload, optionTypeId: number, label: string) {
  const existing = await findValue(payload, optionTypeId, label);
  if (existing) return { id: existing.id, created: false };
  if (!APPLY) return { id: null, created: true };
  const doc = await payload.create({
    collection: "variant-option-values",
    data: { label, optionType: optionTypeId }, // slug auto via hook
    overrideAccess: true,
  });
  return { id: doc.id, created: true };
}

async function main(): Promise<void> {
  loadEnv();
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  console.log(`[split] Mode : ${APPLY ? "APPLY (écriture prod)" : "DRY-RUN (lecture seule)"}`);

  // Snapshot complet Girolami avant toute écriture.
  if (APPLY) {
    const all = await payload.find({ collection: "products", where: { brand: { equals: "Girolami" } }, depth: 0, limit: 1000 });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const f = path.join(ROOT, "imports/girolami-catalogue-2026", `_snapshot-group-split-${stamp}.json`);
    fs.writeFileSync(f, JSON.stringify(all.docs, null, 2));
    console.log(`[split] snapshot ${all.docs.length} fiches Girolami -> ${path.relative(ROOT, f)}`);
  }

  // 1. Valeurs Puissance (axe existant id=6)
  console.log("\n[split] Axe Puissance (id=6) :");
  const powerIds: Record<string, number | null> = {};
  for (const label of ["9 kW", "12 kW", "14 kW"]) {
    const v = await getOrCreateValue(payload, PUISSANCE_AXIS_ID, label);
    powerIds[label] = v.id;
    console.log(`   ${label} : ${v.created ? (APPLY ? "CRÉÉ" : "À CRÉER") : `existe (id=${v.id})`}`);
  }

  // 2. Axe Canalisation (créer si absent)
  console.log("\n[split] Axe Canalisation :");
  let canalAxisId: number | null = null;
  const axisR = await payload.find({ collection: "variant-option-types", where: { slug: { equals: "canalisation" } }, limit: 1, depth: 0 });
  if (axisR.docs[0]) {
    canalAxisId = axisR.docs[0].id;
    console.log(`   axe existe (id=${canalAxisId})`);
  } else if (APPLY) {
    const a = await payload.create({
      collection: "variant-option-types",
      data: { label: "Canalisation", slug: "canalisation", displayMode: "text", sortOrder: 50 },
      overrideAccess: true,
    });
    canalAxisId = a.id;
    console.log(`   axe CRÉÉ (id=${canalAxisId})`);
  } else {
    console.log("   axe À CRÉER (Canalisation, mode text)");
  }
  const canalIds: Record<string, number | null> = {};
  for (const label of ["Standard", "Canalisable"]) {
    if (canalAxisId == null && !APPLY) { canalIds[label] = null; console.log(`   valeur ${label} : À CRÉER`); continue; }
    const v = await getOrCreateValue(payload, canalAxisId as number, label);
    canalIds[label] = v.id;
    console.log(`   valeur ${label} : ${v.created ? (APPLY ? "CRÉÉ" : "À CRÉER") : `existe (id=${v.id})`}`);
  }

  // 3. Lecture des fiches source (prix réels)
  console.log("\n[split] Combinaisons (prix lus sur les fiches actuelles) :");
  const srcBySlug: Record<string, { id: number; priceTTC: number | null }> = {};
  for (const slug of [...new Set(COMBOS.map((c) => c.src))]) {
    const r = await payload.find({ collection: "products", where: { slug: { equals: slug } }, limit: 1, depth: 0 });
    const d = r.docs[0];
    if (!d) { console.error(`   ⚠ fiche source absente : ${slug}`); continue; }
    if (d.brand !== "Girolami") { console.error(`   BRAND MISMATCH ${slug} (${d.brand}) -> abandon`); process.exit(1); }
    srcBySlug[slug] = { id: d.id, priceTTC: d.priceTTC ?? null };
  }

  const variants = COMBOS.map((c) => {
    const src = srcBySlug[c.src];
    const sku = `GIR-SPLIT-${c.power.replace(" kW", "")}${c.canal === "Canalisable" ? "-CAN" : ""}`;
    console.log(`   ${c.power} + ${c.canal}  ->  ${src?.priceTTC ?? "?"} € TTC   [${sku}]  (source ${c.src})`);
    return {
      optionValues: [powerIds[c.power], canalIds[c.canal]].filter((x): x is number => x != null),
      sku,
      price: src?.priceTTC ?? 0,
      stockStatus: "on_order" as const,
    };
  });

  const parent = srcBySlug[PARENT_SRC_SLUG];
  console.log(`\n[split] Parent : ${PARENT_SRC_SLUG} -> « ${PARENT_NAME} » (slug ${PARENT_NEW_SLUG}), ${variants.length} combinaisons.`);
  const toHide = COMBOS.map((c) => c.src).filter((s) => s !== PARENT_SRC_SLUG);
  console.log(`[split] Fiches masquées (deviennent des combinaisons) : ${[...new Set(toHide)].join(", ")}`);

  if (!APPLY) {
    console.log("\n[split] DRY-RUN terminé. Rien écrit. Relance avec --apply pour appliquer.");
    process.exit(0);
  }

  // 4. Écriture : parent + masquage des autres
  if (!parent) { console.error("[split] parent introuvable, abandon."); process.exit(1); }
  await payload.update({
    collection: "products",
    id: parent.id,
    data: {
      name: PARENT_NAME,
      slug: PARENT_NEW_SLUG,
      hasVariants: true,
      variantOptions: [
        { optionType: PUISSANCE_AXIS_ID, values: [powerIds["9 kW"], powerIds["12 kW"], powerIds["14 kW"]].filter((x): x is number => x != null) },
        { optionType: canalAxisId, values: [canalIds["Standard"], canalIds["Canalisable"]].filter((x): x is number => x != null) },
      ],
      variants,
    } as never,
    overrideAccess: true,
  });
  console.log(`[split] ✓ parent ${PARENT_NEW_SLUG} mis à jour (${variants.length} combinaisons).`);

  for (const slug of [...new Set(toHide)]) {
    const src = srcBySlug[slug];
    if (!src) continue;
    await payload.update({ collection: "products", id: src.id, data: { hiddenFromBoutique: true } as never, overrideAccess: true });
    console.log(`[split] ✓ ${slug} masqué`);
  }

  console.log("\n[split] APPLY terminé. Vérifie /produit/girolami-split (le parent est masqué de la boutique mais l'URL rend).");
  process.exit(0);
}

main().catch((e) => { console.error("[split] Fatal:", e); process.exit(1); });
