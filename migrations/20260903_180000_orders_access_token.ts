import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Migration : ajoute la colonne `access_token` sur la table orders.
 *
 * Le champ `accessToken` existait dans la collection Payload et dans le code
 * du checkout depuis la mise en place de Mollie, mais la colonne n'avait
 * jamais été créée en base. Conséquence constatée le 03/09/2026 : TOUTE
 * commande en ligne échouait à l'insertion (« column "access_token" of
 * relation "orders" does not exist ») APRÈS la création du paiement Mollie.
 * Autrement dit un client pouvait être débité sans qu'aucune commande
 * n'existe. Aucune vente en ligne n'a donc jamais pu aboutir.
 *
 * Colonne nullable : les commandes éventuellement présentes avant cette
 * migration n'ont pas de jeton, et la page /commande/[id] refuse simplement
 * l'accès quand le jeton ne correspond pas.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders"
    ADD COLUMN IF NOT EXISTS "access_token" varchar;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders"
    DROP COLUMN IF EXISTS "access_token";
  `);
}
