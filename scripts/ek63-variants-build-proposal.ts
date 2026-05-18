/**
 * EK63 — générateur de la proposition de variantes (Phases 1→4 du brief
 * `mister-pellets-variants-import-ek63.md`).
 *
 * LECTURE SEULE côté base : ne fait que `SELECT` pour rattacher chaque modèle
 * tarif à son produit Payload. N'écrit RIEN en base. Émet uniquement des
 * fichiers dans `imports/ek63-variants-mai2026/`.
 *
 * Exécution : ./node_modules/.bin/tsx scripts/ek63-variants-build-proposal.ts
 *
 * Structure uniforme à 3 axes pour tous les modèles :
 *   Sortie des fumées  ×  Finition (matériau)  ×  Couleur
 *
 * Données tarif : `Tarif Public_Prijslijst - Mai_Mei 2026_EK63 FR-NL.pdf`
 * (millésime mai 2026). Tous les prix sont HORS TVA.
 */
import fs from "fs";
import path from "path";

const TARIFF_SOURCE = "EK63 Mai 2026 (945904 0,7.05.2026/A)";
const OUT_DIR = path.resolve(process.cwd(), "imports/ek63-variants-mai2026");

/* ===========================================================================
   DONNÉES TARIF — 19 modèles pellet, structurées en 3 axes.
   - Système A : chaque couleur a un code complet `81xxxx` + un prix final.
   - Système B : chaque sortie a un code structure `81xxxx` + prix structure ;
     chaque finition est une « série » avec un prix ; chaque couleur a un code
     série `11xxxxx`. computedPriceHT = prix structure + prix série.
   =========================================================================== */

interface ColourA { couleur: string; code: string; prixHT: number | null }
interface ColourB { couleur: string; colorSku: string }
interface BranchA { sortie: string; finition: string; couleurs: ColourA[] }
interface SortieB { sortie: string; structureSku: string; prixStructureHT: number | null }
interface FinitionB { finition: string; serieLabel: string; prixSerieHT: number | null; couleurs: ColourB[] }
interface ModelA {
  nom: string; slugPayload: string; system: "A"; page: number;
  matchCertain: boolean; branches: BranchA[]; note?: string;
}
interface ModelB {
  nom: string; slugPayload: string; system: "B"; page: number;
  matchCertain: boolean; sorties: SortieB[]; finitions: FinitionB[]; note?: string;
}
type Model = ModelA | ModelB;

const C_BLANC_PERLE = "Blanc perle";
const C_TOURTERELLE = "Tourterelle";
const C_BORDEAUX = "Bordeaux";
const C_NOIRE = "Noire opaque";
const C_BLANC_OPAQUE = "Blanc opaque";

