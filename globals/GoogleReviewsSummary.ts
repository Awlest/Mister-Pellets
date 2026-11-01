import type { GlobalConfig } from "payload";
import { revalidateGoogleReviewPages } from "../lib/google-reviews-revalidate";

/** Fiche Google d'Awlest SRL, la société qui exploite Mister Pellets. */
export const AWLEST_GOOGLE_PLACE_URL = "https://www.google.com/maps?cid=18162453141568513927";

/**
 * Note moyenne et nombre d'avis de la fiche Google d'Awlest, relevés à la
 * main avec leur date. Mieux vaut un chiffre daté qu'un chiffre inventé : la
 * date du relevé est affichée à côté de la note. Aucune note en étoiles dans
 * les données structurées (voir components/seo/JsonLd.tsx).
 */
export const GoogleReviewsSummary: GlobalConfig = {
  slug: "google-reviews-summary",
  label: "Note Google",
  access: {
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    group: "Contenu",
    description:
      "Note et nombre d'avis affichés sur la fiche Google d'Awlest, tels que Google les montre le jour du relevé. Les reporter avec la date à chaque nouvel avis.",
  },
  hooks: {
    afterChange: [() => revalidateGoogleReviewPages({ withProductPages: true })],
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "rating",
          type: "number",
          required: true,
          min: 1,
          max: 5,
          label: "Note moyenne",
          admin: { width: "33%", step: 0.1, description: "Par exemple 5 ou 4,9." },
        },
        {
          name: "reviewCount",
          type: "number",
          required: true,
          min: 1,
          label: "Nombre d'avis",
          admin: { width: "33%" },
        },
        {
          name: "checkedAt",
          type: "date",
          required: true,
          label: "Relevé le",
          admin: {
            width: "33%",
            date: { pickerAppearance: "dayOnly", displayFormat: "dd/MM/yyyy" },
          },
        },
      ],
    },
    {
      name: "placeUrl",
      type: "text",
      required: true,
      defaultValue: AWLEST_GOOGLE_PLACE_URL,
      label: "Lien vers la fiche Google",
    },
  ],
};
