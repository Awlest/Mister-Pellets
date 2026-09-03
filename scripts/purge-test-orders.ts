/**
 * Supprime les commandes de TEST créées pendant l'audit.
 *
 * Sans argument : DRY-RUN, il affiche seulement ce qui serait supprimé.
 * Avec `--apply` : supprime réellement.
 *
 * Ne cible QUE les commandes dont le nom client commence par « TEST ».
 * Exécution : ./node_modules/.bin/tsx scripts/purge-test-orders.ts [--apply]
 */
import fs from "fs";
import path from "path";

function loadEnv(): void {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}

async function main(): Promise<void> {
  loadEnv();
  const apply = process.argv.includes("--apply");
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  const found = await payload.find({
    collection: "orders",
    where: { customerName: { like: "TEST" } },
    limit: 100,
    overrideAccess: true,
  });

  console.log(`${found.docs.length} commande(s) de test trouvee(s) :`);
  for (const d of found.docs) {
    const o = d as unknown as { id: number; orderNumber: string; customerName: string; total: number };
    console.log(`  #${o.id} ${o.orderNumber} — ${o.customerName} — ${o.total} EUR`);
  }

  if (!apply) {
    console.log("\nDRY-RUN. Relancer avec --apply pour supprimer.");
    process.exit(0);
  }

  for (const d of found.docs) {
    await payload.delete({ collection: "orders", id: d.id, overrideAccess: true });
    console.log(`  supprimee : #${d.id}`);
  }
  console.log("\nTermine.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
