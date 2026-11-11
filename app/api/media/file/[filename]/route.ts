import { mediaNameFromPath, mediaStoreBase, notFound, serveMediaFile } from "@/lib/media-file";

/**
 * Photos et PDF de la médiathèque : /api/media/file/<nom>.
 *
 * Cette route passe avant la route générale de Payload (/api/[...slug]) pour
 * cette seule adresse. Elle relit le fichier dans le Blob public sans
 * démarrer Payload ni ouvrir de connexion à la base : avant le 11/11/2026,
 * plusieurs fichiers demandés en même temps hors cache répondaient 500
 * (cause et règles : lib/media-file.ts). Les adresses ne changent pas.
 *
 * Deux cas repassent par Payload, qui sait les traiter :
 * - pas de Blob (poste de développement, fichiers dans ./media) ;
 * - un paramètre `prefix`, que seul un dossier de la médiathèque demanderait.
 *
 * À revoir si la collection Media cesse d'être publique, ou si le greffon de
 * stockage reçoit un `prefix` ou des envois directs depuis le navigateur
 * (`clientUploads`) : cette route ne lit ni droits ni dossier.
 */

type Method = "GET" | "HEAD";

async function viaPayload(request: Request, name: string, method: Method): Promise<Response> {
  const [{ default: config }, { REST_GET }] = await Promise.all([
    import("@payload-config"),
    import("@payloadcms/next/routes"),
  ]);
  const response = await REST_GET(config)(request, {
    params: Promise.resolve({ slug: ["media", "file", name] }),
  });
  if (method === "GET") return response;
  void response.body?.cancel();
  return new Response(null, { status: response.status, headers: response.headers });
}

async function handle(request: Request, method: Method): Promise<Response> {
  const url = new URL(request.url);
  const name = mediaNameFromPath(url.pathname);
  if (!name) return notFound();

  const base = mediaStoreBase();
  if (!base || url.searchParams.has("prefix")) return viaPayload(request, name, method);

  return serveMediaFile(name, base, { method, headers: request.headers });
}

export function GET(request: Request): Promise<Response> {
  return handle(request, "GET");
}

export function HEAD(request: Request): Promise<Response> {
  return handle(request, "HEAD");
}
