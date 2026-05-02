import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');
  CREATE TYPE "public"."enum_orders_fulfillment_status" AS ENUM('new', 'processing', 'shipped', 'delivered', 'cancelled');
  CREATE TYPE "public"."enum_quotes_delay" AS ENUM('asap', '1-3-mois', '3-6-mois', '+6-mois');
  CREATE TYPE "public"."enum_quotes_status" AS ENUM('new', 'contacted', 'quoted', 'won', 'lost');
  CREATE TYPE "public"."enum_quotes_surface" AS ENUM('moins-80', '80-120', '120-180', '180-plus');
  CREATE TYPE "public"."enum_quotes_peb" AS ENUM('A', 'B', 'C', 'D', 'E', 'F', 'G', 'ne-sais-pas');
  CREATE TYPE "public"."enum_quotes_chimney" AS ENUM('diam-80', 'diam-100', 'aucune', 'ne-sais-pas');
  CREATE TYPE "public"."enum_quotes_style" AS ENUM('moderne', 'classique', 'rustique', 'design', 'scandinave', 'peu-importe');
  CREATE TYPE "public"."enum_quotes_budget" AS ENUM('moins-3000', '3000-5000', '5000-7500', '7500-plus');
  CREATE TYPE "public"."enum_contact_messages_subject" AS ENUM('info-produit', 'info-pose', 'info-primes', 'info-entretien', 'info-other');
  CREATE TYPE "public"."enum_contact_messages_status" AS ENUM('new', 'replied', 'archived');
  CREATE TABLE "orders_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_slug" varchar NOT NULL,
  	"product_name" varchar NOT NULL,
  	"product_brand" varchar,
  	"quantity" numeric DEFAULT 1 NOT NULL,
  	"unit_price" numeric NOT NULL,
  	"total_price" numeric NOT NULL
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order_number" varchar NOT NULL,
  	"customer_name" varchar NOT NULL,
  	"customer_email" varchar NOT NULL,
  	"customer_phone" varchar,
  	"customer_address" varchar,
  	"subtotal" numeric NOT NULL,
  	"vat" numeric NOT NULL,
  	"shipping" numeric DEFAULT 0,
  	"total" numeric NOT NULL,
  	"payment_status" "enum_orders_payment_status" DEFAULT 'pending' NOT NULL,
  	"fulfillment_status" "enum_orders_fulfillment_status" DEFAULT 'new' NOT NULL,
  	"stripe_payment_intent_id" varchar,
  	"stripe_checkout_session_id" varchar,
  	"notes" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "quotes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"postal_code" varchar NOT NULL,
  	"delay" "enum_quotes_delay" NOT NULL,
  	"status" "enum_quotes_status" DEFAULT 'new' NOT NULL,
  	"surface" "enum_quotes_surface" NOT NULL,
  	"peb" "enum_quotes_peb" NOT NULL,
  	"chimney" "enum_quotes_chimney" NOT NULL,
  	"style" "enum_quotes_style" NOT NULL,
  	"budget" "enum_quotes_budget" NOT NULL,
  	"message" varchar,
  	"internal_notes" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contact_messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"subject" "enum_contact_messages_subject" NOT NULL,
  	"status" "enum_contact_messages_status" DEFAULT 'new' NOT NULL,
  	"message" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "orders_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "quotes_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "contact_messages_id" integer;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "orders_items_order_idx" ON "orders_items" USING btree ("_order");
  CREATE INDEX "orders_items_parent_id_idx" ON "orders_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE INDEX "quotes_updated_at_idx" ON "quotes" USING btree ("updated_at");
  CREATE INDEX "quotes_created_at_idx" ON "quotes" USING btree ("created_at");
  CREATE INDEX "contact_messages_updated_at_idx" ON "contact_messages" USING btree ("updated_at");
  CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quotes_fk" FOREIGN KEY ("quotes_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_messages_fk" FOREIGN KEY ("contact_messages_id") REFERENCES "public"."contact_messages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_quotes_id_idx" ON "payload_locked_documents_rels" USING btree ("quotes_id");
  CREATE INDEX "payload_locked_documents_rels_contact_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_messages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quotes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_messages" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "orders_items" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "quotes" CASCADE;
  DROP TABLE "contact_messages" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_orders_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_quotes_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_contact_messages_fk";
  
  DROP INDEX "payload_locked_documents_rels_orders_id_idx";
  DROP INDEX "payload_locked_documents_rels_quotes_id_idx";
  DROP INDEX "payload_locked_documents_rels_contact_messages_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "orders_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "quotes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "contact_messages_id";
  DROP TYPE "public"."enum_orders_payment_status";
  DROP TYPE "public"."enum_orders_fulfillment_status";
  DROP TYPE "public"."enum_quotes_delay";
  DROP TYPE "public"."enum_quotes_status";
  DROP TYPE "public"."enum_quotes_surface";
  DROP TYPE "public"."enum_quotes_peb";
  DROP TYPE "public"."enum_quotes_chimney";
  DROP TYPE "public"."enum_quotes_style";
  DROP TYPE "public"."enum_quotes_budget";
  DROP TYPE "public"."enum_contact_messages_subject";
  DROP TYPE "public"."enum_contact_messages_status";`)
}
