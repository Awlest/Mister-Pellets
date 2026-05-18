/**
 * MIGRATION PROPOSÉE — NE PAS EXÉCUTER SANS LE GO DE DORIAN.
 *
 * Ce fichier est volontairement placé HORS du dossier `migrations/` pour qu'il
 * ne soit pas ramassé par `payload migrate`. Après GO :
 *   1. le déplacer dans `migrations/` en le renommant avec un horodatage,
 *      ex. `migrations/20260518_120000_products_variants_ek63_subfields.ts` ;
 *   2. ajouter l'entrée correspondante dans `migrations/index.ts` ;
 *   3. ajouter les sous-champs miroir dans `collections/Products.ts`
 *      (array `variants`) — voir bloc commenté en bas de ce fichier ;
 *   4. l'appliquer d'ABORD sur preview/staging, jamais sur prod directement.
 *
 * 100 % ADDITIF. Aucune colonne existante n'est modifiée, renommée ou supprimée.
 * N'ajoute que 7 colonnes neuves à la sous-table `products_variants`.
 * `mpn` et `gtin` existent déjà → réutilisés tels quels, pas recréés.
 * `fumeOutlet` / `color` ne sont PAS créés : la relation `optionValues`
 * (brief v2) porte déjà les axes Sortie + Couleur (voir anomalie A9 du livrable).
 */
import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products_variants"
      ADD COLUMN IF NOT EXISTS "manufacturer_structure_sku" varchar,
      ADD COLUMN IF NOT EXISTS "manufacturer_color_sku"     varchar,
      ADD COLUMN IF NOT EXISTS "coding_system"              varchar,
      ADD COLUMN IF NOT EXISTS "computed_price_ht"          numeric,
      ADD COLUMN IF NOT EXISTS "price_source"               varchar,
      ADD COLUMN IF NOT EXISTS "tariff_source"              varchar,
      ADD COLUMN IF NOT EXISTS "import_batch_id"            varchar;
  `);
  // Index pour pouvoir retrouver / annuler un lot d'import précis.
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "products_variants_import_batch_id_idx"
      ON "products_variants" USING btree ("import_batch_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP INDEX IF EXISTS "products_variants_import_batch_id_idx";`);
  await db.execute(sql`
    ALTER TABLE "products_variants"
      DROP COLUMN IF EXISTS "manufacturer_structure_sku",
      DROP COLUMN IF EXISTS "manufacturer_color_sku",
      DROP COLUMN IF EXISTS "coding_system",
      DROP COLUMN IF EXISTS "computed_price_ht",
      DROP COLUMN IF EXISTS "price_source",
      DROP COLUMN IF EXISTS "tariff_source",
      DROP COLUMN IF EXISTS "import_batch_id";
  `);
}

/* -----------------------------------------------------------------------------
 * SOUS-CHAMPS À AJOUTER dans collections/Products.ts — array `variants`,
 * à la FIN de la liste `fields` de l'array (après le champ `image`).
 * Additif : aucun champ existant n'est touché.
 *
 *   { name: "manufacturerStructureSku", type: "text",
 *     admin: { description: "Code structure EK63 (6 chiffres). Obligatoire." } },
 *   { name: "manufacturerColorSku", type: "text",
 *     admin: { description: "Code série couleur (7 chiffres). Système B uniquement." } },
 *   { name: "codingSystem", type: "select", options: ["A", "B"],
 *     admin: { description: "Système de codage détecté au tarif." } },
 *   { name: "computedPriceHT", type: "number",
 *     admin: { step: 0.01, description: "Prix calculé HT (hors TVA)." } },
 *   { name: "priceSource", type: "text",
 *     admin: { description: "Trace du calcul, ex. 'structure 2520 + serie 150'." } },
 *   { name: "tariffSource", type: "text",
 *     admin: { description: "Édition du tarif, ex. 'EK63 Mai 2026 (945904 0,7.05.2026/A)'." } },
 *   { name: "importBatchId", type: "text",
 *     admin: { description: "Identifiant du lot d'import (pour annulation ciblée)." } },
 *
 * --------------------------------------------------------------------------- */
