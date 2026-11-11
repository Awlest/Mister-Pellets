/**
 * Versions Markdown des pages de contenu, pour les agents et les moteurs de
 * réponse (modèle : awlest.be, lib/markdown.ts).
 *
 * Chaque guide, article et page marque existe aussi en texte brut à son
 * adresse suivie de « .md » (/guides/<slug>.md, /blog/<slug>.md,
 * /nos-marques/<slug>.md), réécrite vers app/md (next.config.ts), et
 * /llms-full.txt les réunit avec la FAQ et les forfaits de pose.
 *
 * Le texte vient des MÊMES sources que les pages (lib/guides.ts,
 * lib/articles.ts, lib/brands.ts, lib/faqs.ts) : une page et sa version
 * Markdown ne peuvent pas se contredire. Module sans accès à la base.
 */

import { ARTICLES, getArticleBySlug, type ArticleData } from "@/lib/articles";
import { TOP_TIER_BRANDS, type BrandData } from "@/lib/brands";
import { FAQS, FAQ_CATEGORIES } from "@/lib/faqs";
import { GUIDES, getGuideBySlug, type GuideData } from "@/lib/guides";
import { SITE_URL } from "@/lib/seo";

const url = (path: string) => `${SITE_URL}${path}`;

/** Liens `[texte](/chemin)` des textes du site : adresse absolue en Markdown. */
const md = (text: string): string => text.replace(/\]\(\//g, `](${SITE_URL}/`);

const join = (...parts: (string | null | undefined | false)[]) =>
  parts.filter((p): p is string => typeof p === "string" && p.trim().length > 0).join("\n\n");

const cell = (s: string) => md(s).replace(/\|/g, "\\|").replace(/\n/g, " ");

function table(headers: string[], rows: string[][], caption?: string): string {
  return join(
    [`| ${headers.map(cell).join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`, ...rows.map((r) => `| ${r.map(cell).join(" | ")} |`)].join("\n"),
    caption ? `*${caption}*` : null,
  );
}

function faqBlock(items: { question: string; answer: string }[], title = "Questions fréquentes"): string | null {
  if (items.length === 0) return null;
  return [`## ${title}`, ...items.map((f) => `### ${f.question}\n\n${md(f.answer)}`)].join("\n\n");
}

/** Pied commun : d'où vient le texte et comment joindre Mister Pellets. */
function footer(path: string, updated?: string): string {
  const date = updated ? ` Dernière mise à jour : ${updated.slice(0, 10)}.` : "";
  return `---\n\nSource : ${url(path)}.${date} Mister Pellets (Awlest SRL), Fernelmont (Namur), 081 13 83 09, info@awlest.com. Visite technique gratuite : ${url("/prendre-rendez-vous")}`;
}

export function guideMarkdown(guide: GuideData): string {
  return join(
    `# ${guide.title}`,
    guide.directAnswer ? `> ${md(guide.directAnswer)}` : `> ${guide.excerpt}`,
    `Publié le ${guide.publishedAt}, mis à jour le ${guide.modifiedAt}.`,
    ...guide.sections.map((s) =>
      join(
        `## ${s.heading}`,
        ...(s.paragraphs ?? []).map(md),
        s.table ? table(s.table.headers, s.table.rows, s.table.caption) : null,
        s.list ? s.list.map((item) => `- ${md(item)}`).join("\n") : null,
      ),
    ),
    faqBlock(guide.faq ?? []),
    guide.sources && guide.sources.length > 0
      ? join("## Sources", guide.sources.map((src) => `- ${src.href ? `[${src.label}](${src.href})` : src.label}`).join("\n"))
      : null,
    footer(`/guides/${guide.slug}`, guide.modifiedAt),
  );
}

export function articleMarkdown(article: ArticleData): string {
  return join(
    `# ${article.title}`,
    `> ${md(article.tldr)}`,
    `Publié le ${article.publishedAt.slice(0, 10)}${article.modifiedAt ? `, mis à jour le ${article.modifiedAt.slice(0, 10)}` : ""}.`,
    ...article.sections.map((s) =>
      join(
        `## ${s.heading}`,
        ...(s.paragraphs ?? []).map(md),
        s.list ? s.list.items.map((item, i) => `${s.list!.ordered ? `${i + 1}.` : "-"} ${md(item)}`).join("\n") : null,
        s.callout ? `> ${md(s.callout.text)}` : null,
        s.table ? table(s.table.headers, s.table.rows, s.table.caption) : null,
      ),
    ),
    faqBlock(article.faqs),
    footer(`/blog/${article.slug}`, article.modifiedAt ?? article.publishedAt),
  );
}

export function brandMarkdown(brand: BrandData): string {
  return join(
    `# ${brand.name} : ${brand.tagline}`,
    `> ${md(brand.intro)}`,
    `Pays : ${brand.country}. ${brand.positioning}. Garantie : ${brand.warranty}. Site du fabricant : ${brand.officialUrl}`,
    brand.whyWeLove && brand.whyWeLove.length > 0 ? join("## Pourquoi nous la posons", ...brand.whyWeLove.map(md)) : null,
    brand.distinctions && brand.distinctions.length > 0
      ? join("## Ce qui la distingue", brand.distinctions.map((d) => `- **${d.title}** : ${md(d.description)}`).join("\n"))
      : null,
    brand.modelsTable && brand.modelsTable.length > 0
      ? join(
          "## Modèles",
          table(
            ["Modèle", "Puissance", "Type", "Pour qui"],
            brand.modelsTable.map((m) => [m.slug ? `[${m.name}](/produit/${m.slug})` : m.name, m.power, m.type ?? "", m.forWhom]),
          ),
        )
      : null,
    brand.milestones && brand.milestones.length > 0
      ? join("## Repères", brand.milestones.map((m) => `- ${m.marker} : ${m.label}`).join("\n"))
      : null,
    faqBlock(brand.faq ?? []),
    footer(`/nos-marques/${brand.slug}`),
  );
}

function faqMarkdown(): string {
  return join(
    "# Questions fréquentes sur les poêles à pellets",
    ...FAQ_CATEGORIES.filter((c) => c.count > 0).map((c) =>
      join(
        `## ${c.label}`,
        ...FAQS.filter((f) => f.category === c.value).map((f) => `### ${f.question}\n\n${md(f.answer)}`),
      ),
    ),
    footer("/faq"),
  );
}

/** Adresses des pages qui ont une version Markdown (sans « .md »). */
export function markdownPaths(): string[] {
  return [
    "/faq",
    ...GUIDES.map((g) => `/guides/${g.slug}`),
    ...ARTICLES.map((a) => `/blog/${a.slug}`),
    ...TOP_TIER_BRANDS.map((b) => `/nos-marques/${b.slug}`),
  ];
}

/** Texte Markdown d'une page, ou null si elle n'a pas de version Markdown. */
export function renderMarkdown(path: string): string | null {
  if (path === "/faq") return faqMarkdown();
  const [, section, slug, extra] = path.split("/");
  if (!slug || extra !== undefined) return null;
  if (section === "guides") {
    const guide = getGuideBySlug(slug);
    return guide ? guideMarkdown(guide) : null;
  }
  if (section === "blog") {
    const article = getArticleBySlug(slug);
    return article ? articleMarkdown(article) : null;
  }
  if (section === "nos-marques") {
    const brand = TOP_TIER_BRANDS.find((b) => b.slug === slug);
    return brand ? brandMarkdown(brand) : null;
  }
  return null;
}
