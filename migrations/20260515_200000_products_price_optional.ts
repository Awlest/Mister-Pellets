import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Migration : rend les colonnes price_h_t et price_t_t_c facultatives.
 *
 * Permet d'encoder des produits « sur devis » (sans prix affiché) — utile
 * pour les nouvelles marques dont la grille tarifaire n'est pas encore
 * disponible (Girolami au 2026-05). Le frontend gère déjà ce cas : la fiche
 * produit et la carte boutique affichent « Sur devis » quand le prix manque.
 *
 * 100% additif côté contrainte (on retire seulement le NOT NULL). Aucune
 * donnée existante modifiée — les 123 produits déjà encodés gardent leur prix.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" ALTER COLUMN "price_h_t" DROP NOT NULL;
  `);
  await db.execute(sql`
    ALTER TABLE "products" ALTER COLUMN "price_t_t_c" DROP NOT NULL;
  `);
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // No-op volontaire : ré-imposer NOT NULL échouerait si des produits
  // « sur devis » (sans prix) ont été encodés entre-temps. Les colonnes
  // restent simplement nullable. Aucun risque pour les données.
}
