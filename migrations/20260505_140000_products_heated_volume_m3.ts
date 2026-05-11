import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Migration : remplace surfaceMin/surfaceMax (m²) par heatedVolumeM3 (m³).
 *
 * Contexte : les catalogues constructeurs (EK63, Edilkamin, Dielle, Ferlux)
 * expriment tous le volume chauffable en m³. À l'import initial, on avait
 * converti volume × 0,40 → surfaceMin et volume × 0,65 → surfaceMax pour
 * fournir une plage en m² à l'UI. L'équipe Awlest préfère saisir directement
 * la donnée m³ depuis le catalogue, sans conversion intermédiaire.
 *
 * Google Merchant n'a pas de champ surface pour les poêles à pellets — donc
 * on peut retirer surfaceMin/Max sans impact SEO.
 *
 * Étapes :
 * 1. Ajouter la colonne heated_volume_m3
 * 2. Backfill : reverse la conversion (volume = surfaceMax / 0,65 arrondi
 *    à la dizaine) pour les produits existants
 * 3. Drop des colonnes surface_min et surface_max
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. Ajouter la colonne heated_volume_m3
  await db.execute(sql`
    ALTER TABLE "products"
    ADD COLUMN IF NOT EXISTS "heated_volume_m3" numeric;
  `);

  // 2. Backfill depuis surface_max (volume = surface_max / 0.65, arrondi à la dizaine)
  await db.execute(sql`
    UPDATE "products"
    SET "heated_volume_m3" = ROUND(("surface_max" / 0.65) / 10) * 10
    WHERE "surface_max" IS NOT NULL
      AND "heated_volume_m3" IS NULL;
  `);

  // 3. Drop des anciennes colonnes (pas utiles pour Google Merchant pour cette
  //    catégorie de produit)
  await db.execute(sql`
    ALTER TABLE "products"
    DROP COLUMN IF EXISTS "surface_min",
    DROP COLUMN IF EXISTS "surface_max";
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Restaure les colonnes surfaceMin/Max et backfill depuis heatedVolumeM3
  await db.execute(sql`
    ALTER TABLE "products"
    ADD COLUMN IF NOT EXISTS "surface_min" numeric,
    ADD COLUMN IF NOT EXISTS "surface_max" numeric;
  `);

  await db.execute(sql`
    UPDATE "products"
    SET
      "surface_min" = ROUND("heated_volume_m3" * 0.40),
      "surface_max" = ROUND("heated_volume_m3" * 0.65)
    WHERE "heated_volume_m3" IS NOT NULL
      AND "surface_max" IS NULL;
  `);

  await db.execute(sql`
    ALTER TABLE "products"
    DROP COLUMN IF EXISTS "heated_volume_m3";
  `);
}