const MODELS: Model[] = [
  // ----- Système B -----------------------------------------------------------
  {
    nom: "Zone 80 Evo", slugPayload: "ek63-zone-80", system: "B", page: 7, matchCertain: true,
    sorties: [{ sortie: "Back", structureSku: "817340", prixStructureHT: 1530 }],
    finitions: [{ finition: "Acier", serieLabel: "série acier", prixSerieHT: 210, couleurs: [
      { couleur: C_BLANC_PERLE, colorSku: "1192110" },
      { couleur: C_TOURTERELLE, colorSku: "1192120" },
      { couleur: C_BORDEAUX, colorSku: "1192130" },
      { couleur: C_NOIRE, colorSku: "1192140" },
    ]}],
  },
  {
    nom: "Berry 90+ Evo", slugPayload: "ek63-berry-90", system: "B", page: 9, matchCertain: true,
    sorties: [{ sortie: "Back", structureSku: "816440", prixStructureHT: 1920 }],
    finitions: [{ finition: "Céramique", serieLabel: "série céramique", prixSerieHT: 300, couleurs: [
      { couleur: C_BLANC_OPAQUE, colorSku: "1147990" },
      { couleur: C_TOURTERELLE, colorSku: "1148000" },
      { couleur: C_BORDEAUX, colorSku: "1148010" },
    ]}],
  },
  {
    nom: "Daily 130++ Evo", slugPayload: "ek63-daily-130", system: "B", page: 13, matchCertain: true,
    sorties: [{ sortie: "Back", structureSku: "817150", prixStructureHT: 2630 }],
    finitions: [{ finition: "Céramique", serieLabel: "série céramique", prixSerieHT: 660, couleurs: [
      { couleur: C_BLANC_OPAQUE, colorSku: "1148050" },
      { couleur: C_TOURTERELLE, colorSku: "1148060" },
      { couleur: C_BORDEAUX, colorSku: "1148070" },
    ]}],
  },
  {
    nom: "Monday 130++ Evo", slugPayload: "ek63-monday-130", system: "B", page: 15, matchCertain: true,
    sorties: [{ sortie: "Back", structureSku: "816490", prixStructureHT: 2900 }],
    finitions: [{ finition: "Acier-Céramique", serieLabel: "série acier+céramique", prixSerieHT: 390, couleurs: [
      { couleur: C_BLANC_OPAQUE, colorSku: "1146350" },
      { couleur: C_BORDEAUX, colorSku: "1146360" },
      { couleur: "Gris foncé", colorSku: "1146370" },
    ]}],
  },
  {
    nom: "Like 80 Evo", slugPayload: "ek63-like-80", system: "B", page: 17, matchCertain: true,
    sorties: [
      { sortie: "Top", structureSku: "817510", prixStructureHT: 1910 },
      { sortie: "Back", structureSku: "817530", prixStructureHT: 1910 },
      { sortie: "Coax", structureSku: "817550", prixStructureHT: 2420 },
    ],
    finitions: [
      { finition: "Acier", serieLabel: "série acier", prixSerieHT: 250, couleurs: [
        { couleur: C_BLANC_PERLE, colorSku: "1190110" },
        { couleur: C_TOURTERELLE, colorSku: "1190120" },
        { couleur: C_BORDEAUX, colorSku: "1190130" },
        { couleur: C_NOIRE, colorSku: "1190140" },
      ]},
      { finition: "Céramique", serieLabel: "série céramique", prixSerieHT: 560, couleurs: [
        { couleur: C_BLANC_OPAQUE, colorSku: "1193230" },
        { couleur: C_TOURTERELLE, colorSku: "1193240" },
        { couleur: C_BORDEAUX, colorSku: "1193250" },
      ]},
    ],
  },
  {
    nom: "Like 90+ Evo", slugPayload: "ek63-like-90", system: "B", page: 19, matchCertain: true,
    sorties: [
      { sortie: "Top", structureSku: "817520", prixStructureHT: 2110 },
      { sortie: "Back", structureSku: "817540", prixStructureHT: 2110 },
      { sortie: "Coax", structureSku: "817560", prixStructureHT: 2320 },
    ],
    finitions: [
      { finition: "Acier", serieLabel: "série acier", prixSerieHT: 250, couleurs: [
        { couleur: C_BLANC_PERLE, colorSku: "1190110" },
        { couleur: C_TOURTERELLE, colorSku: "1190120" },
        { couleur: C_BORDEAUX, colorSku: "1190130" },
        { couleur: C_NOIRE, colorSku: "1190140" },
      ]},
      { finition: "Céramique", serieLabel: "série céramique", prixSerieHT: 560, couleurs: [
        { couleur: C_BLANC_OPAQUE, colorSku: "1193230" },
        { couleur: C_TOURTERELLE, colorSku: "1193240" },
        { couleur: C_BORDEAUX, colorSku: "1193250" },
      ]},
    ],
  },
  {
    nom: "Spy 110+ Evo", slugPayload: "ek63-spy-110", system: "B", page: 23, matchCertain: true,
    note: "Prix structure de la sortie Top (817930) illisible dans le PDF → variantes Top à verifier.",
    sorties: [
      { sortie: "Back", structureSku: "817920", prixStructureHT: 2520 },
      { sortie: "Top", structureSku: "817930", prixStructureHT: null },
    ],
    finitions: [
      { finition: "Acier", serieLabel: "série acier", prixSerieHT: 150, couleurs: [
        { couleur: C_BLANC_PERLE, colorSku: "1193870" },
        { couleur: C_TOURTERELLE, colorSku: "1193880" },
        { couleur: C_NOIRE, colorSku: "1193900" },
      ]},
      { finition: "Verre", serieLabel: "série verre", prixSerieHT: 560, couleurs: [
        { couleur: "Blanc", colorSku: "1193910" },
        { couleur: "Noir", colorSku: "1193920" },
      ]},
    ],
  },
  {
    nom: "Yung 130++ Evo", slugPayload: "ek63-yung-130", system: "B", page: 25, matchCertain: true,
    sorties: [{ sortie: "Back", structureSku: "817160", prixStructureHT: 2980 }],
    finitions: [{ finition: "Céramique", serieLabel: "série céramique", prixSerieHT: 300, couleurs: [
      { couleur: C_BLANC_OPAQUE, colorSku: "1148080" },
      { couleur: C_TOURTERELLE, colorSku: "1148090" },
      { couleur: C_BORDEAUX, colorSku: "1148100" },
      { couleur: C_NOIRE, colorSku: "1148440" },
    ]}],
  },
  {
    nom: "Dub 100++ Evo", slugPayload: "ek63-dub-100", system: "B", page: 33, matchCertain: true,
    sorties: [{ sortie: "Top", structureSku: "816450", prixStructureHT: 2910 }],
    finitions: [{ finition: "Céramique", serieLabel: "série céramique", prixSerieHT: 230, couleurs: [
      { couleur: C_BLANC_OPAQUE, colorSku: "1148110" },
      { couleur: C_TOURTERELLE, colorSku: "1148120" },
      { couleur: C_BORDEAUX, colorSku: "1148130" },
      { couleur: C_NOIRE, colorSku: "1148450" },
    ]}],
  },
  {
    nom: "Pellek 80 Evo²", slugPayload: "ek63-pellek-80", system: "B", page: 35, matchCertain: true,
    note: "EXCEPTION : pas de couleur ni de finition au tarif. L'axe 'Finition' porte ici le kit de chargement obligatoire (axe à arbitrer).",
    sorties: [{ sortie: "Top", structureSku: "817970", prixStructureHT: 3180 }],
    finitions: [
      { finition: "Kit tiroir rectangulaire", serieLabel: "série kit", prixSerieHT: 340, couleurs: [
        { couleur: "Standard", colorSku: "1167410" }]},
      { finition: "Kit tiroir carré", serieLabel: "série kit", prixSerieHT: 340, couleurs: [
        { couleur: "Standard", colorSku: "1194130" }]},
      { finition: "Kit trappe", serieLabel: "série kit", prixSerieHT: 300, couleurs: [
        { couleur: "Standard", colorSku: "1167450" }]},
    ],
  },
  {
    nom: "Pellek 100+ Evo²", slugPayload: "ek63-pellek-110", system: "B", page: 35, matchCertain: false,
    note: "Rapprochement INCERTAIN : produit Payload nommé 'Pellek 110+ Evo²' (110), tarif 'Pellek 100+ Evo²' (100). EXCEPTION axe kit comme Pellek 80.",
    sorties: [{ sortie: "Top", structureSku: "817960", prixStructureHT: 3390 }],
    finitions: [
      { finition: "Kit tiroir rectangulaire", serieLabel: "série kit", prixSerieHT: 340, couleurs: [
        { couleur: "Standard", colorSku: "1167410" }]},
      { finition: "Kit tiroir carré", serieLabel: "série kit", prixSerieHT: 340, couleurs: [
        { couleur: "Standard", colorSku: "1194130" }]},
      { finition: "Kit trappe", serieLabel: "série kit", prixSerieHT: 300, couleurs: [
        { couleur: "Standard", colorSku: "1167450" }]},
    ],
  },
  {
    nom: "Monday H 190 Evo", slugPayload: "ek63-monday-190h", system: "B", page: 39, matchCertain: true,
    sorties: [{ sortie: "Back", structureSku: "813740", prixStructureHT: 3500 }],
    finitions: [{ finition: "Acier-Céramique", serieLabel: "série acier+céramique", prixSerieHT: 390, couleurs: [
      { couleur: C_BLANC_OPAQUE, colorSku: "1146350" },
      { couleur: C_BORDEAUX, colorSku: "1146360" },
      { couleur: "Gris foncé", colorSku: "1146370" },
    ]}],
  },
  {
    nom: "Monday H 230 Evo", slugPayload: "ek63-monday-230h", system: "B", page: 39, matchCertain: true,
    sorties: [{ sortie: "Back", structureSku: "813770", prixStructureHT: 3830 }],
    finitions: [{ finition: "Acier-Céramique", serieLabel: "série acier+céramique", prixSerieHT: 390, couleurs: [
      { couleur: C_BLANC_OPAQUE, colorSku: "1146350" },
      { couleur: C_BORDEAUX, colorSku: "1146360" },
      { couleur: "Gris foncé", colorSku: "1146370" },
    ]}],
  },
  // ----- Système A -----------------------------------------------------------
  {
    nom: "Metro 110+ Evo", slugPayload: "ek63-metro-110", system: "A", page: 11, matchCertain: true,
    branches: [{ sortie: "Back", finition: "Acier", couleurs: [
      { couleur: C_BLANC_PERLE, code: "817650", prixHT: 2360 },
      { couleur: C_TOURTERELLE, code: "817660", prixHT: 2360 },
      { couleur: C_BORDEAUX, code: "817670", prixHT: 2360 },
      { couleur: C_NOIRE, code: "817680", prixHT: 2360 },
    ]}],
  },
  {
    nom: "Tweed 90+ Evo", slugPayload: "ek63-tweed-90", system: "A", page: 21, matchCertain: true,
    branches: [
      { sortie: "Top", finition: "Acier", couleurs: [
        { couleur: C_BLANC_PERLE, code: "817570", prixHT: 2360 },
        { couleur: C_TOURTERELLE, code: "817580", prixHT: 2360 },
        { couleur: C_BORDEAUX, code: "817590", prixHT: 2360 },
        { couleur: C_NOIRE, code: "817600", prixHT: 2360 },
      ]},
      { sortie: "Back", finition: "Acier", couleurs: [
        { couleur: C_NOIRE, code: "817630", prixHT: 2360 },
      ]},
    ],
  },
  {
    nom: "Gotha 70 Evo", slugPayload: "ek63-gotha-70", system: "A", page: 27, matchCertain: true,
    branches: [{ sortie: "Top", finition: "Acier", couleurs: [
      { couleur: C_BLANC_PERLE, code: "817180", prixHT: 1950 },
      { couleur: C_TOURTERELLE, code: "817190", prixHT: 1950 },
      { couleur: C_BORDEAUX, code: "817200", prixHT: 1950 },
      { couleur: C_NOIRE, code: "817210", prixHT: 1950 },
    ]}],
  },
  {
    nom: "Cell 80+ Evo", slugPayload: "ek63-cell-80", system: "A", page: 29, matchCertain: true,
    branches: [
      { sortie: "Top", finition: "Acier", couleurs: [
        { couleur: C_BLANC_PERLE, code: "817220", prixHT: 2150 },
        { couleur: C_TOURTERELLE, code: "817230", prixHT: 2150 },
        { couleur: C_BORDEAUX, code: "817240", prixHT: 2150 },
        { couleur: C_NOIRE, code: "817250", prixHT: 2150 },
      ]},
      { sortie: "Coax", finition: "Acier", couleurs: [
        { couleur: C_BLANC_PERLE, code: "817260", prixHT: 2360 },
        { couleur: C_NOIRE, code: "817270", prixHT: 2360 },
      ]},
    ],
  },
  {
    nom: "Entity 90+ Evo", slugPayload: "ek63-entity-90", system: "A", page: 31, matchCertain: true,
    note: "Code couleur Bordeaux (817300 attendu) non extrait du PDF → à verifier.",
    branches: [{ sortie: "Top", finition: "Acier", couleurs: [
      { couleur: C_BLANC_PERLE, code: "817280", prixHT: 2560 },
      { couleur: C_TOURTERELLE, code: "817290", prixHT: 2560 },
      { couleur: C_NOIRE, code: "817310", prixHT: 2560 },
    ]}],
  },
  {
    nom: "Spot100 H Evo", slugPayload: "ek63-spot-100h", system: "A", page: 37, matchCertain: true,
    branches: [{ sortie: "Back", finition: "Céramique", couleurs: [
      { couleur: "Blanc crème", code: "815670", prixHT: 3020 },
      { couleur: C_BORDEAUX, code: "815680", prixHT: 3020 },
      { couleur: "Gris foncé", code: "815690", prixHT: 3020 },
    ]}],
  },
];

