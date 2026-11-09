/**
 * Banc des correctifs de sécurité du 06/11/2026 : JSON-LD échappé, salutation
 * des e-mails, champs avec un lien, plafonds de réservation (sur une base
 * simulée en mémoire), règles d'accès par rôle, lecture publique des articles
 * et secret du cron.
 *
 *   node --import tsx scripts/check-securite.ts
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JsonLd, serializeJsonLd } from "@/components/seo/JsonLd";
import { greeting } from "@/lib/email-layout";
import { clip, hasLink, oneLine } from "@/lib/form-text";
import { errorInfo } from "@/lib/log-error";
import { BOOKING_LIMITS, normalizePhone, reserveBookingQuota } from "@/lib/booking-limits";
import { canEditLeads, isAdminOrSelf, isAdminUser } from "@/lib/access";
import { Articles } from "@/collections/Articles";
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

await bookingScenarios();
await cronScenarios();

console.log(ko === 0 ? "\nTout est bon." : `\n${ko} contrôle(s) en échec.`);
process.exit(ko === 0 ? 0 : 1);
