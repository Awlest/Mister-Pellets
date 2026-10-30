import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Migration : ajoute 'MCZ' à l'enum de la colonne `brand` des tables products
 * et accessories (gamme pellets MCZ, 30/10/2026).
 *
 * 100 % additif, même schéma que 20261018_120000_products_brand_austroflamm_cadel :
 * `ADD VALUE IF NOT EXISTS` est idempotent et autorisé dans une transaction
 * tant que la valeur n'y est pas utilisée.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_products_brand" ADD VALUE IF NOT EXISTS 'MCZ';
    ALTER TYPE "public"."enum_accessories_brand" ADD VALUE IF NOT EXISTS 'MCZ';
  `);
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // PostgreSQL ne retire pas une valeur d'enum utilisée par une colonne :
  // no-op volontaire, comme pour Austroflamm et Cadel. La valeur reste disponible.
}
