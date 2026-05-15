/**
 * Seed des axes et valeurs de variantes — Section 2 du brief.
 *
 * Peuple les collections variant-option-types et variant-option-values avec
 * le référentiel standard Mister Pellets (matériau, couleur, type de chauffe,
 * sortie des fumées, alimentation, puissance).
 *
 * IDEMPOTENT : chaque type/valeur est recherché par slug avant création.
 * Relançable sans risque de doublon. Ne touche AUCUN produit.
 *
 * Exécution (après application de la migration variantes) :
 *   ./node_modules/.bin/tsx scripts/seed-variant-options.ts
 */

import fs from "fs";
import path from "path";

function loadEnv(): void {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

type DisplayMode = "text" | "color" | "icon";

interface TypeDef {
  label: string;
  slug: string;
  displayMode: DisplayMode;
  sortOrder: number;
  values: Array<{ label: string; slug: string; colorHex?: string }>;
}

/** Référentiel standard — Sections 2.1 et 2.2 du brief. */
const REFERENTIEL: TypeDef[] = [
  {
    label: "Matériau",
    slug: "materiau",
    displayMode: "text",
    sortOrder: 10,
    values: [
      { label: "Acier", slug: "acier" },
      { label: "Céramique", slug: "ceramique" },
      { label: "Pierre ollaire", slug: "pierre-ollaire" },
      { label: "Majolique", slug: "majolique" },
      { label: "Verre", slug: "verre" },
      { label: "Fonte", slug: "fonte" },
    ],
  },
  {
    label: "Couleur",
    slug: "couleur",
    displayMode: "color",
    sortOrder: 20,
    values: [
      { label: "Noir", slug: "noir", colorHex: "#1a1a1a" },
      { label: "Blanc", slug: "blanc", colorHex: "#f5f3ee" },
      { label: "Crème", slug: "creme", colorHex: "#e8dec8" },
      { label: "Brun", slug: "brun", colorHex: "#5c3a21" },
      { label: "Bordeaux", slug: "bordeaux", colorHex: "#6b1f2e" },
      { label: "Gris anthracite", slug: "gris-anthracite", colorHex: "#3a3a3a" },
      { label: "Vert sapin", slug: "vert-sapin", colorHex: "#2d4a2b" },
      { label: "Beige", slug: "beige", colorHex: "#d9c9a8" },
    ],
  },
  {
    label: "Type de chauffe",
    slug: "type-chauffe",
    displayMode: "icon",
    sortOrder: 30,
    values: [
      { label: "Rayonnant", slug: "rayonnant" },
      { label: "Ventilé standard", slug: "ventile-standard" },
      { label: "Ventilé + 1 canalisation", slug: "ventile-canalise-1" },
      { label: "Ventilé + 2 canalisations", slug: "ventile-canalise-2" },
      { label: "Hybride pellet + bois", slug: "hybride-bois" },
      { label: "Hydro", slug: "hydro" },
      { label: "Hybride hydro", slug: "hybride-hydro" },
    ],
  },
  {
    label: "Sortie des fumées",
    slug: "sortie-fumees",
    displayMode: "text",
    sortOrder: 40,
    values: [
      { label: "Haute", slug: "haute" },
      { label: "Arrière", slug: "arriere" },
      { label: "Latérale gauche", slug: "laterale-gauche" },
      { label: "Latérale droite", slug: "laterale-droite" },
    ],
  },
  {
    label: "Système d'alimentation",
    slug: "alimentation",
    displayMode: "icon",
    sortOrder: 50,
    values: [
      { label: "Toboggan", slug: "toboggan" },
      { label: "Brasier", slug: "brasier" },
    ],
  },
  {
    label: "Puissance",
    slug: "puissance",
    displayMode: "text",
    sortOrder: 60,
    values: [
      { label: "6 kW", slug: "6-kw" },
      { label: "7 kW", slug: "7-kw" },
      { label: "8 kW", slug: "8-kw" },
      { label: "9 kW", slug: "9-kw" },
      { label: "10 kW", slug: "10-kw" },
      { label: "11 kW", slug: "11-kw" },
      { label: "12 kW", slug: "12-kw" },
    ],
  },
];

async function main(): Promise<void> {
  loadEnv();

  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  let typesCreated = 0;
  let typesSkipped = 0;
  let valuesCreated = 0;
  let valuesSkipped = 0;

  for (const typeDef of REFERENTIEL) {
    // --- Type ---
    let typeId: number;
    const existingType = await payload.find({
      collection: "variant-option-types",
      where: { slug: { equals: typeDef.slug } },
      limit: 1,
    });

    if (existingType.docs.length > 0) {
      typeId = (existingType.docs[0] as { id: number }).id;
      console.log(`[seed-variants]   ⏭  type "${typeDef.slug}" existe déjà`);
      typesSkipped++;
    } else {
      const created = await payload.create({
        collection: "variant-option-types",
        data: {
          label: typeDef.label,
          slug: typeDef.slug,
          displayMode: typeDef.displayMode,
          sortOrder: typeDef.sortOrder,
        },
      });
      typeId = (created as { id: number }).id;
      console.log(`[seed-variants]   ✓ type "${typeDef.slug}" créé`);
      typesCreated++;
    }

    // --- Valeurs ---
    for (const valueDef of typeDef.values) {
      const existingValue = await payload.find({
        collection: "variant-option-values",
        where: {
          and: [
            { slug: { equals: valueDef.slug } },
            { optionType: { equals: typeId } },
          ],
        },
        limit: 1,
      });

      if (existingValue.docs.length > 0) {
        valuesSkipped++;
        continue;
      }

      await payload.create({
        collection: "variant-option-values",
        data: {
          label: valueDef.label,
          slug: valueDef.slug,
          optionType: typeId,
          ...(valueDef.colorHex ? { colorHex: valueDef.colorHex } : {}),
        },
      });
      console.log(`[seed-variants]     ✓ valeur "${typeDef.slug}/${valueDef.slug}" créée`);
      valuesCreated++;
    }
  }

  console.log(
    `\n[seed-variants] Terminé : ${typesCreated} types créés (${typesSkipped} skip), ` +
      `${valuesCreated} valeurs créées (${valuesSkipped} skip).`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("[seed-variants] Fatal :", err);
  process.exit(1);
});
