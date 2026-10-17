// Garde-fou des interdits visuels de DESIGN.md (section « Interdits »).
//
//   pnpm run check:design
//
// Parcourt app/ et components/ (fichiers .ts, .tsx, .css) et échoue, avec
// fichier:ligne, sur :
//   - les dégradés (linear/radial/conic-gradient, bg-gradient-*, bg-linear-*,
//     from-/via-/to-), sauf le remplissage à arrêt net d'un curseur marqué
//     `check-design: allow range-fill` ;
//   - les flous (backdrop-blur, backdrop-filter, blur(), blur-*) ;
//   - les lueurs : ombre à décalage nul avec flou, drop-shadow, ombre colorée
//     par un jeton, jeton --shadow-glow ;
//   - les courbes à ressort (cubic-bezier dont une ordonnée sort de [0, 1],
//     transition de type « spring ») ;
//   - les animations en boucle (animate-pulse, -ping, -bounce, `infinite`),
//     sauf dans un fichier marqué `check-design: loading` ;
//   - la lévitation au survol (hover:-translate-y) ;
//   - les marges négatives verticales (-mt-, -mb-, margin-top/bottom négatif) ;
//   - les couleurs en dur (#hex, rgb(), hsl(), oklch()) dans les .ts/.tsx, hors
//     images Open Graph et icônes générées.
//
// Exception ponctuelle : un commentaire `check-design: allow (raison)` sur la
// ligne visée ou sur l'une des deux lignes au-dessus. Les commentaires du code
// ne sont pas analysés (seulement le code), mais c'est là qu'on lit les marques.
//
// Node pur, sans dépendance. Code de sortie 1 s'il reste un écart.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const SCAN_DIRS = ["app", "components"];
// Interface d'administration générée par Payload : hors site public.
const SKIP_DIRS = new Set(["node_modules", ".next", "(payload)"]);
const EXTENSIONS = /\.(tsx?|css)$/;
// Images générées (Satori ne lit pas les variables CSS) : couleurs en dur admises.
const GENERATED_IMAGE = /(^|\/)(opengraph-image|twitter-image|icon|apple-icon)\.tsx$/;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (EXTENSIONS.test(name)) out.push(full);
  }
  return out;
}

/**
 * Remplace le contenu des commentaires par des espaces (sauts de ligne gardés,
 * donc numéros de ligne intacts). Chaînes ' et " fermées en fin de ligne au
 * plus tard : une apostrophe de texte JSX ne déborde pas sur la suite.
 */
function stripComments(src, isCss) {
  let out = "";
  let i = 0;
  let state = "code"; // code | line | block | sq | dq | tpl
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (state === "code") {
      if (c === "/" && n === "*") { state = "block"; out += "  "; i += 2; continue; }
      if (!isCss && c === "/" && n === "/" && src[i - 1] !== ":") { state = "line"; out += "  "; i += 2; continue; }
      if (c === "'") state = "sq";
      else if (c === '"') state = "dq";
      else if (c === "`" && !isCss) state = "tpl";
      out += c; i += 1; continue;
    }
    if (state === "line") {
      if (c === "\n") { state = "code"; out += c; } else out += " ";
      i += 1; continue;
    }
    if (state === "block") {
      if (c === "*" && n === "/") { state = "code"; out += "  "; i += 2; continue; }
      out += c === "\n" ? c : " "; i += 1; continue;
    }
    // Chaînes : recopiées telles quelles (on y cherche aussi les classes).
    if (c === "\\") { out += c + (n ?? ""); i += 2; continue; }
    if ((state === "sq" && (c === "'" || c === "\n")) || (state === "dq" && (c === '"' || c === "\n")) || (state === "tpl" && c === "`")) {
      state = "code";
    }
    out += c; i += 1;
  }
  return out;
}

