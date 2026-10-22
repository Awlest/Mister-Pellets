import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Migration : colonnes demandées par Payload 3.90, pour la montée
 * 3.84.1 → 3.91.0 (correctifs de sécurité, 22/10/2026).
 *
 * - `users.reset_password_requested_at` : date de la dernière demande de mot
 *   de passe oublié (Payload limite désormais ces demandes).
 * - `media._objectkey` : dossier propre à chaque fichier envoyé directement
 *   depuis le navigateur. Ajoutée par le greffon de stockage Vercel Blob, donc
 *   seulement quand BLOB_READ_WRITE_TOKEN est défini (prod). Vide pour les
 *   fichiers existants, dont le chemin ne change pas.
 *
 * Relevé en comparant les schémas que Payload 3.84.1 et 3.91.0 construisent
 * pour cette config (drizzle-kit, sans base) : ces deux colonnes, rien d'autre.
 *
 * Purement additive, colonnes facultatives sans valeur par défaut : le code
 * en 3.84.1 ne les lit pas, la migration peut donc passer AVANT le
 * déploiement. L'inverse casse le site : Payload 3.91 lit ces colonnes à
 * chaque requête sur users et media (photos, fiches produit, /admin).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_requested_at" timestamp(3) with time zone;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "_objectkey" varchar;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" DROP COLUMN IF EXISTS "reset_password_requested_at";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "_objectkey";
  `);
}
