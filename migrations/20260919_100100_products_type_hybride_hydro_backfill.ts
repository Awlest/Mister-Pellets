import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Migration : classe en « hybride-hydro » les poêles qui sont les deux à la fois.
 *
 * Règle : combustible = hybride (bois + pellets) ET case « Hydro » cochée, quel
 * que soit l'ancien type (« hybride » ou « hydro »). Les inserts hybrides non
 * raccordés à l'eau, les hydro bois (TC EVO) et les hybrides sans hydro (Dielle
 * Ghibli / Ponente) ne sont pas concernés.
 *
 * État relevé en base le 19/09/2026 avant exécution, 13 fiches Girolami :
 *  - 11 en « hybride » : edge, furni, sharp, soft, soft-slim, tc-bio-evo-80, ti,
 *    ti-panorama, ti-slim, ti-slim-panorama, ti-plus-26-hybride (masquée) ;
 *  -  2 en « hydro »   : soft-maiolica, ti-plus-panorama-26 (masquée).
 * Le `down` restaure exactement cette répartition.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET "product_type" = 'hybride-hydro'
    WHERE "combustible" = 'hybride'
      AND "is_hydro" = true
      AND "product_type" IN ('hybride', 'hydro');
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET "product_type" = 'hydro'
    WHERE "product_type" = 'hybride-hydro'
      AND "slug" IN ('girolami-soft-maiolica', 'girolami-ti-plus-panorama-26');
  `);
  await db.execute(sql`
    UPDATE "products"
    SET "product_type" = 'hybride'
    WHERE "product_type" = 'hybride-hydro';
  `);
}
