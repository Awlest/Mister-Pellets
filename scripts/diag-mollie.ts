/**
 * Diagnostic LECTURE SEULE de la configuration Mollie.
 *
 * Liste les moyens de paiement réellement activés sur le compte et les compare
 * à ceux que le checkout demande. Ne crée aucun paiement, ne débite rien.
 *
 * Exécution : ./node_modules/.bin/tsx scripts/diag-mollie.ts
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
  const key = process.env.MOLLIE_API_KEY ?? "";
  console.log(`cle presente : ${key.length > 0} | mode : ${key.startsWith("live_") ? "LIVE" : key.startsWith("test_") ? "TEST" : "inconnu"}`);
  if (!key) process.exit(1);

  const res = await fetch("https://api.mollie.com/v2/methods?locale=fr_BE&amount[value]=3182.00&amount[currency]=EUR", {
    headers: { Authorization: `Bearer ${key}` },
  });
  const body = (await res.json()) as {
    _embedded?: { methods?: Array<{ id: string; description: string; status?: string }> };
    detail?: string;
    title?: string;
  };
  console.log(`\nGET /methods -> ${res.status}`);
  if (!res.ok) {
    console.log("  erreur :", body.title, body.detail);
  } else {
    const methods = body._embedded?.methods ?? [];
    console.log(`  moyens disponibles pour 3182,00 EUR (${methods.length}) :`);
    for (const m of methods) console.log(`    ${m.id.padEnd(16)} ${m.description}`);
    const demandes = ["bancontact", "creditcard", "applepay"];
    const dispo = new Set(methods.map((m) => m.id));
    console.log("\n  demandes par le checkout :");
    for (const d of demandes) console.log(`    ${d.padEnd(16)} ${dispo.has(d) ? "OK" : "ABSENT -> refus de creation du paiement"}`);
  }

  const all = await fetch("https://api.mollie.com/v2/methods/all?locale=fr_BE", {
    headers: { Authorization: `Bearer ${key}` },
  });
  const allBody = (await all.json()) as {
    _embedded?: { methods?: Array<{ id: string; status?: string }> };
  };
  console.log("\n  statut de chaque moyen sur le compte :");
  for (const m of allBody._embedded?.methods ?? []) {
    console.log(`    ${m.id.padEnd(16)} ${m.status ?? "?"}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