/* ===========================================================================
   Construction des variantes candidates (3 axes uniformes).
   =========================================================================== */

interface Variant {
  modele: string;
  slugPayload: string;
  matchCertain: boolean;
  sortie: string;
  finition: string;
  couleur: string;
  manufacturerStructureSku: string;
  manufacturerColorSku: string;
  mpn: string;
  codingSystem: "A" | "B";
  computedPriceHT: number | null;
  priceSource: string;
  skuInterne: string;
  tariffSource: string;
}

function up(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function modelToken(nom: string): string {
  // "Tweed 90+ Evo" -> "TWEED-90" ; "Monday H 190 Evo" -> "MONDAY-H-190"
  return up(nom.replace(/\+/g, "").replace(/\bEvo²?\b/gi, "").trim());
}

function buildVariants(m: Model): Variant[] {
  const out: Variant[] = [];
  const tok = modelToken(m.nom);
  if (m.system === "A") {
    for (const b of m.branches) {
      for (const c of b.couleurs) {
        out.push({
          modele: m.nom, slugPayload: m.slugPayload, matchCertain: m.matchCertain,
          sortie: b.sortie, finition: b.finition, couleur: c.couleur,
          manufacturerStructureSku: c.code, manufacturerColorSku: "", mpn: c.code,
          codingSystem: "A",
          computedPriceHT: c.prixHT,
          priceSource: c.prixHT == null ? "a verifier" : `code complet ${c.code}`,
          skuInterne: `EK63-${tok}-${up(b.sortie)}-${up(b.finition)}-${up(c.couleur)}`,
          tariffSource: TARIFF_SOURCE,
        });
      }
    }
  } else {
    for (const s of m.sorties) {
      for (const f of m.finitions) {
        for (const c of f.couleurs) {
          const computable = s.prixStructureHT != null && f.prixSerieHT != null;
          const price = computable
            ? (s.prixStructureHT as number) + (f.prixSerieHT as number)
            : null;
          out.push({
            modele: m.nom, slugPayload: m.slugPayload, matchCertain: m.matchCertain,
            sortie: s.sortie, finition: f.finition, couleur: c.couleur,
            manufacturerStructureSku: s.structureSku, manufacturerColorSku: c.colorSku,
            mpn: s.structureSku, codingSystem: "B",
            computedPriceHT: price,
            priceSource: computable
              ? `structure ${s.prixStructureHT} + serie ${f.prixSerieHT}`
              : "a verifier",
            skuInterne: `EK63-${tok}-${up(s.sortie)}-${up(f.finition)}-${up(c.couleur)}`,
            tariffSource: TARIFF_SOURCE,
          });
        }
      }
    }
  }
  return out;
}

/* ===========================================================================
   Rattachement Payload (lecture seule) + émission des fichiers.
   =========================================================================== */

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
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return s.includes(";") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
}

