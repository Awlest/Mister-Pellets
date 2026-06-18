import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Migration : ajoute `combustible` (pellet | bois | hybride) à la collection
 * products. Sert au nouveau filtre boutique « Combustible » et, combiné à la
 * case `isHydro` (ventilé / hydro), remplace l'ancien filtre « Type » qui
 * mélangeait combustible et mode de chauffage.
 *
 * La table products contient déjà des données : on ajoute donc la colonne
 * NOT NULL avec DEFAULT 'pellet' (Postgres remplit les lignes existantes).
 * Le backfill par marque/modèle (bois, hybride, isHydro) est fait ensuite par
 * scripts/girolami-categories-2026-06-17.ts.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_products_combustible" AS ENUM(
      'pellet',
      'bois',
      'hybride'
    );
  `);

  await db.execute(sql`
    ALTER TABLE "products"
    ADD COLUMN IF NOT EXISTS "combustible" "enum_products_combustible" NOT NULL DEFAULT 'pellet';
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products"
    DROP COLUMN IF EXISTS "combustible";
  `);
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_products_combustible";`);
}
