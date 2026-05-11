/**
 * One-shot : transforme les fichiers seed *.products.ts en remplaçant
 *   surfaceMin: X,
 *   surfaceMax: Y,
 * par
 *   heatedVolumeM3: Z,
 * où Z = round(Y / 0.65 / 10) * 10 (volume original du catalogue, à la dizaine).
 *
 * Usage : node scripts/transform-seeds-to-m3.mjs
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const FILES = [
  "ek63-products.ts",
  "edilkamin-products.ts",
  "dielle-products.ts",
  "dielle-2025-update.ts",
  "ferlux-products.ts",
];

for (const file of FILES) {
  const path = join(__dirname, file);
  let content;
  try {
    content = await readFile(path, "utf8");
  } catch {
    console.log(`[skip] ${file} — not found`);
    continue;
  }

  // Pattern : capture les blocs surfaceMin: N, surfaceMax: M, (avec whitespace flexible)
  // Replace by heatedVolumeM3: V, (computed)
  const pattern = /(\s*)surfaceMin:\s*(\d+),\s*\n\s*surfaceMax:\s*(\d+),/g;
  let replaceCount = 0;
  const newContent = content.replace(pattern, (_match, indent, _min, max) => {
    const volumeM3 = Math.round(Number(max) / 0.65 / 10) * 10;
    replaceCount++;
    return `${indent}heatedVolumeM3: ${volumeM3},`;
  });

  if (replaceCount === 0) {
    console.log(`[ok ] ${file} — no surfaceMin/Max occurrences (already migrated?)`);
    continue;
  }

  await writeFile(path, newContent, "utf8");
  console.log(`[done] ${file} — ${replaceCount} products converted`);
}
