/**
 * Génère les icônes du site à partir de la tête de la mascotte
 * (public/logo-mister-pellets-tete.svg, planche de marque du 14/11/2026).
 * Sortie :
 * - app/favicon.ico : 16, 32 et 48 px. Le 16 px est cadré plus serré sur le
 *   visage, sinon la flamme et le visage se fondent en une tache ;
 * - app/icon.png (32 px) : repli PNG de app/icon.svg ;
 * - app/apple-icon.png (180 px), public/icon-192.png et public/icon-512.png
 *   (manifeste) : opaques, sur fond crème, avec une marge pour le masque
 *   arrondi d'iOS et d'Android.
 * app/icon.svg est la même tête en vectoriel, posée à la main.
 * Exécution : ./node_modules/.bin/tsx scripts/generate-favicons.ts
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const SRC = path.resolve(process.cwd(), "public/logo-mister-pellets-tete.svg");
const APP = path.resolve(process.cwd(), "app");
const PUBLIC = path.resolve(process.cwd(), "public");
const CREAM = { r: 244, g: 237, b: 225, alpha: 1 };
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };

/** Fichier .ico à plusieurs images, chaque PNG embarqué tel quel. */
function icoFromPngs(images: { png: Buffer; size: number }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // réservé
  header.writeUInt16LE(1, 2); // type : icône
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ png, size }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0); // largeur
    entry.writeUInt8(size, 1); // hauteur
    entry.writeUInt8(0, 2); // palette
    entry.writeUInt8(0, 3); // réservé
    entry.writeUInt16LE(1, 4); // plans
    entry.writeUInt16LE(32, 6); // bits par pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
}

async function main(): Promise<void> {
  const svg = fs.readFileSync(SRC);
  // Tête entière dans un carré de 1024 px, fond transparent : base de toutes les réductions.
  const square = await sharp(svg, { density: 600 })
    .resize(1024, 1024, { fit: "contain", background: CLEAR })
    .png()
    .toBuffer();
  const at = (size: number, src = square) => sharp(src).resize(size, size, { kernel: "lanczos3" }).png().toBuffer();
  // 16 px : carré de 82 % de la hauteur, calé en bas et centré (le visage remplit l'icône).
  const side = Math.round(1024 * 0.82);
  const tight = await sharp(square)
    .extract({ left: Math.round((1024 - side) / 2), top: 1024 - side, width: side, height: side })
    .png()
    .toBuffer();
  const png16 = await at(16, tight);
  const png32 = await at(32);
  const png48 = await at(48);
  fs.writeFileSync(path.join(APP, "favicon.ico"), icoFromPngs([
    { png: png16, size: 16 },
    { png: png32, size: 32 },
    { png: png48, size: 48 },
  ]));
  fs.writeFileSync(path.join(APP, "icon.png"), png32);
  // Icônes opaques : tête à 80 % du carré, fond crème.
  const opaque = async (size: number, file: string) => {
    const inner = Math.round(size * 0.8);
    const head = await sharp(square).resize(inner, inner, { kernel: "lanczos3" }).png().toBuffer();
    await sharp({ create: { width: size, height: size, channels: 4, background: CREAM } })
      .composite([{ input: head, gravity: "center" }])
      .flatten({ background: CREAM })
      .png()
      .toFile(file);
  };
  await opaque(180, path.join(APP, "apple-icon.png"));
  await opaque(192, path.join(PUBLIC, "icon-192.png"));
  await opaque(512, path.join(PUBLIC, "icon-512.png"));
  console.log("[favicons] favicon.ico (16, 32, 48), icon.png, apple-icon.png, icon-192.png et icon-512.png générés.");
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
