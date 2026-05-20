/**
 * Génère les variantes PNG du favicon à partir du SVG mascotte.
 * Sortie : app/icon.png (32x32) + app/apple-icon.png (180x180).
 * Exécution unique : ./node_modules/.bin/tsx scripts/generate-favicons.ts
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const SRC = path.resolve(process.cwd(), "public/logo-mister-pellets-mascotte.svg");
const APP = path.resolve(process.cwd(), "app");

async function main(): Promise<void> {
  const svg = fs.readFileSync(SRC);
  // PNG 32x32 — favicon classique navigateurs.
  await sharp(svg).resize(32, 32).png().toFile(path.join(APP, "icon.png"));
  // PNG 180x180 — Apple touch icon iOS.
  await sharp(svg).resize(180, 180).png().toFile(path.join(APP, "apple-icon.png"));
  console.log("[favicons] app/icon.png (32x32) et app/apple-icon.png (180x180) générés.");
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
