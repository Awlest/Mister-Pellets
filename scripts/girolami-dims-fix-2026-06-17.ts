/**
 * Corrections DIMENSIONS Girolami du 2026-06-17 — uniquement la cote « poêle »
 * (DIMENSIONI PRODOTTO du Catalistino 2026), jamais l'emballage (IMBALLAGGIO).
 *
 * Audit complet (catalogue vs base) : TOUTES les fiches portent déjà la cote
 * produit, AUCUNE ne porte la cote d'emballage. Il ne restait que 2 anomalies :
 *
 *  1. girolami-vision-evo-80 : largeur/hauteur INVERSÉES dans la base
 *     (56 x 80.5 x 42) — la fiche catalogue donne 80,5 (L) x 56 (H) x 42 (P),
 *     cohérent avec ses sœurs 70/90/100 (largeur = n° du modèle + 0,5).
 *     -> width 80.5, height 56, depth 42
 *  2. girolami-tc-evo-plus-80 : dimensions ABSENTES. Catalogue (p.124) :
 *     PRODOTTO 89 (L) x 77 (P) x 161 (H). -> width 89, height 161, depth 77
 *
 * N'écrit QUE le champ `dimensions` de ces 2 fiches. Brand guard Girolami.
 * Snapshot avant écriture. Dry-run par défaut.
 *
 *   npx tsx scripts/girolami-dims-fix-2026-06-17.ts            # DRY-RUN (lecture seule)
 *   npx tsx scripts/girolami-dims-fix-2026-06-17.ts --apply    # écrit en prod (snapshot avant)
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

// Cote PRODUIT (poêle) du Catalistino 2026, en cm. width=L, height=H, depth=P.
const DIMS: Record<string, { width: number; height: number; depth: number }> = {
  "girolami-vision-evo-80": { width: 80.5, height: 56, depth: 42 },
  "girolami-tc-evo-plus-80": { width: 89, height: 161, depth: 77 },
};

async function main(): Promise<void> {
  loadEnv();
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  const slugs = Object.keys(DIMS);
  const r = await payload.find({
    collection: "products",
    where: { slug: { in: slugs } },
    depth: 0,
    limit: 100,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docs = r.docs as any[];
  console.log(`[dims] ${docs.length}/${slugs.length} fiches trouvées. Mode : ${APPLY ? "APPLY (écriture prod)" : "DRY-RUN (lecture seule)"}.`);

  if (APPLY) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const f = path.join(ROOT, "imports/girolami-catalogue-2026", `_snapshot-dims-fix-${stamp}.json`);
    fs.writeFileSync(f, JSON.stringify(docs, null, 2));
    console.log(`[dims] snapshot avant écriture -> ${path.relative(ROOT, f)}`);
  }

  let updated = 0, errored = 0;
  for (const slug of slugs) {
    const ex = docs.find((d) => d.slug === slug);
    if (!ex) { console.warn(`[dims] ⚠ ${slug} ABSENT en base -> ignoré`); errored++; continue; }
    if (ex.brand !== "Girolami") { console.error(`[dims] BRAND MISMATCH ${slug} (${ex.brand}) -> abandon`); process.exit(1); }
    const next = DIMS[slug];
    if (!next) continue;
    const before = ex.dimensions
      ? `${ex.dimensions.width ?? "∅"}x${ex.dimensions.height ?? "∅"}x${ex.dimensions.depth ?? "∅"}`
      : "∅";
    const after = `${next.width}x${next.height}x${next.depth}`;
    if (!APPLY) { console.log(`[dims] (dry) ${slug}  ${before} -> ${after}`); continue; }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await payload.update({ collection: "products", id: Number(ex.id), data: { dimensions: next } as any });
      updated++;
      console.log(`[dims] ✓ ${slug}  ${before} -> ${after}`);
    } catch (e) {
      errored++;
      console.error(`[dims] ✗ ${slug}:`, e instanceof Error ? e.message : e);
    }
  }

  console.log(`\n[dims] ${APPLY ? "APPLIQUÉ" : "DRY-RUN"} : ${updated} écrites, ${errored} erreurs/absentes.`);
  process.exit(errored > 0 && APPLY ? 1 : 0);
}

main().catch((e) => { console.error("[dims] Fatal:", e); process.exit(1); });
