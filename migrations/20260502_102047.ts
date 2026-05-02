import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_brand" AS ENUM('Edilkamin', 'EK63', 'Dielle', 'Ferlux');
  CREATE TYPE "public"."enum_products_product_type" AS ENUM('air', 'canalisable', 'hydro', 'hybride', 'insert');
  CREATE TYPE "public"."enum_products_energy_class" AS ENUM('A++', 'A+', 'A', 'B', 'C');
  CREATE TYPE "public"."enum_products_stock_status" AS ENUM('in_stock', 'on_order', 'out_of_stock', 'discontinued');
  CREATE TABLE "products_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "products_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"sku" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"brand" "enum_products_brand" NOT NULL,
  	"model" varchar NOT NULL,
  	"product_type" "enum_products_product_type" NOT NULL,
  	"price_h_t" numeric NOT NULL,
  	"price_t_t_c" numeric NOT NULL,
  	"promo_price" numeric,
  	"installation_price" numeric,
  	"power" numeric NOT NULL,
  	"surface_min" numeric,
  	"surface_max" numeric,
  	"efficiency" numeric,
  	"energy_class" "enum_products_energy_class",
  	"emissions" numeric,
  	"hopper_capacity" numeric,
  	"weight" numeric,
  	"is_airtight" boolean,
  	"is_canalizable" boolean,
  	"is_hydro" boolean,
  	"is_connected" boolean,
  	"dimensions_width" numeric,
  	"dimensions_height" numeric,
  	"dimensions_depth" numeric,
  	"gtin" varchar,
  	"mpn" varchar,
  	"google_product_category" varchar DEFAULT 'Home & Garden > Household Appliances > Heating > Pellet Stoves',
  	"main_image_id" integer,
  	"short_description" varchar,
  	"description" jsonb,
  	"technical_sheet_id" integer,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"stock" numeric DEFAULT 0,
  	"stock_status" "enum_products_stock_status" DEFAULT 'in_stock' NOT NULL,
  	"delivery_delay" varchar DEFAULT '48-72h',
  	"is_bestseller" boolean,
  	"is_featured" boolean,
  	"is_new" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "products_gallery_images" ADD CONSTRAINT "products_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_gallery_images" ADD CONSTRAINT "products_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_features" ADD CONSTRAINT "products_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_main_image_id_media_id_fk" FOREIGN KEY ("main_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_technical_sheet_id_media_id_fk" FOREIGN KEY ("technical_sheet_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "products_gallery_images_order_idx" ON "products_gallery_images" USING btree ("_order");
  CREATE INDEX "products_gallery_images_parent_id_idx" ON "products_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "products_gallery_images_image_idx" ON "products_gallery_images" USING btree ("image_id");
  CREATE INDEX "products_features_order_idx" ON "products_features" USING btree ("_order");
  CREATE INDEX "products_features_parent_id_idx" ON "products_features" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_sku_idx" ON "products" USING btree ("sku");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_main_image_idx" ON "products" USING btree ("main_image_id");
  CREATE INDEX "products_technical_sheet_idx" ON "products" USING btree ("technical_sheet_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_gallery_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_gallery_images" CASCADE;
  DROP TABLE "products_features" CASCADE;
  DROP TABLE "products" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_products_fk";
  
  DROP INDEX "payload_locked_documents_rels_products_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "products_id";
  DROP TYPE "public"."enum_products_brand";
  DROP TYPE "public"."enum_products_product_type";
  DROP TYPE "public"."enum_products_energy_class";
  DROP TYPE "public"."enum_products_stock_status";`)
}
