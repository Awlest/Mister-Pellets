/**
 * Typographie des montants et de la ponctuation à l'affichage.
 *
 * Sur téléphone, un montant écrit avec des espaces ordinaires se coupait en
 * fin de ligne : « 28 / 900 », « 41 100 / € », un « € » ou un « : » seul au
 * début de la ligne suivante (recette du 11/11/2026). Deux outils, une seule
 * règle :
 * - `formatEuros` écrit tout montant calculé par le code ;
 * - `typo` corrige un texte écrit à la main (articles, guides, FAQ, tableaux),
 *   au moment de l'afficher. La source reste en espaces ordinaires, et ce qui
 *   part en texte brut (JSON-LD, méta, llms.txt) n'est pas touché.
 *
 * Les deux espaces sont construites par leur code : aucun caractère invisible
 * ni séquence d'échappement dans ce fichier.
 *
 * Module sans dépendance : importé par le serveur, le navigateur et les
 * contrôles.
 */

/** Espace insécable (U+00A0) : avant « € », « % », « : », « ; », « ? », « ! », « » », après « « ». */
export const NBSP = String.fromCharCode(0x00a0);
/** Espace fine insécable (U+202F) : entre les milliers. */
export const NNBSP = String.fromCharCode(0x202f);

/**
 * « 2 890 € », « 12 345 € », ou « 2 317,50 € » avec `cents`. Le résultat ne se
 * coupe nulle part. Écrit à la main plutôt qu'avec Intl : le serveur et le
 * navigateur rendent ainsi la même chaîne, quelle que soit leur version d'ICU.
 *
 * `cents` : `false` arrondit à l'euro (défaut), `true` garde deux décimales,
 * `"auto"` ne les garde que si le montant n'est pas rond.
 */
export function formatEuros(amount: number, { cents = false }: { cents?: boolean | "auto" } = {}): string {
  const toCent = Math.round(amount * 100) / 100;
  const withCents = cents === "auto" ? !Number.isInteger(toCent) : cents;
  const value = withCents ? toCent : Math.round(amount);
  const [whole = "0", decimals] = Math.abs(value).toFixed(withCents ? 2 : 0).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP);
  return `${value < 0 ? "-" : ""}${grouped}${decimals ? `,${decimals}` : ""}${NBSP}€`;
}

/** « 28 900 » : un à trois chiffres puis des groupes de trois, séparés par une espace ordinaire. */
const THOUSANDS = /(?<![\d.,])\d{1,3}(?: \d{3})+(?!\d)/g;
/** Espace avant « € » ou « % ». */
const BEFORE_UNIT = / ([€%])/g;
/**
 * Espace avant une ponctuation double ou un guillemet fermant. Ce qui suit
 * doit être une fin de mot : un « ?param » ou un « :root » ne sont pas visés.
 */
const BEFORE_PUNCTUATION = / ([:;?!»])(?=[\s.,;:!?)\]«»…]|$)/g;
const AFTER_GUILLEMET = /« /g;
/** « 3 000 à 4 500 € », « 10 à 50 % » : la fourchette tient en un bloc. */
const RANGE = new RegExp(`(\\d) à (?=\\d[\\d${NNBSP}]*(?:,\\d+)?${NBSP}[€%])`, "g");

/**
 * Rend insécables, dans un texte affiché : les milliers d'un nombre, l'espace
 * avant « € » et « % », les fourchettes « X à Y € », l'espace avant « : »,
 * « ; », « ? », « ! » et à l'intérieur des guillemets. Sans effet sur un texte
 * déjà corrigé.
 */
export function typo(text: string): string {
  return text
    .replace(THOUSANDS, (number) => number.split(" ").join(NNBSP))
    .replace(BEFORE_UNIT, (_, sign: string) => NBSP + sign)
    .replace(BEFORE_PUNCTUATION, (_, sign: string) => NBSP + sign)
    .replace(AFTER_GUILLEMET, `«${NBSP}`)
    .replace(RANGE, (_, digit: string) => `${digit}${NBSP}à${NBSP}`);
}
