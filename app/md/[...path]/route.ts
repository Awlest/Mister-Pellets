import { markdownPaths, renderMarkdown } from "@/lib/markdown";
import { SITE_URL } from "@/lib/seo";

/**
 * Version Markdown d'une page : /guides/<slug>.md est réécrit vers
 * /md/guides/<slug> (next.config.ts, rewrites « beforeFiles »). Textes tirés
 * de lib/markdown.ts, mêmes sources que les pages. L'en-tête Link désigne la
 * page HTML comme canonique : la version Markdown ne compte pas comme un
 * doublon.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return markdownPaths().map((p) => ({ path: p.slice(1).split("/") }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pagePath = `/${path.map((p) => decodeURIComponent(p)).join("/")}`;
  const body = renderMarkdown(pagePath);
  if (!body) {
    return new Response(`Aucune version Markdown pour ${pagePath}. Index : ${SITE_URL}/llms.txt\n`, {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return new Response(`${body}\n`, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      // Lisible par les assistants, pas indexé comme un doublon de la page HTML.
      "X-Robots-Tag": "noindex",
      Link: `<${SITE_URL}${pagePath}>; rel="canonical"`,
    },
  });
}
