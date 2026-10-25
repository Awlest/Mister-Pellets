/**
 * Découpe le texte d'un bloc légal en morceaux : texte, gras, lien.
 *
 * ⚠️ FICHIER COMMUN aux quatre sites d'AWLEST SRL (voir types.ts). Chaque site
 * rend ces morceaux avec ses propres composants et ses propres classes.
 */
export type InlinePart =
  | { kind: "text"; text: string }
  | { kind: "strong"; text: string }
  | { kind: "link"; text: string; href: string };

const PATTERN = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function parseInline(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let last = 0;
  for (const match of text.matchAll(PATTERN)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ kind: "text", text: text.slice(last, index) });
    if (match[1] !== undefined) parts.push({ kind: "strong", text: match[1] });
    else parts.push({ kind: "link", text: match[2] ?? "", href: match[3] ?? "" });
    last = index + match[0].length;
  }
  if (last < text.length) parts.push({ kind: "text", text: text.slice(last) });
  return parts;
}

/** « a, b et c » : énumération à la française. */
export function listFr(items: readonly string[]): string {
  if (items.length < 2) return items.join("");
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
}

/** Lien externe : à ouvrir sans transmettre la page d'origine. */
export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}

/** Ancre stable d'un intertitre, pour les liens vers un article précis. */
export function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
