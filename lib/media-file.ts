/**
 * Fichiers de la médiathèque servis sans Payload ni base de données
 * (route /api/media/file/<nom>, app/api/media/file/[filename]/route.ts).
 *
 * Constat du 11/11/2026 : demandés un par un, les fichiers répondaient 200 ;
 * demandés à plusieurs en même temps, hors cache du CDN, une partie répondait
 * 500. La route d'origine de Payload démarre Payload, lit la table `media`
 * (une connexion Postgres) puis interroge l'API du Blob avant de relire le
 * fichier, et cela pour CHAQUE fichier absent du cache. Une page qui affiche
 * trente photos ou une série de fiches techniques ouvre donc autant de
 * lectures en base d'un coup, sur plusieurs instances, et le pooler refuse
 * les connexions en trop.
 *
 * Or ces fichiers sont publics (`access.read` de la collection Media rend
 * `true`) et rangés à la racine d'un Blob public : rien à vérifier en base.
 * Le fichier est donc relu directement dans le Blob, avec les mêmes adresses
 * et le même cache qu'avant. Seuls les noms de fichier de la racine sont
 * servis, comme le faisait déjà la route de Payload ; l'adresse du Blob
 * n'apparaît dans aucune réponse.
 *
 * Logique sans dépendance à Next ni à Payload : la route fournit fetch, ce
 * qui permet de la contrôler hors serveur (scripts/check-securite.ts).
 */

/** Même durée que le greffon de stockage de Payload : un an. */
const CACHE = "public, max-age=31536000";

/** Délai pour obtenir les en-têtes du Blob ; le corps est ensuite relayé au fil de l'eau. */
const HEADERS_TIMEOUT_MS = 10_000;

/** En-têtes du Blob recopiés tels quels ; tout le reste est écarté. */
const RELAYED = [
  "content-type",
  "content-disposition",
  "content-range",
  "accept-ranges",
  "etag",
  "last-modified",
] as const;

/** En-têtes de la demande transmis au Blob : lecture partielle (PDF) et revalidation. */
const FORWARDED = ["range", "if-none-match", "if-modified-since"] as const;

/** Celle que Payload pose sur un fichier XML ou SVG : aucun script exécuté. */
const UPLOAD_CSP = "script-src 'none'; frame-src 'none'; object-src 'none'";

/**
 * Base publique du Blob (même règle que @payloadcms/storage-vercel-blob), ou
 * null sans Blob : poste de développement, fichiers dans ./media.
 */
export function mediaStoreBase(env: Record<string, string | undefined> = process.env): string | null {
  const explicit = env.STORAGE_VERCEL_BLOB_BASE_URL?.trim().replace(/\/+$/, "");
  if (explicit) return explicit;
  const storeId = env.BLOB_READ_WRITE_TOKEN?.match(/^vercel_blob_rw_([a-z\d]+)_[a-z\d]+$/i)?.[1];
  return storeId ? `https://${storeId.toLowerCase()}.public.blob.vercel-storage.com` : null;
}

/**
 * Nom de fichier à partir du chemin de la demande (encore encodé), ou null.
 * Un seul segment, décodé une seule fois : ni dossier, ni remontée, ni
 * caractère de contrôle. Les copies WebP de photos-webp/ et tout autre
 * dossier du Blob restent hors de portée.
 */
export function mediaNameFromPath(pathname: string, prefix = "/api/media/file/"): string | null {
  if (!pathname.startsWith(prefix)) return null;
  const raw = pathname.slice(prefix.length);
  if (!raw || raw.includes("/")) return null;
  let name: string;
  try {
    name = decodeURIComponent(raw);
  } catch {
    return null;
  }
  if (name.length > 255 || name === "." || name === "..") return null;
  if (/[/\\\u0000-\u001f\u007f-\u009f]/.test(name)) return null;
  return name;
}

function isXmlType(contentType: string): boolean {
  const essence = (contentType.split(";", 1)[0] ?? "").trim().toLowerCase();
  return essence === "application/xml" || essence === "text/xml" || essence === "text/xsl" || essence.endsWith("+xml");
}

export interface MediaRequest {
  method: "GET" | "HEAD";
  headers: Headers;
}

export async function serveMediaFile(
  name: string,
  base: string,
  request: MediaRequest,
  fetchFn: typeof fetch = fetch,
): Promise<Response> {
  const forwarded = new Headers();
  for (const key of FORWARDED) {
    const value = request.headers.get(key);
    if (value) forwarded.set(key, value);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HEADERS_TIMEOUT_MS);
  let upstream: Response;
  try {
    upstream = await fetchFn(`${base}/${encodeURIComponent(name)}`, {
      method: request.method,
      headers: forwarded,
      // Pas de copie dans le cache de données de Next : le CDN s'en charge.
      cache: "no-store",
      // Le Blob ne redirige pas ; une redirection ne serait pas suivie.
      redirect: "manual",
      signal: controller.signal,
    });
  } catch {
    return unavailable();
  } finally {
    clearTimeout(timer);
  }

  if (upstream.status === 404) {
    void upstream.body?.cancel();
    return notFound();
  }
  const partial = upstream.status === 206;
  const unchanged = upstream.status === 304;
  const unsatisfiable = upstream.status === 416;
  if (upstream.status !== 200 && !partial && !unchanged && !unsatisfiable) {
    // Blob bloqué (403), en panne ou réponse inattendue : une erreur franche,
    // jamais mise en cache, plutôt qu'un fichier vide.
    void upstream.body?.cancel();
    return unavailable();
  }

  const headers = new Headers();
  for (const key of RELAYED) {
    const value = upstream.headers.get(key);
    if (value) headers.set(key, value);
  }
  // Corps décompressé par fetch si le Blob l'a compressé : la taille annoncée
  // ne serait plus la bonne.
  const length = upstream.headers.get("content-encoding") ? null : upstream.headers.get("content-length");
  if (length && !unchanged) headers.set("Content-Length", length);

  if (unsatisfiable) {
    void upstream.body?.cancel();
    headers.set("Cache-Control", "no-store");
    return new Response(null, { status: 416, headers });
  }

  const contentType = headers.get("content-type");
  if (!contentType && !unchanged) headers.set("Content-Type", "application/octet-stream");
  if (contentType && isXmlType(contentType)) headers.set("Content-Security-Policy", UPLOAD_CSP);
  headers.set("Cache-Control", CACHE);
  headers.set("CDN-Cache-Control", CACHE);

  const withBody = request.method === "GET" && !unchanged;
  if (!withBody) void upstream.body?.cancel();
  return new Response(withBody ? upstream.body : null, { status: upstream.status, headers });
}

function unavailable(): Response {
  return new Response("Fichier indisponible", { status: 502, headers: { "Cache-Control": "no-store" } });
}

export function notFound(): Response {
  return new Response(null, { status: 404, headers: { "Cache-Control": "public, max-age=300" } });
}
