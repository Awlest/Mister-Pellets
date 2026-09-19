import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Migration : ajoute la valeur 'hybride-hydro' à l'enum de `productType`.
 *
 * Avant, « hydro » et « hybride » étaient deux valeurs exclusives : un poêle
 * qui brûle bois + pellets ET alimente le chauffage central (gamme Girolami)
 * ne pouvait en porter qu'une, d'où des fiches classées tantôt « hybride »,
 * tantôt « hydro ». La nouvelle valeur couvre ce cas.
 *
 * 100 % additif. `ADD VALUE IF NOT EXISTS` est idempotent. PostgreSQL 12+
 * autorise l'ajout dans une transaction tant que la valeur n'y est pas
 * utilisée : la réaffectation des fiches est donc dans la migration suivante
 * (Payload ouvre une transaction par fichier de migration).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_products_product_type" ADD VALUE IF NOT EXISTS 'hybride-hydro';
  `);
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // PostgreSQL ne sait pas retirer proprement une valeur d'un enum utilisé par
  // une colonne. No-op volontaire : la valeur reste disponible mais inutilisée
  // une fois la migration de réaffectation annulée. Aucun risque pour les données.
}
