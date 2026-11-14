import { ImageResponse } from "next/og";
import { ARTICLES, CATEGORY_LABELS } from "@/lib/articles";
import { GUIDES } from "@/lib/guides";
import { brandPng } from "@/lib/brand-images";

/**
 * Image de partage (Open Graph) d'un article ou d'un guide : son titre sur le
 * fond du site. Sans elle, les 20 articles et les 6 guides partageaient la
 * même image générique. Adresse stable, `/og/blog/<slug>` ou
 * `/og/guides/<slug>` (ogImagePath, lib/seo.ts), reprise dans og:image et
 * dans le JSON-LD `Article`.
 *
 * Images construites au build, une par contenu : un slug inconnu répond 404.
 * Couleurs en dur comme app/opengraph-image.tsx (les jetons CSS n'existent
 * pas dans une image générée).
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return [
    ...ARTICLES.map((a) => ({ type: "blog", slug: a.slug })),
    ...GUIDES.map((g) => ({ type: "guides", slug: g.slug })),
  ];
}

// check-design: allow (image Open Graph générée, sans feuille de style)
const CREAM = "#F4EDE1";
// check-design: allow (image Open Graph générée, sans feuille de style)
const GREEN = "#102916";
// check-design: allow (image Open Graph générée, sans feuille de style)
const INK_SOFT = "#4A5A50";
// check-design: allow (image Open Graph générée, sans feuille de style)
const ORANGE = "#C2680A";

export async function GET(_request: Request, { params }: { params: Promise<{ type: string; slug: string }> }) {
  const { type, slug } = await params;
  const article = type === "blog" ? ARTICLES.find((a) => a.slug === slug) : undefined;
  const guide = type === "guides" ? GUIDES.find((g) => g.slug === slug) : undefined;
  const title = article?.title ?? guide?.title;
  if (!title) return new Response("Not found", { status: 404 });
  const label = article ? CATEGORY_LABELS[article.category] : `Guide · ${guide!.category}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: CREAM,
          padding: "64px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: ORANGE, letterSpacing: "0.04em" }}>
          {label.toUpperCase()}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 70 ? 54 : 64,
            fontWeight: 600,
            color: GREEN,
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 28, color: INK_SOFT }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img {...brandPng("compact", 64)} alt="Mister Pellets" />
          <div style={{ display: "flex" }}>mister-pellets.be</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
