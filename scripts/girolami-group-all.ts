/**
 * ROLLOUT — regroupe TOUTES les familles Girolami en produits à variantes
 * (façon Edilkamin). Ne touche QUE Girolami. Idempotent : une famille déjà
 * regroupée (parent `girolami-<base>` existant) est ignorée (donc Split passe).
 *
 *   npx tsx scripts/girolami-group-all.ts            # DRY-RUN (défaut, lecture seule)
 *   npx tsx scripts/girolami-group-all.ts --apply    # écrit en prod (snapshot avant)
 *
 * Principe : pour chaque famille (= préfixe de slug avant le 1er nombre), on
 * détecte les axes qui VARIENT (Puissance/Taille, Canalisation, Sortie coaxiale,
 * Combustible pellet/hybride, Configuration dx-sx/curvo), on transforme la fiche
 * de base en PARENT, on crée une combinaison par fiche (prix LU sur la fiche,
 * rien d'inventé), et on masque les autres fiches de la famille.
 * Couleur = reste gérée par colorVariants (images, sans prix).
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
    const eq = t.indexOf("="); if (eq === -1) continue;
    const k = t.slice(0, eq).trim(); let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!(k in process.env)) process.env[k] = v;
  }
}

const PUISSANCE_AXIS_ID = 6;
const SORTIE_AXIS_ID = 4; // « Sortie des fumées » existant (contient déjà « Coaxial »)
// Familles dont le nombre = TAILLE (cm), pas puissance.
const SIZE_FAMILIES = new Set(["frame", "mbs-f", "vision-evo", "tc-evo"]);

interface Member {
  id: number; slug: string; name: string; price: number;
  base: string; num: number; flags: string[];
}

function parseSlug(slug: string): { base: string; num: number | null; flags: string[] } {
  const parts = slug.replace(/^girolami-/, "").split("-");
  const idx = parts.findIndex((p) => /^\d+$/.test(p));
  if (idx === -1) return { base: parts.join("-"), num: null, flags: [] };
  return { base: parts.slice(0, idx).join("-"), num: Number(parts[idx]), flags: parts.slice(idx + 1) };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Payload = any;

async function getOrCreateAxis(payload: Payload, slug: string, label: string, displayMode: string, sortOrder: number): Promise<number | null> {
  const r = await payload.find({ collection: "variant-option-types", where: { slug: { equals: slug } }, limit: 1, depth: 0 });
  if (r.docs[0]) return r.docs[0].id;
  if (!APPLY) return -1; // placeholder « à créer » pour l'affichage du dry-run
  const d = await payload.create({ collection: "variant-option-types", data: { label, slug, displayMode, sortOrder }, overrideAccess: true });
  return d.id;
}
async function getOrCreateValue(payload: Payload, optionTypeId: number, label: string): Promise<number | null> {
  const r = await payload.find({ collection: "variant-option-values", where: { and: [{ optionType: { equals: optionTypeId } }, { label: { equals: label } }] }, limit: 1, depth: 0 });
  if (r.docs[0]) return r.docs[0].id;
  if (!APPLY) return -1; // placeholder « à créer » pour l'affichage du dry-run
  const d = await payload.create({ collection: "variant-option-values", data: { label, optionType: optionTypeId }, overrideAccess: true });
  return d.id;
}

async function main(): Promise<void> {
  loadEnv();
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });
  console.log(`[group] Mode : ${APPLY ? "APPLY (écriture prod)" : "DRY-RUN (lecture seule)"}\n`);

  const all = await payload.find({ collection: "products", where: { brand: { equals: "Girolami" } }, depth: 0, limit: 1000, sort: "slug" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docs = all.docs as any[];
  const existingSlugs = new Set<string>(docs.map((d) => d.slug));

  if (APPLY) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const f = path.join(ROOT, "imports/girolami-catalogue-2026", `_snapshot-group-all-${stamp}.json`);
    fs.writeFileSync(f, JSON.stringify(docs, null, 2));
    console.log(`[group] snapshot ${docs.length} fiches -> ${path.relative(ROOT, f)}\n`);
  }

  // Regrouper par base
  const families = new Map<string, Member[]>();
  for (const d of docs) {
    if (d.brand !== "Girolami") { console.error(`BRAND MISMATCH ${d.slug}`); process.exit(1); }
    const { base, num, flags } = parseSlug(d.slug);
    if (num == null) continue; // singletons (alfa, biotec, parents déjà créés…)
    if (!families.has(base)) families.set(base, []);
    families.get(base)!.push({ id: d.id, slug: d.slug, name: d.name, price: d.priceTTC ?? 0, base, num, flags });
  }

  const redirects: { from: string; to: string }[] = [];
  let grouped = 0, skipped = 0;

  for (const [base, membersRaw] of [...families.entries()].sort()) {
    const members = membersRaw;
    if (members.length < 2) { skipped++; continue; } // rien à regrouper
    if (existingSlugs.has(`girolami-${base}`)) { console.log(`[group] (skip) ${base} : parent girolami-${base} existe déjà`); skipped++; continue; }

    const isSize = SIZE_FAMILIES.has(base);
    const hasCanal = members.some((m) => m.flags.includes("canalisable"));
    const hasCoax = members.some((m) => m.flags.includes("coaxiale"));
    const hasFuel = members.some((m) => m.flags.includes("pellet") || m.flags.includes("hybride"));
    const hasConfig = members.some((m) => m.flags.some((f) => ["dx", "sx", "curvo"].includes(f)));

    // valeurs par axe et par membre
    const mainOf = (m: Member) => (isSize ? `${m.num} cm` : `${m.num} kW`);
    const canalOf = (m: Member) => (m.flags.includes("canalisable") ? "Canalisable" : "Standard");
    const coaxOf = (m: Member) => (m.flags.includes("coaxiale") ? "Coaxial" : "Standard");
    const fuelOf = (m: Member) => (m.flags.includes("pellet") ? "Pellet" : "Hybride bois-pellet"); // bare = hybride
    const configOf = (m: Member) => (m.flags.includes("curvo") ? "Curvo" : (m.flags.includes("dx") || m.flags.includes("sx")) ? "DX/SX" : "Standard");

    // n'inclure un axe que s'il a >1 valeur distincte
    const distinct = (fn: (m: Member) => string) => new Set(members.map(fn)).size > 1;
    const axMain = distinct(mainOf);
    const axCanal = hasCanal && distinct(canalOf);
    const axCoax = hasCoax && distinct(coaxOf);
    const axFuel = hasFuel && distinct(fuelOf);
    const axConfig = hasConfig && distinct(configOf);
    if (!axMain && !axCanal && !axCoax && !axFuel && !axConfig) { skipped++; continue; }

    // parent = plus petit num, puis moins de flags
    const parent = [...members].sort((a, b) => a.num - b.num || a.flags.length - b.flags.length || a.slug.localeCompare(b.slug))[0];
    if (!parent) continue; // garanti défini (members.length >= 2), garde pour TS
    const parentName = parent.name.replace(/\s+\d.*$/, "").trim();
    const parentSlug = `girolami-${base}`;

    // Résolution des IDs d'axes/valeurs
    const axes: { optionTypeId: number; valueIds: number[]; valueOf: (m: Member) => string; label: string }[] = [];
    const pushAxis = async (active: boolean, optionTypeId: number | null, valueOf: (m: Member) => string, label: string) => {
      if (!active || optionTypeId == null) return;
      const labels = [...new Set(members.map(valueOf))];
      const ids: number[] = [];
      for (const l of labels) { const id = await getOrCreateValue(payload, optionTypeId, l); if (id != null) ids.push(id); }
      axes.push({ optionTypeId, valueIds: ids, valueOf, label });
    };

    const tailleAxisId = isSize ? await getOrCreateAxis(payload, "taille", "Taille (cm)", "text", 40) : null;
    const canalAxisId = axCanal ? await getOrCreateAxis(payload, "canalisation", "Canalisation", "text", 50) : null;
    const fuelAxisId = axFuel ? await getOrCreateAxis(payload, "combustible", "Combustible", "text", 55) : null;
    const configAxisId = axConfig ? await getOrCreateAxis(payload, "configuration", "Configuration", "text", 70) : null;

    await pushAxis(axMain, isSize ? tailleAxisId : PUISSANCE_AXIS_ID, mainOf, isSize ? "Taille" : "Puissance");
    await pushAxis(axCanal, canalAxisId, canalOf, "Canalisation");
    await pushAxis(axCoax, SORTIE_AXIS_ID, coaxOf, "Sortie des fumées");
    await pushAxis(axFuel, fuelAxisId, fuelOf, "Combustible");
    await pushAxis(axConfig, configAxisId, configOf, "Configuration");

    // Combos (variants)
    const valueIdByLabel = new Map<string, number>();
    if (APPLY || true) {
      // construit une table label->id en relisant (en dry-run les ids peuvent être null -> on affiche les labels)
    }
    const skuOf = (m: Member) => `GIR-${base.toUpperCase().replace(/[^A-Z0-9]/g, "")}-${m.num}` +
      (axCanal && m.flags.includes("canalisable") ? "-CAN" : "") +
      (axCoax && m.flags.includes("coaxiale") ? "-COAX" : "") +
      (axFuel ? (m.flags.includes("pellet") ? "-PEL" : "-HYB") : "") +
      (axConfig ? (m.flags.includes("curvo") ? "-CRV" : (m.flags.includes("dx") || m.flags.includes("sx")) ? "-DXSX" : "") : "");

    console.log(`\n=== ${parentName}  (${parentSlug})  ${members.length} combinaisons ===`);
    console.log(`    axes: ${axes.map((a) => a.label).join(" × ") || "(aucun)"}`);
    for (const m of [...members].sort((a, b) => a.num - b.num || a.slug.localeCompare(b.slug))) {
      const combo = axes.map((a) => a.valueOf(m)).join(" + ");
      console.log(`    ${combo}  ->  ${m.price} € TTC   [${skuOf(m)}]${m.id === parent.id ? "  (PARENT)" : ""}`);
    }

    if (!APPLY) {
      for (const m of members) if (m.id !== parent.id) redirects.push({ from: `/produit/${m.slug}`, to: `/produit/${parentSlug}` });
      grouped++;
      continue;
    }

    // Écriture (APPLY) : il faut les ids de valeurs par membre -> relire par label
    const labelToId = new Map<string, number>();
    for (const ax of axes) {
      const r = await payload.find({ collection: "variant-option-values", where: { optionType: { equals: ax.optionTypeId } }, limit: 200, depth: 0 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const v of r.docs as any[]) labelToId.set(`${ax.optionTypeId}:${v.label}`, v.id);
    }
    const variants = members.map((m) => ({
      optionValues: axes.map((a) => labelToId.get(`${a.optionTypeId}:${a.valueOf(m)}`)).filter((x): x is number => x != null),
      sku: skuOf(m),
      price: m.price,
      stockStatus: "on_order" as const,
    }));
    await payload.update({
      collection: "products", id: parent.id, overrideAccess: true,
      data: {
        name: parentName, slug: parentSlug, hasVariants: true,
        variantOptions: axes.map((a) => ({ optionType: a.optionTypeId, values: a.valueIds })),
        variants,
      } as never,
    });
    console.log(`    ✓ parent ${parentSlug} (${variants.length} combinaisons)`);
    for (const m of members) {
      if (m.id === parent.id) continue;
      await payload.update({ collection: "products", id: m.id, overrideAccess: true, data: { hiddenFromBoutique: true } as never });
      redirects.push({ from: `/produit/${m.slug}`, to: `/produit/${parentSlug}` });
    }
    console.log(`    ✓ ${members.length - 1} fiches masquées`);
    grouped++;
  }

  console.log(`\n[group] ${APPLY ? "APPLIQUÉ" : "DRY-RUN"} : ${grouped} familles regroupées, ${skipped} ignorées.`);
  // Écrit la liste des redirections (pour next.config.ts) dans un fichier.
  const redirFile = path.join(ROOT, "imports/girolami-catalogue-2026", "_redirects-girolami.json");
  fs.writeFileSync(redirFile, JSON.stringify(redirects, null, 2));
  console.log(`[group] ${redirects.length} redirections 301 à ajouter -> ${path.relative(ROOT, redirFile)}`);
  process.exit(0);
}

main().catch((e) => { console.error("[group] Fatal:", e); process.exit(1); });
