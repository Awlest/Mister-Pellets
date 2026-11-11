/**
 * Banc des correctifs de sécurité du 06/11/2026 : JSON-LD échappé, salutation
 * des e-mails, champs avec un lien, plafonds de réservation (sur une base
 * simulée en mémoire), règles d'accès par rôle, lecture publique des articles
 * et secret du cron. Depuis le 11/11/2026 : fichiers de la médiathèque servis
 * sans base (noms admis, en-têtes rendus, pannes du Blob), et règle CSP de
 * tout ce que sert /api.
 *
 *   node --import tsx scripts/check-securite.ts
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { modifyRouteRegex } from "next/dist/lib/redirect-status";
import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match";
import nextConfig from "../next.config";
import { JsonLd, serializeJsonLd } from "@/components/seo/JsonLd";
import { greeting } from "@/lib/email-layout";
import { clip, hasLink, oneLine } from "@/lib/form-text";
import { errorInfo } from "@/lib/log-error";
import { BOOKING_LIMITS, normalizePhone, reserveBookingQuota } from "@/lib/booking-limits";
import { canEditLeads, isAdminOrSelf, isAdminUser } from "@/lib/access";
import { UPLOAD_CSP, mediaNameFromPath, mediaStoreBase, serveMediaFile } from "@/lib/media-file";
import { Articles } from "@/collections/Articles";
import { Media } from "@/collections/Media";
import { Users } from "@/collections/Users";

let ko = 0;
function check(label: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) ko++;
  console.log(`${ok ? "ok  " : "KO  "} ${label}${ok ? "" : `\n      attendu ${JSON.stringify(want)}\n      obtenu  ${JSON.stringify(got)}`}`);
}

// 1. JSON-LD : un « </script> » stocké dans une fiche ne ferme plus la balise.
const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);
const hostile = {
  "@type": "Product",
  name: `Poêle </script><script>alert(1)</script>`,
  description: `A & B <!-- x --> ligne${LS}suite${PS}fin`,
};
const serialized = serializeJsonLd(hostile);
check("JSON-LD : ni <, ni >, ni &, ni U+2028/2029", /[<>&\u2028\u2029]/.test(serialized), false);
check("JSON-LD : relu à l'identique", JSON.parse(serialized), hostile);
const html = renderToStaticMarkup(createElement(JsonLd, { data: hostile }));
check("JSON-LD rendu : une seule balise </script>, la fermante", html.split("</script").length - 1, 1);
check("JSON-LD rendu : se termine par </script>", html.endsWith("</script>"), true);
check("JSON-LD rendu : aucune balise <script> injectée", (html.match(/<script/g) ?? []).length, 1);

// 2. Salutation des e-mails au visiteur : prénom seulement s'il en a la forme.
check("salutation : jean", greeting("jean dupont"), "Bonjour Jean,");
check("salutation : JEAN-MARC", greeting("JEAN-MARC Dupont"), "Bonjour Jean-Marc,");
check("salutation : Zoë", greeting("Zoë"), "Bonjour Zoë,");
check("salutation : O’Brien", greeting("O’Brien"), "Bonjour O’Brien,");
check("salutation : lien", greeting("https://arnaque.example promo"), "Bonjour,");
check("salutation : domaine", greeting("arnaque.example"), "Bonjour,");
check("salutation : e-mail", greeting("a@b.be"), "Bonjour,");
check("salutation : chiffres", greeting("0470123456"), "Bonjour,");
check("salutation : 31 lettres", greeting("a".repeat(31)), "Bonjour,");
check("salutation : 30 lettres", greeting("a".repeat(30)), `Bonjour A${"a".repeat(29)},`);
check("salutation : vide", greeting(""), "Bonjour,");

// 3. Champs texte : lien refusé, une ligne, longueur bornée.
check("lien : http", hasLink("Jean http"), true);
check("lien : HTTPS://", hasLink("HTTPS://x.be"), true);
check("lien : www.", hasLink("www.x.be"), true);
check("lien : @", hasLink("jean@x.be"), true);
check("lien : boîte 12/3 permise", hasLink("Rue de la Gare 12/3"), false);
check("lien : nom ordinaire", hasLink("Jean-Marc d'Ath"), false);
check("une ligne : CR/LF retirés", oneLine("Jean\r\nBcc: x@y.be", 120), "Jean Bcc: x@y.be");
check("une ligne : bornée", oneLine("x".repeat(500), 120).length, 120);
check("une ligne : non-texte", oneLine({ a: 1 }, 10), "");
check("message : borné, retours gardés", clip(" a\nb ", 10), "a\nb");

// 4. Logs : nom et code d'une erreur, jamais son message.
const drizzleLike = Object.assign(new Error("Failed query: insert ...\nparams: Jean,jean@x.be,0470123456"), {
  name: "DrizzleQueryError",
  cause: { code: "57014" },
});
check("log d'erreur : nom et code seulement", errorInfo(drizzleLike), { name: "DrizzleQueryError", code: "57014" });
check("log d'erreur : sans cause", errorInfo(new TypeError("fetch failed")), { name: "TypeError" });
check("log d'erreur : pas une Error", errorInfo("texte"), { name: "string" });

// 5. Plafonds de réservation, sur une base simulée en mémoire.
type Row = { id: number; emailKey: string | null; phoneKey: string | null; service: string; createdAt: string };
type W = Record<string, unknown>;
function matches(row: Row, where: W): boolean {
  return Object.entries(where).every(([key, cond]) => {
    if (key === "and") return (cond as W[]).every((w) => matches(row, w));
    if (key === "or") return (cond as W[]).some((w) => matches(row, w));
    const value = row[key as keyof Row];
    const c = cond as { equals?: unknown; less_than?: string; greater_than_equal?: string };
    if ("equals" in c) return value === c.equals;
    if (c.less_than !== undefined) return String(value) < c.less_than;
    if (c.greater_than_equal !== undefined) return String(value) >= c.greater_than_equal;
    throw new Error(`opérateur non simulé : ${JSON.stringify(c)}`);
  });
}
function fakeStore(clock: { now: number }) {
  const rows: Row[] = [];
  let next = 1;
  const store = {
    rows,
    async create({ data }: { data: Omit<Row, "id" | "createdAt"> }) {
      const row = { ...data, id: next++, createdAt: new Date(clock.now).toISOString() };
      rows.push(row);
      return row;
    },
    async count({ where }: { where: W }) {
      return { totalDocs: rows.filter((r) => matches(r, where)).length };
    },
    async delete(args: { id?: number; where?: W }) {
      for (let i = rows.length - 1; i >= 0; i--) {
        const row = rows[i]!;
        if (args.id !== undefined ? row.id === args.id : matches(row, args.where ?? {})) rows.splice(i, 1);
      }
      return {};
    },
  };
  return store;
}
type Store = Parameters<typeof reserveBookingQuota>[0];

async function bookingScenarios() {
  const clock = { now: Date.UTC(2026, 10, 6, 9, 0) };
  const store = fakeStore(clock);
  const book = (email?: string, phone?: string) =>
    reserveBookingQuota(store as unknown as Store, { email, phone, service: "devis-sur-place", now: clock.now, secret: "s" })
      .then((q) => (q.ok ? "ok" : q.reason));

  check("contact : 1re réservation", await book("jean@x.be"), "ok");
  check("contact : 2e réservation", await book("Jean@X.be "), "ok");
  check("contact : 3e refusée (même e-mail, autre casse)", await book("JEAN@x.be"), "contact");
  check("contact : la demande refusée ne laisse pas de ligne", store.rows.length, 2);
  check("contact : aucune adresse en clair en base", store.rows.some((r) => JSON.stringify(r).includes("@")), false);

  check("téléphone : formes ramenées à une seule", [normalizePhone("0470 12 34 56"), normalizePhone("+32 470 12 34 56"), normalizePhone("0032470123456")], ["0470123456", "0470123456", "0470123456"]);
  check("téléphone : 1re", await book(undefined, "0470 12 34 56"), "ok");
  check("téléphone : 2e (+32)", await book("autre@x.be", "+32 470 12 34 56"), "ok");
  check("téléphone : 3e refusée (0032)", await book("encore@x.be", "0032 470 12 34 56"), "contact");

  // 4 lignes : 2 e-mails, 2 téléphones. Il reste 4 places sous le plafond du site.
  for (let i = 0; i < BOOKING_LIMITS.perSite - 4; i++) await book(`client${i}@x.be`);
  check("site : 8 réservations acceptées", store.rows.length, BOOKING_LIMITS.perSite);
  check("site : la 9e est refusée", await book("neuvieme@x.be"), "site");
  check("site : toujours 8 lignes", store.rows.length, BOOKING_LIMITS.perSite);

  // Une réservation qui échoue (créneau pris) rend sa place.
  const quota = await reserveBookingQuota(store as unknown as Store, { email: "x@y.be", service: "s", now: clock.now, secret: "s" });
  check("release : refus tant que le site est plein", quota.ok, false);
  store.rows.pop();
  const freed = await reserveBookingQuota(store as unknown as Store, { email: "x@y.be", service: "s", now: clock.now, secret: "s" });
  if (freed.ok) await freed.release();
  check("release : la place est rendue", store.rows.length, BOOKING_LIMITS.perSite - 1);

  // 24 heures plus tard, les anciennes lignes sont effacées et ne comptent plus.
  clock.now += BOOKING_LIMITS.windowMs + 60000;
  check("fenêtre : de nouveau possible après 24 h", await book("jean@x.be"), "ok");
  check("fenêtre : anciennes lignes effacées", store.rows.length, 1);
}

// 6. Règles d'accès par rôle.
type AccessFn = (args: { req: { user: unknown } }) => unknown;
const asAccess = (fn: unknown) => fn as AccessFn;
const user = (role: string | null | undefined, id = 5) => ({ id, role, collection: "users" });
check("admin : rôle admin", isAdminUser({ role: "admin" }), true);
check("admin : rôle absent (ancien compte)", isAdminUser({}), true);
check("admin : rôle null", isAdminUser({ role: null }), true);
check("admin : editor", isAdminUser({ role: "editor" }), false);
check("admin : viewer", isAdminUser({ role: "viewer" }), false);
check("admin : anonyme", isAdminUser(null), false);
check("leads : viewer ne modifie pas", asAccess(canEditLeads)({ req: { user: user("viewer") } }), false);
check("leads : editor modifie", asAccess(canEditLeads)({ req: { user: user("editor") } }), true);
check("leads : anonyme refusé", asAccess(canEditLeads)({ req: { user: null } }), false);
check("users : editor limité à son compte", asAccess(isAdminOrSelf)({ req: { user: user("editor", 7) } }), { id: { equals: 7 } });
check("users : admin sur tout compte", asAccess(isAdminOrSelf)({ req: { user: user("admin") } }), true);
check("users : création réservée à l'admin", [asAccess(Users.access?.create)({ req: { user: user("viewer") } }), asAccess(Users.access?.create)({ req: { user: user("admin") } })], [false, true]);
check("users : suppression réservée à l'admin", asAccess(Users.access?.delete)({ req: { user: user("editor") } }), false);
const roleField = Users.fields.find((f) => "name" in f && f.name === "role") as { access?: { update?: unknown } };
check("users : rôle modifiable par un admin seulement", [asAccess(roleField.access?.update)({ req: { user: user("viewer") } }), asAccess(roleField.access?.update)({ req: { user: user(undefined) } })], [false, true]);

// 7. Articles : un anonyme ne lit que les publiés.
check("articles : anonyme limité aux publiés", asAccess(Articles.access?.read)({ req: { user: null } }), {
  and: [{ _status: { equals: "published" } }, { isPublished: { equals: true } }],
});
check("articles : compte de l'admin, tout", asAccess(Articles.access?.read)({ req: { user: user("editor") } }), true);

// 8. Cron : refusé sans secret configuré, refusé avec un mauvais secret.
async function cronScenarios() {
  const { GET } = await import("@/app/api/cron/bonus/route");
  const call = (auth?: string) =>
    GET(new Request("http://localhost/api/cron/bonus", auth ? { headers: { authorization: auth } } : undefined))
      .then((r) => r.status)
      .catch(() => "levée");
  delete process.env.CRON_SECRET;
  check("cron : sans CRON_SECRET, refusé", await call("Bearer undefined"), 401);
  process.env.CRON_SECRET = "";
  check("cron : CRON_SECRET vide, refusé", await call("Bearer "), 401);
  process.env.CRON_SECRET = "secret-de-test";
  check("cron : sans en-tête, refusé", await call(), 401);
  check("cron : mauvais secret, refusé", await call("Bearer secret-de-tesT"), 401);
  // Bon secret : l'authentification passe (une nuit de bascule, revalidatePath
  // lève hors de Next ; ce n'est plus un refus).
  check("cron : bon secret, accepté", [200, "levée"].includes(await call("Bearer secret-de-test")), true);
}

// 9. Médiathèque servie sans base (lib/media-file.ts) : seuls les noms de la
// racine du Blob, seuls les en-têtes utiles, jamais l'adresse du Blob.
async function mediaScenarios() {
  check("médias : collection toujours publique (sinon revoir la route)", asAccess(Media.access?.read)({ req: { user: null } }), true);

  const P = "/api/media/file/";
  check("nom : simple", mediaNameFromPath(`${P}16_Fiche_Rise.pdf`), "16_Fiche_Rise.pdf");
  check("nom : espace et accent décodés", mediaNameFromPath(`${P}po%C3%AAle%20noir-400x400.webp`), "poêle noir-400x400.webp");
  check("nom : décodé une seule fois", mediaNameFromPath(`${P}a%2520b.pdf`), "a%20b.pdf");
  check("nom : dossier refusé", mediaNameFromPath(`${P}photos-webp/v1/x.webp`), null);
  check("nom : dossier encodé refusé", mediaNameFromPath(`${P}photos-webp%2Fv1%2Fx.webp`), null);
  check(
    "nom : remontées refusées",
    ["..", ".", "%2e%2e", "..%2Fsecret.pdf", "..%5Csecret.pdf", "x%5C..%5Cy"].map((n) => mediaNameFromPath(P + n)),
    [null, null, null, null, null, null],
  );
  check("nom : caractères de contrôle refusés", ["a%00b.pdf", "a%0D%0Ab.pdf", "a%C2%85b.pdf"].map((n) => mediaNameFromPath(P + n)), [null, null, null]);
  check("nom : encodage cassé refusé", mediaNameFromPath(`${P}a%zz.pdf`), null);
  check("nom : vide refusé", mediaNameFromPath(P), null);
  check("nom : 255 caractères admis, 256 refusés", [mediaNameFromPath(P + "a".repeat(255))?.length, mediaNameFromPath(P + "a".repeat(256))], [255, null]);
  check("nom : autre route refusée", mediaNameFromPath("/api/users/file/x.pdf"), null);

  check("base : tirée du jeton", mediaStoreBase({ BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_AbC123_xyz789" }), "https://abc123.public.blob.vercel-storage.com");
  check("base : adresse imposée, sans barre finale", mediaStoreBase({ STORAGE_VERCEL_BLOB_BASE_URL: "http://127.0.0.1:9000/" }), "http://127.0.0.1:9000");
  check("base : sans Blob", [mediaStoreBase({}), mediaStoreBase({ BLOB_READ_WRITE_TOKEN: "autre" })], [null, null]);

  const BASE = "https://store-de-test.public.blob.vercel-storage.com";
  type Call = { url: string; method: string; headers: Record<string, string> };
  const fake = (reply: (call: Call) => Response) => {
    const calls: Call[] = [];
    const fn = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const call = {
        url: String(input),
        method: init?.method ?? "GET",
        headers: Object.fromEntries(new Headers(init?.headers).entries()),
      };
      calls.push(call);
      return reply(call);
    }) as typeof fetch;
    return { fn, calls };
  };
  const ask = (name: string, f: typeof fetch, headers: Record<string, string> = {}, method: "GET" | "HEAD" = "GET") =>
    serveMediaFile(name, BASE, { method, headers: new Headers(headers) }, f);
  const headersOf = (r: Response) => Object.fromEntries(r.headers.entries());

  // Réponse ordinaire : fichier relayé, en-têtes triés, cache d'un an.
  const ok = fake(
    () =>
      new Response("%PDF-", {
        headers: {
          "content-type": "application/pdf",
          "content-length": "5",
          "content-disposition": 'inline; filename="fiche.pdf"',
          etag: '"abc"',
          "last-modified": "Mon, 14 Sep 2026 14:35:24 GMT",
          "accept-ranges": "bytes",
          "cache-control": "public, max-age=60",
          "set-cookie": "x=1",
          "x-vercel-id": "fra1::abc",
          server: "Vercel",
        },
      }),
  );
  const r200 = await ask("poêle noir.pdf", ok.fn, { cookie: "payload-token=secret", authorization: "JWT secret", "user-agent": "x" });
  check("200 : statut et corps", [r200.status, await r200.text()], [200, "%PDF-"]);
  check("200 : fichier lu à la racine du Blob, nom encodé", ok.calls[0]?.url, `${BASE}/po%C3%AAle%20noir.pdf`);
  check("200 : ni cookie ni autorisation envoyés au Blob", ok.calls[0]?.headers, {});
  check("200 : en-têtes rendus", headersOf(r200), {
    "accept-ranges": "bytes",
    "cache-control": "public, max-age=31536000",
    "cdn-cache-control": "public, max-age=31536000",
    "content-disposition": 'inline; filename="fiche.pdf"',
    "content-length": "5",
    "content-type": "application/pdf",
    etag: '"abc"',
    "last-modified": "Mon, 14 Sep 2026 14:35:24 GMT",
  });
  check("200 : adresse du Blob absente de la réponse", JSON.stringify(headersOf(r200)).includes("blob.vercel-storage"), false);

  // Lecture partielle (lecteurs PDF) et revalidation.
  const part = fake(() => new Response("%P", { status: 206, headers: { "content-type": "application/pdf", "content-range": "bytes 0-1/5", "content-length": "2" } }));
  const r206 = await ask("fiche.pdf", part.fn, { range: "bytes=0-1" });
  check("206 : plage transmise et rendue", [part.calls[0]?.headers, r206.status, r206.headers.get("content-range"), await r206.text()], [{ range: "bytes=0-1" }, 206, "bytes 0-1/5", "%P"]);
  const same = fake(() => new Response(null, { status: 304, headers: { etag: '"abc"' } }));
  const r304 = await ask("fiche.pdf", same.fn, { "if-none-match": '"abc"' });
  check("304 : validateur transmis, réponse sans corps", [same.calls[0]?.headers, r304.status, r304.headers.get("cache-control"), await r304.text()], [{ "if-none-match": '"abc"' }, 304, "public, max-age=31536000", ""]);
  const r416 = await ask("fiche.pdf", fake(() => new Response(null, { status: 416, headers: { "content-range": "bytes */5" } })).fn, { range: "bytes=9-" });
  check("416 : rendue sans cache", [r416.status, r416.headers.get("content-range"), r416.headers.get("cache-control")], [416, "bytes */5", "no-store"]);

  // HEAD : même question au Blob, pas de corps.
  const head = fake(() => new Response(null, { headers: { "content-type": "image/webp", "content-length": "1234" } }));
  const rHead = await ask("photo.webp", head.fn, {}, "HEAD");
  check("HEAD : transmise telle quelle", [head.calls[0]?.method, rHead.status, rHead.headers.get("content-type"), rHead.headers.get("content-length"), await rHead.text()], ["HEAD", 200, "image/webp", "1234", ""]);

  // Fichier compressé par le Blob : la taille annoncée ne vaut plus.
  const r200z = await ask("logo.svg", fake(() => new Response("<svg/>", { headers: { "content-type": "image/svg+xml", "content-encoding": "br", "content-length": "3" } })).fn);
  check("compressé : taille non recopiée", r200z.headers.get("content-length"), null);
  check("SVG : la route envoie la règle des fichiers", r200z.headers.get("content-security-policy"), UPLOAD_CSP);
  check("PDF : rien d'ajouté par la route (next.config.ts pose la règle sur tout /api)", r200.headers.get("content-security-policy"), null);
  const bare = await ask("x.bin", fake(() => new Response(new Uint8Array([1]))).fn);
  check("type absent : fichier binaire, jamais deviné", bare.headers.get("content-type"), "application/octet-stream");

  // Absences et pannes : jamais de fichier vide en 200, jamais de cache long.
  const r404 = await ask("absent.pdf", fake(() => new Response("Not found", { status: 404 })).fn);
  check("404 : rendue, cache court", [r404.status, r404.headers.get("cache-control"), await r404.text()], [404, "public, max-age=300", ""]);
  for (const status of [302, 403, 500, 503]) {
    const r = await ask("fiche.pdf", fake(() => new Response("x", { status, headers: { location: "https://ailleurs.example/x" } })).fn);
    check(`${status} du Blob : 502 sans cache, rien de recopié`, [r.status, r.headers.get("cache-control"), r.headers.get("location")], [502, "no-store", null]);
  }
  const down = await ask("fiche.pdf", (async () => { throw new TypeError("fetch failed"); }) as unknown as typeof fetch);
  check("Blob injoignable : 502 sans cache", [down.status, down.headers.get("cache-control")], [502, "no-store"]);
}

