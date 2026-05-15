import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Migration : ajoute la valeur 'Girolami' à l'enum de la colonne `brand`
 * de la table products.
 *
 * Girolami devient une marque top-tier distribuée par Mister Pellets
 * (cf. brief marques 2026-05). Sans cette valeur, l'admin Payload ne peut
 * pas encoder de produit Girolami.
 *
 * 100% additif. `ADD VALUE IF NOT EXISTS` est idempotent. PostgreSQL 12+
 * autorise l'ajout d'une valeur d'enum dans une transaction tant qu'elle
 * n'est pas utilisée dans la même transaction (ce qui est le cas ici).
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_products_brand" ADD VALUE IF NOT EXISTS 'Girolami';
  `);
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // PostgreSQL ne permet pas de retirer proprement une valeur d'un enum
  // utilisé par une colonne. Le down() est volontairement un no-op : la
  // valeur 'Girolami' reste disponible mais inutilisée si aucun produit ne
  // la référence. Aucun risque pour les données.
}
