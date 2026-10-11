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
 * Ce n'est pas l'optimiseur d'images de Vercel (/_next/image, quota épuisé le
 * 17/09/2026, cf. lib/product-image.ts) : aucun redimensionnement, un seul
 * fichier converti par URL, aucune variante créée à la demande.
 */

/** Nom d'une déclinaison JPEG ou PNG, sans dossier. */
const SOURCE_NAME = /^[^/\\?#]{1,250}\.(?:jpe?g|png)$/i;

/** Même qualité que l'original converti par Payload, un cran en dessous. */
const WEBP_QUALITY = 80;

/** Base des fichiers : Blob public (même règle que @payloadcms/storage-vercel-blob). */
function sourceBase(): string {
  if (process.env.STORAGE_VERCEL_BLOB_BASE_URL) return process.env.STORAGE_VERCEL_BLOB_BASE_URL;
  const storeId = process.env.BLOB_READ_WRITE_TOKEN?.match(/^vercel_blob_rw_([a-z\d]+)_[a-z\d]+$/i)?.[1];
  if (storeId) return `https://${storeId.toLowerCase()}.public.blob.vercel-storage.com`;
  // Sans Blob (poste de développement) : les fichiers de la prod, en lecture.
  return "https://mister-pellets.be/api/media/file";
}

export async function GET(request: Request, { params }: { params: Promise<{ file: string }> }) {
  const url = new URL(request.url);
  // Une seule URL par photo : un paramètre ajouté contournerait le cache du
  // CDN et relancerait une conversion à chaque requête.
  if (url.search) {
    return Response.redirect(new URL(url.pathname, url.origin), 301);
  }

  const raw = (await params).file;
  let name = raw;
  if (raw.includes("%")) {
    try {
      name = decodeURIComponent(raw);
    } catch {
      return notFound();
    }
  }
  if (!name.endsWith(".webp")) return notFound();
  const source = name.slice(0, -".webp".length);
  if (!SOURCE_NAME.test(source)) return notFound();

  const sourceUrl = `${sourceBase()}/${encodeURIComponent(source)}`;
  let upstream: Response;
  try {
    upstream = await fetch(sourceUrl, { cache: "no-store" });
  } catch {
    return new Response("Source indisponible", { status: 502, headers: { "Cache-Control": "no-store" } });
  }
  if (upstream.status === 404) return notFound();
  if (!upstream.ok) {
    return new Response("Source indisponible", { status: 502, headers: { "Cache-Control": "no-store" } });
  }

  try {
    // Import dynamique : si sharp ne se chargeait pas, la photo d'origine est
    // servie (catch plus bas) au lieu d'une erreur sur toutes les photos.
    const { default: sharp } = await import("sharp");
    const input = Buffer.from(await upstream.arrayBuffer());
    const webp = await sharp(input).webp({ quality: WEBP_QUALITY }).toBuffer();
    return new Response(new Uint8Array(webp), {
      headers: {
        "Content-Type": "image/webp",
        "Content-Length": String(webp.length),
        // Le nom de fichier change à chaque envoi (Payload le rend unique) :
        // la réponse ne change jamais, elle peut rester un an en cache.
        "Cache-Control": "public, max-age=31536000, immutable",
        "CDN-Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    // Conversion impossible (ou sharp absent) : la photo d'origine plutôt
    // qu'une image cassée.
    return new Response(null, {
      status: 307,
      headers: {
        Location: `/api/media/file/${encodeURIComponent(source)}`,
        "Cache-Control": "no-store",
      },
    });
  }
}

function notFound(): Response {
  return new Response("Introuvable", { status: 404, headers: { "Cache-Control": "public, max-age=300" } });
}
