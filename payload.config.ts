import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Products } from "./collections/Products";
import { Orders } from "./collections/Orders";
import { Quotes } from "./collections/Quotes";
import { ContactMessages } from "./collections/ContactMessages";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: " · Mister Pellets",
    },
  },

  collections: [Users, Media, Products, Orders, Quotes, ContactMessages],

  editor: lexicalEditor(),

  secret: process.env.PAYLOAD_SECRET ?? "",

  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI ?? "",
    },
  }),

  sharp,

  // Le client browser est bloqué par défaut quand NEXT_PUBLIC_ALLOW_INDEXING != true.
  // Affecte uniquement les meta robots, pas l'admin Payload.
});
