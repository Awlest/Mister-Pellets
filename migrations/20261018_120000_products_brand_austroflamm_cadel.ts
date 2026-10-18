import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Migration : ajoute 'Austroflamm' et 'Cadel' à l'enum de la colonne `brand`
 * de la table products (gammes pellets et mixtes bois + pellets, 18/10/2026).
 *
 * 100 % additif, même schéma que 20260515_190000_products_brand_girolami :
 * `ADD VALUE IF NOT EXISTS` est idempotent et autorisé dans une transaction
 * tant que la valeur n'y est pas utilisée.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_products_brand" ADD VALUE IF NOT EXISTS 'Austroflamm';
    ALTER TYPE "public"."enum_products_brand" ADD VALUE IF NOT EXISTS 'Cadel';
  `);
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // PostgreSQL ne retire pas une valeur d'enum utilisée par une colonne :
  // no-op volontaire, comme pour Girolami. Les valeurs restent disponibles.
}
