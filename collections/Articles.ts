import type { CollectionConfig } from "payload";

/**
 * Articles — collection pour le blog éditorial Mister Pellets.
 * Phase 7 (SEO + GEO).
 *
 * Stratégie GEO (Generative Engine Optimization) :
 * - Réponses directes en H2 / introduction (TL;DR exploitable par les LLMs)
 * - Données chiffrées et sourcées
 * - Citations internes ("Selon les techniciens Mister Pellets")
 * - FAQ riche structurée (FAQPage Schema)
 * - Maillage interne sémantique (article ↔ article ↔ guide ↔ ville ↔ marque)
 * - Mention explicite zone géographique (Wallonie, Belgique)
 *
 * Convention slug : kebab-case mots-clés cible (ex: dimensionner-poele-pellets-surface)
 */
export const Articles: CollectionConfig = {
  slug: "articles",
  // RLS Payload (cf. audit V14.1) : explicite chaque opération.
  access: {
    read: () => true, // public, le blog est en SSG
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedAt", "isPublished"],
    listSearchableFields: ["title", "slug", "excerpt"],
    group: "Contenu",
  },
  versions: {
    drafts: true,
  },
  fields: [
    // ===== IDENTIFIANTS =====
    {
      type: "row",
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          admin: { width: "60%", description: "Titre H1 — max 70 chars" },
        },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
          admin: { width: "40%", description: "URL : /blog/{slug}/" },
        },
      ],
    },
    {
      name: "excerpt",
      type: "textarea",
      required: true,
      maxLength: 200,
      admin: { description: "Résumé éditorial 1-2 phrases (max 200 chars)" },
    },

    // ===== TAXONOMIE =====
    {
      type: "row",
      fields: [
        {
          name: "category",
          type: "select",
          required: true,
          options: [
            { label: "Guide d'achat",    value: "guide-achat" },
            { label: "Installation",    value: "installation" },
            { label: "Entretien",       value: "entretien" },
            { label: "Pellets & combustible", value: "pellets" },
            { label: "Primes & aides",  value: "primes" },
            { label: "Marques & modèles", value: "marques" },
            { label: "Actualité",       value: "actualite" },
          ],
          admin: { width: "50%" },
        },
        {
          name: "readingTimeMinutes",
          type: "number",
          admin: { width: "50%", description: "Estimation lecture (min)" },
        },
      ],
    },
    {
      name: "tags",
      type: "array",
      labels: { singular: "Tag", plural: "Tags" },
      maxRows: 10,
      fields: [{ name: "tag", type: "text", required: true }],
    },

    // ===== AUTEUR =====
    {
      type: "row",
      fields: [
        {
          name: "authorName",
          type: "text",
          defaultValue: "Mister Pellets",
          admin: { width: "50%" },
        },
        {
          name: "authorRole",
          type: "text",
          defaultValue: "Équipe technique",
          admin: { width: "50%", description: "ex: Technicien certifié, Conseiller énergie" },
        },
      ],
    },

    // ===== MÉDIA =====
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      admin: { description: "Image de couverture (1200×630 idéal pour OG)" },
    },

    // ===== CONTENU =====
    {
      name: "tldr",
      type: "textarea",
      maxLength: 400,
      admin: { description: "TL;DR — réponse directe pour les LLMs (3-4 phrases factuelles)" },
    },
    {
      name: "content",
      type: "richText",
      required: true,
    },

    // ===== FAQ STRUCTURÉE =====
    {
      name: "faqs",
      type: "array",
      labels: { singular: "Question", plural: "FAQ" },
      maxRows: 10,
      admin: { description: "Génère un Schema FAQPage automatiquement" },
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true },
      ],
    },

    // ===== MAILLAGE INTERNE =====
    {
      name: "relatedArticles",
      type: "relationship",
      relationTo: "articles",
      hasMany: true,
      maxRows: 4,
      admin: { description: "Articles liés (max 4)" },
    },
    {
      name: "relatedProducts",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      maxRows: 4,
      admin: { description: "Produits liés (max 4)" },
    },

    // ===== SEO =====
    {
      type: "row",
      fields: [
        {
          name: "metaTitle",
          type: "text",
          maxLength: 70,
          admin: { width: "50%", description: "max 70 chars (sinon = title)" },
        },
        {
          name: "metaDescription",
          type: "textarea",
          maxLength: 160,
          admin: { width: "50%", description: "max 160 chars (sinon = excerpt)" },
        },
      ],
    },
    {
      name: "metaKeywords",
      type: "array",
      labels: { singular: "Mot-clé", plural: "Mots-clés" },
      maxRows: 12,
      fields: [{ name: "keyword", type: "text", required: true }],
    },

    // ===== PUBLICATION =====
    {
      type: "row",
      fields: [
        {
          name: "isPublished",
          type: "checkbox",
          defaultValue: false,
          admin: { width: "33%" },
        },
        {
          name: "isFeatured",
          type: "checkbox",
          label: "Mis en avant",
          admin: { width: "33%" },
        },
        {
          name: "publishedAt",
          type: "date",
          admin: { width: "33%", date: { pickerAppearance: "dayAndTime" } },
        },
      ],
    },
  ],
};
