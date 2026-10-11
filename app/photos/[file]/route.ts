import { after } from "next/server";
import { put } from "@vercel/blob";
import { WEBP_QUALITY, notFound, parsePhotoName, servePhoto } from "@/lib/photo-webp";

/**
 * Déclinaisons de photos servies en WebP : /photos/<fichier source>.webp
 *
 * Payload convertit l'original en WebP à l'envoi, mais jusqu'au 11/10/2026 il
 * générait les tailles affichées par le site (400, 800 et 1 600 px) au format
 * d'entrée : 1 790 fichiers JPEG et 20 PNG dans le Blob. Plutôt que de
 * régénérer tous les médias (réécriture et suppression de fichiers de
 * production), cette route convertit une déclinaison existante en WebP à la
 * première demande ; la réponse est ensuite servie par le CDN pendant un an.
 * Gain mesuré sur des photos du catalogue : 30 % en moyenne (21 à 48 %),
 * 10 à 60 ms de conversion. Les envois postérieurs sont déjà en WebP
 * (collections/Media.ts) et ne passent pas par ici.
 *
 * Le CDN se vide à chaque déploiement : chaque conversion est aussi rangée
 * dans le Blob (dossier photos-webp/), relue ensuite au lieu d'être refaite.
 * Logique et règles de fraîcheur : lib/photo-webp.ts.
 *
 * Ce n'est pas l'optimiseur d'images de Vercel (/_next/image, quota épuisé le
 * 17/09/2026, cf. lib/product-image.ts) : aucun redimensionnement, un seul
 * fichier converti par URL, aucune variante créée à la demande.
 */

/** Base des fichiers : Blob public (même règle que @payloadcms/storage-vercel-blob). */
function sourceBase(): string {
  if (process.env.STORAGE_VERCEL_BLOB_BASE_URL) return process.env.STORAGE_VERCEL_BLOB_BASE_URL;
  const storeId = process.env.BLOB_READ_WRITE_TOKEN?.match(/^vercel_blob_rw_([a-z\d]+)_[a-z\d]+$/i)?.[1];
  if (storeId) return `https://${storeId.toLowerCase()}.public.blob.vercel-storage.com`;
  // Sans Blob (poste de développement) : les fichiers de la prod, en lecture.
  return "https://mister-pellets.be/api/media/file";
}

/** Copie rangée dans le Blob ; un échec ne touche pas la réponse déjà partie. */
async function storeCopy(pathname: string, webp: Buffer): Promise<void> {
  try {
    await put(pathname, webp, {
      access: "public",
      contentType: "image/webp",
      addRandomSuffix: false,
      // Deux premières visites simultanées écrivent le même contenu.
      allowOverwrite: true,
      cacheControlMaxAge: 31536000,
    });
  } catch (error) {
    console.error("[photos] copie WebP non rangée :", error instanceof Error ? error.name : "erreur inconnue");
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ file: string }> }) {
  const url = new URL(request.url);
  // Une seule URL par photo : un paramètre ajouté contournerait le cache du
  // CDN et relancerait une conversion à chaque requête.
  if (url.search) {
    return Response.redirect(new URL(url.pathname, url.origin), 301);
  }

  const source = parsePhotoName((await params).file);
  if (!source) return notFound();

  return servePhoto(source, sourceBase(), {
    fetch,
    convert: async (input) => {
      // Import dynamique : si sharp ne se chargeait pas, la photo d'origine est
      // servie au lieu d'une erreur sur toutes les photos.
      const { default: sharp } = await import("sharp");
      return sharp(input).webp({ quality: WEBP_QUALITY }).toBuffer();
    },
    // Écriture possible seulement avec le jeton du Blob (prod, préversions).
    store: process.env.BLOB_READ_WRITE_TOKEN ? storeCopy : undefined,
    later: (task) => after(task),
  });
}
