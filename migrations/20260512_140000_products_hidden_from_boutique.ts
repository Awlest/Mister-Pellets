import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Migration : ajoute la colonne `hidden_from_boutique` (boolean, default false)
 * sur la table products.
 *
 * Permet à l'équipe Awlest de masquer un produit du listing boutique sans
 * le supprimer. La page produit (URL directe /produit/{slug}) reste
 * accessible — le filtrage est uniquement appliqué dans getAllProducts() et
 * getAllProductSlugs() côté Next.js.
 *
 * Default false → tous les produits existants restent visibles, aucun
 * changement de comportement pour les ~125 produits déjà encodés.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products"
    ADD COLUMN IF NOT EXISTS "hidden_from_boutique" boolean NOT NULL DEFAULT false;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products"
    DROP COLUMN IF EXISTS "hidden_from_boutique";
  `);
}
