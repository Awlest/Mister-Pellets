/**
 * Slugifie une chaîne pour générer des identifiants techniques propres :
 * - lowercase
 * - retire les accents (é → e, è → e, …)
 * - remplace tout caractère non alphanumérique par un tiret
 * - dédoublonne les tirets, trim les tirets en bordure
 *
 * Helper partagé par les collections de configuration des variantes
 * (variant-option-types, variant-option-values). La collection Products
 * conserve sa propre copie inline historique — on n'y touche pas.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // retire les diacritiques (accents)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
