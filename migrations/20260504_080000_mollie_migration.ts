import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Migration : remplace stripe_payment_intent_id + stripe_checkout_session_id
 * par mollie_payment_id sur la table orders (V1.6 — migration Stripe vers
 * Mollie pour profiter du forfait Bancontact 0,39 €).
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. Ajouter la nouvelle colonne mollie_payment_id (nullable, le temps de
  // la migration des données existantes)
  await db.execute(sql`
    ALTER TABLE "orders"
    ADD COLUMN IF NOT EXISTS "mollie_payment_id" varchar;
  `);

  // 2. Optionnel : copier stripe_payment_intent_id dans mollie_payment_id
  // pour préserver les commandes existantes (même si format différent, c'est
  // un identifiant historique, ne sert plus à appeler Mollie).
  // Désactivé par défaut car les commandes Stripe sont historiques et n'ont
  // pas besoin d'être migrées (pas de re-paiement possible).
  // await db.execute(sql`
  //   UPDATE "orders" SET "mollie_payment_id" = "stripe_payment_intent_id"
  //   WHERE "stripe_payment_intent_id" IS NOT NULL;
  // `);

  // 3. Supprimer les anciennes colonnes Stripe
  await db.execute(sql`
    ALTER TABLE "orders"
    DROP COLUMN IF EXISTS "stripe_payment_intent_id",
    DROP COLUMN IF EXISTS "stripe_checkout_session_id";
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Rollback : restaurer les colonnes Stripe (sans données)
  await db.execute(sql`
    ALTER TABLE "orders"
    ADD COLUMN IF NOT EXISTS "stripe_payment_intent_id" varchar,
    ADD COLUMN IF NOT EXISTS "stripe_checkout_session_id" varchar,
    DROP COLUMN IF EXISTS "mollie_payment_id";
  `);
}