// 10. Règles CSP de next.config.ts, appliquées comme le fait Next : dans
// l'ordre, la dernière règle qui correspond l'emporte pour une même clé. Les
// pages gardent leur règle ; tout ce que sert /api reçoit celle des fichiers.
async function cspScenarios() {
  const CSP = "Content-Security-Policy";
  const rules = (await nextConfig.headers?.()) ?? [];
  const compiled = rules.map((rule) => ({
    rule,
    match: getPathMatch(rule.source, {
      strict: true,
      removeUnnamedParams: true,
      regexModifier: (regex: string) => modifyRouteRegex(regex),
    }),
  }));
  const sent = (pathname: string) => {
    const out: Record<string, string> = {};
    for (const { rule, match } of compiled) {
      if (!match(pathname)) continue;
      for (const header of rule.headers) out[header.key] = header.value;
    }
    return out;
  };
  const directives = (csp: string | undefined) =>
    Object.fromEntries((csp ?? "").split(";").map((d) => d.trim().split(/\s+/)).map(([name, ...values]) => [name, values.join(" ")]));

  check(
    "CSP : deux règles, celle des pages puis celle de /api, même clé",
    rules.flatMap((r) => r.headers.filter((h) => h.key.toLowerCase() === CSP.toLowerCase()).map((h) => [r.source, h.key])),
    [["/:path*", CSP], ["/api/:path*", CSP]],
  );
  check("CSP des fichiers : valeur", UPLOAD_CSP, "script-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'");
  check("CSP des fichiers : ni exception ni sandbox", /unsafe|sandbox|\*|https?:/.test(UPLOAD_CSP), false);

  const pages = ["/", "/contact", "/boutique", "/produit/ek63-berry-90", "/poeles-pellets-ath", "/admin", "/admin/login", "/apiculture", "/api-x/y", "/photos/x.jpg.webp", "/icon.svg"];
  const pageCsp = sent("/")[CSP];
  check("pages : scripts du site permis, comme avant", [directives(pageCsp)["default-src"], directives(pageCsp)["script-src"]?.startsWith("'self' 'unsafe-inline'")], ["'self'", true]);
  check("pages : toutes sous la règle des pages", pages.filter((p) => sent(p)[CSP] !== pageCsp), []);

  const api = [
    "/api/media/file/logo.svg",
    "/api/media/file/Fiche%20technique%20Tally%208.pdf",
    "/api/media/file/po%C3%AAle-400x400.webp",
    "/api/media/file/logo.svg/",
    "/api/media/FILE/logo.svg",
    "/api/Media/File/logo.svg",
    "/api/media/fil%65/logo.svg",
    "/api/medi%61/file/logo.svg",
    "/API/media/file/logo.svg",
    "/api",
    "/api/users/me",
    "/api/graphql",
    "/api/feed/google-merchant",
    "/api/rdv/ics",
  ];
  check("/api : tout sous la règle des fichiers, quelle que soit l'écriture de l'adresse", api.filter((p) => sent(p)[CSP] !== UPLOAD_CSP), []);
  const kept = (p: string) => Object.keys(sent(p)).filter((k) => k !== CSP && k !== "X-Robots-Tag").sort();
  check("/api : les autres en-têtes de sécurité restent", kept("/api/media/file/logo.svg"), kept("/"));
  check("/api : type jamais deviné, cadre limité au site", [sent("/api/media/file/logo.svg")["X-Content-Type-Options"], sent("/api/media/file/logo.svg")["X-Frame-Options"]], ["nosniff", "SAMEORIGIN"]);
}

await bookingScenarios();
await cronScenarios();
await mediaScenarios();
await cspScenarios();

console.log(ko === 0 ? "\nTout est bon." : `\n${ko} contrôle(s) en échec.`);
process.exit(ko === 0 ? 0 : 1);
