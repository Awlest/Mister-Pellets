import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Migration : ajoute le support des déclinaisons de couleur sur les produits.
 *
 * Une variante de couleur contient :
 *   - colorName (ex: "Noir", "Crème")
 *   - colorHex (pour la pastille visuelle)
 *   - gtin (code EAN-13 propre à cette couleur)
 *   - mainImage (override optionnel de la photo principale)
 *   - galleryImages (override optionnel de la galerie)
 *
 * Tables créées :
 *   - products_color_variants : 1 ligne par variante
 *   - products_color_variants_gallery_images : galerie spécifique à une variante
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. Table principale des variantes de couleur
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "products_color_variants" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "color_name" varchar NOT NULL,
      "color_hex" varchar,
      "gtin" varchar,
      "main_image_id" integer,
      CONSTRAINT "products_color_variants_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "products"("id")
        ON DELETE CASCADE,
      CONSTRAINT "products_color_variants_main_image_id_fk"
        FOREIGN KEY ("main_image_id") REFERENCES "media"("id")
        ON DELETE SET NULL
    );
  `);

  // 2. Table de la galerie spécifique à chaque variante
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "products_color_variants_gallery_images" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer NOT NULL,
      CONSTRAINT "products_color_variants_gallery_images_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "products_color_variants"("id")
        ON DELETE CASCADE,
      CONSTRAINT "products_color_variants_gallery_images_image_id_fk"
        FOREIGN KEY ("image_id") REFERENCES "media"("id")
        ON DELETE CASCADE
    );
  `);

  // 3. Index pour les FK et l'ordre
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "products_color_variants_parent_idx"
      ON "products_color_variants" ("_parent_id");
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "products_color_variants_order_idx"
      ON "products_color_variants" ("_order");
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "products_color_variants_main_image_idx"
      ON "products_color_variants" ("main_image_id");
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "products_color_variants_gallery_parent_idx"
      ON "products_color_variants_gallery_images" ("_parent_id");
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "products_color_variants_gallery_image_idx"
      ON "products_color_variants_gallery_images" ("image_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Drop dans l'ordre inverse pour respecter les FKs
  await db.execute(sql`DROP TABLE IF EXISTS "products_color_variants_gallery_images";`);
  await db.execute(sql`DROP TABLE IF EXISTS "products_color_variants";`);
}
