/**
 * Corrections ciblées issues de l'audit du 2026-06-12 (croisement des fiches
 * Payload avec les SCHEDA TECNICA officielles de girolami.eu).
 *
 * N'écrit QUE les champs listés ci-dessous, rien d'autre. Brand guard Girolami.
 * Snapshot complet des fiches Girolami avant toute écriture.
 *
 *   npx tsx scripts/girolami-fix-audit-2026-06-12.ts           # DRY-RUN (défaut, AUCUNE écriture)
 *   npx tsx scripts/girolami-fix-audit-2026-06-12.ts --apply   # écrit en prod (à lancer par Dorian)
 *
 * Corrections (source = fiche officielle, vérifiées une à une) :
 *  - Mini (6, 9)            : hopperCapacity 15 -> 12 kg ; profondeur absente -> 63 cm
 *  - Soft Slim (14..26)     : hopperCapacity 25 -> 35 kg (seul hydro à 35, pas 25)
 *  - Alfa Bio               : weight -> 300 kg ; energyClass -> A+
 *  - TC Evo 75 (+dx/sx, +curvo) : weight -> 240 kg
 *  - Bois (Frame, Alfa, Alfa Double, MBS, Vision Evo, TC Evo 75) : energyClass -> A+
 *
 * IMPORTANT : le bois est A+ (efficacité ~85 %), JAMAIS A++. Ne PAS toucher au
 * pellet/hybride qui sont bien A++. tc-bio-evo (hybride) et tc-evo-plus-80
 * volontairement EXCLUS (classe à confirmer par Dorian sur la fiche).
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
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}

// Lot bois -> classe énergétique A+ (jamais A++).
const WOOD_A_PLUS = new Set<string>([
  "girolami-frame-80", "girolami-frame-80-dx-sx",
  "girolami-frame-100", "girolami-frame-100-dx-sx",
  "girolami-frame-120", "girolami-frame-120-dx-sx",
  "girolami-alfa", "girolami-alfa-double",
  "girolami-mbs-f-80", "girolami-mbs-f-100", "girolami-mbs-f-120",
  "girolami-vision-evo-60", "girolami-vision-evo-70", "girolami-vision-evo-80",
  "girolami-vision-evo-90", "girolami-vision-evo-100",
  "girolami-tc-evo-75", "girolami-tc-evo-75-dx-sx", "girolami-tc-evo-75-curvo",
]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Doc = any;

interface Rule {
  id: string;
  match: (slug: string) => boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  build: (ex: Doc) => Record<string, any>;
}

const RULES: Rule[] = [
  {
    id: "mini-reservoir+profondeur",
    match: (s) => s === "girolami-mini-6" || s === "girolami-mini-9",
    build: (ex) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const out: Record<string, any> = { hopperCapacity: 12 };
      const dim = ex.dimensions ?? {};
      const hasDepth = typeof dim.depth === "number" && dim.depth > 0;
      if (!hasDepth) {
        // Détecte l'unité d'après la largeur (cm si < 200, sinon mm).
        const w = typeof dim.width === "number" ? dim.width : 0;
        const depthVal = w >= 200 ? 630 : 63; // 63 cm officiel
        out.dimensions = {
          width: dim.width ?? null,
          height: dim.height ?? null,
          depth: depthVal,
        };
      }
      return out;
    },
  },
  {
    id: "soft-slim-reservoir",
    match: (s) => s.startsWith("girolami-soft-slim"),
    build: () => ({ hopperCapacity: 35 }),
  },
  {
    id: "alfa-bio-poids+classe",
    match: (s) => s === "girolami-alfa-bio",
    build: () => ({ weight: 300, energyClass: "A+" }),
  },
  {
    id: "tc-evo-75-poids",
    match: (s) =>
      s === "girolami-tc-evo-75" ||
      s === "girolami-tc-evo-75-dx-sx" ||
      s === "girolami-tc-evo-75-curvo",
    build: () => ({ weight: 240 }),
  },
  {
    id: "bois-classe-A+",
    match: (s) => WOOD_A_PLUS.has(s),
    build: () => ({ energyClass: "A+" }),
  },
];

async function main(): Promise<void> {
  loadEnv();
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  const all = await payload.find({
    collection: "products",
    where: { brand: { equals: "Girolami" } },
    depth: 0,
    limit: 1000,
  });
  const docs = all.docs as Doc[];
  console.log(`[fix] ${docs.length} fiches Girolami chargées. Mode : ${APPLY ? "APPLY (écriture prod)" : "DRY-RUN (lecture seule)"}.`);

  if (APPLY) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const f = path.join(ROOT, "imports/girolami-catalogue-2026", `_snapshot-fix-audit-${stamp}.json`);
    fs.writeFileSync(f, JSON.stringify(docs, null, 2));
    console.log(`[fix] snapshot avant écriture -> ${path.relative(ROOT, f)}`);
  }

  const ruleHits: Record<string, number> = {};
  let planned = 0, applied = 0, errored = 0;

  for (const ex of docs) {
    if (ex.brand !== "Girolami") {
      console.error(`[fix] BRAND MISMATCH ${ex.slug} (${ex.brand}) -> abandon`);
      process.exit(1);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let merged: Record<string, any> = {};
    const reasons: string[] = [];
    for (const rule of RULES) {
      if (rule.match(ex.slug)) {
        merged = { ...merged, ...rule.build(ex) };
        reasons.push(rule.id);
        ruleHits[rule.id] = (ruleHits[rule.id] ?? 0) + 1;
      }
    }
    if (Object.keys(merged).length === 0) continue;

    const diff = Object.entries(merged)
      .map(([k, v]) => {
        const before = k === "dimensions" ? JSON.stringify(ex.dimensions ?? null) : ex[k];
        const after = k === "dimensions" ? JSON.stringify(v) : v;
        return `${k}: ${before ?? "∅"} -> ${after}`;
      })
      .join(" | ");

    planned++;
    if (!APPLY) {
      console.log(`[fix] (dry) ${ex.slug}  [${reasons.join(",")}]  ${diff}`);
      continue;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await payload.update({ collection: "products", id: Number(ex.id), data: merged as any });
      applied++;
      console.log(`[fix] ✓ ${ex.slug}  ${diff}`);
    } catch (e) {
      errored++;
      console.error(`[fix] ✗ ${ex.slug}:`, e instanceof Error ? e.message : e);
    }
  }

  // Avertit si une règle n'a touché aucune fiche (slug différent de l'attendu).
  for (const rule of RULES) {
    if (!ruleHits[rule.id]) console.warn(`[fix] ⚠ règle « ${rule.id} » n'a matché AUCUNE fiche (slug à vérifier).`);
  }

  console.log(`\n[fix] ${APPLY ? "APPLIQUÉ" : "DRY-RUN"} : ${planned} fiches concernées, ${applied} écrites, ${errored} erreurs.`);
  process.exit(errored > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("[fix] Fatal:", e);
  process.exit(1);
});
