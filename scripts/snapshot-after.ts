/**
 * Snapshot APRÈS migration variantes + diff — Sections 6 et 6.1 du brief.
 *
 * 1. Recharge le dernier snapshot products-before-*.json sous backups/.
 * 2. Ré-exporte la collection `products` (depth 0) et compte `media`.
 * 3. Compare champ par champ : tout champ existant AVANT la migration doit
 *    être STRICTEMENT identique après. Seuls hasVariants / variantOptions /
 *    variants (nouveaux) ont le droit d'apparaître.
 * 4. Écrit un rapport reports/migration-variantes-{timestamp}.md.
 *
 * Code de sortie 1 si la moindre anomalie est détectée → signal de rollback.
 *
 * Lecture seule — n'écrit RIEN dans la base.
 *
 * Exécution :
 *   ./node_modules/.bin/tsx scripts/snapshot-after.ts
 */

import fs from "fs";
import path from "path";

/** Champs autorisés à apparaître/changer après la migration (additifs). */
const ALLOWED_NEW_FIELDS = new Set(["hasVariants", "variantOptions", "variants"]);
/** Champs ignorés du diff (horodatages techniques). */
const IGNORED_FIELDS = new Set(["updatedAt", "createdAt"]);

function loadEnv(): void {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
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

/** Récupère le snapshot-before le plus récent. */
function findLatestBefore(dir: string): string {
  if (!fs.existsSync(dir)) {
    throw new Error(`Dossier backups/ introuvable — lance d'abord snapshot-before.ts`);
  }
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("products-before-") && f.endsWith(".json"))
    .sort();
  const latest = files[files.length - 1];
  if (!latest) {
    throw new Error("Aucun products-before-*.json — lance d'abord snapshot-before.ts");
  }
  return path.join(dir, latest);
}

type Anomaly = { productId: number | string; field: string; before: string; after: string };

async function main(): Promise<void> {
  loadEnv();

  const backupsDir = path.resolve(process.cwd(), "backups");
  const beforeFile = findLatestBefore(backupsDir);
  console.log(`[snapshot-after] Référence : ${beforeFile}`);

  const before = JSON.parse(fs.readFileSync(beforeFile, "utf8")) as {
    totalProducts: number;
    mediaCount: number;
    products: Array<Record<string, unknown>>;
  };

  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  const after = await payload.find({
    collection: "products",
    limit: 1000,
    depth: 0,
    pagination: false,
    sort: "id",
  });
  const mediaCount = await payload.count({ collection: "media" });

  const afterById = new Map<number | string, Record<string, unknown>>();
  for (const doc of after.docs) {
    afterById.set(
      (doc as { id: number | string }).id,
      doc as unknown as Record<string, unknown>,
    );
  }

  const anomalies: Anomaly[] = [];
  const missingProducts: Array<number | string> = [];

  for (const beforeDoc of before.products) {
    const id = beforeDoc.id as number | string;
    const afterDoc = afterById.get(id);
    if (!afterDoc) {
      missingProducts.push(id);
      continue;
    }
    for (const key of Object.keys(beforeDoc)) {
      if (IGNORED_FIELDS.has(key) || ALLOWED_NEW_FIELDS.has(key)) continue;
      const b = JSON.stringify(beforeDoc[key] ?? null);
      const a = JSON.stringify(afterDoc[key] ?? null);
      if (b !== a) {
        anomalies.push({ productId: id, field: key, before: b, after: a });
      }
    }
  }

  // Vérifs structurelles
  const countOk = before.totalProducts === after.totalDocs;
  const mediaOk = before.mediaCount === mediaCount.totalDocs;
  const newProducts = after.docs
    .map((d) => (d as { id: number | string }).id)
    .filter((id) => !before.products.some((p) => p.id === id));

  const ok =
    anomalies.length === 0 &&
    missingProducts.length === 0 &&
    countOk &&
    mediaOk &&
    newProducts.length === 0;

  // Rapport
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportsDir = path.resolve(process.cwd(), "reports");
  fs.mkdirSync(reportsDir, { recursive: true });
  const reportFile = path.join(reportsDir, `migration-variantes-${timestamp}.md`);

  const lines: string[] = [];
  lines.push(`# Rapport migration variantes — ${timestamp}`);
  lines.push("");
  lines.push(`Snapshot de référence : \`${path.basename(beforeFile)}\``);
  lines.push("");
  lines.push(`## Verdict : ${ok ? "✅ OK — aucune anomalie" : "🔴 ANOMALIE DÉTECTÉE"}`);
  lines.push("");
  lines.push("## Contrôles structurels");
  lines.push("");
  lines.push(`| Contrôle | Avant | Après | Statut |`);
  lines.push(`|---|---|---|---|`);
  lines.push(
    `| Nombre de produits | ${before.totalProducts} | ${after.totalDocs} | ${countOk ? "✅" : "🔴"} |`,
  );
  lines.push(
    `| Nombre de médias | ${before.mediaCount} | ${mediaCount.totalDocs} | ${mediaOk ? "✅" : "🔴"} |`,
  );
  lines.push(
    `| Produits disparus | — | ${missingProducts.length} | ${missingProducts.length === 0 ? "✅" : "🔴"} |`,
  );
  lines.push(
    `| Produits apparus | — | ${newProducts.length} | ${newProducts.length === 0 ? "✅" : "🔴"} |`,
  );
  lines.push(
    `| Champs existants modifiés | — | ${anomalies.length} | ${anomalies.length === 0 ? "✅" : "🔴"} |`,
  );
  lines.push("");

  if (anomalies.length > 0) {
    lines.push("## 🔴 Anomalies — champs existants modifiés (NE DOIVENT JAMAIS BOUGER)");
    lines.push("");
    lines.push(`| Produit (id) | Champ | Avant | Après |`);
    lines.push(`|---|---|---|---|`);
    for (const an of anomalies) {
      lines.push(
        `| ${an.productId} | ${an.field} | \`${an.before.slice(0, 120)}\` | \`${an.after.slice(0, 120)}\` |`,
      );
    }
    lines.push("");
  }
  if (missingProducts.length > 0) {
    lines.push(`## 🔴 Produits disparus : ${missingProducts.join(", ")}`);
    lines.push("");
  }
  if (newProducts.length > 0) {
    lines.push(`## 🔴 Produits apparus (inattendu) : ${newProducts.join(", ")}`);
    lines.push("");
  }

  lines.push("## Conclusion");
  lines.push("");
  lines.push(
    ok
      ? "Migration purement additive confirmée. Aucune donnée produit existante n'a été altérée. Sûr de continuer."
      : "🔴 ROLLBACK REQUIS — exécuter `npx --no payload migrate:down` et investiguer avant toute suite.",
  );
  lines.push("");

  fs.writeFileSync(reportFile, lines.join("\n"));

  console.log(`[snapshot-after] Rapport écrit → ${reportFile}`);
  console.log(
    `[snapshot-after] Verdict : ${ok ? "✅ OK" : "🔴 ANOMALIE"} — ` +
      `${anomalies.length} champ(s) modifié(s), ${missingProducts.length} disparu(s), ` +
      `médias ${mediaOk ? "OK" : "DIFFÉRENT"}.`,
  );
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error("[snapshot-after] Fatal :", err);
  process.exit(1);
});
