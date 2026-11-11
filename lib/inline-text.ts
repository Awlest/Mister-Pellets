import { parseInline } from "./legal/inline";

/**
 * Textes de contenu (articles, guides, FAQ, pages marque) avec liens.
 *
 * Ces textes sont des chaînes dans lib/*.ts. Un lien s'y écrit
 * `[texte](adresse)` et du gras `**texte**`, la même écriture que les pages
 * légales (lib/legal/inline.ts). `InlineText` (components/ui/inline-text.tsx)
 * les affiche ; `plainText` les retire pour tout usage en texte brut : méta
 * description, JSON-LD, llms.txt, recherche de la FAQ.
 */
export function plainText(text: string): string {
  return parseInline(text)
    .map((part) => part.text)
    .join("");
}
