/**
 * Banc de la mise au carré des détourés (lib/detoure-carre.ts), sur des
 * images fabriquées. Le 31/10/2026, la même fonction passée sur les 1 012
 * photos du site a mis au carré les 14 détourés non carrés et aucune des
 * 438 ambiances.
 *
 *   node --import tsx scripts/check-detoure.ts
 */
import sharp from "sharp";
import { Media } from "@/collections/Media";
import { squareCutout } from "@/lib/detoure-carre";

let ko = 0;
function check(label: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) ko++;
  console.log(`${ok ? "ok  " : "KO  "} ${label}${ok ? "" : `\n      attendu ${JSON.stringify(want)}\n      obtenu  ${JSON.stringify(got)}`}`);
}

type Rgba = { r: number; g: number; b: number; alpha: number };
const WHITE: Rgba = { r: 255, g: 255, b: 255, alpha: 1 };
const CLEAR: Rgba = { r: 255, g: 255, b: 255, alpha: 0 };
const STOVE: Rgba = { r: 40, g: 40, b: 40, alpha: 1 };

/** Fond uni + « poêle » (rectangle sombre) à la position donnée. */
async function photo(
  w: number,
  h: number,
  background: Rgba,
  stove: { left: number; top: number; width: number; height: number },
  format: "png" | "jpeg" = "png",
) {
  const block = await sharp({ create: { width: stove.width, height: stove.height, channels: 4, background: STOVE } })
    .png()
    .toBuffer();
  const img = sharp({ create: { width: w, height: h, channels: 4, background } }).composite([
    { input: block, left: stove.left, top: stove.top },
  ]);
  return format === "jpeg" ? img.flatten({ background: "#fff" }).jpeg({ quality: 92 }).toBuffer() : img.png().toBuffer();
}

/** Nombre de pixels sombres : le poêle doit rester entier. */
async function darkPixels(buf: Buffer) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let n = 0;
  for (let i = 0; i < data.length; i += info.channels) if ((data[i + 3] ?? 0) > 128 && (data[i] ?? 255) < 100) n++;
  return n;
}

async function size(buf: Buffer) {
  const m = await sharp(buf).metadata();
  return [m.width, m.height, m.format];
}

// 1. Détouré portrait sur blanc : complété en largeur, poêle intact.
{
  const src = await photo(300, 600, WHITE, { left: 50, top: 50, width: 200, height: 500 });
  const r = await squareCutout(sharp, src);
  check("portrait blanc : carré 600, même format", r && (await size(r.buffer)), [600, 600, "png"]);
  check("portrait blanc : fond repris", r?.background, { r: 255, g: 255, b: 255 });
  check("portrait blanc : poêle entier", r && (await darkPixels(r.buffer)), await darkPixels(src));
}

// 2. Poêle qui touche le haut et le bas : les bords longs (côtés) restent unis.
{
  const src = await photo(300, 600, WHITE, { left: 60, top: 0, width: 180, height: 600 });
  const r = await squareCutout(sharp, src);
  check("poêle bord à bord en hauteur : mis au carré", r && (await size(r.buffer)), [600, 600, "png"]);
}

// 3. Détouré transparent paysage : complété en hauteur, fond transparent.
{
  const src = await photo(400, 200, CLEAR, { left: 100, top: 20, width: 200, height: 160 });
  const r = await squareCutout(sharp, src);
  check("paysage transparent : carré 400", r && (await size(r.buffer)), [400, 400, "png"]);
  check("paysage transparent : fond transparent", r?.background, "transparent");
}

// 4. Fond gris clair (#F4F4F4) en JPEG : complément de la même couleur.
{
  const src = await photo(300, 500, { r: 244, g: 244, b: 244, alpha: 1 }, { left: 60, top: 40, width: 180, height: 420 }, "jpeg");
  const r = await squareCutout(sharp, src);
  check("JPEG gris clair : carré 500 en JPEG", r && (await size(r.buffer)), [500, 500, "jpeg"]);
  const bg = r?.background;
  check("JPEG gris clair : fond ≈ 244", typeof bg === "object" && Math.abs(bg.r - 244) <= 2, true);
}

// 5. Déjà carré : rien à faire.
{
  const src = await photo(500, 500, WHITE, { left: 100, top: 50, width: 300, height: 400 });
  check("carré : intact", await squareCutout(sharp, src), null);
}

// 6. Ambiance : sol sombre sur un bord long, intacte (le point focal s'en charge).
{
  const src = await photo(640, 360, WHITE, { left: 0, top: 300, width: 640, height: 60 });
  check("ambiance paysage (sol en bas) : intacte", await squareCutout(sharp, src), null);
}

// 7. Ambiance portrait : mur blanc à gauche, meuble sur le bord droit.
{
  const src = await photo(360, 640, WHITE, { left: 250, top: 100, width: 110, height: 400 });
  check("ambiance portrait (meuble à droite) : intacte", await squareCutout(sharp, src), null);
}

// 8. Hook de la collection Media : remplace req.file avant le calcul des tailles.
{
  const hook = Media.hooks?.beforeOperation?.[0];
  const run = async (data: Buffer, mimetype: string) => {
    const req = {
      file: { data, mimetype, name: "test.png", size: data.length },
      payload: { config: { sharp }, logger: { info: () => {}, warn: () => {} } },
    };
    await hook?.({ args: {}, operation: "create", req } as unknown as Parameters<NonNullable<typeof hook>>[0]);
    return req.file;
  };
  const tall = await photo(300, 600, WHITE, { left: 50, top: 50, width: 200, height: 500 });
  const f = await run(tall, "image/png");
  check("hook : fichier remplacé par le carré", [await size(f.data), f.size === f.data.length], [[600, 600, "png"], true]);
  const room = await photo(640, 360, WHITE, { left: 0, top: 300, width: 640, height: 60 });
  check("hook : ambiance laissée telle quelle", (await run(room, "image/png")).data === room, true);
  check("hook : PDF ignoré", (await run(Buffer.from("%PDF-1.4"), "application/pdf")).data.toString(), "%PDF-1.4");
}

console.log(ko ? `\n${ko} contrôle(s) en échec` : "\nTous les contrôles passent");
process.exit(ko ? 1 : 0);
