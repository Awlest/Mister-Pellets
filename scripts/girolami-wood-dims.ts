/**
 * Patch ciblé : écrit poids + dimensions (L×H×P) des inserts/monoblocs BOIS
 * Girolami, validés par Dorian (extraits du Catalistino 2026, voir
 * _extract/wood_geometry.py). Ne touche QUE weight + dimensions, rien d'autre.
 * Poids depuis l'extraction catalogue (01b...bois.json). Brand guard Girolami.
 *
 *   tsx scripts/girolami-wood-dims.ts --dry-run
 *   tsx scripts/girolami-wood-dims.ts
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const DRY = process.argv.includes("--dry-run");

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

// Dimensions validées par Dorian (cm). Les variantes dx/sx/curvo reprennent
// la géométrie de leur modèle de base. tc-evo-80 / plus-80 NON validés -> exclus.
const DIMS: Record<string, { w: number; h: number; d: number }> = {
  "girolami-frame-80": { w: 92, h: 156, d: 56 },
  "girolami-frame-80-dx-sx": { w: 92, h: 156, d: 56 },
  "girolami-frame-100": { w: 112, h: 156, d: 56 },
  "girolami-frame-100-dx-sx": { w: 112, h: 156, d: 56 },
  "girolami-frame-120": { w: 132, h: 156, d: 56 },
  "girolami-frame-120-dx-sx": { w: 132, h: 156, d: 56 },
  "girolami-alfa": { w: 90, h: 153, d: 65 },
  "girolami-alfa-double": { w: 90, h: 152, d: 60 },
  "girolami-mbs-f-80": { w: 81, h: 154, d: 60 },
  "girolami-mbs-f-100": { w: 96, h: 170, d: 61 },
  "girolami-mbs-f-120": { w: 107, h: 170, d: 61 },
  "girolami-vision-evo-60": { w: 80, h: 70, d: 60 },
  "girolami-vision-evo-70": { w: 90, h: 70, d: 60 },
  "girolami-vision-evo-80": { w: 100, h: 70, d: 60 },
  "girolami-vision-evo-90": { w: 110, h: 70, d: 60 },
  "girolami-vision-evo-100": { w: 120, h: 70, d: 60 },
  "girolami-tc-bio-evo-80": { w: 115, h: 161, d: 77 },
  "girolami-tc-evo-75": { w: 81, h: 116, d: 71 },
  "girolami-tc-evo-75-dx-sx": { w: 81, h: 116, d: 71 },
  "girolami-tc-evo-75-curvo": { w: 81, h: 116, d: 71 },
};

async function main(): Promise<void> {
  loadEnv();
  // poids catalogue (extraction bois)
  const bois = JSON.parse(fs.readFileSync(path.join(ROOT, "imports/girolami-catalogue-2026/01b-extraction-girolami-bois.json"), "utf8"));
  const weightBySlug: Record<string, number | null> = {};
  for (const p of bois.products) weightBySlug[p.slug] = (typeof p.weight === "number" ? p.weight : null);
  // Poids MBS lus sur le PDF (absents de l'extraction JSON), validés par Dorian.
  const WEIGHT_OVERRIDE: Record<string, number> = {
    "girolami-mbs-f-80": 202, "girolami-mbs-f-100": 248, "girolami-mbs-f-120": 263,
  };
  for (const [s, w] of Object.entries(WEIGHT_OVERRIDE)) weightBySlug[s] = w;

  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  // snapshot
  if (!DRY) {
    const slugs = Object.keys(DIMS);
    const snap = await payload.find({ collection: "products", where: { slug: { in: slugs } }, depth: 0, limit: 100 });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const f = path.join(ROOT, "imports/girolami-catalogue-2026", `_snapshot-wood-dims-${stamp}.json`);
    fs.writeFileSync(f, JSON.stringify(snap.docs, null, 2));
    console.log(`[wood] snapshot ${snap.docs.length} fiches -> ${path.relative(ROOT, f)}`);
  }

  let updated = 0, skipped = 0, errored = 0;
  for (const [slug, g] of Object.entries(DIMS)) {
    try {
      const r = await payload.find({ collection: "products", where: { slug: { equals: slug } }, depth: 0, limit: 1 });
      const ex = r.docs[0] as any;
      if (!ex) { console.warn(`[wood] ⚠ ${slug} absent`); skipped++; continue; }
      if (ex.brand !== "Girolami") { console.error(`[wood] BRAND MISMATCH ${slug} (${ex.brand}) -> abandon`); process.exit(1); }
      const weight = weightBySlug[slug] ?? null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: Record<string, any> = { dimensions: { width: g.w, height: g.h, depth: g.d } };
      if (weight != null) data.weight = weight;
      if (DRY) { console.log(`[wood] (dry) ${slug} -> ${g.w}x${g.h}x${g.d} cm, ${weight ?? "?"} kg`); skipped++; continue; }
      await payload.update({ collection: "products", id: Number(ex.id), data: data as any });
      updated++;
      console.log(`[wood] ✓ ${slug} -> ${g.w}x${g.h}x${g.d} cm${weight != null ? `, ${weight} kg` : " (poids inchangé)"}`);
    } catch (e) {
      errored++;
      console.error(`[wood] ✗ ${slug}:`, e instanceof Error ? e.message : e);
    }
  }
  console.log(`\n[wood] Terminé : ${updated} mises à jour, ${skipped} ignorées, ${errored} erreurs.`);
  process.exit(errored > 0 ? 1 : 0);
}

main().catch((e) => { console.error("[wood] Fatal:", e); process.exit(1); });
