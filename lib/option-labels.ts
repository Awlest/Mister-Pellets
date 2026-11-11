/**
 * Libellés de finition affichés en français.
 *
 * Les fabricants (MCZ surtout, Cadel) nomment leurs finitions en anglais :
 * « Métal Black », « Céramique Warm Grey ». La fiche affichait « Couleur :
 * Black ». Les valeurs de l'admin, les références et le flux Merchant ne
 * changent pas : la traduction ne se fait qu'à l'affichage, ici.
 *
 * Seuls les mots de couleur courants sont traduits. Les noms de série
 * (« Line », « Plain »), les noms propres de matière (« Serpentino »,
 * « Corten », « Velvet Ivory ») et tout mot absent de la table restent tels
 * quels.
 */

/** Expressions d'abord, mots seuls ensuite : [anglais, masculin, féminin]. */
const TRANSLATIONS: readonly (readonly [string, string, string])[] = [
  ["Salt & Pepper", "Poivre et sel", "Poivre et sel"],
  ["Matt Black", "Noir mat", "Noire mate"],
  ["Gloss Black", "Noir brillant", "Noire brillante"],
  ["Gloss White", "Blanc brillant", "Blanche brillante"],
  ["all Black", "tout noir", "toute noire"],
  ["Warm Grey", "Gris chaud", "Gris chaud"],
  ["Light Bronze", "Bronze clair", "Bronze clair"],
  ["Black", "Noir", "Noire"],
  ["White", "Blanc", "Blanche"],
  ["Dark", "Foncé", "Foncée"],
  ["Silver", "Argent", "Argent"],
  ["Sand", "Sable", "Sable"],
  ["Smoke", "Fumé", "Fumée"],
  ["Titanium", "Titane", "Titane"],
];

/** Matières au féminin : la couleur s'accorde (« Céramique Blanche », « Fonte Fumée »). */
const FEMININE = /^(?:Céramique|Fonte|Pierre)\b/i;

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function translatePart(part: string): string {
  const feminine = FEMININE.test(part.trim());
  let out = part;
  for (const [english, masculine, feminineForm] of TRANSLATIONS) {
    // Mot entier seulement : « Blackline » ou « Whitestone » ne sont pas touchés.
    out = out.replace(new RegExp(`(^|[\\s(])${escape(english)}(?=$|[\\s),])`, "g"), `$1${feminine ? feminineForm : masculine}`);
  }
  return out;
}

/** « Céramique White + Métal Dark » devient « Céramique Blanche + Métal Foncé ». */
export function displayOptionLabel(label: string): string {
  return label
    .split(" + ")
    .map(translatePart)
    .join(" + ");
}
