import type { CollectionConfig } from "payload";

/**
 * Media — gestion centralisée des images, PDFs, vidéos.
 * Stockage local en dev (./media/), à basculer vers S3 (Cellar OVH ou Combell)
 * en prod via @payloadcms/storage-s3 (à ajouter Phase 5).
 */
export const Media: CollectionConfig = {
  slug: "media",
  // RLS Payload (cf. audit V14.1) : explicite chaque opération.
  access: {
    read: () => true, // public (les médias sont servis sur le frontend)
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    defaultColumns: ["filename", "alt", "mimeType", "filesize"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Texte alternatif (accessibilité + SEO)",
    },
    {
      name: "caption",
      type: "text",
      label: "Légende (optionnel)",
    },
  ],
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*", "application/pdf"],
    imageSizes: [
      { name: "thumbnail", width: 200, height: 200, position: "centre" },
      { name: "card",      width: 400 },
      { name: "display",   width: 800 },
      { name: "full",      width: 1600 },
    ],
    formatOptions: {
      format: "webp",
      options: { quality: 85 },
    },
  },
};
