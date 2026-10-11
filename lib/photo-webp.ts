import { createHash } from "node:crypto";

/**
 * Conversion WebP des anciennes déclinaisons JPEG et PNG (route /photos/…),
 * avec une copie gardée dans le Blob.
 *
 * Le CDN de Vercel vide son cache à chaque déploiement : sans copie, chaque
 * mise en ligne relançait la conversion de chaque photo à sa première vue
 * (0,2 à 0,6 s de plus, constaté le 11/10/2026). La copie est relue au lieu
 * d'être recalculée.
 *
 * Son nom contient l'empreinte de la source (ETag lu par une requête HEAD) :
 * une source remplacée donne une autre copie, une source supprimée répond 404
 * avant toute lecture de copie, rien d'obsolète n'est servi.
 *
 * Logique sans dépendance à Next ni au SDK Blob : la route fournit fetch, la
 * conversion, l'écriture et after(), ce qui permet de la tester hors serveur.
 */

/** Même qualité que l'original converti par Payload, un cran en dessous. */
export const WEBP_QUALITY = 80;

/**
 * Dossier des copies dans le Blob. À changer (v2…) si la conversion change
 * (qualité, format) : les anciennes copies ne seront alors plus lues.
 */
export const STORE_PREFIX = "photos-webp/v1/";

/** Nom d'une déclinaison JPEG ou PNG, sans dossier. */
const SOURCE_NAME = /^[^/\\?#]{1,250}\.(?:jpe?g|png)$/i;

/** Délai des requêtes ajoutées (empreinte, copie) : au-delà, on convertit. */
const STORE_TIMEOUT_MS = 5000;

const IMMUTABLE = "public, max-age=31536000, immutable";

export interface PhotoDeps {
  fetch: typeof fetch;
  /** JPEG ou PNG vers WebP. Peut lever (sharp absent) : l'original est alors servi. */
  convert: (input: Buffer) => Promise<Buffer>;
  /** Range une copie dans le Blob. Absent sans jeton Blob (poste de développement). */
  store?: (pathname: string, webp: Buffer) => Promise<void>;
  /** Lance une tâche après l'envoi de la réponse (after() de Next). */
  later: (task: () => Promise<void>) => void;
}

/** Nom de la source à partir du segment d'URL (« x.jpg.webp »), ou null. */
export function parsePhotoName(raw: string): string | null {
  let name = raw;
  if (raw.includes("%")) {
    try {
      name = decodeURIComponent(raw);
    } catch {
      return null;
    }
  }
  if (!name.endsWith(".webp")) return null;
  const source = name.slice(0, -".webp".length);
  return SOURCE_NAME.test(source) ? source : null;
}

/**
 * Chemin de la copie dans le Blob : caractères sûrs seulement (l'URL publique
 * s'en déduit sans encodage), empreinte de la source à la fin.
 */
export function storedPathname(source: string, fingerprint: string): string {
  const digest = createHash("sha256").update(`${source}\n${fingerprint}`).digest("hex").slice(0, 16);
  const readable = source
    .replace(/\.(?:jpe?g|png)$/i, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${STORE_PREFIX}${readable}-${digest}.webp`;
}

/**
 * Empreinte de la source : ETag, ou taille et date à défaut.
 * "missing" si la source n'existe plus, null si on ne peut pas la lire.
 */
async function sourceFingerprint(url: string, fetchFn: typeof fetch): Promise<string | "missing" | null> {
  let res: Response;
  try {
    res = await fetchFn(url, { method: "HEAD", cache: "no-store", signal: AbortSignal.timeout(STORE_TIMEOUT_MS) });
  } catch {
    return null;
  }
  if (res.status === 404) return "missing";
  if (!res.ok) return null;
  const etag = res.headers.get("etag")?.replace(/^W\//, "").replace(/"/g, "");
  if (etag) return etag;
  const length = res.headers.get("content-length");
  const modified = res.headers.get("last-modified");
  return length && modified ? `${length}|${modified}` : null;
}

export async function servePhoto(source: string, base: string, deps: PhotoDeps): Promise<Response> {
  const sourceUrl = `${base}/${encodeURIComponent(source)}`;

  // Copie déjà rangée ? Seulement quand on sait ranger : sans jeton Blob, la
  // base est l'API de fichiers de Payload, qui ne connaît pas les copies.
  let pathname: string | null = null;
  if (deps.store) {
    const fingerprint = await sourceFingerprint(sourceUrl, deps.fetch);
    if (fingerprint === "missing") return notFound();
    if (fingerprint) {
      pathname = storedPathname(source, fingerprint);
      let stored: Response | null = null;
      try {
        stored = await deps.fetch(`${base}/${pathname}`, {
          cache: "no-store",
          signal: AbortSignal.timeout(STORE_TIMEOUT_MS),
        });
      } catch {
        stored = null;
      }
      if (stored?.ok && stored.body) {
        // Corps décompressé par fetch si le Blob l'a compressé : la taille
        // annoncée ne serait plus la bonne.
        const length = stored.headers.get("content-encoding") ? null : stored.headers.get("content-length");
        return webpResponse(stored.body, length, "stored");
      }
      // Blob en difficulté (autre chose qu'un 404) : on convertit sans écrire.
      if (stored?.status !== 404) pathname = null;
    }
  }

  let upstream: Response;
  try {
    upstream = await deps.fetch(sourceUrl, { cache: "no-store" });
  } catch {
    return unavailable();
  }
  if (upstream.status === 404) return notFound();
  if (!upstream.ok) return unavailable();

  try {
    const webp = await deps.convert(Buffer.from(await upstream.arrayBuffer()));
    const store = deps.store;
    if (store && pathname) {
      const target = pathname;
      // Après la réponse : le visiteur n'attend pas l'écriture dans le Blob.
      deps.later(() => store(target, webp));
    }
    return webpResponse(new Uint8Array(webp), String(webp.length), "converted");
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

function webpResponse(
  body: ReadableStream<Uint8Array> | Uint8Array,
  length: string | null,
  origin: "stored" | "converted",
): Response {
  const headers = new Headers({
    "Content-Type": "image/webp",
    // Le nom de fichier change à chaque envoi (Payload le rend unique) :
    // la réponse ne change jamais, elle peut rester un an en cache.
    "Cache-Control": IMMUTABLE,
    "CDN-Cache-Control": IMMUTABLE,
    // Copie relue ou conversion du moment : pour le contrôle après déploiement.
    "X-Photo-Source": origin,
  });
  if (length) headers.set("Content-Length", length);
  return new Response(body as BodyInit, { headers });
}

function unavailable(): Response {
  return new Response("Source indisponible", { status: 502, headers: { "Cache-Control": "no-store" } });
}

export function notFound(): Response {
  return new Response("Introuvable", { status: 404, headers: { "Cache-Control": "public, max-age=300" } });
}
