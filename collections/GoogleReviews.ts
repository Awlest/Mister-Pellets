import type { CollectionConfig } from "payload";
import { revalidateGoogleReviewPages } from "../lib/google-reviews-revalidate";

/**
 * Avis Google repris sur le site : ceux de la fiche Google d'Awlest SRL (la
 * société qui exploite Mister Pellets) qui parlent de poêles à pellets.
 *
 * La règle est publiée sur /avis-clients (politique d'avis, SPF Économie) :
 * TOUT avis de la fiche qui parle d'un poêle à pellets va ici, quelle que soit
 * sa note. N'en écarter aucun parce qu'il est négatif : afficher une sélection
 * sans le dire, ou en cachant les avis défavorables, est une pratique
 * commerciale déloyale. Ne jamais saisir un avis qui n'est pas sur Google.
 *
 * Pas d'API Places : les avis sont recopiés à la main (choix de Dorian du
 * 01/11/2026), sans clé ni mise en cache de contenu Google.
 */
export const GoogleReviews: CollectionConfig = {
  slug: "google-reviews",
  labels: { singular: "Avis Google", plural: "Avis Google" },
  // RLS Payload (cf. audit V14.1) : explicite chaque opération. Le site lit
  // les avis par l'API locale, l'API publique n'en a pas besoin.
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: "authorName",
    defaultColumns: ["authorName", "rating", "sortOrder"],
    group: "Contenu",
    description:
      "Avis de la fiche Google d'Awlest qui parlent de poêles à pellets, recopiés tels quels. Règle publiée sur /avis-clients : tout avis de la fiche sur un poêle à pellets va ici, y compris un avis négatif. La note moyenne et le nombre d'avis se changent dans « Note Google ».",
  },
  defaultSort: "sortOrder",
  hooks: {
    afterChange: [() => revalidateGoogleReviewPages()],
    afterDelete: [() => revalidateGoogleReviewPages()],
  },
  fields: [
    {
      name: "authorName",
      type: "text",
      required: true,
      label: "Auteur",
      admin: {
        description:
          "Prénom et initiale du nom, comme « Olivier P. ». Le nom complet reste sur Google.",
      },
    },
    {
      name: "rating",
      type: "number",
      required: true,
      min: 1,
      max: 5,
      defaultValue: 5,
      label: "Note (étoiles)",
    },
    {
      name: "quote",
      type: "textarea",
      required: true,
      label: "Texte de l'avis",
      admin: {
        description: "Recopié tel quel depuis la fiche Google, sans retouche ni coupe.",
      },
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 100,
      label: "Ordre d'affichage",
      admin: {
        description:
          "Les plus petits d'abord. Les trois premiers s'affichent sur l'accueil, la page prix et la prise de rendez-vous ; /avis-clients les montre tous.",
      },
    },
  ],
};
