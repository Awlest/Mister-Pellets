import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Logos en PNG pour les images générées par next/og (Open Graph), qui ne
 * lisent ni le SVG importé ni les adresses relatives : le fichier de
 * public/brand est lu sur le disque et passé en data URI. Toutes ces images
 * sont construites au build (routes statiques), la lecture n'a lieu qu'alors.
 */
export const BRAND_PNG = {
  /** Logo complet, mascotte et nom, 1180 × 600. */
  full: { file: "mister-pellets-logo.png", width: 1180, height: 600 },
  /** Tête et nom sur deux lignes, 360 × 128. */
  compact: { file: "mister-pellets-logo-compact.png", width: 360, height: 128 },
} as const;

const cache = new Map<string, string>();

export function brandPng(key: keyof typeof BRAND_PNG, height: number): { src: string; width: number; height: number } {
  const { file, width: w, height: h } = BRAND_PNG[key];
  let src = cache.get(file);
  if (!src) {
    src = `data:image/png;base64,${readFileSync(join(process.cwd(), "public", "brand", file)).toString("base64")}`;
    cache.set(file, src);
  }
  return { src, width: Math.round((height * w) / h), height };
}