async function main(): Promise<void> {
  loadEnv();
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });
  const pool = (
    payload.db as unknown as {
      pool: { query: (q: string) => Promise<{ rows: Record<string, unknown>[] }> };
    }
  ).pool;

  const prodRows = await pool.query(
    `SELECT id, slug, name, model, has_variants FROM products WHERE brand='EK63'`,
  );
  const bySlug = new Map<string, Record<string, unknown>>();
  for (const r of prodRows.rows) bySlug.set(String(r.slug), r);

  // Toutes les variantes candidates des 19 modèles
  const allVariants: Variant[] = [];
  for (const m of MODELS) allVariants.push(...buildVariants(m));

  // CSV
  const headers = [
    "modele", "slugPayload", "produitId", "hasVariants", "matchCertain",
    "sortie", "finition", "couleur",
    "manufacturerStructureSku", "manufacturerColorSku", "mpn", "codingSystem",
    "computedPriceHT", "priceSource", "tariffSource", "skuInterne",
  ];
  const lines = [headers.join(";")];
  let nbHasVariants = 0;
  let nbAVerifier = 0;
  for (const v of allVariants) {
    const prod = bySlug.get(v.slugPayload);
    const hv = prod?.has_variants === true;
    if (hv) nbHasVariants++;
    if (v.computedPriceHT == null) nbAVerifier++;
    lines.push([
      v.modele, v.slugPayload, prod?.id ?? "INTROUVABLE", hv ? "true" : "false",
      v.matchCertain ? "oui" : "INCERTAIN",
      v.sortie, v.finition, v.couleur,
      v.manufacturerStructureSku, v.manufacturerColorSku, v.mpn, v.codingSystem,
      v.computedPriceHT ?? "", v.priceSource, v.tariffSource, v.skuInterne,
    ].map(csvCell).join(";"));
  }
  fs.writeFileSync(path.join(OUT_DIR, "variantes-proposees.csv"), lines.join("\n") + "\n");

  // Récap console
  const nbA = MODELS.filter((m) => m.system === "A").length;
  const nbB = MODELS.filter((m) => m.system === "B").length;
  console.log(`[gen] Modèles: ${MODELS.length} (A=${nbA}, B=${nbB})`);
  console.log(`[gen] Variantes candidates: ${allVariants.length}`);
  console.log(`[gen]   dont sur produits hasVariants=true: ${nbHasVariants}`);
  console.log(`[gen]   dont prix 'a verifier': ${nbAVerifier}`);
  console.log(`[gen] CSV écrit: imports/ek63-variants-mai2026/variantes-proposees.csv`);
  const missing = MODELS.filter((m) => !bySlug.has(m.slugPayload));
  if (missing.length) {
    console.log(`[gen] Modèles tarif sans produit Payload: ${missing.map((m) => m.nom).join(", ")}`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
