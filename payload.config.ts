import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter, type PostgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { resendAdapter } from "@payloadcms/email-resend";
import { attachDatabasePool } from "@vercel/functions";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Products } from "./collections/Products";
import { Accessories } from "./collections/Accessories";
import { VariantOptionTypes } from "./collections/VariantOptionTypes";
import { VariantOptionValues } from "./collections/VariantOptionValues";
import { Orders } from "./collections/Orders";
import { Quotes } from "./collections/Quotes";
import { ContactMessages } from "./collections/ContactMessages";
import { Articles } from "./collections/Articles";
import { GoogleReviews } from "./collections/GoogleReviews";
import { OnlineBookings } from "./collections/OnlineBookings";
import { GoogleReviewsSummary } from "./globals/GoogleReviewsSummary";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// CORS + CSRF restreints au domaine (audit V14.1) : NO WILDCARD.
// Seuls notre domaine prod et, hors production, localhost peuvent appeler
// l'API Payload et accéder à l'admin. Tout autre origin est rejeté avec 403.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const ALLOWED_ORIGINS = [
  SITE_URL,
  ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:3000", "http://localhost:3001"]),
].filter((v, i, arr) => arr.indexOf(v) === i); // dédup

// Expéditeur des e-mails de Payload (mot de passe oublié de l'admin) : celui des
// notifications internes de lib/email.ts, même variable et même repli. Pas
// EMAIL_FROM : info@mister-pellets.be est un alias « Envoyer en tant que » du
// Gmail qui reçoit, et Gmail rangerait le lien dans « Messages envoyés ».
const EMAIL_FROM_INTERNAL =
  process.env.EMAIL_FROM_INTERNAL ?? "Site Mister Pellets <notifications@mister-pellets.be>";
const fromMatch = /^(.*)<([^>]+)>\s*$/.exec(EMAIL_FROM_INTERNAL);
const fromName = fromMatch?.[1]?.trim().replace(/^"|"$/g, "") || "Mister Pellets";
const fromAddress = fromMatch?.[2]?.trim() || EMAIL_FROM_INTERNAL;

// Taille du pool Postgres de chaque instance. Sur Vercel, chaque instance ouvre
// le sien : sans plafond (10 par défaut dans pg), un pic de trafic remplit le
// pooler Supabase, qui refuse alors toute nouvelle connexion (erreur
// EMAXCONN). Avec un petit pool, les requêtes patientent au lieu d'échouer.
// Jamais moins de 3 : Payload garde une connexion dès son démarrage, et un
// enregistrement dans l'admin en tient une pour sa transaction pendant que la
// lecture du verrou du document en demande une autre. À 2, chaque
// enregistrement attend une connexion qui ne se libère pas, puis échoue.
const DB_POOL_MAX = Math.max(3, Number(process.env.DB_POOL_MAX) || 5);

export default buildConfig({
  serverURL: SITE_URL,
  cors: ALLOWED_ORIGINS,
  csrf: ALLOWED_ORIGINS,

  // GraphQL : playground + introspection coupés en prod (réduit la surface
  // d'exploration du schéma). Ce sont les défauts Payload, rendus explicites.
  graphQL: {
    disablePlaygroundInProduction: true,
    disableIntrospectionInProduction: true,
  },

  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: " · Mister Pellets",
    },
  },

  collections: [
    Users,
    Media,
    Products,
    Accessories,
    VariantOptionTypes,
    VariantOptionValues,
    Orders,
    Quotes,
    ContactMessages,
    Articles,
    GoogleReviews,
    OnlineBookings,
  ],

  globals: [GoogleReviewsSummary],

  editor: lexicalEditor(),

  secret: process.env.PAYLOAD_SECRET ?? "",

  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI ?? "",
      max: DB_POOL_MAX,
      // Connexions inactives fermées après 5 s. Sur Vercel, ce délai ne court
      // pas pendant qu'une instance est suspendue : voir onInit plus bas.
      idleTimeoutMillis: 5_000,
      // Pool plein ou base injoignable : la requête attend jusqu'à 15 s, puis
      // échoue avec une erreur lisible au lieu de rester en suspens.
      connectionTimeoutMillis: 15_000,
    },
    // Garde-fou : on DÉSACTIVE le push automatique de schéma. Tout changement
    // de schéma DOIT passer par un fichier de migration explicite (dossier
    // migrations/). Sans ce flag, exécuter un script via tsx (mode dev) avec
    // DATABASE_URI pointant sur la prod pousse le schéma directement en base —
    // exactement ce que le protocole de migration interdit.
    push: false,
  }),

  // Fluid compute suspend une instance dès sa réponse envoyée. Ses connexions
  // inactives restent alors ouvertes au pooler Supabase tant que l'instance
  // existe, car le délai de 5 s ne court plus. attachDatabasePool garde
  // l'instance éveillée le temps que le pool les ferme. Sans effet hors Vercel
  // (poste local, scripts, payload migrate).
  onInit: (payload) => {
    const { pool } = payload.db as unknown as Pick<PostgresAdapter, "pool">;
    if (pool) attachDatabasePool(pool);
  },

  sharp,

  // Sans adaptateur, Payload n'envoie aucun e-mail : il écrit seulement le
  // destinataire et le sujet dans les logs (WARN « No email adapter provided »
  // au démarrage). Le lien « mot de passe oublié » de l'admin n'arrivait donc
  // jamais (même trou que Mister Clim, constaté le 25/10/2026). Sans clé (poste
  // local, scripts) : même repli sur les logs.
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        defaultFromAddress: fromAddress,
        defaultFromName: fromName,
        apiKey: process.env.RESEND_API_KEY,
      })
    : undefined,

  // Storage : Vercel Blob (CDN public, 5 GB free).
  // Ne s'active que si BLOB_READ_WRITE_TOKEN est défini ; en dev local sans
  // token, Payload retombe sur le filesystem local (./media/).
  // Sur Vercel prod, le token est auto-injecté quand le Blob store est lié au
  // projet via le dashboard Storage.
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN ?? "",
      // Pas besoin d'addRandomSuffix : Payload gère déjà des filenames uniques.
      // Les fichiers sont servis par app/api/media/file/[filename]/route.ts,
      // qui les relit à la racine du Blob sans passer par Payload ni par la
      // base. Un `prefix`, des `clientUploads` ou une lecture restreinte de la
      // collection Media demandent d'adapter cette route (lib/media-file.ts).
    }),
  ],

  // Le client browser est bloqué par défaut quand NEXT_PUBLIC_ALLOW_INDEXING != true.
  // Affecte uniquement les meta robots, pas l'admin Payload.
});
