/**
 * Backfill CATÉGORIES (point #4) : combustible (pellet/bois/hybride) + isHydro
 * (ventilé/hydro), pour le nouveau filtre boutique « Combustible » + « Chauffage ».
 *
 * - GIROLAMI : classification explicite par fiche, d'après le Catalistino 2026
 *   (sections AIR/HYDRO + lot bois + mentions « HYBRID LEGNA/PELLET »).
 *   Garde-fou : toute fiche Girolami non mappée fait échouer le script.
 * - AUTRES MARQUES : règle sûre — combustible = hybride si productType=hybride,
 *   sinon pellet ; isHydro = valeur existante OU (productType=hydro). On ne
 *   retire jamais un isHydro=true existant.
 *
 * N'écrit QUE `combustible` et `isHydro`. Snapshot avant écriture. Dry-run par défaut.
 *
 *   npx tsx scripts/girolami-categories-2026-06-17.ts            # DRY-RUN
 *   npx tsx scripts/girolami-categories-2026-06-17.ts --apply    # écrit en prod (snapshot avant)
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const APPLY = process.argv.includes("--apply");

function loadEnv(): void {
  const p = path.resolve(ROOT, ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const t = line.trim(); if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("="); if (eq === -1) continue;
    const k = t.slice(0, eq).trim(); let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!(k in process.env)) process.env[k] = v;
  }
}

type Combustible = "pellet" | "bois" | "hybride";

// Classification Girolami explicite (slug -> combustible), Catalistino 2026.
const GIR_PELLET = [
  "girolami-curvy", "girolami-flow", "girolami-split", "girolami-round",
  "girolami-vert", "girolami-vert-maiolica", "girolami-slim", "girolami-mini",
  "girolami-twin-mini-6", "girolami-twin-slim", "girolami-grid-panorama",
  "girolami-grid-verticale", "girolami-soft-maiolica", "girolami-biotec",
];
const GIR_BOIS = [
  "girolami-frame", "girolami-frame-100", "girolami-frame-100-dx-sx",
  "girolami-frame-120", "girolami-frame-120-dx-sx", "girolami-frame-80-dx-sx",
  "girolami-mbs-f", "girolami-mbs-f-100", "girolami-mbs-f-120",
  "girolami-alfa", "girolami-alfa-double",
  "girolami-vision-evo-70", "girolami-vision-evo-80", "girolami-vision-evo-90",
  "girolami-vision-evo-100",
  "girolami-tc-evo", "girolami-tc-evo-plus-80", "girolami-tc-evo-75-dx-sx",
  "girolami-tc-evo-75-curvo",
];
const GIR_HYBRIDE = [
  "girolami-edge", "girolami-furni", "girolami-sharp", "girolami-soft",
  "girolami-ti", "girolami-ti-panorama", "girolami-ti-slim",
  "girolami-ti-slim-panorama", "girolami-soft-slim", "girolami-alfa-bio",
  "girolami-tc-bio-evo-80", "girolami-ti-plus-26-hybride",
  "girolami-ti-plus-panorama-26",
];
const GIR_COMBUSTIBLE = new Map<string, Combustible>([
  ...GIR_PELLET.map((s) => [s, "pellet"] as const),
  ...GIR_BOIS.map((s) => [s, "bois"] as const),
  ...GIR_HYBRIDE.map((s) => [s, "hybride"] as const),
]);

// Fiches Girolami HYDRO (thermo/eau). Tout le reste = ventilé (air).
const GIR_HYDRO = new Set<string>([
  "girolami-soft", "girolami-soft-maiolica", "girolami-soft-slim",
  "girolami-sharp", "girolami-edge", "girolami-furni", "girolami-ti",
  "girolami-ti-panorama", "girolami-ti-slim", "girolami-ti-slim-panorama",
  "girolami-ti-plus-26-hybride", "girolami-ti-plus-panorama-26",
  "girolami-tc-evo", "girolami-tc-evo-plus-80", "girolami-tc-evo-75-dx-sx",
  "girolami-tc-evo-75-curvo", "girolami-tc-bio-evo-80", "girolami-biotec",
]);

async function main(): Promise<void> {
  loadEnv();
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  const all = await payload.find({ collection: "products", depth: 0, limit: 1000 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docs = all.docs as any[];
  console.log(`[cat] ${docs.length} fiches. Mode : ${APPLY ? "APPLY (écriture prod)" : "DRY-RUN"}.`);

  // Garde-fou : toute fiche Girolami doit être classée.
  const unmapped = docs.filter((d) => d.brand === "Girolami" && !GIR_COMBUSTIBLE.has(d.slug));
  if (unmapped.length) {
    console.error(`[cat] ⚠ Girolami non mappées : ${unmapped.map((d) => d.slug).join(", ")} -> abandon`);
    process.exit(1);
  }

  if (APPLY) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const f = path.join(ROOT, "imports/girolami-catalogue-2026", `_snapshot-categories-${stamp}.json`);
    fs.writeFileSync(f, JSON.stringify(docs.map((d) => ({ id: d.id, slug: d.slug, brand: d.brand, productType: d.productType, combustible: d.combustible ?? null, isHydro: d.isHydro ?? null })), null, 2));
    console.log(`[cat] snapshot -> ${path.relative(ROOT, f)}`);
  }

  const tally: Record<string, number> = {};
  let changed = 0, errored = 0;
  for (const d of docs) {
    const combustible: Combustible = d.brand === "Girolami"
      ? GIR_COMBUSTIBLE.get(d.slug)!
      : (d.productType === "hybride" ? "hybride" : "pellet");
    const isHydro: boolean = d.brand === "Girolami"
      ? GIR_HYDRO.has(d.slug)
      : (d.isHydro === true || d.productType === "hydro");

    const need = d.combustible !== combustible || (d.isHydro ?? false) !== isHydro;
    if (!need) continue;
    tally[`${combustible}/${isHydro ? "hydro" : "air"}`] = (tally[`${combustible}/${isHydro ? "hydro" : "air"}`] ?? 0) + 1;
    const line = `${d.slug.padEnd(28)} ${String(d.combustible ?? "∅").padEnd(8)}->${combustible.padEnd(8)} hydro ${d.isHydro ?? false}->${isHydro}`;
    if (!APPLY) { console.log(`[cat] (dry) ${line}`); changed++; continue; }
    try {
      await payload.update({ collection: "products", id: Number(d.id), data: { combustible, isHydro } as never, overrideAccess: true });
      changed++;
    } catch (e) {
      errored++;
      console.error(`[cat] ✗ ${d.slug}:`, e instanceof Error ? e.message : e);
    }
  }
  console.log(`\n[cat] répartition cible :`, tally);
  console.log(`[cat] ${APPLY ? "APPLIQUÉ" : "DRY-RUN"} : ${changed} fiches modifiées, ${errored} erreurs.`);
  process.exit(errored > 0 && APPLY ? 1 : 0);
}

main().catch((e) => { console.error("[cat] Fatal:", e); process.exit(1); });
