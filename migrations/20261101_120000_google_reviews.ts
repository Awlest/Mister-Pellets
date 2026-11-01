import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Migration : avis Google repris sur le site (collection `google-reviews`) et
 * note de la fiche (global `google-reviews-summary`), avec leur contenu de
 * départ.
 *
 * Purement additive : deux tables neuves et une colonne neuve dans
 * `payload_locked_documents_rels` (verrou d'édition de l'admin, une colonne
 * par collection). L'ancien code ignore tout ce qui est créé ici, donc la
 * migration peut passer avant le déploiement du code qui s'en sert.
 *
 * Contenu : les 9 avis de la fiche Google d'Awlest qui parlent de poêles à
 * pellets, relevés le 01/11/2026 sur 69 avis (tous à 5 étoiles), recopiés tels
 * quels ; seul le nom est réduit au prénom et à l'initiale, et le « … » que
 * Google ajoute après un texte à émoji n'est pas repris. Les 60 autres parlent
 * de climatisation, de panneaux solaires, de ventilation, ou ne nomment pas
 * l'appareil.
 *
 * Le `down` retire la colonne du verrou, les deux tables et leur contenu
 * (y compris les avis ajoutés depuis dans l'admin).
 */

const REVIEWS: { authorName: string; quote: string; sortOrder: number }[] = [
  {
    authorName: "Olivier P.",
    quote:
      "Nous avons fait appel à Awlest pour l'installation d'un poêle à pellet. Très professionnel, devis et placement rapide.\nÉquipe très sympa et à l'écoute nous sommes 100% satisfait. Je recommande !",
    sortOrder: 10,
  },
  {
    authorName: "T. F.",
    quote:
      "Installation d'un poêle à pellets.\nPonctualité, travail professionnel et propre, suivis tant commercial que technique impeccables. Je les recommande vivement !",
    sortOrder: 20,
  },
  {
    authorName: "Sébastien D.",
    quote:
      "Très content de l’intervention de dépannage d’Awlest pour mon poêle à pellets : prise en charge rapide, service efficace, équipe très professionnelle et super sympa. Merci pour la réactivité, je recommande sans hésiter !!",
    sortOrder: 30,
  },
  {
    authorName: "Hajar L.",
    quote:
      "J’ai fait installer un poêle à pellets et je ne peux que recommander cette entreprise ! Le service a été impeccable du début à la fin. Une équipe professionnelle, à l’écoute, et un travail réalisé avec soin. Je suis ravie de mon installation, tout s’est déroulé parfaitement. Merci encore pour votre sérieux et votre efficacité !",
    sortOrder: 40,
  },
  {
    authorName: "Sunita D.",
    quote:
      "Nous recommandons de A a Z la société Awlest. Imane est d’une gentillesse et d’un professionnalisme exemplaire et toute l’équipe d’installation également. Ils ont effectué un travail impeccable chez nous lors d’une installation de poêle à granulés. Le tout en un temps record, et sans accrocs. Leurs conseils et dynamisme ont fait toute la différence. Nous nous sommes senti en confiance, n’hésitez pas à faire appel à eux!",
    sortOrder: 50,
  },
  {
    authorName: "Alexandra B.",
    quote:
      "Une entreprise à l’écoute des besoins et avec des ressources pour trouver des solutions. Rapidité aussi bien pour le rendez-vous pour le devis que pour l’installation. Une équipe respectueuse, efficace et rapide pour l’installation. Vraiment au top. Je recommande fortement pour toute personne qui souhaite procéder à l’installation d’un poêle à pellets. Reprise de mon ancien système de chauffage hors service sans frais supplémentaires. Beaucoup d’humanité et de compréhension pour l’aspect financier et avec des ressources pour dégager des solutions. Disponible rapidement aussi bien avant que après l’installation pour toutes questions. Un tout grand merci à cette entreprise et à toute son équipe. Au top !",
    sortOrder: 60,
  },
  {
    authorName: "Jeremy S.",
    quote:
      "Placement d’un poêle à pellets edil Kamin, service au top depuis la prise de rdv jusqu’au placement 👌🏼👍",
    sortOrder: 70,
  },
  {
    authorName: "Soumaya L.",
    quote: "Merci beaucoup à Jacques pour les explications, le poêle à pellets chauffe tellement bien 🔥",
    sortOrder: 80,
  },
  {
    authorName: "Sabrine",
    quote: "Super satisfaite de mon poêle à pellets 😍. Équipe et conseils au top!",
    sortOrder: 90,
  },
];

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "google_reviews" (
      "id" serial PRIMARY KEY NOT NULL,
      "author_name" varchar NOT NULL,
      "rating" numeric DEFAULT 5 NOT NULL,
      "quote" varchar NOT NULL,
      "sort_order" numeric DEFAULT 100,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "google_reviews_updated_at_idx" ON "google_reviews" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "google_reviews_created_at_idx" ON "google_reviews" USING btree ("created_at");
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "google_reviews_summary" (
      "id" serial PRIMARY KEY NOT NULL,
      "rating" numeric NOT NULL,
      "review_count" numeric NOT NULL,
      "checked_at" timestamp(3) with time zone NOT NULL,
      "place_url" varchar DEFAULT 'https://www.google.com/maps?cid=18162453141568513927' NOT NULL,
      "updated_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone
    );
  `);

  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "google_reviews_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_google_reviews_fk"
      FOREIGN KEY ("google_reviews_id") REFERENCES "public"."google_reviews"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_google_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("google_reviews_id");
  `);

  for (const review of REVIEWS) {
    await db.execute(sql`
      INSERT INTO "google_reviews" ("author_name", "rating", "quote", "sort_order")
      VALUES (${review.authorName}, 5, ${review.quote}, ${review.sortOrder});
    `);
  }

  // Midi UTC : la forme qu'enregistre un champ date « jour seul » de l'admin.
  await db.execute(sql`
    INSERT INTO "google_reviews_summary" ("rating", "review_count", "checked_at", "updated_at", "created_at")
    VALUES (5, 69, '2026-11-01T12:00:00.000Z', now(), now());
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "payload_locked_documents_rels" WHERE "google_reviews_id" IS NOT NULL;
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_google_reviews_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_google_reviews_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "google_reviews_id";

    DELETE FROM "payload_locked_documents" WHERE "global_slug" = 'google-reviews-summary';
    DROP TABLE IF EXISTS "google_reviews_summary" CASCADE;
    DROP TABLE IF EXISTS "google_reviews" CASCADE;
  `);
}
