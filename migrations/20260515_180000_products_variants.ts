import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Migration : système de variantes produits multi-axes.
 *
 * Ajoute le schéma générique de variantes décrit dans le brief « Variantes
 * Produits » :
 *   - 2 collections de configuration : variant_option_types (axes) et
 *     variant_option_values (valeurs).
 *   - products.has_variants : active/désactive le mode variantes.
 *   - products_variant_options : array des axes activés par produit.
 *   - products_variants : array des combinaisons réelles (prix/SKU/stock).
 *   - products_rels : table de jointure des relations hasMany imbriquées
 *     (variantOptions.values + variants.optionValues).
 *
 * 100% ADDITIF — ne modifie ni ne supprime aucune colonne ni donnée existante.
 * Le champ `colorVariants` (déclinaisons de couleur simples) reste intact et
 * indépendant.
 *
 * NOTE CONTEXTE : ce schéma a été appliqué une première fois sur la base prod
 * le 2026-05-15 via le mécanisme dev-push de Payload (push désormais désactivé
 * dans payload.config.ts). Cette migration le FORMALISE : toutes les
 * instructions sont idempotentes (IF NOT EXISTS / garde duplicate_object) —
 * donc no-op sur la base prod actuelle, mais reconstruction fidèle sur toute
 * base neuve. Schéma calqué à l'identique sur l'introspection de la prod.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. Types enum (garde duplicate_object → idempotent)
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_variant_option_types_display_mode" AS ENUM('text', 'color', 'icon');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `);
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_products_variants_stock_status" AS ENUM('in_stock', 'on_order', 'out_of_stock');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `);

  // 2. Collection variant_option_types (axes de variation)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "variant_option_types" (
      "id" serial PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "display_mode" "enum_variant_option_types_display_mode" DEFAULT 'text' NOT NULL,
      "sort_order" numeric DEFAULT 100,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `);

  // 3. Collection variant_option_values (valeurs des axes)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "variant_option_values" (
      "id" serial PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "option_type_id" integer NOT NULL,
      "color_hex" varchar,
      "icon_id" integer,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      CONSTRAINT "variant_option_values_option_type_id_variant_option_types_id_fk"
        FOREIGN KEY ("option_type_id") REFERENCES "public"."variant_option_types"("id") ON DELETE SET NULL,
      CONSTRAINT "variant_option_values_icon_id_media_id_fk"
        FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE SET NULL
    );
  `);

  // 4. products.has_variants (interrupteur du mode variantes)
  await db.execute(sql`
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "has_variants" boolean;
  `);

  // 5. products_variant_options (array : axes activés par produit)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "products_variant_options" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "option_type_id" integer,
      CONSTRAINT "products_variant_options_option_type_id_variant_option_types_id"
        FOREIGN KEY ("option_type_id") REFERENCES "public"."variant_option_types"("id") ON DELETE SET NULL,
      CONSTRAINT "products_variant_options_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE CASCADE
    );
  `);

  // 6. products_variants (array : combinaisons réelles)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "products_variants" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "sku" varchar,
      "gtin" varchar,
      "mpn" varchar,
      "price" numeric,
      "sale_price" numeric,
      "stock_status" "enum_products_variants_stock_status" DEFAULT 'in_stock',
      "lead_time_days" numeric,
      "image_id" integer,
      CONSTRAINT "products_variants_image_id_media_id_fk"
        FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE SET NULL,
      CONSTRAINT "products_variants_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE CASCADE
    );
  `);

  // 7. products_rels (jointure des relations hasMany imbriquées :
  //    variantOptions.values + variants.optionValues → variant_option_values)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "products_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "variant_option_values_id" integer,
      CONSTRAINT "products_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE CASCADE,
      CONSTRAINT "products_rels_variant_option_values_fk"
        FOREIGN KEY ("variant_option_values_id") REFERENCES "public"."variant_option_values"("id") ON DELETE CASCADE
    );
  `);

  // 8. Index (FK, ordre, slug unique)
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "variant_option_types_slug_idx" ON "variant_option_types" USING btree ("slug");
    CREATE INDEX IF NOT EXISTS "variant_option_types_updated_at_idx" ON "variant_option_types" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "variant_option_types_created_at_idx" ON "variant_option_types" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "variant_option_values_option_type_idx" ON "variant_option_values" USING btree ("option_type_id");
    CREATE INDEX IF NOT EXISTS "variant_option_values_icon_idx" ON "variant_option_values" USING btree ("icon_id");
    CREATE INDEX IF NOT EXISTS "variant_option_values_updated_at_idx" ON "variant_option_values" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "variant_option_values_created_at_idx" ON "variant_option_values" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "products_variant_options_order_idx" ON "products_variant_options" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "products_variant_options_parent_id_idx" ON "products_variant_options" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "products_variant_options_option_type_idx" ON "products_variant_options" USING btree ("option_type_id");
    CREATE INDEX IF NOT EXISTS "products_variants_order_idx" ON "products_variants" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "products_variants_parent_id_idx" ON "products_variants" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "products_variants_image_idx" ON "products_variants" USING btree ("image_id");
    CREATE INDEX IF NOT EXISTS "products_rels_order_idx" ON "products_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "products_rels_path_idx" ON "products_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "products_rels_variant_option_values_id_idx" ON "products_rels" USING btree ("variant_option_values_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Drop dans l'ordre inverse des dépendances FK. CASCADE pour les index.
  await db.execute(sql`DROP TABLE IF EXISTS "products_rels" CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS "products_variants" CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS "products_variant_options" CASCADE;`);
  await db.execute(sql`ALTER TABLE "products" DROP COLUMN IF EXISTS "has_variants";`);
  await db.execute(sql`DROP TABLE IF EXISTS "variant_option_values" CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS "variant_option_types" CASCADE;`);
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_products_variants_stock_status";`);
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_variant_option_types_display_mode";`);
}
