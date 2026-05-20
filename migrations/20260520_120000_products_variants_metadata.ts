import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Sous-champs additifs sur products_variants (section 5 du brief
 * mister-pellets-variants-import-ek63.md) :
 *  - manufacturer_structure_sku  (code structure tarif, 6 chiffres)
 *  - manufacturer_color_sku      (code série couleur tarif, 7 chiffres ; null sur système A)
 *  - coding_system               ('A' | 'B' selon la détection)
 *  - computed_price_h_t          (prix HT calculé : code complet ou structure+série)
 *  - price_source                (trace du calcul, ex. "structure 2520 + serie 150")
 *  - tariff_source               (édition de tarif, ex. "Edilkamin Mai 2026")
 *  - import_batch_id             (identifiant du lot, pour annulation ciblée)
 *
 * 100% ADDITIF. Idempotent. Aucune colonne existante n'est modifiée.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products_variants"
      ADD COLUMN IF NOT EXISTS "manufacturer_structure_sku" varchar,
      ADD COLUMN IF NOT EXISTS "manufacturer_color_sku"     varchar,
      ADD COLUMN IF NOT EXISTS "coding_system"              varchar,
      ADD COLUMN IF NOT EXISTS "computed_price_h_t"         numeric,
      ADD COLUMN IF NOT EXISTS "price_source"               varchar,
      ADD COLUMN IF NOT EXISTS "tariff_source"              varchar,
      ADD COLUMN IF NOT EXISTS "import_batch_id"            varchar;
  `);
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
      DROP COLUMN IF EXISTS "computed_price_h_t",
      DROP COLUMN IF EXISTS "price_source",
      DROP COLUMN IF EXISTS "tariff_source",
      DROP COLUMN IF EXISTS "import_batch_id";
  `);
}
