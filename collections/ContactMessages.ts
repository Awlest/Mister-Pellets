import type { CollectionConfig } from "payload";

/**
 * ContactMessages — messages reçus via /contact.
 * Plus simple que Quotes (qui a 12 champs spécifiques au form 6 étapes).
 */
export const ContactMessages: CollectionConfig = {
  slug: "contact-messages",
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user), // REST public verrouillé ; création via /api/contact (Local API)
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "subject", "status", "createdAt"],
    group: "Leads",
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true, admin: { width: "33%" } },
        { name: "email", type: "email", required: true, admin: { width: "33%" } },
        { name: "phone", type: "text", admin: { width: "33%" } },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "subject",
          type: "select",
          required: true,
          options: [
            { label: "Question produit", value: "info-produit" },
            { label: "Pose / installation", value: "info-pose" },
            { label: "Primes Wallonie", value: "info-primes" },
            { label: "Entretien", value: "info-entretien" },
            { label: "Autre", value: "info-other" },
          ],
          admin: { width: "67%" },
        },
        {
          name: "status",
          type: "select",
          required: true,
          defaultValue: "new",
          options: [
            { label: "Nouveau", value: "new" },
            { label: "Répondu", value: "replied" },
            { label: "Archivé", value: "archived" },
          ],
          admin: { width: "33%" },
        },
      ],
    },
    {
      name: "message",
      type: "textarea",
      required: true,
    },
  ],
};
