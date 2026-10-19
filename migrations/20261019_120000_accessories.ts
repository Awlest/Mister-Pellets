import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Migration : collection `accessories` (« Compléments » : thermostat, Wi-Fi,
 * kits de canalisation…) et champ `accessories` des produits (relation
 * hasMany, stockée dans `products_rels` comme les valeurs de variantes).
 *
 * Purement additive : une table neuve, deux types neufs, une colonne neuve
 * dans `products_rels` et dans `payload_locked_documents_rels` (verrou
 * d'édition de l'admin, une colonne par collection). Aucune donnée existante
 * n'est modifiée ; l'ancien code ignore tout ce qui est créé ici, donc la
 * migration peut passer avant le déploiement du code qui s'en sert.
 *
 * Le `down` retire la colonne des deux tables de jointure (et les liens
 * produit → complément avec elle), la table et ses types.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_accessories_brand" AS ENUM(
      'Edilkamin', 'EK63', 'Girolami', 'Dielle', 'Ferlux', 'Austroflamm', 'Cadel'
    );
    CREATE TYPE "public"."enum_accessories_category" AS ENUM(
      'thermostat', 'connectivite', 'canalisation', 'raccordement', 'habillage', 'fonctionnement', 'autre'
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "accessories" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "brand" "enum_accessories_brand" NOT NULL,
      "category" "enum_accessories_category" DEFAULT 'autre' NOT NULL,
      "mpn" varchar,
      "price_h_t" numeric,
      "price_t_t_c" numeric,
      "sku" varchar NOT NULL,
      "description" varchar,
      "tariff_source" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "accessories_sku_idx" ON "accessories" USING btree ("sku");
    CREATE INDEX IF NOT EXISTS "accessories_updated_at_idx" ON "accessories" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "accessories_created_at_idx" ON "accessories" USING btree ("created_at");
  `);

  await db.execute(sql`
    ALTER TABLE "products_rels" ADD COLUMN IF NOT EXISTS "accessories_id" integer;
    ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_accessories_fk"
      FOREIGN KEY ("accessories_id") REFERENCES "public"."accessories"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX IF NOT EXISTS "products_rels_accessories_id_idx" ON "products_rels" USING btree ("accessories_id");
  `);

  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "accessories_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accessories_fk"
      FOREIGN KEY ("accessories_id") REFERENCES "public"."accessories"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_accessories_id_idx" ON "payload_locked_documents_rels" USING btree ("accessories_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "products_rels" WHERE "accessories_id" IS NOT NULL;
    ALTER TABLE "products_rels" DROP CONSTRAINT IF EXISTS "products_rels_accessories_fk";
    DROP INDEX IF EXISTS "products_rels_accessories_id_idx";
    ALTER TABLE "products_rels" DROP COLUMN IF EXISTS "accessories_id";

    DELETE FROM "payload_locked_documents_rels" WHERE "accessories_id" IS NOT NULL;
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_accessories_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_accessories_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "accessories_id";

    DROP TABLE IF EXISTS "accessories" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_accessories_category";
    DROP TYPE IF EXISTS "public"."enum_accessories_brand";
  `);
}
