/**
 * Fonds de section — palette 60/30/10 appliquée au rythme de la page.
 *
 * Le site alterne crème / beige d'une section à l'autre, avec le vert profond
 * comme rupture ponctuelle. Deux sections consécutives de même fond effacent la
 * séparation visuelle : la page paraît alors être un seul bloc mou, et les
 * hauteurs de section deviennent illisibles.
 *
 * Les composants de section exposent donc une prop `tone` pour que la page
 * décide de l'alternance, au lieu de la figer dans chaque composant.
 */
export type SectionTone = "cream" | "beige" | "green";

export const SECTION_TONE: Record<SectionTone, string> = {
  cream: "bg-mp-cream",
  beige: "bg-mp-beige",
  green: "bg-mp-green-deep text-white",
};

export function toneClass(tone: SectionTone): string {
  return SECTION_TONE[tone];
}
