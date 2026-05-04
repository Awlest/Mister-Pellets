import type { CollectionConfig } from "payload";

/**
 * Products — collection des poêles à pellets distribués.
 * Phase 5 : schéma riche pour les 61 produits Wix à importer.
 *
 * Convention slug : {marque}-{modèle}-{puissance}kw-{type?}
 *   ex: edilkamin-blade-9kw, ek63-tweed-90, dielle-iride-22-hydro
 */
export const Products: CollectionConfig = {
  slug: "products",
  // RLS Payload (cf. audit V14.1) : explicite chaque opération.
  access: {
    read: () => true, // public (la boutique consulte le catalogue)
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "brand", "power", "priceTTC", "stockStatus", "isBestseller"],
    listSearchableFields: ["name", "sku", "slug", "brand"],
    group: "Boutique",
  },
  fields: [
    // ===== IDENTIFIANTS =====
    {
      type: "row",
      fields: [
        {
          name: "sku",
          type: "text",
          required: true,
          unique: true,
          admin: { width: "33%", description: "Référence interne unique" },
        },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
          admin: { width: "67%", description: "URL : /produit/{slug}/" },
        },
      ],
    },

    // ===== IDENTITÉ =====
    {
      name: "name",
      type: "text",
      required: true,
      admin: { description: "Nom commercial complet (ex: Edilkamin Blade Plus 9 kW)" },
    },
    {
      type: "row",
      fields: [
        {
          name: "brand",
          type: "select",
          required: true,
          options: [
            { label: "Edilkamin", value: "Edilkamin" },
            { label: "EK63", value: "EK63" },
            { label: "Dielle", value: "Dielle" },
            { label: "Ferlux", value: "Ferlux" },
          ],
          admin: { width: "50%" },
        },
        {
          name: "model",
          type: "text",
          required: true,
          admin: { width: "50%", description: "ex: Blade Plus, Tweed 90+, Iride 22" },
        },
      ],
    },
    {
      name: "productType",
      type: "select",
      required: true,
      options: [
        { label: "Air pulsé", value: "air" },
        { label: "Canalisable", value: "canalisable" },
        { label: "Hydro", value: "hydro" },
        { label: "Hybride", value: "hybride" },
        { label: "Insert encastrable", value: "insert" },
      ],
    },

    // ===== PRIX =====
    {
      type: "row",
      fields: [
        {
          name: "priceHT",
          type: "number",
          required: true,
          admin: { width: "33%", description: "Prix HTVA (€)" },
        },
        {
          name: "priceTTC",
          type: "number",
          required: true,
          admin: { width: "33%", description: "Prix TTC (€) — TVA 21%" },
        },
        {
          name: "promoPrice",
          type: "number",
          admin: { width: "33%", description: "Prix promo TTC (optionnel)" },
        },
      ],
    },
    {
      name: "installationPrice",
      type: "number",
      admin: { description: "Prix pose typique (€) — TVA 6%" },
    },

    // ===== CARACTÉRISTIQUES TECHNIQUES =====
    {
      type: "row",
      fields: [
        {
          name: "power",
          type: "number",
          required: true,
          admin: { width: "25%", description: "Puissance (kW)" },
        },
        {
          name: "surfaceMin",
          type: "number",
          admin: { width: "25%", description: "Surface min (m²)" },
        },
        {
          name: "surfaceMax",
          type: "number",
          admin: { width: "25%", description: "Surface max (m²)" },
        },
        {
          name: "efficiency",
          type: "number",
          admin: { width: "25%", description: "Rendement (%)" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "energyClass",
          type: "select",
          options: [
            { label: "A++", value: "A++" },
            { label: "A+", value: "A+" },
            { label: "A", value: "A" },
            { label: "B", value: "B" },
            { label: "C", value: "C" },
          ],
          admin: { width: "25%" },
        },
        {
          name: "emissions",
          type: "number",
          admin: { width: "25%", description: "Émissions CO (mg/m³)" },
        },
        {
          name: "hopperCapacity",
          type: "number",
          admin: { width: "25%", description: "Réservoir pellets (kg)" },
        },
        {
          name: "weight",
          type: "number",
          admin: { width: "25%", description: "Poids (kg)" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "isAirtight",
          type: "checkbox",
          label: "Étanche (BBC compatible)",
          admin: { width: "25%" },
        },
        {
          name: "isCanalizable",
          type: "checkbox",
          label: "Canalisable",
          admin: { width: "25%" },
        },
        {
          name: "isHydro",
          type: "checkbox",
          label: "Hydro (chauffage central)",
          admin: { width: "25%" },
        },
        {
          name: "isConnected",
          type: "checkbox",
          label: "Connecté (WiFi)",
          admin: { width: "25%" },
        },
      ],
    },
    {
      name: "dimensions",
      type: "group",
      admin: { description: "Dimensions externes (cm)" },
      fields: [
        {
          type: "row",
          fields: [
            { name: "width",  type: "number", admin: { width: "33%" } },
            { name: "height", type: "number", admin: { width: "33%" } },
            { name: "depth",  type: "number", admin: { width: "33%" } },
          ],
        },
      ],
    },

    // ===== GOOGLE MERCHANT =====
    {
      type: "row",
      fields: [
        {
          name: "gtin",
          type: "text",
          admin: { width: "50%", description: "Code-barres EAN (optionnel mais recommandé Merchant)" },
        },
        {
          name: "mpn",
          type: "text",
          admin: { width: "50%", description: "Référence fabricant (Merchant required si pas de GTIN)" },
        },
      ],
    },
    {
      name: "googleProductCategory",
      type: "text",
      defaultValue: "Home & Garden > Household Appliances > Heating > Pellet Stoves",
      admin: { description: "Taxonomie Google Merchant" },
    },

    // ===== MÉDIAS =====
    {
      name: "mainImage",
      type: "upload",
      relationTo: "media",
      admin: { description: "Photo principale (carrée idéale 1200×1200)" },
    },
    {
      name: "galleryImages",
      type: "array",
      labels: { singular: "Image", plural: "Galerie" },
      maxRows: 8,
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
      ],
    },

    // ===== CONTENU RÉDACTIONNEL =====
    {
      name: "shortDescription",
      type: "textarea",
      maxLength: 200,
      admin: { description: "1-2 lignes pour les cards (max 200 chars)" },
    },
    {
      name: "description",
      type: "richText",
      admin: { description: "Description longue éditable (markdown rich text)" },
    },
    {
      name: "features",
      type: "array",
      labels: { singular: "Point fort", plural: "Points forts" },
      maxRows: 6,
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              admin: { width: "40%" },
            },
            {
              name: "description",
              type: "text",
              required: true,
              admin: { width: "60%" },
            },
          ],
        },
      ],
    },
    {
      name: "technicalSheet",
      type: "upload",
      relationTo: "media",
      admin: { description: "Fiche technique PDF (optionnel)" },
    },

    // ===== SEO =====
    {
      type: "row",
      fields: [
        {
          name: "metaTitle",
          type: "text",
          maxLength: 70,
          admin: { width: "50%", description: "max 70 chars" },
        },
        {
          name: "metaDescription",
          type: "textarea",
          maxLength: 160,
          admin: { width: "50%", description: "max 160 chars" },
        },
      ],
    },

    // ===== STOCK & DISPONIBILITÉ =====
    {
      type: "row",
      fields: [
        {
          name: "stock",
          type: "number",
          defaultValue: 0,
          admin: { width: "33%" },
        },
        {
          name: "stockStatus",
          type: "select",
          required: true,
          defaultValue: "in_stock",
          options: [
            { label: "En stock", value: "in_stock" },
            { label: "Sur commande", value: "on_order" },
            { label: "Rupture temporaire", value: "out_of_stock" },
            { label: "Discontinué", value: "discontinued" },
          ],
          admin: { width: "33%" },
        },
        {
          name: "deliveryDelay",
          type: "text",
          defaultValue: "48-72h",
          admin: { width: "33%", description: "ex: 48-72h, 4-6 sem." },
        },
      ],
    },

    // ===== MARKETING =====
    {
      type: "row",
      fields: [
        {
          name: "isBestseller",
          type: "checkbox",
          label: "Best-seller",
          admin: { width: "33%" },
        },
        {
          name: "isFeatured",
          type: "checkbox",
          label: "Mis en avant",
          admin: { width: "33%" },
        },
        {
          name: "isNew",
          type: "checkbox",
          label: "Nouveau",
          admin: { width: "33%" },
        },
      ],
    },
  ],
};
