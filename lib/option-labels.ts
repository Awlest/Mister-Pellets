/**
 * Libellés de finition affichés en français.
 *
 * Les fabricants (MCZ surtout, Cadel, Austroflamm) nomment leurs finitions en
 * anglais ou en italien : « Métal Black », « Céramique Warm Grey », « Materia
 * Tortora ». Les valeurs de l'admin, les références, les données structurées
 * et le flux Merchant ne changent pas : la traduction ne se fait qu'à
 * l'affichage, ici (sélecteurs de la fiche, pastilles, texte alternatif des
 * photos).
 *
 * Traduction mot à mot, sans interprétation : « Warm Grey » donne « Gris
 * chaud », « Dark » donne « Foncé ». Ce qui n'est pas une couleur reste tel
 * quel : noms de série (« Line », « Plain »), noms de matière du fabricant
 * (« Materia », « Corten », « Serpentino »), et tout mot absent de la table.
 *
 * Relevé du 11/11/2026 : 107 libellés distincts sur les 246 fiches affichées
 * (scripts/releve-finitions.ts). `check:catalogue` refuse qu'un mot de couleur
 * anglais ou italien de ce relevé ressorte à l'affichage.
 */

/** Expressions d'abord, mots seuls ensuite : [fabricant, masculin, féminin]. */
const TRANSLATIONS: readonly (readonly [string, string, string])[] = [
  ["Salt & Pepper", "Poivre et sel", "Poivre et sel"],
  ["Marble Grey Clouds", "Marbre gris nuagé", "Marbre gris nuagé"],
  ["Velvet Ivory", "Ivoire velours", "Ivoire velours"],
  ["Ossido Bruno", "Oxyde brun", "Oxyde brun"],
  ["Nero Greco", "Noir grec", "Noire grecque"],
  ["Dark Anthracite", "Anthracite foncé", "Anthracite foncé"],
  ["Bright White", "Blanc éclatant", "Blanche éclatante"],
  ["Matt Black", "Noir mat", "Noire mate"],
  ["Gloss Black", "Noir brillant", "Noire brillante"],
  ["Gloss White", "Blanc brillant", "Blanche brillante"],
  ["all Black", "tout noir", "toute noire"],
  ["Warm Grey", "Gris chaud", "Gris chaud"],
  ["Light Bronze", "Bronze clair", "Bronze clair"],
  ["Black", "Noir", "Noire"],
  ["White", "Blanc", "Blanche"],
  ["Grey", "Gris", "Grise"],
  ["Dark", "Foncé", "Foncée"],
  ["Silver", "Argent", "Argent"],
  ["Gold", "Or", "Or"],
  ["Ivory", "Ivoire", "Ivoire"],
  ["Sand", "Sable", "Sable"],
  ["Smoke", "Fumé", "Fumée"],
  ["Titanium", "Titane", "Titane"],
  ["Limestone", "Calcaire", "Calcaire"],
  ["Tortora", "Tourterelle", "Tourterelle"],
  ["Piombo", "Plomb", "Plomb"],
  ["Nero", "Noir", "Noire"],
  ["Bianco", "Blanc", "Blanche"],
  ["Grigio", "Gris", "Grise"],
];

/** Matières au féminin : la couleur s'accorde (« Céramique Blanche », « Fonte Fumée »). */
const FEMININE = /^(?:Céramique|Fonte|Pierre)(?=$|\s)/i;

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Mot entier seulement, sans tenir compte de la casse : « Blackline » ou
 * « Whitestone » ne sont pas touchés. Un trait d'union ou une barre borne
 * aussi un mot (« Anthracite-titanium », « Blanc-gold »).
 */
const RULES = TRANSLATIONS.map(([source, masculine, feminine]) => ({
  pattern: new RegExp(`(^|[\\s(/-])(${escape(source)})(?=$|[\\s),/-])`, "gi"),
  masculine,
  feminine,
}));

const lowerFirst = (s: string): string => s.charAt(0).toLowerCase() + s.slice(1);

function translatePart(part: string): string {
  const feminine = FEMININE.test(part);
  let out = part;
  for (const rule of RULES) {
    out = out.replace(rule.pattern, (_, before: string, found: string) => {
      const french = feminine ? rule.feminine : rule.masculine;
      // « Anthracite-titanium » : le mot du fabricant est en minuscules, sa traduction aussi.
      return before + (found.charAt(0) === found.charAt(0).toLowerCase() ? lowerFirst(french) : french);
    });
  }
  return out;
}

/** « Céramique White + Métal Dark » devient « Céramique Blanche + Métal Foncé ». */
export function displayOptionLabel(label: string): string {
  return label
    .trim()
    .split(" + ")
    .map((part) => translatePart(part.trim()))
    .join(" + ");
}

/**
 * Mots de couleur anglais ou italien courants : aucun ne doit rester dans un
 * libellé affiché. Sert au contrôle (scripts/check-catalogue.ts).
 */
export const FOREIGN_COLOUR_WORD =
  /(?:^|[\s(/+-])(white|black|gr[ae]y|silver|gold|dark|light|bright|matte?|gloss|glossy|sand|smoke|ivory|titanium|red|green|blue|brown|yellow|cream|salt|pepper|marble|clouds?|limestone|nero|bianc[oa]|grigi[oa]|ross[oa]|verde|tortora|piombo|bruno|ossido|greco|avorio|sabbia)(?=$|[\s),/+-])/i;
