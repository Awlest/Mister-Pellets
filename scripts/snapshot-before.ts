/**
 * Snapshot AVANT migration variantes — Section 0.2 du brief.
 *
 * Exporte l'intégralité de la collection `products` (relations en IDs,
 * depth 0 → diff propre, sans bruit de métadonnées média) + le comptage
 * de la collection `media`, dans un fichier JSON horodaté sous backups/.
 *
 * Ce fichier est la RÉFÉRENCE ABSOLUE comparée par snapshot-after.ts une
 * fois la migration appliquée.
 *
 * Lecture seule — n'écrit RIEN dans la base.
 *
 * Exécution :
 *   ./node_modules/.bin/tsx scripts/snapshot-before.ts
 */

import fs from "fs";
import path from "path";

/** Charge .env.local manuellement (zéro dépendance dotenv requise). */
function loadEnv(): void {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    console.warn("[snapshot-before] .env.local introuvable — on compte sur l'env système.");
    return;
  }
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

async function main(): Promise<void> {
  loadEnv();

  const dbHost = process.env.DATABASE_URI?.split("@")[1]?.split("/")[0] ?? "?";
  console.log(`[snapshot-before] DATABASE_URI host : ${dbHost}`);

  // Import dynamique APRÈS loadEnv : la config Payload lit DATABASE_URI au build.
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");

  const payload = await getPayload({ config });

  const products = await payload.find({
    collection: "products",
    limit: 1000,
    depth: 0, // relations en IDs → diff byte-exact sans bruit
    pagination: false,
    sort: "id",
  });

  const mediaCount = await payload.count({ collection: "media" });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = path.resolve(process.cwd(), "backups");
  fs.mkdirSync(dir, { recursive: true });

  const file = path.join(dir, `products-before-${timestamp}.json`);
  fs.writeFileSync(
    file,
    JSON.stringify(
      {
        kind: "snapshot-before",
        generatedAt: timestamp,
        totalProducts: products.totalDocs,
        mediaCount: mediaCount.totalDocs,
        products: products.docs,
      },
      null,
      2,
    ),
  );

  console.log(
    `[snapshot-before] ${products.totalDocs} produits, ${mediaCount.totalDocs} médias.`,
  );
  console.log(`[snapshot-before] Écrit → ${file}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("[snapshot-before] Fatal :", err);
  process.exit(1);
});
