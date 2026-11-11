import { CATEGORIES, productsInCategory, summarizeCategory } from "@/lib/categories";
import { errorInfo } from "@/lib/log-error";
import { markdownPaths, renderMarkdown } from "@/lib/markdown";
import { getInstallPrices } from "@/lib/price-examples";
import { getAllProducts } from "@/lib/products";
import { ROUTES } from "@/config/navigation";
import { SITE_URL } from "@/lib/seo";

/**
 * /llms-full.txt : le texte des pages de contenu en un seul fichier (FAQ,
 * guides, articles, marques), avec les forfaits de pose et un résumé du
 * catalogue par catégorie, pour un agent qui veut tout lire d'un coup.
 * /llms.txt reste le résumé structuré. Mêmes sources que les versions .md
 * (lib/markdown.ts) ; prix de pose de lib/pose/tarifs.ts ; catalogue lu dans
 * la base, ignoré si elle ne répond pas.
 */
export const revalidate = 86400;

const eur = (n: number) => `${Math.round(n).toLocaleString("fr-BE")} €`;
const kw = (n: number) => String(n).replace(".", ",");

async function catalogueSection(): Promise<string> {
  try {
    const products = await getAllProducts();
    const lines = CATEGORIES.map((c) => {
      const { total } = summarizeCategory(productsInCategory(c, products));
      const power = total.minKw != null && total.maxKw != null ? `, ${kw(total.minKw)} à ${kw(total.maxKw)} kW` : "";
      const price =
        total.minPrice != null && total.maxPrice != null
          ? `, prix affichés de ${eur(total.minPrice)} à ${eur(total.maxPrice)} TVAC (appareil seul, ${total.priced} fiches sur ${total.models})`
          : ", sur devis";
      return `- ${c.label} : ${total.models} modèles${power}${price}. ${SITE_URL}${c.path}`;
    });
    return `## Catalogue par catégorie (calculé le ${new Date().toISOString().slice(0, 10)})\n\n${lines.join("\n")}`;
  } catch (err) {
    console.warn("[llms-full.txt] catalogue non joignable :", errorInfo(err));
    return `## Catalogue\n\n${CATEGORIES.map((c) => `- ${c.label} : ${SITE_URL}${c.path}`).join("\n")}`;
  }
}

export async function GET() {
  const installs = getInstallPrices()
    .map((it) => `- ${it.label}${it.heightM > 0 ? ` (${it.heightM} m)` : ""} : ${eur(it.laborTTC)} TVAC à 6 %, poêle non compris.`)
    .join("\n");
  const intro = [
    "# Mister Pellets : contenu complet du site",
    "> Vente, installation, entretien et dépannage de poêles à pellets (ou à granulés) en Wallonie. Marque d'Awlest SRL, Fernelmont (province de Namur). Téléphone 081 13 83 09, info@awlest.com. Atelier sur rendez-vous.",
    `Ce fichier réunit le texte des pages de contenu, sans mise en page. Chaque page existe aussi seule en Markdown (adresse de la page suivie de « .md »). Résumé structuré : ${SITE_URL}/llms.txt.`,
    `## Forfaits de pose par évacuation des fumées\n\n${installs}\n- Détail et exemples : ${SITE_URL}${ROUTES.prices} ; déroulé de la pose : ${SITE_URL}${ROUTES.installation}`,
    await catalogueSection(),
  ].join("\n\n");
  const pages = markdownPaths()
    .map((path) => renderMarkdown(path))
    .filter((body): body is string => Boolean(body));
  return new Response(`${[intro, ...pages].join("\n\n---\n\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // Lisible par les robots des assistants, pas indexable comme un doublon des pages.
      "X-Robots-Tag": "noindex",
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
