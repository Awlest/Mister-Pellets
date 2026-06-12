import type { CollectionConfig } from "payload";
import { randomUUID } from "crypto";

/**
 * Orders — commandes boutique créées par la route /api/checkout (Mollie).
 * Le statut de paiement est finalisé par le webhook Mollie après confirmation.
 */
export const Orders: CollectionConfig = {
  slug: "orders",
  access: {
    read: ({ req }) => Boolean(req.user), // admin uniquement
    // REST public verrouillé : empêche un POST /api/orders direct d'injecter
    // une fausse commande "payée". La création légitime passe par /api/checkout
    // (Local API, overrideAccess) — voir app/api/checkout/route.ts.
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Jeton anti-IDOR : généré une seule fois à la création. Sert de preuve
        // de possession pour la page de confirmation publique /commande/[id].
        if (operation === "create" && !data.accessToken) {
          data.accessToken = randomUUID();
        }
        return data;
      },
    ],
  },
  admin: {
    useAsTitle: "orderNumber",
    defaultColumns: ["orderNumber", "customerEmail", "total", "paymentStatus", "fulfillmentStatus", "createdAt"],
    listSearchableFields: ["orderNumber", "customerEmail", "customerName", "molliePaymentId"],
    group: "Boutique",
  },
  fields: [
    {
      name: "orderNumber",
      type: "text",
      required: true,
      unique: true,
      admin: { description: "ex: MP-2026-00042" },
    },
    {
      type: "row",
      fields: [
        { name: "customerName", type: "text", required: true, admin: { width: "50%" } },
        { name: "customerEmail", type: "email", required: true, admin: { width: "50%" } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "customerPhone", type: "text", admin: { width: "33%" } },
        { name: "customerAddress", type: "textarea", admin: { width: "67%" } },
      ],
    },
    {
      name: "items",
      type: "array",
      labels: { singular: "Article", plural: "Articles" },
      required: true,
      minRows: 1,
      fields: [
        {
          type: "row",
          fields: [
            { name: "productSlug", type: "text", required: true, admin: { width: "33%" } },
            { name: "productName", type: "text", required: true, admin: { width: "33%" } },
            { name: "productBrand", type: "text", admin: { width: "33%" } },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "quantity", type: "number", required: true, defaultValue: 1, admin: { width: "33%" } },
            { name: "unitPrice", type: "number", required: true, admin: { width: "33%", description: "TTC unitaire" } },
            { name: "totalPrice", type: "number", required: true, admin: { width: "33%", description: "TTC total ligne" } },
          ],
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "subtotal", type: "number", required: true, admin: { width: "25%" } },
        { name: "vat", type: "number", required: true, admin: { width: "25%", description: "TVA 21%" } },
        { name: "shipping", type: "number", defaultValue: 0, admin: { width: "25%" } },
        { name: "total", type: "number", required: true, admin: { width: "25%" } },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "paymentStatus",
          type: "select",
          required: true,
          defaultValue: "pending",
          options: [
            { label: "En attente", value: "pending" },
            { label: "Payée", value: "paid" },
            { label: "Échouée", value: "failed" },
            { label: "Remboursée", value: "refunded" },
          ],
          admin: { width: "33%" },
        },
        {
          name: "fulfillmentStatus",
          type: "select",
          required: true,
          defaultValue: "new",
          options: [
            { label: "Nouvelle", value: "new" },
            { label: "En traitement", value: "processing" },
            { label: "Expédiée", value: "shipped" },
            { label: "Livrée", value: "delivered" },
            { label: "Annulée", value: "cancelled" },
          ],
          admin: { width: "33%" },
        },
        {
          // V1.6 : migration Stripe → Mollie. Champ unique pour l'ID
          // payment Mollie (format tr_xxxxxxxxxxxxx).
          name: "molliePaymentId",
          type: "text",
          admin: { width: "33%", readOnly: true, description: "ID payment Mollie (tr_...)" },
        },
      ],
    },
    {
      name: "accessToken",
      type: "text",
      admin: {
        readOnly: true,
        description:
          "Jeton de la page de confirmation client (anti-IDOR). Généré automatiquement, ne pas partager.",
      },
    },
    {
      name: "notes",
      type: "richText",
      admin: { description: "Notes internes (visibles admin uniquement)" },
    },
  ],
};