const B = `(?:^|[\\s"'\`:{(\\[])`; // début de classe : espace, guillemet ou variante
const RULES = [
  {
    id: "dégradé",
    re: /\b(?:repeating-)?(?:linear|radial|conic)-gradient\(/,
    allow: "range-fill",
    msg: "dégradé interdit : un aplat issu des jetons --mp-*",
  },
  {
    id: "dégradé",
    re: new RegExp(`${B}(?:bg-gradient-|bg-linear-|bg-radial|bg-conic|(?:from|via|to)-(?:mp-|white|black|transparent|\\[|[a-z]+-\\d{2,3}))`),
    msg: "classes de dégradé Tailwind interdites",
  },
  {
    id: "flou",
    re: new RegExp(`backdrop-blur|backdrop-filter|\\bblur\\(|${B}blur(?:-[a-z0-9[\\]]+)?(?=[\\s"'\`]|$)`),
    msg: "flou décoratif interdit : fond opaque (jeton de surface plein)",
  },
  {
    id: "lueur",
    re: /(?:box|text)-shadow\s*:\s*0(?:px)?\s+0(?:px)?\s+[1-9]|shadow-\[0_0_[1-9]|drop-shadow|shadow-glow|--shadow-glow|\bshadow-mp-/,
    msg: "halo ou lueur interdits : ombre de l'échelle (shadow-md/lg) ou filet",
  },
  {
    id: "ressort",
    test: (line) => {
      if (/type\s*:\s*["']spring["']/.test(line)) return true;
      const re = /cubic-bezier\(\s*([-\d.]+)\s*[,_]\s*([-\d.]+)\s*[,_]\s*([-\d.]+)\s*[,_]\s*([-\d.]+)\s*\)/g;
      for (const m of line.matchAll(re)) {
        const y1 = Number(m[2]);
        const y2 = Number(m[4]);
        if (y1 < 0 || y1 > 1 || y2 < 0 || y2 > 1) return true;
      }
      return false;
    },
    msg: "courbe à ressort ou à rebond interdite : var(--mp-ease-out)",
  },
  {
    id: "boucle",
    re: /\banimate-(?:pulse|ping|bounce)\b|\binfinite\b/,
    loadingOk: true,
    msg: "animation en boucle décorative interdite (sauf indicateur de chargement)",
  },
  {
    id: "lévitation",
    re: /hover:-translate-y/,
    msg: "carte qui lévite au survol : signaler le survol par la bordure ou la couleur",
  },
  {
    id: "superposition",
    re: new RegExp(`${B}-m[tb]-|margin-(?:top|bottom)\\s*:\\s*-`),
    msg: "marge négative verticale : un bloc ne monte pas sur le précédent",
  },
  {
    id: "couleur en dur",
    tsOnly: true,
    re: /(?<![&\w])#[0-9a-fA-F]{3,8}\b|(?<![a-zA-Z-])(?:rgba?|hsla?|oklch)\(/,
    msg: "couleur en dur : utiliser un jeton (bg-mp-*, text-mp-*, var(--mp-*))",
  },
];

/** Le dégradé du curseur doit être un vrai arrêt net : deux couleurs, même position. */
function isHardStopRangeFill(lines, index) {
  const text = lines.slice(index, index + 8).join(" ");
  const start = text.search(/linear-gradient\(/);
  if (start < 0) return false;
  let depth = 0;
  let body = "";
  for (let i = text.indexOf("(", start); i < text.length; i++) {
    const c = text[i];
    if (c === "(") depth++;
    if (c === ")") depth--;
    if (depth === 0) break;
    body += c;
  }
  const parts = [];
  let cur = "";
  depth = 0;
  for (const c of body.slice(1)) {
    if (c === "(") depth++;
    if (c === ")") depth--;
    if (c === "," && depth === 0) { parts.push(cur.trim()); cur = ""; } else cur += c;
  }
  parts.push(cur.trim());
  const stops = parts.filter((p) => !/^to\s|deg$/.test(p));
  if (stops.length !== 2) return false;
  const pos = stops.map((s) => s.replace(/^var\([^)]*\)\s*|^#[0-9a-fA-F]+\s*/, "").trim());
  return pos[0] !== "" && pos[0] === pos[1];
}

const findings = [];
const files = SCAN_DIRS.flatMap((d) => walk(join(ROOT, d)));

for (const file of files) {
  const rel = relative(ROOT, file).split(sep).join("/");
  const isCss = rel.endsWith(".css");
  const source = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const original = source.split("\n");
  const code = stripComments(source, isCss).split("\n");
  const loadingFile = /check-design:\s*(?:allow\s+)?loading/.test(source);

  code.forEach((line, i) => {
    if (!line.trim()) return;
    const context = original.slice(Math.max(0, i - 2), i + 1).join("\n");
    for (const rule of RULES) {
      if (rule.tsOnly && (isCss || GENERATED_IMAGE.test(rel))) continue;
      const hit = rule.test ? rule.test(line) : rule.re.test(line);
      if (!hit) continue;
      if (rule.loadingOk && loadingFile) continue;
      if (rule.allow === "range-fill") {
        if (/check-design:\s*allow range-fill/.test(context) && isHardStopRangeFill(original, i)) continue;
      } else if (/check-design:\s*allow\b/.test(context)) {
        continue;
      }
      findings.push(`${rel}:${i + 1}  [${rule.id}] ${rule.msg}\n    ${original[i].trim().slice(0, 160)}`);
    }
  });
}

if (findings.length) {
  console.error(`check:design : ${findings.length} écart(s) aux interdits de DESIGN.md\n`);
  console.error(findings.join("\n"));
  process.exit(1);
}
console.log(`check:design : ${files.length} fichiers, aucun dégradé, halo, flou, superposition ni animation lourde.`);
