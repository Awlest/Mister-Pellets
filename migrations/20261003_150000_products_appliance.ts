import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Migration : ajoute `appliance` (poêle | insert | foyer | chaudière) à la
 * collection products, pour que le titre de la fiche dise ce qu'est
 * l'appareil. Le type ne le permettait pas : un insert thermo-cheminée y est
 * « hybride-hydro », un foyer « insert », d'où des titres en « Poêle… » ou
 * « Insert… » à tort. Colonne facultative : vide, la nature se déduit du type
 * (lib/product-kind.ts).
 *
 * Renseignée pour les 34 fiches dont le type ne dit pas la nature, d'après
 * les catalogues fabricants (relevé du 03/10/2026, 7 fiches visibles) :
 *  - insert : rubrique « Inserts thermo-cheminée » du catalogue Girolami 2026
 *    (TI et TC Bio Evo 80), typés hybride-hydro ;
 *  - foyer : « cheminées hydro à bois » Girolami TC EVO (typées hydro),
 *    monoblocs à bois Girolami Frame, Alfa et MBS F, foyers à bois Edilkamin
 *    Windo et Blokk (typés insert) ;
 *  - chaudière : Girolami Biotec (« chaudière à granulés », typée hydro).
 * Le `down` retire la colonne et son type.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_products_appliance" AS ENUM(
      'poele',
      'insert',
      'foyer',
      'chaudiere'
    );
  `);

  await db.execute(sql`
    ALTER TABLE "products"
    ADD COLUMN IF NOT EXISTS "appliance" "enum_products_appliance";
  `);

  await db.execute(sql`
    UPDATE "products" SET "appliance" = 'insert'
    WHERE "slug" IN (
      'girolami-tc-bio-evo-80',
      'girolami-ti',
      'girolami-ti-panorama',
      'girolami-ti-plus-26-hybride',
      'girolami-ti-plus-panorama-26',
      'girolami-ti-slim',
      'girolami-ti-slim-panorama'
    );
  `);

  await db.execute(sql`
    UPDATE "products" SET "appliance" = 'foyer'
    WHERE "slug" IN (
      'girolami-tc-evo',
      'girolami-tc-evo-75-curvo',
      'girolami-tc-evo-75-dx-sx',
      'girolami-tc-evo-plus-80',
      'girolami-alfa',
      'girolami-alfa-double',
      'girolami-frame',
      'girolami-frame-100',
      'girolami-frame-100-dx-sx',
      'girolami-frame-120',
      'girolami-frame-120-dx-sx',
      'girolami-frame-80-dx-sx',
      'girolami-mbs-f',
      'girolami-mbs-f-100',
      'girolami-mbs-f-120',
      'edilkamin-blokk-70-evo',
      'edilkamin-blokk-90-evo',
      'edilkamin-windo-100-evo',
      'edilkamin-windo-120',
      'edilkamin-windo-70-evo',
      'edilkamin-windo-90-evo',
      'edilkamin-windo2-50',
      'edilkamin-windo2-75-evo-r-l',
      'edilkamin-windo2-95-evo-r-l',
      'edilkamin-windo3-50',
      'edilkamin-windo3-85-evo'
    );
  `);

  await db.execute(sql`
    UPDATE "products" SET "appliance" = 'chaudiere'
    WHERE "slug" = 'girolami-biotec';
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products"
    DROP COLUMN IF EXISTS "appliance";
  `);
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_products_appliance";`);
}
