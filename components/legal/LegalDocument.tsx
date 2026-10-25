import Link from "next/link";
import { Fragment } from "react";
import { ConsentSettingsButton } from "@/components/layout/Analytics";
import { buttonVariants } from "@/components/ui/button-variants";
import { isExternal, parseInline, slugify } from "@/lib/legal/inline";
import type { LegalBlock } from "@/lib/legal/types";

/**
 * Corps des pages légales. Le texte vient de lib/legal (commun aux quatre
 * sites d'AWLEST SRL) ; ce composant ne fait que le mettre aux couleurs du
 * site : colonne de lecture centrée, intertitres verts, liens orange.
 */
const LINK = "text-mp-orange-ink underline hover:no-underline";

function Inline({ text }: { text: string }) {
  return parseInline(text).map((part, index) => {
    if (part.kind === "strong") return <strong key={index}>{part.text}</strong>;
    if (part.kind === "link") {
      if (part.href.startsWith("/")) {
        return (
          <Link key={index} href={part.href} className={LINK}>
            {part.text}
          </Link>
        );
      }
      return (
        <a
          key={index}
          href={part.href}
          className={LINK}
          {...(isExternal(part.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {part.text}
        </a>
      );
    }
    return <Fragment key={index}>{part.text}</Fragment>;
  });
}

export function LegalDocument({ blocks, updatedOn }: { blocks: LegalBlock[]; updatedOn: string }) {
  return (
    <article className="bg-mp-cream mp-band">
      <div className="mp-shell">
        <div className="mp-measure text-mp-ink leading-relaxed">
          {blocks.map((block, index) => {
            if ("h2" in block)
              return (
                <h2
                  key={index}
                  id={slugify(block.h2)}
                  className="mt-12 mb-3 scroll-mt-28 text-2xl font-semibold text-mp-green-deep first:mt-0"
                >
                  {block.h2}
                </h2>
              );
            if ("h3" in block)
              return (
                <h3 key={index} id={slugify(block.h3)} className="mt-8 mb-2 scroll-mt-28 text-xl font-semibold text-mp-green-deep">
                  {block.h3}
                </h3>
              );
            if ("ul" in block)
              return (
                <ul key={index} className="mb-4 list-disc list-outside ml-5 space-y-2">
                  {block.ul.map((item, i) => (
                    <li key={i}>
                      <Inline text={item} />
                    </li>
                  ))}
                </ul>
              );
            if ("table" in block)
              return (
                <div key={index} className="mb-4 overflow-x-auto rounded-xl border border-mp-sand/40">
                  <table className="w-full text-sm">
                    <thead className="bg-mp-beige">
                      <tr>
                        {block.table.head.map((cell) => (
                          <th key={cell} scope="col" className="text-left px-3 py-3 font-semibold text-mp-green-deep sm:px-4">
                            {cell}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.table.rows.map((row, r) => (
                        <tr key={r} className="border-t border-mp-sand/40">
                          {row.map((cell, c) => (
                            <td
                              key={c}
                              className={
                                c === 0 ? "px-3 py-3 font-mono text-xs break-words sm:px-4" : c === 2 ? "px-3 py-3 text-mp-ink-soft sm:px-4" : "px-3 py-3 sm:px-4"
                              }
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            if ("consent" in block)
              return (
                <ConsentSettingsButton
                  key={index}
                  className={`${buttonVariants({ variant: "outline" })} mb-6 cursor-pointer`}
                />
              );
            return (
              <p key={index} className="mb-4">
                <Inline text={block.p} />
              </p>
            );
          })}

          <p className="mt-10 pt-6 border-t border-mp-sand/40 text-sm text-mp-ink-soft">
            Dernière mise à jour&nbsp;: {updatedOn}
          </p>
        </div>
      </div>
    </article>
  );
}
