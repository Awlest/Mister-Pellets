import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { resendAdapter } from "@payloadcms/email-resend";
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

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// CORS + CSRF restreints au domaine (audit V14.1) : NO WILDCARD.
// Seuls notre domaine prod et localhost (dev) peuvent appeler l'API Payload
// et accéder à l'admin. Tout autre origin est rejeté avec 403.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const ALLOWED_ORIGINS = [
  SITE_URL,
  "http://localhost:3000",
  "http://localhost:3001",
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
  ],

  editor: lexicalEditor(),

  secret: process.env.PAYLOAD_SECRET ?? "",

  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI ?? "",
    },
    // Garde-fou : on DÉSACTIVE le push automatique de schéma. Tout changement
    // de schéma DOIT passer par un fichier de migration explicite (dossier
    // migrations/). Sans ce flag, exécuter un script via tsx (mode dev) avec
    // DATABASE_URI pointant sur la prod pousse le schéma directement en base —
    // exactement ce que le protocole de migration interdit.
    push: false,
  }),

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
    }),
  ],

  // Le client browser est bloqué par défaut quand NEXT_PUBLIC_ALLOW_INDEXING != true.
  // Affecte uniquement les meta robots, pas l'admin Payload.
});
