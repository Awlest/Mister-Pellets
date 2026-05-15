/**
 * Génère les 9 icônes SVG des variantes — Section 3 du brief.
 *
 * Style : outline, trait ~2,5 px, couleur unique vert profond #174724,
 * viewBox 64×64, fond transparent. Écrites dans public/icones-variantes/
 * → servies directement par Vercel à l'URL /icones-variantes/{slug}.svg
 * (pas besoin de la médiathèque Payload ni du storage Blob).
 *
 * Le nom de fichier correspond au slug de la valeur d'option correspondante
 * (variant-option-values) — la page produit les résout automatiquement.
 *
 * Exécution : node scripts/generate-variant-icons.mjs
 */
import fs from "fs";
import path from "path";

const DIR = path.resolve(process.cwd(), "public/icones-variantes");
fs.mkdirSync(DIR, { recursive: true });

/** Enveloppe SVG commune (style design system Mister Pellets). */
const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" ` +
  `stroke="#174724" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">` +
  body +
  `</svg>\n`;

/** Flamme standard réutilisée. */
const FLAME =
  `<path d="M32 9C40 21 43 31 38 41 35 47 29 47 26 41 23 35 29 30 28 22 ` +
  `31 27 33 28 34 28 36 21 33 15 32 9Z"/>`;

/** Petite flamme (coin). */
const FLAME_SM =
  `<path d="M26 9C31 17 33 22 30 28 28 32 23 32 21 28 19 24 23 20 22 15 ` +
  `24 18 26 19 27 19 29 14 27 11 26 9Z"/>`;

const icons = {
  // ----- Type de chauffe (7) -----
  rayonnant:
    `<circle cx="32" cy="32" r="11"/>` +
    `<path d="M32 5v7M32 52v7M5 32h7M52 32h7M14 14l5 5M45 45l5 5M50 14l-5 5M19 45l-5 5"/>`,

  "ventile-standard":
    `<circle cx="32" cy="33" r="20"/><circle cx="32" cy="33" r="3"/>` +
    `<path d="M32 33 44 18M32 33 50 42M32 33 16 44"/>`,

  "ventile-canalise-1":
    `<circle cx="32" cy="44" r="15"/><circle cx="32" cy="44" r="2.5"/>` +
    `<path d="M32 44 43 33M32 44 45 51M32 44 21 50"/>` +
    `<path d="M32 24V7M25 14l7-7 7 7"/>`,

  "ventile-canalise-2":
    `<circle cx="32" cy="45" r="14"/><circle cx="32" cy="45" r="2.5"/>` +
    `<path d="M32 45 42 36M32 45 44 51M32 45 22 51"/>` +
    `<path d="M25 28 17 9M17 9l-1 9M17 9l8 2"/>` +
    `<path d="M39 28 47 9M47 9l1 9M47 9l-8 2"/>`,

  "hybride-bois":
    FLAME_SM +
    `<rect x="13" y="42" width="38" height="13" rx="6.5"/>` +
    `<ellipse cx="21" cy="48.5" rx="3" ry="4.5"/>`,

  hydro:
    FLAME +
    `<path d="M32 27C35 31 36 35 32 38 28 35 29 31 32 27Z"/>`,

  "hybride-hydro":
    FLAME +
    `<path d="M33 24C36 28 37 31 33 34 30 31 30 28 33 24Z"/>` +
    `<circle cx="22" cy="46" r="2.5"/><circle cx="29" cy="49" r="2.5"/>`,

  // ----- Système d'alimentation (2) -----
  toboggan:
    `<circle cx="15" cy="14" r="4"/>` +
    `<path d="M17 17C30 22 33 33 32 42"/>` +
    `<path d="M32 42C37 47 39 52 35 57 32 60 28 58 28 53 28 49 32 47 31 43 33 46 32 42 32 42Z"/>`,

  brasier:
    `<path d="M14 36C14 49 22 55 32 55 42 55 50 49 50 36"/>` +
    `<line x1="12" y1="36" x2="52" y2="36"/>` +
    `<path d="M32 55v5M24 60h16"/>` +
    `<path d="M32 31C32 25 28 21 30 14 31 18 33 19 33 19 35 15 33 10 35 6 40 14 41 23 36 30"/>` +
    `<path d="M25 31C24 27 21 25 23 20 24 23 26 24 26 24 26 20 25 19 26 16 29 21 29 27 27 31"/>`,
};

let count = 0;
for (const [name, body] of Object.entries(icons)) {
  fs.writeFileSync(path.join(DIR, `${name}.svg`), svg(body));
  count++;
}
console.log(`[icones] ${count} icônes SVG écrites dans public/icones-variantes/`);
