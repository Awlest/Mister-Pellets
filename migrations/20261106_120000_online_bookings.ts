import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Migration : collection `online-bookings`, trace des réservations en ligne
 * des dernières 24 heures pour les plafonds de /api/rdv/book (deux rendez-vous
 * par e-mail ou par téléphone, huit pour le site, lib/booking-limits.ts).
 *
 * Purement additive : une table neuve, vide. Aucune colonne dans
 * `payload_locked_documents_rels` : la collection a `lockDocuments: false`.
 * L'ancien code ignore la table, donc la migration peut passer avant le
 * déploiement du code qui s'en sert. Le nouveau code sans la table : la
 * réservation passe sans plafond (erreur journalisée « plafond non vérifié »).
 *
 * Le `down` retire la table et son contenu (empreintes HMAC, aucune donnée
 * lisible du client).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "online_bookings" (
      "id" serial PRIMARY KEY NOT NULL,
      "email_key" varchar,
      "phone_key" varchar,
      "service" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "online_bookings_email_key_idx" ON "online_bookings" USING btree ("email_key");
    CREATE INDEX IF NOT EXISTS "online_bookings_phone_key_idx" ON "online_bookings" USING btree ("phone_key");
    CREATE INDEX IF NOT EXISTS "online_bookings_updated_at_idx" ON "online_bookings" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "online_bookings_created_at_idx" ON "online_bookings" USING btree ("created_at");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "online_bookings" CASCADE;
  `);
}
