import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Migration : adapte la collection products pour matcher la taxonomie V1.3
 * - productType : `air` → `standard` (ce qu'EST le poêle, pas comment il diffuse)
 * - Ajoute `diffusion` (ventilation-forcee | convection-naturelle)
 * - Ajoute `color` (light | dark | natural)
 *
 * Phase 5 : préparation seed depuis lib/products-demo.ts vers Payload CMS.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. Renommer 'air' en 'standard' dans l'enum existant.
  // Postgres ≥ 10 supporte RENAME VALUE. Aucune donnée à migrer car la table
  // products est vide à ce stade (le seed n'a pas encore été lancé).
  await db.execute(sql`
    ALTER TYPE "public"."enum_products_product_type"
    RENAME VALUE 'air' TO 'standard';
  `);

  // 2. Créer les nouveaux enums diffusion + color.
  await db.execute(sql`
    CREATE TYPE "public"."enum_products_diffusion" AS ENUM(
      'ventilation-forcee',
      'convection-naturelle'
    );
  `);

  await db.execute(sql`
    CREATE TYPE "public"."enum_products_color" AS ENUM(
      'light',
      'dark',
      'natural'
    );
  `);

  // 3. Ajouter les colonnes (NOT NULL avec defaults — la table est vide, donc OK).
  await db.execute(sql`
    ALTER TABLE "products"
    ADD COLUMN IF NOT EXISTS "diffusion" "enum_products_diffusion" NOT NULL DEFAULT 'ventilation-forcee',
    ADD COLUMN IF NOT EXISTS "color"     "enum_products_color"     NOT NULL DEFAULT 'dark';
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Retire les colonnes
  await db.execute(sql`
    ALTER TABLE "products"
    DROP COLUMN IF EXISTS "diffusion",
    DROP COLUMN IF EXISTS "color";
  `);

  // Drop les enums
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_products_diffusion";`);
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_products_color";`);

  // Revert 'standard' → 'air'
  await db.execute(sql`
    ALTER TYPE "public"."enum_products_product_type"
    RENAME VALUE 'standard' TO 'air';
  `);
}
