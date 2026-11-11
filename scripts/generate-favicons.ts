/**
 * Génère les icônes du site à partir du SVG mascotte.
 * Sortie :
 * - app/icon.png (32x32) et app/apple-icon.png (180x180) ;
 * - app/favicon.ico (48x48) : /favicon.ico répondait 404, or c'est l'adresse
 *   que demandent d'office les navigateurs, les lecteurs de flux et Google ;
 * - public/icon-192.png et public/icon-512.png pour app/manifest.ts.
 * Exécution unique : ./node_modules/.bin/tsx scripts/generate-favicons.ts
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const SRC = path.resolve(process.cwd(), "public/logo-mister-pellets-mascotte.svg");
const APP = path.resolve(process.cwd(), "app");
const PUBLIC = path.resolve(process.cwd(), "public");

/** Fichier .ico à une seule image, le PNG étant embarqué tel quel (format lu par tous les navigateurs actuels). */
function icoFromPng(png: Buffer, size: number): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // réservé
  header.writeUInt16LE(1, 2); // type : icône
  header.writeUInt16LE(1, 4); // une image
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size, 0); // largeur
  entry.writeUInt8(size, 1); // hauteur
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // réservé
  entry.writeUInt16LE(1, 4); // plans
  entry.writeUInt16LE(32, 6); // bits par pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);
  return Buffer.concat([header, entry, png]);
}

async function main(): Promise<void> {
  const svg = fs.readFileSync(SRC);
  // PNG 32x32 — favicon classique navigateurs.
  await sharp(svg).resize(32, 32).png().toFile(path.join(APP, "icon.png"));
  // PNG 180x180 — Apple touch icon iOS.
  await sharp(svg).resize(180, 180).png().toFile(path.join(APP, "apple-icon.png"));
  // ICO 48x48 : /favicon.ico.
  const png48 = await sharp(svg).resize(48, 48).png().toBuffer();
  fs.writeFileSync(path.join(APP, "favicon.ico"), icoFromPng(png48, 48));
  // PNG 192 et 512 : manifeste (écran d'accueil Android, résultats Google).
  await sharp(svg).resize(192, 192).png().toFile(path.join(PUBLIC, "icon-192.png"));
  await sharp(svg).resize(512, 512).png().toFile(path.join(PUBLIC, "icon-512.png"));
  console.log("[favicons] icon.png, apple-icon.png, favicon.ico, icon-192.png et icon-512.png générés.");
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
