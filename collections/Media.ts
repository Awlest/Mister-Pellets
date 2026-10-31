import type { CollectionConfig } from "payload";
import { squareCutout } from "../lib/detoure-carre";

/** Déclinaisons en WebP, même qualité que la conversion à la volée (app/photos). */
const WEBP_SIZE = { format: "webp", options: { quality: 80 } } as const;

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
  hooks: {
    // Détouré non carré remis au carré avant que Payload ne calcule les
    // tailles (cf. lib/detoure-carre.ts) : le poêle reste entier dans les
    // vignettes et cartes carrées. beforeOperation passe avant la lecture du
    // fichier ; une erreur laisse la photo telle quelle.
    beforeOperation: [
      async ({ args, operation, req }) => {
        const file = req.file;
        const sharp = req.payload.config.sharp;
        if ((operation !== "create" && operation !== "update") || !file || !sharp) return args;
        if (!/^image\/(jpeg|png|webp)$/.test(file.mimetype)) return args;
        try {
          const input = file.tempFilePath
            ? await (await import("node:fs/promises")).readFile(file.tempFilePath)
            : file.data;
          const squared = await squareCutout(sharp as Parameters<typeof squareCutout>[0], input);
          if (squared) {
            req.file = { ...file, data: squared.buffer, size: squared.buffer.length, tempFilePath: undefined };
            req.payload.logger.info(
              `media : détouré ${squared.from.width}x${squared.from.height} mis au carré (${squared.side} px)`,
            );
          }
        } catch (err) {
          req.payload.logger.warn(`media : mise au carré ignorée (${err instanceof Error ? err.message : "erreur"})`);
        }
        return args;
      },
    ],
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
    // Active le sélecteur visuel de point focal dans l'admin. Les valeurs
    // focalX/focalY (0-100 %) sont stockées sur le doc Media et utilisées
    // côté frontend pour positionner l'image dans la carte boutique et la
    // galerie produit (CSS object-position).
    focalPoint: true,
    // Chaque taille porte son propre formatOptions : celui du bas ne convertit
    // que l'original. Jusqu'au 11/10/2026, les tailles sortaient au format
    // d'entrée (1 790 JPEG et 20 PNG pour 583 originaux WebP) ; les anciennes
    // sont converties à la volée par app/photos/[file]/route.ts.
    imageSizes: [
      { name: "thumbnail", width: 200, height: 200, position: "centre", formatOptions: WEBP_SIZE },
      { name: "card",      width: 400, formatOptions: WEBP_SIZE },
      { name: "display",   width: 800, formatOptions: WEBP_SIZE },
      { name: "full",      width: 1600, formatOptions: WEBP_SIZE },
    ],
    formatOptions: {
      format: "webp",
      options: { quality: 85 },
    },
  },
};
