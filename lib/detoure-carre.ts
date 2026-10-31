import type sharpLib from "sharp";
import type { Region } from "sharp";

/**
 * Photo détourée remise au carré à l'envoi.
 *
 * La galerie, les cartes boutique et les vignettes recadrent chaque photo en
 * carré (object-cover). Un détouré plus haut que large y perdait le haut ou
 * le bas du poêle, et le point focal n'y peut rien quand le poêle occupe toute
 * la hauteur (relevé du 31/10/2026). On complète donc l'image jusqu'au carré,
 * sans rien rogner : le poêle reste entier partout.
 *
 * Détourée = les deux bords longs (ceux qu'on prolonge) sont unis, blancs ou
 * transparents. Le complément reprend leur couleur : aucun raccord visible.
 * Une ambiance a un mur, un sol ou un meuble sur ces bords : elle n'est pas
 * touchée, son cadrage passe par le point focal réglé dans l'admin.
 */

type Sharp = typeof sharpLib;

/** Épaisseur des bandes examinées, en part du petit côté (2 px au moins). */
const BAND = 0.01;
/** Part de pixels unis exigée sur chacun des deux bords longs. */
const PLAIN_MIN = 0.97;
/** Pixel « blanc » : canaux ≥ 240 et quasi neutre (photo JPEG, fond #F4F4F4). */
const WHITE_MIN = 240;
const NEUTRAL_SPREAD = 12;
/** Pixel transparent. */
const ALPHA_MAX = 10;
/** En deçà de cet écart entre côtés, la photo est considérée carrée. */
const SQUARE_TOLERANCE = 0.01;

export type SquaredPhoto = {
  buffer: Buffer;
  /** Taille avant et après, pour le journal. */
  from: { width: number; height: number };
  side: number;
  background: "transparent" | { r: number; g: number; b: number };
};

type BandStats = { plain: number; total: number; transparent: number; r: number; g: number; b: number; opaque: number };

async function bandStats(sharp: Sharp, input: Buffer, region: Region): Promise<BandStats> {
  const { data, info } = await sharp(input).extract(region).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const s: BandStats = { plain: 0, total: 0, transparent: 0, r: 0, g: 0, b: 0, opaque: 0 };
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    const a = data[i + 3] ?? 0;
    s.total++;
    if (a <= ALPHA_MAX) {
      s.plain++;
      s.transparent++;
    } else if (Math.min(r, g, b) >= WHITE_MIN && Math.max(r, g, b) - Math.min(r, g, b) <= NEUTRAL_SPREAD) {
      s.plain++;
      s.r += r;
      s.g += g;
      s.b += b;
      s.opaque++;
    }
  }
  return s;
}

/**
 * Renvoie la photo complétée au carré, ou null si elle est déjà carrée, n'est
 * pas un détouré, ou n'est pas une image fixe lisible. Même format en sortie
 * qu'en entrée (Payload convertit ensuite en WebP), sans perte de qualité.
 */
export async function squareCutout(sharp: Sharp, input: Buffer): Promise<SquaredPhoto | null> {
  let meta = await sharp(input).metadata();
  if (!meta.width || !meta.height || (meta.pages ?? 1) > 1) return null;
  const format = meta.format;
  if (format !== "jpeg" && format !== "png" && format !== "webp") return null;

  // Photo de téléphone tournée par EXIF : on travaille sur l'image redressée.
  let source = input;
  if (meta.orientation && meta.orientation !== 1) {
    source = await sharp(input).rotate().png().toBuffer();
    meta = await sharp(source).metadata();
  }
  const width = meta.width!;
  const height = meta.height!;
  if (Math.abs(width - height) <= SQUARE_TOLERANCE * Math.max(width, height)) return null;

  const portrait = height > width;
  const band = Math.max(2, Math.round(Math.min(width, height) * BAND));
  // Bords longs : gauche et droite d'un portrait, haut et bas d'un paysage.
  const regions: Region[] = portrait
    ? [
        { left: 0, top: 0, width: band, height },
        { left: width - band, top: 0, width: band, height },
      ]
    : [
        { left: 0, top: 0, width, height: band },
        { left: 0, top: height - band, width, height: band },
      ];
  const stats = await Promise.all(regions.map((r) => bandStats(sharp, source, r)));
  if (stats.some((s) => s.plain / s.total < PLAIN_MIN)) return null;

  const transparent = stats.reduce((n, s) => n + s.transparent, 0);
  const opaque = stats.reduce((n, s) => n + s.opaque, 0);
  const background: SquaredPhoto["background"] =
    meta.hasAlpha && transparent >= opaque
      ? "transparent"
      : {
          r: Math.round(stats.reduce((n, s) => n + s.r, 0) / Math.max(1, opaque)),
          g: Math.round(stats.reduce((n, s) => n + s.g, 0) / Math.max(1, opaque)),
          b: Math.round(stats.reduce((n, s) => n + s.b, 0) / Math.max(1, opaque)),
        };

  const side = Math.max(width, height);
  const padX = side - width;
  const padY = side - height;
  let out = sharp(source);
  if (background !== "transparent" && meta.hasAlpha) out = out.flatten({ background });
  out = out.extend({
    left: Math.floor(padX / 2),
    right: padX - Math.floor(padX / 2),
    top: Math.floor(padY / 2),
    bottom: padY - Math.floor(padY / 2),
    background: background === "transparent" ? { r: 255, g: 255, b: 255, alpha: 0 } : { ...background, alpha: 1 },
  });
  const encoded =
    format === "jpeg"
      ? out.jpeg({ quality: 95, chromaSubsampling: "4:4:4" })
      : format === "png"
        ? out.png()
        : out.webp({ lossless: true });
  return { buffer: await encoded.toBuffer(), from: { width, height }, side, background };
}
