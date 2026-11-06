import type { CollectionConfig } from "payload";
import { canEditLeads, isLoggedIn } from "../lib/access";

/**
 * Sujets du formulaire de contact. La route /api/contact refuse toute autre
 * valeur : le sujet part tel quel dans la notification interne.
 */
export const CONTACT_SUBJECTS = [
  { label: "Question produit", value: "info-produit" },
  { label: "Pose / installation", value: "info-pose" },
  { label: "Primes Wallonie", value: "info-primes" },
  { label: "Entretien", value: "info-entretien" },
  { label: "Autre", value: "info-other" },
];

/**
 * ContactMessages — messages reçus via /contact.
 * Plus simple que Quotes (qui a 12 champs spécifiques au form 6 étapes).
 */
export const ContactMessages: CollectionConfig = {
  slug: "contact-messages",
  // Lecture pour tout compte, écriture refusée au rôle « viewer » (lib/access.ts).
  access: {
    read: isLoggedIn,
    create: canEditLeads, // REST public verrouillé ; création via /api/contact (Local API)
    update: canEditLeads,
    delete: canEditLeads,
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
          options: CONTACT_SUBJECTS,
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
