import type { CollectionConfig } from "payload";
import { canEditLeads, isLoggedIn } from "../lib/access";

/**
 * Réponses possibles du formulaire de devis, une liste par question. La route
 * /api/quote refuse toute autre valeur : ces réponses partent telles quelles
 * dans la notification interne.
 */
export const QUOTE_OPTIONS = {
  delay: [
    { label: "ASAP", value: "asap" },
    { label: "1-3 mois", value: "1-3-mois" },
    { label: "3-6 mois", value: "3-6-mois" },
    { label: "+6 mois", value: "+6-mois" },
  ],
  surface: [
    { label: "Moins de 80 m²", value: "moins-80" },
    { label: "80 à 120 m²", value: "80-120" },
    { label: "120 à 180 m²", value: "120-180" },
    { label: "Plus de 180 m²", value: "180-plus" },
  ],
  peb: ["A", "B", "C", "D", "E", "F", "G", "ne-sais-pas"].map((v) => ({ label: v, value: v })),
  chimney: [
    { label: "Diam. 80 mm", value: "diam-80" },
    { label: "Diam. 100 mm", value: "diam-100" },
    { label: "Aucune", value: "aucune" },
    { label: "Ne sais pas", value: "ne-sais-pas" },
  ],
  style: [
    { label: "Moderne", value: "moderne" },
    { label: "Classique", value: "classique" },
    { label: "Rustique", value: "rustique" },
    { label: "Design", value: "design" },
    { label: "Scandinave", value: "scandinave" },
    { label: "Peu importe", value: "peu-importe" },
  ],
  budget: [
    { label: "Moins de 3 000 €", value: "moins-3000" },
    { label: "3 000 à 5 000 €", value: "3000-5000" },
    { label: "5 000 à 7 500 €", value: "5000-7500" },
    { label: "Plus de 7 500 €", value: "7500-plus" },
  ],
};

/**
 * Quotes — demandes de devis reçues via /demande-de-devis (formulaire 6 étapes).
 */
export const Quotes: CollectionConfig = {
  slug: "quotes",
  // Lecture pour tout compte, écriture refusée au rôle « viewer » (lib/access.ts).
  access: {
    read: isLoggedIn,
    create: canEditLeads, // REST public verrouillé ; création via /api/quote (Local API)
    update: canEditLeads,
    delete: canEditLeads,
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "postalCode", "budget", "status", "createdAt"],
    listSearchableFields: ["name", "email", "phone", "postalCode"],
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
        { name: "postalCode", type: "text", required: true, admin: { width: "33%" } },
        {
          name: "delay",
          type: "select",
          required: true,
          options: QUOTE_OPTIONS.delay,
          admin: { width: "33%" },
        },
        {
          name: "status",
          type: "select",
          required: true,
          defaultValue: "new",
          options: [
            { label: "Nouveau", value: "new" },
            { label: "Contacté", value: "contacted" },
            { label: "Devis envoyé", value: "quoted" },
            { label: "Gagné", value: "won" },
            { label: "Perdu", value: "lost" },
          ],
          admin: { width: "33%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "surface",
          type: "select",
          required: true,
          options: QUOTE_OPTIONS.surface,
          admin: { width: "50%" },
        },
        {
          name: "peb",
          type: "select",
          required: true,
          options: QUOTE_OPTIONS.peb,
          admin: { width: "50%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "chimney",
          type: "select",
          required: true,
          options: QUOTE_OPTIONS.chimney,
          admin: { width: "50%" },
        },
        {
          name: "style",
          type: "select",
          required: true,
          options: QUOTE_OPTIONS.style,
          admin: { width: "50%" },
        },
      ],
    },
    {
      name: "budget",
      type: "select",
      required: true,
      options: QUOTE_OPTIONS.budget,
    },
    {
      name: "message",
      type: "textarea",
    },
    {
      name: "internalNotes",
      type: "richText",
      admin: { description: "Notes internes — historique du suivi commercial" },
    },
  ],
};
