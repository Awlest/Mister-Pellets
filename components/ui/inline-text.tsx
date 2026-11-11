import Link from "next/link";
import { Fragment } from "react";
import { FAMILY_HOSTS } from "@/config/site";
import { isExternal, parseInline } from "@/lib/legal/inline";
import { typo } from "@/lib/typo";
import { cn } from "@/lib/utils";

const LINK = "text-mp-orange-ink underline underline-offset-2 hover:no-underline";

/** Site de la famille Awlest : même onglet, comme les liens du pied de page. */
function isFamilySite(href: string): boolean {
  try {
    const host = new URL(href).hostname.replace(/^www\./, "");
    return (FAMILY_HOSTS as readonly string[]).includes(host);
  } catch {
    return false;
  }
}

/**
 * Affiche un texte de contenu qui peut porter des liens `[texte](adresse)` et
 * du gras `**texte**` (voir lib/inline-text.ts). Lien interne : navigation
 * Next. Lien vers un site de la famille : même onglet. Autre site : nouvel
 * onglet, sans transmettre la page d'origine. Chaque morceau passe par `typo`
 * (lib/typo.ts) : montants, « € », « % » et « : » ne se coupent pas en fin de
 * ligne. Le texte brut (`plainText`) n'est pas touché.
 */
export function InlineText({ text, linkClassName }: { text: string; linkClassName?: string }) {
  return parseInline(text).map((part, index) => {
    if (part.kind === "strong") return <strong key={index}>{typo(part.text)}</strong>;
    if (part.kind === "link") {
      const className = cn(LINK, linkClassName);
      if (part.href.startsWith("/")) {
        return (
          <Link key={index} href={part.href} className={className}>
            {typo(part.text)}
          </Link>
        );
      }
      const newTab = isExternal(part.href) && !isFamilySite(part.href);
      return (
        <a
          key={index}
          href={part.href}
          className={className}
          {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {typo(part.text)}
        </a>
      );
    }
    return <Fragment key={index}>{typo(part.text)}</Fragment>;
  });
}
