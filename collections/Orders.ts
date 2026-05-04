import type { CollectionConfig } from "payload";

/**
 * Orders — commandes boutique reçues via Stripe Checkout.
 * L'item est créé par le webhook Stripe après confirmation de paiement.
 */
export const Orders: CollectionConfig = {
  slug: "orders",
  access: {
    read: ({ req }) => Boolean(req.user), // admin uniquement
    create: () => true, // créé par le webhook (server side)
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
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
      name: "notes",
      type: "richText",
      admin: { description: "Notes internes (visibles admin uniquement)" },
    },
  ],
};
